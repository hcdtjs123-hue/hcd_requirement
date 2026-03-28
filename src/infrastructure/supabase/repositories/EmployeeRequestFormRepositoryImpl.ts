import { supabase } from '@/infrastructure/supabase/client'
import type { EmployeeRequestForm, EmployeeRequestFormInput } from '@/domain/entities/EmployeeRequestForm'
import type { EmployeeRequestFormRepository } from '@/domain/repositories/EmployeeRequestFormRepository'
import { approvalRepo } from '@/infrastructure/container'

const approverEmployeeSelect =
  'profile:profiles!approver_master_profile_id_fkey(full_name, email, username)'

export class EmployeeRequestFormRepositoryImpl implements EmployeeRequestFormRepository {
  async getAll(): Promise<EmployeeRequestForm[]> {
    const accessScope = await this.getAccessScope()
    let query = supabase.from('employee_request_form').select(`
      *,
      pt:master_pt(id, name),
      department_ref:master_department(id, name),
      job_level_ref:master_job_level(id, name),
      custom_grup_1:master_custom_grup_1(name),
      custom_grup_2:master_custom_grup_2(name),
      custom_grup_3:master_custom_grup_3(name),
      custom_grup_4:master_custom_grup_4(name),
      custom_grup_5:master_custom_grup_5(name),
      custom_grup_6:master_custom_grup_6(name)
    `)

    if (accessScope.isManager && accessScope.userId) {
      query = query.eq('created_by', accessScope.userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return this.attachCreatorNames((data ?? []).map(this.flattenCustomGroups))
  }

  async getById(id: string): Promise<EmployeeRequestForm | null> {
    const accessScope = await this.getAccessScope()
    let query = supabase.from('employee_request_form').select(`
      *,
      pt:master_pt(id, name),
      department_ref:master_department(id, name),
      job_level_ref:master_job_level(id, name),
      custom_grup_1:master_custom_grup_1(name),
      custom_grup_2:master_custom_grup_2(name),
      custom_grup_3:master_custom_grup_3(name),
      custom_grup_4:master_custom_grup_4(name),
      custom_grup_5:master_custom_grup_5(name),
      custom_grup_6:master_custom_grup_6(name)
    `).eq('id', id)

    if (accessScope.isManager && accessScope.userId) {
      query = query.eq('created_by', accessScope.userId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) return null

    const [job] = await this.attachCreatorNames([this.flattenCustomGroups(data)])
    return job ?? null
  }

  private flattenCustomGroups(item: any): EmployeeRequestForm {
    return {
      ...item,
      pt_id: item.pt_id ?? item.pt?.id ?? null,
      pt_pembebanan: item.pt?.name ?? item.pt_pembebanan ?? null,
      department_id: item.department_id ?? item.department_ref?.id ?? null,
      department: item.department_ref?.name ?? item.department ?? null,
      job_level_id: item.job_level_id ?? item.job_level_ref?.id ?? null,
      job_level: item.job_level_ref?.name ?? item.job_level ?? null,
      custom_grup_1: item.custom_grup_1?.name ?? null,
      custom_grup_2: item.custom_grup_2?.name ?? null,
      custom_grup_3: item.custom_grup_3?.name ?? null,
      custom_grup_4: item.custom_grup_4?.name ?? null,
      custom_grup_5: item.custom_grup_5?.name ?? null,
      custom_grup_6: item.custom_grup_6?.name ?? null,
    }
  }

  private async attachCreatorNames(items: EmployeeRequestForm[]): Promise<EmployeeRequestForm[]> {
    const creatorIds = Array.from(new Set(items.map((item) => item.created_by).filter(Boolean)))

    if (creatorIds.length === 0) {
      return items
    }

    const { data: creators, error } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', creatorIds)

    if (error) {
      throw new Error(error.message)
    }

    const creatorNameMap = new Map<string, string>()
    for (const creator of creators ?? []) {
      const fullName = String(creator.full_name ?? creator.username ?? '').trim()

      if (fullName) {
        creatorNameMap.set(creator.id, fullName)
      }
    }

    return items.map((item) => ({
      ...item,
      created_by_name: item.created_by ? creatorNameMap.get(item.created_by) ?? null : null,
    }))
  }

  async create(data: EmployeeRequestFormInput): Promise<EmployeeRequestForm> {
    const user = await supabase.auth.getUser()
    const masterDataIds = await this.resolveMasterDataIds(data)

    // Auto-populate: find active GM HRD approver from approver_master
    const { data: gmHrdApprover } = await supabase
      .from('approver_master')
      .select(approverEmployeeSelect)
      .eq('step_order', 1)
      .limit(1)
      .maybeSingle()

    // Auto-populate: find active Direktur HRD approver from approver_master
    const { data: directorHrdApprover } = await supabase
      .from('approver_master')
      .select(approverEmployeeSelect)
      .eq('step_order', 2)
      .limit(1)
      .maybeSingle()

    const gmEmployee = (gmHrdApprover?.profile as any)
    const approvalGmHrd = String(gmEmployee?.full_name ?? gmEmployee?.username ?? '').trim() || null

    const directorEmployee = (directorHrdApprover?.profile as any)
    const approvalDirectorHrd =
      String(directorEmployee?.full_name ?? directorEmployee?.username ?? '').trim() || null

    const payload = {
      ...this.mapInput(data, masterDataIds),
      approval_gm_hrd: approvalGmHrd,
      approval_director_hrd: approvalDirectorHrd,
      created_by: user.data.user?.id ?? null,
    }

    const { data: created, error } = await supabase
      .from('employee_request_form')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Automatically trigger approval chain.
    // If approval or email delivery fails, surface the error so the user knows
    // the ERF did not enter the approval flow correctly.
    if (created) {
      try {
        await approvalRepo.submitForApproval({ employee_request_form_id: created.id })
      } catch (err) {
        console.error('Failed to start approval chain:', err)

        const message = err instanceof Error
          ? err.message
          : 'Failed to start ERF approval flow.'

        throw new Error(`ERF was saved, but approval flow could not start: ${message}`)
      }
    }

    return created
  }

  async update(id: string, data: EmployeeRequestFormInput): Promise<EmployeeRequestForm> {
    const accessScope = await this.getAccessScope()
    const masterDataIds = await this.resolveMasterDataIds(data)

    let query = supabase
      .from('employee_request_form')
      .update({
        ...this.mapInput(data, masterDataIds),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (accessScope.isManager && accessScope.userId) {
      query = query.eq('created_by', accessScope.userId)
    }

    const { data: updated, error } = await query.select('*').maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!updated) {
      throw new Error('Job request data not found or inaccessible.')
    }

    return updated
  }

  async delete(id: string): Promise<void> {
    const accessScope = await this.getAccessScope()
    let query = supabase.from('employee_request_form').delete().eq('id', id)

    if (accessScope.isManager && accessScope.userId) {
      query = query.eq('created_by', accessScope.userId)
    }

    const { data, error } = await query.select('id')

    if (error) {
      throw new Error(error.message)
    }

    if (accessScope.isManager && (!data || data.length === 0)) {
      throw new Error('Job request data not found or could not be deleted.')
    }
  }

  async close(id: string, category: 'employee hired' | 'canceled', reason: string): Promise<void> {
    const { error } = await supabase
      .from('employee_request_form')
      .update({
        status: 'closed',
        closed_date: new Date().toISOString(),
        closed_category: category,
        reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  private async getAccessScope() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw new Error(userError.message)
    }

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

    if (roleError) {
      throw new Error(roleError.message)
    }

    const roleName = (roleData as { roles?: { name?: string } | null } | null)?.roles?.name

    return {
      isManager: roleName?.toLowerCase() === 'manager',
      userId: user.id,
    }
  }

  private async resolveMasterDataIds(data: EmployeeRequestFormInput) {
    const ptName = String(data.pt_pembebanan ?? '').trim()
    const departmentName = String(data.department ?? '').trim()
    const jobLevelName = String(data.job_level ?? '').trim()

    const [ptResult, departmentResult, jobLevelResult] = await Promise.all([
      ptName
        ? supabase.from('master_pt').select('id').eq('name', ptName).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      departmentName
        ? supabase.from('master_department').select('id').eq('name', departmentName).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      jobLevelName
        ? supabase.from('master_job_level').select('id').eq('name', jobLevelName).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])

    if (ptResult.error) throw new Error(ptResult.error.message)
    if (departmentResult.error) throw new Error(departmentResult.error.message)
    if (jobLevelResult.error) throw new Error(jobLevelResult.error.message)

    return {
      pt_id: data.pt_id || ptResult.data?.id || null,
      department_id: data.department_id || departmentResult.data?.id || null,
      job_level_id: data.job_level_id || jobLevelResult.data?.id || null,
    }
  }

  private mapInput(
    data: EmployeeRequestFormInput,
    masterDataIds: { pt_id: string | null; department_id: string | null; job_level_id: string | null },
  ) {
    return {
      pt_id: masterDataIds.pt_id,
      pt_pembebanan: data.pt_pembebanan || null,
      department_id: masterDataIds.department_id,
      department: data.department || null,
      job_level_id: masterDataIds.job_level_id,
      job_level: data.job_level || null,
      employment_status: data.employment_status || null,
      direct_manager: data.direct_manager || null,
      approval_director_bu_id: data.approval_director_bu_id || null,
      approval_director_bu: data.approval_director_bu || null,
      approval_director_bu_date: data.approval_director_bu_date || null,
      site: data.site || null,
      working_location: data.working_location || null,
      custom_grup_1_id: data.custom_grup_1_id || null,
      custom_grup_2_id: data.custom_grup_2_id || null,
      custom_grup_3_id: data.custom_grup_3_id || null,
      custom_grup_4_id: data.custom_grup_4_id || null,
      custom_grup_5_id: data.custom_grup_5_id || null,
      custom_grup_6_id: data.custom_grup_6_id || null,
      status: data.status ?? 'open',
      closed_date: data.closed_date || null,
      closed_category: data.closed_category || null,
      reason: data.reason || null,
      required_date: data.required_date || null,
      position_status: data.position_status || null,
      periode_probation: data.periode_probation ?? null,
      main_position: data.main_position || null,
    }
  }
}
