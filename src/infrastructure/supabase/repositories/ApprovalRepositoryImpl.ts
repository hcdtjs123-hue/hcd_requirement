import { supabase } from "@/infrastructure/supabase/client"
import type {
  ApprovalChain,
  ApprovalStep,
  ApproverMaster,
  ApproverMasterInput,
  SubmitApprovalInput,
} from "@/domain/entities/ApprovalChain"
import type { ApprovalRepository } from "@/domain/repositories/ApprovalRepository"

const chainSelect = `
  *,
  steps:approval_steps(*)
`

const chainWithJobRequestSelect = `
  *,
  steps:approval_steps(*),
  job_request:new_employee_application_form(
    id, main_position, designation, site, employment_status,
    direct_manager, pt_pembebanan, working_location, required_date,
    position_status, periode_probation,
    custom_grup_1, custom_grup_2, custom_grup_3,
    custom_grup_4, custom_grup_5, custom_grup_6
  )
`

export class ApprovalRepositoryImpl implements ApprovalRepository {
  // ========================
  // Approval Chain
  // ========================

  async getChainsByUser(): Promise<ApprovalChain[]> {
    const { data, error } = await supabase
      .from("approval_chains")
      .select(chainWithJobRequestSelect)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)

    return (data ?? []).map(this.normalizeChain)
  }

  async getChainByJobRequest(jobRequestId: string): Promise<ApprovalChain | null> {
    const { data, error } = await supabase
      .from("approval_chains")
      .select(chainWithJobRequestSelect)
      .eq("job_request_id", jobRequestId)
      .maybeSingle()

    if (error) throw new Error(error.message)

    return data ? this.normalizeChain(data) : null
  }

  async submitForApproval(input: SubmitApprovalInput): Promise<ApprovalChain> {
    // 1. Get all active approver masters ordered by step_order
    const { data: approvers, error: approverError } = await supabase
      .from("approver_master")
      .select("*")
      .eq("is_active", true)
      .order("step_order", { ascending: true })

    if (approverError) throw new Error(approverError.message)
    if (!approvers || approvers.length === 0) {
      throw new Error("Belum ada approver yang terdaftar. Tambahkan approver di Master Data terlebih dahulu.")
    }

    // 2. Get current user
    const user = await supabase.auth.getUser()

    // 3. Create chain
    const { data: chain, error: chainError } = await supabase
      .from("approval_chains")
      .insert({
        job_request_id: input.job_request_id,
        created_by: user.data.user?.id ?? null,
        status: "pending",
      })
      .select("*")
      .single()

    if (chainError) throw new Error(chainError.message)

    // 4. Create steps from approver masters
    const steps = approvers.map((approver, index) => ({
      chain_id: chain.id,
      step_order: index + 1,
      approver_email: approver.email,
      approver_name: approver.name,
      status: "pending",
    }))

    const { error: stepsError } = await supabase
      .from("approval_steps")
      .insert(steps)

    if (stepsError) throw new Error(stepsError.message)

    // 5. Return the full chain with steps
    const result = await this.getChainByJobRequest(input.job_request_id)
    if (!result) throw new Error("Gagal memuat approval chain yang baru dibuat.")

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
      .from("approval_steps")
      .select("*")
      .eq("token", token)
      .maybeSingle()

    if (stepError) throw new Error(stepError.message)
    if (!step) return null

    const { data: chain, error: chainError } = await supabase
      .from("approval_chains")
      .select(chainWithJobRequestSelect)
      .eq("id", step.chain_id)
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
      .from("approval_steps")
      .select("*")
      .eq("token", token)
      .single()

    if (stepError) throw new Error(stepError.message)
    if (step.status !== "pending") {
      throw new Error("Step ini sudah diproses sebelumnya.")
    }

    // 2. Check sequential: all previous steps must be approved
    const { data: previousSteps, error: prevError } = await supabase
      .from("approval_steps")
      .select("*")
      .eq("chain_id", step.chain_id)
      .lt("step_order", step.step_order)
      .neq("status", "approved")

    if (prevError) throw new Error(prevError.message)
    if (previousSteps && previousSteps.length > 0) {
      throw new Error("Menunggu approval dari tahap sebelumnya.")
    }

    // 3. Approve this step
    const { error: updateError } = await supabase
      .from("approval_steps")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("id", step.id)

    if (updateError) throw new Error(updateError.message)

    // 4. Check if all steps in chain are now approved
    const { data: remainingPending, error: remainError } = await supabase
      .from("approval_steps")
      .select("id")
      .eq("chain_id", step.chain_id)
      .eq("status", "pending")

    if (remainError) throw new Error(remainError.message)

    if (!remainingPending || remainingPending.length === 0) {
      // All steps approved → update chain status
      await supabase
        .from("approval_chains")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", step.chain_id)

      // Auto-create recruitment tracking
      const { data: chain } = await supabase
        .from("approval_chains")
        .select("job_request_id")
        .eq("id", step.chain_id)
        .single()

      if (chain) {
        await supabase
          .from("recruitment_tracking")
          .insert({
            job_request_id: chain.job_request_id,
            chain_id: step.chain_id,
            status: "pending_review",
          })
      }
    }
  }

  async rejectStep(token: string, notes?: string): Promise<void> {
    const { data: step, error: stepError } = await supabase
      .from("approval_steps")
      .select("*")
      .eq("token", token)
      .single()

    if (stepError) throw new Error(stepError.message)
    if (step.status !== "pending") {
      throw new Error("Step ini sudah diproses sebelumnya.")
    }

    // Check sequential
    const { data: previousSteps, error: prevError } = await supabase
      .from("approval_steps")
      .select("*")
      .eq("chain_id", step.chain_id)
      .lt("step_order", step.step_order)
      .neq("status", "approved")

    if (prevError) throw new Error(prevError.message)
    if (previousSteps && previousSteps.length > 0) {
      throw new Error("Menunggu approval dari tahap sebelumnya.")
    }

    const { error: updateError } = await supabase
      .from("approval_steps")
      .update({
        status: "rejected",
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("id", step.id)

    if (updateError) throw new Error(updateError.message)

    // Update chain status to rejected
    await supabase
      .from("approval_chains")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", step.chain_id)
  }

  // ========================
  // Approver Master Data
  // ========================

  async getAllApproverMasters(): Promise<ApproverMaster[]> {
    const { data, error } = await supabase
      .from("approver_master")
      .select("*")
      .order("step_order", { ascending: true })

    if (error) throw new Error(error.message)

    return data ?? []
  }

  async createApproverMaster(input: ApproverMasterInput): Promise<ApproverMaster> {
    const user = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("approver_master")
      .insert({
        email: input.email,
        name: input.name || null,
        step_order: input.step_order,
        is_active: input.is_active ?? true,
        created_by: user.data.user?.id ?? null,
      })
      .select("*")
      .single()

    if (error) throw new Error(error.message)

    return data
  }

  async updateApproverMaster(id: string, input: ApproverMasterInput): Promise<ApproverMaster> {
    const { data, error } = await supabase
      .from("approver_master")
      .update({
        email: input.email,
        name: input.name || null,
        step_order: input.step_order,
        is_active: input.is_active ?? true,
      })
      .eq("id", id)
      .select("*")
      .single()

    if (error) throw new Error(error.message)

    return data
  }

  async deleteApproverMaster(id: string): Promise<void> {
    const { error } = await supabase
      .from("approver_master")
      .delete()
      .eq("id", id)

    if (error) throw new Error(error.message)
  }

  // ========================
  // Helpers
  // ========================

  private normalizeChain(data: Record<string, unknown>): ApprovalChain {
    const steps = Array.isArray(data.steps)
      ? (data.steps as ApprovalStep[]).sort((a, b) => a.step_order - b.step_order)
      : []

    return {
      ...(data as unknown as ApprovalChain),
      steps,
    }
  }
}
