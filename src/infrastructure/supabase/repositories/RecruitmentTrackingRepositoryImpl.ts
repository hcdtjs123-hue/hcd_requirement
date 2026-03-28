import { supabase } from "@/infrastructure/supabase/client"
import type { RecruitmentTracking } from "@/domain/entities/RecruitmentTracking"
import type { RecruitmentTrackingRepository } from "@/domain/repositories/RecruitmentTrackingRepository"

const trackingSelect = `
  *,
  job_request:employee_request_form(
    id,
    pt:master_pt(name),
    department_ref:master_department(name),
    job_level_ref:master_job_level(name),
    main_position,
    site,
    working_location,
    employment_status,
    position_status,
    required_date,
    status,
    closed_date,
    custom_grup_1:master_custom_grup_1(name),
    custom_grup_2:master_custom_grup_2(name),
    custom_grup_3:master_custom_grup_3(name),
    custom_grup_4:master_custom_grup_4(name),
    custom_grup_5:master_custom_grup_5(name),
    custom_grup_6:master_custom_grup_6(name),
    approval_director_bu,
    approval_director_bu_date,
    approval_gm_hrd,
    approval_gm_hrd_date,
    approval_director_hrd,
    approval_director_hrd_date
  )
`

export class RecruitmentTrackingRepositoryImpl implements RecruitmentTrackingRepository {
  async getAll(): Promise<RecruitmentTracking[]> {
    const { data, error } = await supabase
      .from("recruitment_tracking")
      .select(trackingSelect)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)

    return (data ?? []).map(this.normalizeTracking)
  }

  async getById(id: string): Promise<RecruitmentTracking | null> {
    const { data, error } = await supabase
      .from("recruitment_tracking")
      .select(trackingSelect)
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(error.message)

    return data ? this.normalizeTracking(data) : null
  }

  private normalizeTracking(data: Record<string, unknown>): RecruitmentTracking {
    const jobRequest = data.job_request as
      | (Record<string, unknown> & {
          pt?: { name?: string | null } | null
          department_ref?: { name?: string | null } | null
          job_level_ref?: { name?: string | null } | null
          custom_grup_1?: { name?: string | null } | null
          custom_grup_2?: { name?: string | null } | null
          custom_grup_3?: { name?: string | null } | null
          custom_grup_4?: { name?: string | null } | null
          custom_grup_5?: { name?: string | null } | null
          custom_grup_6?: { name?: string | null } | null
        })
      | null

    return {
      ...(data as unknown as RecruitmentTracking),
      job_request: jobRequest
        ? ({
            ...jobRequest,
            pt_pembebanan: jobRequest.pt?.name ?? null,
            department: jobRequest.department_ref?.name ?? null,
            job_level: jobRequest.job_level_ref?.name ?? null,
            custom_grup_1: jobRequest.custom_grup_1?.name ?? null,
            custom_grup_2: jobRequest.custom_grup_2?.name ?? null,
            custom_grup_3: jobRequest.custom_grup_3?.name ?? null,
            custom_grup_4: jobRequest.custom_grup_4?.name ?? null,
            custom_grup_5: jobRequest.custom_grup_5?.name ?? null,
            custom_grup_6: jobRequest.custom_grup_6?.name ?? null,
          } as RecruitmentTracking['job_request'])
        : null,
    }
  }
}
