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
    pt_pembebanan: string | null
    department: string | null
    job_level: string | null
    main_position: string | null
    site: string | null
    working_location: string | null
    employment_status: string | null
    position_status: string | null
    required_date: string | null
    status: 'open' | 'closed' | null
    closed_date: string | null
    custom_grup_1: string | null
    custom_grup_2: string | null
    custom_grup_3: string | null
    custom_grup_4: string | null
    custom_grup_5: string | null
    custom_grup_6: string | null
    approval_director_bu: string | null
    approval_director_bu_date: string | null
    approval_gm_hrd: string | null
    approval_gm_hrd_date: string | null
    approval_director_hrd: string | null
    approval_director_hrd_date: string | null
  } | null
}
