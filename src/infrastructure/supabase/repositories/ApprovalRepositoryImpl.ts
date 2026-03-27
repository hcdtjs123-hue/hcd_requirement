import { supabase } from '@/infrastructure/supabase/client'
import type {
  ApprovalChain,
  ApprovalStep,
  ApproverMaster,
  ApproverMasterInput,
  SubmitApprovalInput,
} from '@/domain/entities/ApprovalChain'
import type { ApprovalRepository } from '@/domain/repositories/ApprovalRepository'

const emailApiUrl = (import.meta.env.VITE_EMAIL_API_URL || '').replace(/\/$/, '')
const emailApiKey = import.meta.env.VITE_EMAIL_API_KEY || ''

const chainSelect = `
  *,
  steps:approval_steps(*)
`

const chainWithJobRequestSelect = `
  *,
  steps:approval_steps(*),
  job_request:employee_request_form(
    id,
    main_position,
    site,
    employment_status,
    required_date,
    approval_director_bu,
    approval_director_bu_date,
    approval_gm_hrd,
    approval_gm_hrd_date,
    approval_director_hrd,
    approval_director_hrd_date,
    direct_manager, pt_pembebanan, working_location, required_date,
    position_status, periode_probation,
    custom_grup_1:master_custom_grup_1(name),
    custom_grup_2:master_custom_grup_2(name),
    custom_grup_3:master_custom_grup_3(name),
    custom_grup_4:master_custom_grup_4(name),
    custom_grup_5:master_custom_grup_5(name),
    custom_grup_6:master_custom_grup_6(name)
  )
`

const approverEmployeeSelect =
  'employee:profiles!approver_master_employee_id_fkey(full_name, email, phone, username)'

export class ApprovalRepositoryImpl implements ApprovalRepository {
  // ========================
  // Approval Chain
  // ========================

