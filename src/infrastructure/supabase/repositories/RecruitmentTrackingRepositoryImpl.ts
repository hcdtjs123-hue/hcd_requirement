import { supabase } from '@/infrastructure/supabase/client'
import type { RecruitmentTracking } from '@/domain/entities/RecruitmentTracking'
import type { RecruitmentTrackingRepository } from '@/domain/repositories/RecruitmentTrackingRepository'

export class RecruitmentTrackingRepositoryImpl implements RecruitmentTrackingRepository {
  async getAll(): Promise<RecruitmentTracking[]> {
    const accessScope = await this.getAccessScope()
    let query = supabase
      .from('recruitment_queue_view')
      .select('*')

    if (accessScope.isManager) {
      if (accessScope.employeeRequestFormIds.length === 0) {
        return []
      }

      query = query.in('employee_request_form_id', accessScope.employeeRequestFormIds)
    }

    const { data, error } = await query.order('updated_at', { ascending: false })

    if (error) throw new Error(error.message)

    return (data ?? []).map(this.normalizeTracking)
  }

  async getById(id: string): Promise<RecruitmentTracking | null> {
    const accessScope = await this.getAccessScope()
    let query = supabase
      .from('recruitment_queue_view')
      .select('*')
      .eq('id', id)

    if (accessScope.isManager) {
      if (accessScope.employeeRequestFormIds.length === 0) {
        return null
      }

      query = query.in('employee_request_form_id', accessScope.employeeRequestFormIds)
    }

    const { data, error } = await query.maybeSingle()

    if (error) throw new Error(error.message)

    return data ? this.normalizeTracking(data) : null
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
        employeeRequestFormIds: [] as string[],
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
    const isManager = roleName?.toLowerCase() === 'manager'

    if (!isManager) {
      return {
        isManager: false,
        employeeRequestFormIds: [] as string[],
      }
    }

    const { data: ownedEmployeeRequestForms, error: ownedEmployeeRequestFormsError } = await supabase
      .from('employee_request_form')
      .select('id')
      .eq('created_by', user.id)

    if (ownedEmployeeRequestFormsError) {
      throw new Error(ownedEmployeeRequestFormsError.message)
    }

    return {
      isManager: true,
      employeeRequestFormIds: (ownedEmployeeRequestForms ?? []).map(
        (employeeRequestForm) => String(employeeRequestForm.id),
      ),
    }
  }

  private normalizeTracking(data: Record<string, unknown>): RecruitmentTracking {
    return {
      id: String(data.id ?? ''),
      chain_id: (data.chain_id as string | null) ?? null,
      employee_request_form_id: String(data.employee_request_form_id ?? ''),
      created_at: (data.created_at as string | null) ?? null,
      updated_at: (data.updated_at as string | null) ?? null,
      employee_request_form: data.employee_request_form_id
        ? {
            id: String(data.employee_request_form_id),
            pt_pembebanan: (data.employee_request_form_pt_pembebanan as string | null) ?? null,
            department: (data.employee_request_form_department as string | null) ?? null,
            job_level: (data.employee_request_form_job_level as string | null) ?? null,
            main_position: (data.employee_request_form_main_position as string | null) ?? null,
            site: (data.employee_request_form_site as string | null) ?? null,
            working_location:
              (data.employee_request_form_working_location as string | null) ?? null,
            employment_status:
              (data.employee_request_form_employment_status as string | null) ?? null,
            position_status:
              (data.employee_request_form_position_status as string | null) ?? null,
            required_date: (data.employee_request_form_required_date as string | null) ?? null,
            status:
              ((data.employee_request_form_status as 'open' | 'closed' | null) ?? null),
            closed_date: (data.employee_request_form_closed_date as string | null) ?? null,
            custom_grup_1: (data.employee_request_form_custom_grup_1 as string | null) ?? null,
            custom_grup_2: (data.employee_request_form_custom_grup_2 as string | null) ?? null,
            custom_grup_3: (data.employee_request_form_custom_grup_3 as string | null) ?? null,
            custom_grup_4: (data.employee_request_form_custom_grup_4 as string | null) ?? null,
            custom_grup_5: (data.employee_request_form_custom_grup_5 as string | null) ?? null,
            custom_grup_6: (data.employee_request_form_custom_grup_6 as string | null) ?? null,
            approval_director_bu:
              (data.employee_request_form_approval_director_bu as string | null) ?? null,
            approval_director_bu_date:
              (data.employee_request_form_approval_director_bu_date as string | null) ?? null,
            approval_gm_hrd:
              (data.employee_request_form_approval_gm_hrd as string | null) ?? null,
            approval_gm_hrd_date:
              (data.employee_request_form_approval_gm_hrd_date as string | null) ?? null,
            approval_director_hrd:
              (data.employee_request_form_approval_director_hrd as string | null) ?? null,
            approval_director_hrd_date:
              (data.employee_request_form_approval_director_hrd_date as string | null) ?? null,
          }
        : null,
    }
  }
}
