import { supabase } from '@/infrastructure/supabase/client'
import type { JobRequest, JobRequestInput } from '@/domain/entities/JobRequest'
import type { JobRequestRepository } from '@/domain/repositories/JobRequestRepository'
import { approvalRepo } from '@/infrastructure/container'

export class JobRequestRepositoryImpl implements JobRequestRepository {
  async getAll(): Promise<JobRequest[]> {
    const accessScope = await this.getAccessScope()
    let query = supabase.from('new_employee_application_form').select('*')

    if (accessScope.isManager && accessScope.userId) {
      query = query.eq('created_by', accessScope.userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data ?? []
  }

  async getById(id: string): Promise<JobRequest | null> {
    const accessScope = await this.getAccessScope()
    let query = supabase.from('new_employee_application_form').select('*').eq('id', id)

    if (accessScope.isManager && accessScope.userId) {
      query = query.eq('created_by', accessScope.userId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async create(data: JobRequestInput): Promise<JobRequest> {
    const user = await supabase.auth.getUser()

    // Auto-populate: find active GM HRD approver from approver_master
    const { data: gmHrdApprover } = await supabase
      .from('approver_master')
      .select('employee:employees(first_name, middle_name, last_name, email)')
      .ilike('jabatan', '%GM HRD%')
      .order('step_order', { ascending: true })
      .limit(1)
      .maybeSingle()

    // Auto-populate: find active Direktur HRD approver from approver_master
    const { data: directorHrdApprover } = await supabase
      .from('approver_master')
      .select('employee:employees(first_name, middle_name, last_name, email)')
      .ilike('jabatan', '%Direktur HRD%')
      .order('step_order', { ascending: true })
      .limit(1)
      .maybeSingle()

    const gmEmployee = (gmHrdApprover?.employee as any)
    const approvalGmHrd = gmEmployee
      ? [gmEmployee.first_name, gmEmployee.middle_name, gmEmployee.last_name]
          .filter(Boolean)
          .join(' ')
      : null

    const directorEmployee = (directorHrdApprover?.employee as any)
    const approvalDirectorHrd = directorEmployee
      ? [directorEmployee.first_name, directorEmployee.middle_name, directorEmployee.last_name]
          .filter(Boolean)
          .join(' ')
      : null

    const payload = {
      ...this.mapInput(data),
      approval_gm_hrd: approvalGmHrd,
      approval_director_hrd: approvalDirectorHrd,
      created_by: user.data.user?.id ?? null,
    }

    const { data: created, error } = await supabase
      .from('new_employee_application_form')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Automatically trigger approval chain
    try {
      if (created) {
        await approvalRepo.submitForApproval({ job_request_id: created.id })
      }
    } catch (err) {
      console.error('Failed to start approval chain:', err)
      // We don't throw here to avoid failing the Job Request creation itself,
      // but in production we might want more robust error handling.
    }

    return created
  }

  async update(id: string, data: JobRequestInput): Promise<JobRequest> {
    const accessScope = await this.getAccessScope()

    let query = supabase
      .from('new_employee_application_form')
      .update({
        ...this.mapInput(data),
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
      throw new Error('Data job request tidak ditemukan atau tidak dapat diakses.')
    }

    return updated
  }

  async delete(id: string): Promise<void> {
    const accessScope = await this.getAccessScope()
    let query = supabase.from('new_employee_application_form').delete().eq('id', id)

    if (accessScope.isManager && accessScope.userId) {
      query = query.eq('created_by', accessScope.userId)
    }

    const { data, error } = await query.select('id')

    if (error) {
      throw new Error(error.message)
    }

    if (accessScope.isManager && (!data || data.length === 0)) {
      throw new Error('Data job request tidak ditemukan atau tidak dapat dihapus.')
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

  private mapInput(data: JobRequestInput) {
    return {
      pt_pembebanan: data.pt_pembebanan || null,
      employment_status: data.employment_status || null,
      direct_manager: data.direct_manager || null,
      approval_director_bu: data.approval_director_bu || null,
      approval_director_bu_date: data.approval_director_bu_date || null,
      site: data.site || null,
      working_location: data.working_location || null,
      custom_grup_1: data.custom_grup_1 || null,
      custom_grup_2: data.custom_grup_2 || null,
      custom_grup_3: data.custom_grup_3 || null,
      custom_grup_4: data.custom_grup_4 || null,
      custom_grup_5: data.custom_grup_5 || null,
      custom_grup_6: data.custom_grup_6 || null,
      required_date: data.required_date || null,
      position_status: data.position_status || null,
      periode_probation: data.periode_probation ?? null,
      main_position: data.main_position || null,
    }
  }
}
