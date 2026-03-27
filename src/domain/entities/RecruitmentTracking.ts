// ===========================
// Recruitment Tracking
// ===========================

export interface RecruitmentTracking {
  id: string
  job_request_id: string
  chain_id: string | null
  created_at: string | null
  updated_at: string | null
  job_request?: {
    id: string
    main_position: string | null
    site: string | null
    employment_status: string | null
    required_date: string | null
    approval_director_bu: string | null
    approval_director_bu_date: string | null
    approval_gm_hrd: string | null
    approval_gm_hrd_date: string | null
    approval_director_hrd: string | null
    approval_director_hrd_date: string | null
  } | null
}