  async getChainsByUser(): Promise<ApprovalChain[]> {
    const accessScope = await this.getApprovalChainAccessScope()
    let query = supabase.from('approval_chains').select(chainWithJobRequestSelect)

    if (accessScope.isManager && accessScope.userId) {
      query = query.eq('created_by', accessScope.userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return (data ?? []).map(this.normalizeChain)
  }

  async getChainByJobRequest(jobRequestId: string): Promise<ApprovalChain | null> {
    const { data, error } = await supabase
      .from('approval_chains')
      .select(chainWithJobRequestSelect)
      .eq('job_request_id', jobRequestId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw new Error(error.message)

    const latestChain = data?.[0]
    return latestChain ? this.normalizeChain(latestChain) : null
  }

  async submitForApproval(input: SubmitApprovalInput): Promise<ApprovalChain> {
    const existingChain = await this.getLatestActiveChainByJobRequest(input.job_request_id)
    if (existingChain) {
      throw new Error('This ERF already has an active approval chain.')
    }

    const { data: jobRequest, error: jobRequestError } = await supabase
      .from('employee_request_form')
      .select('id, approval_director_bu_id, approval_director_bu')
      .eq('id', input.job_request_id)
      .single()

    if (jobRequestError) throw new Error(jobRequestError.message)
    if (!jobRequest.approval_director_bu) {
      throw new Error('BU Director Approval is required before submitting ERF approval.')
    }

    const buDirector = jobRequest.approval_director_bu_id
      ? await this.resolveBuDirectorApproverById(jobRequest.approval_director_bu_id)
      : await this.resolveBuDirectorApprover(jobRequest.approval_director_bu)

    // 1. Get HR approver masters ordered by step_order with employee join
    const { data: approverMasters, error: approverError } = await supabase
      .from('approver_master')
      .select(
        '*, employee:profiles!approver_master_employee_id_fkey(full_name, email, username)',
      )
      .order('step_order', { ascending: true })

    if (approverError) throw new Error(approverError.message)
    if (!approverMasters || approverMasters.length === 0) {
      throw new Error(
        'No approvers registered. Please add approvers in Master Data first.',
      )
    }

    const gmHrdApprover = approverMasters.find((approver: any) => approver.step_order === 1)
    const directorHrdApprover = approverMasters.find((approver: any) => approver.step_order === 2)

    if (!gmHrdApprover?.employee?.email) {
      throw new Error('GM HRD approver is not configured correctly.')
    }

    if (!directorHrdApprover?.employee?.email) {
      throw new Error('Director HRD approver is not configured correctly.')
    }

    // 2. Get current user
    const user = await supabase.auth.getUser()

    // 3. Create chain
    const { data: chain, error: chainError } = await supabase
      .from('approval_chains')
      .insert({
        job_request_id: input.job_request_id,
        created_by: user.data.user?.id ?? null,
        status: 'pending',
      })
      .select('*')
      .single()

    if (chainError) throw new Error(chainError.message)

    // 4. Create steps with fixed order: BU Director -> GM HRD -> Director HRD
    const steps = [
      {
        chain_id: chain.id,
        step_order: 1,
        approver_email: buDirector.email,
        approver_name: buDirector.name,
        status: 'pending',
      },
      {
        chain_id: chain.id,
        step_order: 2,
        approver_email: gmHrdApprover.employee.email || '',
        approver_name: this.buildEmployeeFullName(gmHrdApprover.employee),
        status: 'pending',
      },
      {
        chain_id: chain.id,
        step_order: 3,
        approver_email: directorHrdApprover.employee.email || '',
        approver_name: this.buildEmployeeFullName(directorHrdApprover.employee),
        status: 'pending',
      },
    ]

    const { error: stepsError } = await supabase.from('approval_steps').insert(steps)

    if (stepsError) throw new Error(stepsError.message)

    // 5. Return the full chain with steps
    const result = await this.getChainByJobRequest(input.job_request_id)
    if (!result) throw new Error('Failed to load newly created approval chain.')

    // 6. Send email to the first approver
    const firstStep = result.steps.find((s) => s.step_order === 1)
    if (firstStep && firstStep.token) {
      await this.sendApprovalEmail(
        firstStep.approver_email,
        firstStep.approver_name || 'Approver',
        firstStep.token,
        result.job_request?.main_position,
      )
    }

    return result
  }

  // ========================
  // Public Approval (no auth)
  // ========================

  async getStepByToken(token: string): Promise<{
    step: ApprovalStep
    chain: ApprovalChain
  } | null> {
    const { data: step, error: stepError } = await supabase
      .from('approval_steps')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (stepError) throw new Error(stepError.message)
    if (!step) return null

    const { data: chain, error: chainError } = await supabase
      .from('approval_chains')
      .select(chainWithJobRequestSelect)
      .eq('id', step.chain_id)
      .single()

    if (chainError) throw new Error(chainError.message)

    return {
      step: step as ApprovalStep,
      chain: this.normalizeChain(chain),
    }
  }

  async approveStep(token: string, notes?: string): Promise<void> {
    // 1. Get the step
    const { data: step, error: stepError } = await supabase
      .from('approval_steps')
      .select('*')
      .eq('token', token)
      .single()

    if (stepError) throw new Error(stepError.message)
    if (step.status !== 'pending') {
      throw new Error('This step has been processed already.')
    }

    // 2. Check sequential: all previous steps must be approved
    const { data: previousSteps, error: prevError } = await supabase
      .from('approval_steps')
      .select('*')
      .eq('chain_id', step.chain_id)
      .lt('step_order', step.step_order)
      .neq('status', 'approved')

    if (prevError) throw new Error(prevError.message)
    if (previousSteps && previousSteps.length > 0) {
      throw new Error('Waiting for approval from previous stage.')
    }

    // 3. Approve this step
    const approvedAt = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('approval_steps')
      .update({
        status: 'approved',
        approved_at: approvedAt,
        notes: notes || null,
      })
      .eq('id', step.id)

    if (updateError) throw new Error(updateError.message)

    await this.syncJobRequestApprovalField(step.chain_id, step.step_order, step.approver_name, approvedAt)

    // 4. Check if all steps in chain are now approved
    const { data: remainingPending, error: remainError } = await supabase
      .from('approval_steps')
      .select('id')
      .eq('chain_id', step.chain_id)
      .eq('status', 'pending')

    if (remainError) throw new Error(remainError.message)

    if (!remainingPending || remainingPending.length === 0) {
      // All steps approved → update chain status
      await supabase
        .from('approval_chains')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', step.chain_id)

      // Auto-create recruitment tracking
      const { data: chain } = await supabase
        .from('approval_chains')
        .select('job_request_id')
        .eq('id', step.chain_id)
        .single()

      if (chain) {
        await supabase.from('recruitment_tracking').insert({
          job_request_id: chain.job_request_id,
          chain_id: step.chain_id,
          status: 'pending_review',
        })
      }
    } else {
      // Notify the NEXT approver in the chain
      const { data: nextStep } = await supabase
        .from('approval_steps')
        .select('*')
        .eq('chain_id', step.chain_id)
        .eq('step_order', step.step_order + 1)
        .maybeSingle()

      if (nextStep && nextStep.token) {
        const { data: chainData, error: chainError } = await supabase
          .from('approval_chains')
          .select(chainWithJobRequestSelect)
          .eq('id', step.chain_id)
          .single()

        if (chainError) throw new Error(chainError.message)

        const chain = this.normalizeChain(chainData as Record<string, unknown>)
        await this.sendApprovalEmail(
          nextStep.approver_email,
          nextStep.approver_name || 'Approver',
          nextStep.token,
          chain.job_request?.main_position,
        )
      }
    }
  }

  async rejectStep(token: string, notes?: string): Promise<void> {
    const { data: step, error: stepError } = await supabase
      .from('approval_steps')
      .select('*')
      .eq('token', token)
      .single()

    if (stepError) throw new Error(stepError.message)
    if (step.status !== 'pending') {
      throw new Error('Step ini sudah diproses sebelumnya.')
    }

    // Check sequential
    const { data: previousSteps, error: prevError } = await supabase
      .from('approval_steps')
      .select('*')
      .eq('chain_id', step.chain_id)
      .lt('step_order', step.step_order)
      .neq('status', 'approved')

    if (prevError) throw new Error(prevError.message)
    if (previousSteps && previousSteps.length > 0) {
      throw new Error('Menunggu approval dari tahap sebelumnya.')
    }

    const { error: updateError } = await supabase
      .from('approval_steps')
      .update({
        status: 'rejected',
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', step.id)

    if (updateError) throw new Error(updateError.message)

    // Update chain status to rejected
    await supabase
      .from('approval_chains')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', step.chain_id)
  }

  // ========================
  // Approver Master Data
  // ========================

  async getAllApproverMasters(): Promise<ApproverMaster[]> {
    const query = supabase
      .from('approver_master')
      .select(`*, ${approverEmployeeSelect}`)

    const { data, error } = await query.order('step_order', { ascending: true })

    if (error) throw new Error(error.message)

    return (data ?? []) as ApproverMaster[]
  }

  async createApproverMaster(input: ApproverMasterInput): Promise<ApproverMaster> {
    const user = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('approver_master')
      .insert({
        employee_id: input.employee_id,
        step_order: input.step_order,
        created_by: user.data.user?.id ?? null,
      })
      .select(`*, ${approverEmployeeSelect}`)
      .single()

    if (error) throw new Error(error.message)

    return data as ApproverMaster
  }

  async updateApproverMaster(id: string, input: ApproverMasterInput): Promise<ApproverMaster> {
    const query = supabase
      .from('approver_master')
      .update({
        employee_id: input.employee_id,
        step_order: input.step_order,
      })
      .eq('id', id)

    const { data, error } = await query
      .select(`*, ${approverEmployeeSelect}`)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) {
      throw new Error('Approver data not found.')
    }

    return data as ApproverMaster
  }

  async deleteApproverMaster(id: string): Promise<void> {
    const query = supabase.from('approver_master').delete().eq('id', id)

    const { data, error } = await query.select('id')

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) {
      throw new Error('Approver data not found or could not be deleted.')
    }
  }

  // ========================
  // Helpers
  // ========================

  private normalizeChain(data: Record<string, unknown>): ApprovalChain {
    const steps = Array.isArray(data.steps)
      ? (data.steps as ApprovalStep[]).sort((a, b) => a.step_order - b.step_order)
      : []

    const chain = data as unknown as any
    const jobRequest = chain.job_request

    if (jobRequest) {
      chain.job_request = {
        ...jobRequest,
        custom_grup_1: jobRequest.custom_grup_1?.name ?? null,
        custom_grup_2: jobRequest.custom_grup_2?.name ?? null,
        custom_grup_3: jobRequest.custom_grup_3?.name ?? null,
        custom_grup_4: jobRequest.custom_grup_4?.name ?? null,
        custom_grup_5: jobRequest.custom_grup_5?.name ?? null,
        custom_grup_6: jobRequest.custom_grup_6?.name ?? null,
      }
    }

    return {
      ...chain,
      steps,
    }
  }

  private buildEmployeeFullName(
    employee:
      | {
          full_name?: string | null
          username?: string | null
        }
      | null
      | undefined,
  ) {
    return String(employee?.full_name ?? employee?.username ?? '')
      .trim()
  }

  private async getLatestActiveChainByJobRequest(jobRequestId: string) {
    const { data, error } = await supabase
      .from('approval_chains')
      .select(chainWithJobRequestSelect)
      .eq('job_request_id', jobRequestId)
      .in('status', ['draft', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw new Error(error.message)

    return data?.[0] ? this.normalizeChain(data[0]) : null
  }

  private async resolveBuDirectorApprover(displayLabel: string) {
    const { data: employees, error } = await supabase
      .from('profiles')
      .select('full_name, email, username')

    if (error) throw new Error(error.message)

    const matchedEmployee = (employees ?? []).find((employee) => {
      const fullName = this.buildEmployeeFullName(employee)
      const username = employee.username ? `@${employee.username}` : ''
      return fullName === displayLabel || `${fullName} — ${username}` === displayLabel
    })

    if (!matchedEmployee?.email) {
      throw new Error('BU Director approver email could not be resolved from the selected ERF approver.')
    }

    return {
      email: matchedEmployee.email,
      name: this.buildEmployeeFullName(matchedEmployee) || displayLabel,
    }
  }

  private async resolveBuDirectorApproverById(employeeId: string) {
    const { data: employee, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, username')
      .eq('id', employeeId)
      .maybeSingle()

    if (error) throw new Error(error.message)

    if (!employee?.email) {
      throw new Error('BU Director approver email could not be resolved from the selected employee.')
    }

    return {
      email: employee.email,
      name: this.buildEmployeeFullName(employee) || 'BU Director',
    }
  }

  private async syncJobRequestApprovalField(
    chainId: string,
    stepOrder: number,
    approverName: string | null,
    approvedAt: string,
  ) {
    const { data: chain, error: chainError } = await supabase
      .from('approval_chains')
      .select('job_request_id')
      .eq('id', chainId)
      .single()

    if (chainError) throw new Error(chainError.message)

    const approvalPayloadByStep: Record<number, Record<string, string | null>> = {
      1: {
        approval_director_bu: approverName,
        approval_director_bu_date: approvedAt,
      },
      2: {
        approval_gm_hrd: approverName,
        approval_gm_hrd_date: approvedAt,
      },
      3: {
        approval_director_hrd: approverName,
        approval_director_hrd_date: approvedAt,
      },
    }

    const payload = approvalPayloadByStep[stepOrder]
    if (!payload) return

    const { error: updateJobError } = await supabase
      .from('employee_request_form')
      .update(payload)
      .eq('id', chain.job_request_id)

    if (updateJobError) throw new Error(updateJobError.message)
  }

  private async getApproverMasterAccessScope() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) throw new Error(userError.message)

    if (!user) {
      return {
        isManager: false,
        userId: null as string | null,
      }
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .maybeSingle()

    if (roleError) throw new Error(roleError.message)

    const roleName = (roleData as { roles?: { name?: string } | null } | null)?.roles?.name

    return {
      isManager: roleName?.toLowerCase() === 'manager',
      userId: user.id,
    }
  }

  private async getApprovalChainAccessScope() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) throw new Error(userError.message)

    if (!user) {
      return {
        isManager: false,
        userId: null as string | null,
      }
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .maybeSingle()

    if (roleError) throw new Error(roleError.message)

    const roleName = (roleData as { roles?: { name?: string } | null } | null)?.roles?.name

    return {
      isManager: roleName?.toLowerCase() === 'manager',
      userId: user.id,
    }
  }

  private buildApprovalEmailSubject(mainPosition?: string | null) {
    const normalizedMainPosition = String(mainPosition ?? '').trim()
    return normalizedMainPosition
      ? `ERF Approval Notification (${normalizedMainPosition})`
      : 'ERF Approval Notification'
  }

  private async sendApprovalEmail(
    email: string,
    name: string,
    token: string,
    mainPosition?: string | null,
  ) {
    if (!email?.trim()) {
      throw new Error('Approval email is missing for the current approver.')
    }

    if (!emailApiUrl) {
      throw new Error('VITE_EMAIL_API_URL is not set.')
    }

    if (!emailApiKey) {
      throw new Error('VITE_EMAIL_API_KEY is not set.')
    }

    const approvalLink = `${window.location.origin}/approve/${token}`
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Approval Request (HCD)</h2>
        <p>Dear ${name},</p>
        <p>There is a new Employee Request Form (ERF) submission that requires your approval.</p>
        <p>Please click the link below to view the details and provide your decision:</p>
        <a href="${approvalLink}" style="display:inline-block; padding:10px 20px; background-color:#2563eb; color:white; text-decoration:none; border-radius:5px;">Open Approval Form</a>
        <p style="margin-top:20px; font-size: 12px; color: #666;">If the button doesn't work, copy the following link: <br/>${approvalLink}</p>
      </div>
    `

    const response = await fetch(`${emailApiUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': emailApiKey,
      },
      body: JSON.stringify({
        to: email,
        subject: this.buildApprovalEmailSubject(mainPosition),
        html,
      }),
    })

    const payload = (await response.json().catch(() => ({}))) as {
      ok?: boolean
      error?: string
    }

    if (!response.ok || !payload.ok) {
      throw new Error(
        `Failed to send approval email to ${email}: ${payload.error || `HTTP ${response.status}`}`,
      )
    }
  }
}
