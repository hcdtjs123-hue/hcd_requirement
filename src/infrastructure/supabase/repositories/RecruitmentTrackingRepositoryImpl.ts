import { supabase } from "@/infrastructure/supabase/client"
import type { RecruitmentTracking } from "@/domain/entities/RecruitmentTracking"
import type { RecruitmentTrackingRepository } from "@/domain/repositories/RecruitmentTrackingRepository"

const trackingSelect = `
  *,
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
    return {
      ...(data as unknown as RecruitmentTracking),
    }
  }
}
