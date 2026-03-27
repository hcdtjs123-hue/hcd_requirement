export const employmentStatusOptions = ["Daily", "Probation", "Contract"] as const
export const positionStatusOptions = [
  "Replacement",
  "New Position MPP",
  "New Position Non-MPP",
  "Internship",
] as const

export type EmploymentStatus = (typeof employmentStatusOptions)[number]
export type PositionStatus = (typeof positionStatusOptions)[number]

export interface JobRequest {
  id: string
  pt_id?: string | null
  pt_pembebanan: string | null
  department_id?: string | null
  department: string | null
  job_level_id?: string | null
  job_level: string | null
  employment_status: EmploymentStatus | null
  direct_manager: string | null
  approval_director_bu_id: string | null
  approval_director_bu: string | null
  approval_director_bu_date: string | null
  approval_gm_hrd: string | null
  approval_gm_hrd_date: string | null
  approval_director_hrd: string | null
  approval_director_hrd_date: string | null
  site: string | null
  working_location: string | null
  custom_grup_1_id: string | null
  custom_grup_2_id: string | null
  custom_grup_3_id: string | null
  custom_grup_4_id: string | null
  custom_grup_5_id: string | null
  custom_grup_6_id: string | null
  custom_grup_1?: string | null
  custom_grup_2?: string | null
  custom_grup_3?: string | null
  custom_grup_4?: string | null
  custom_grup_5?: string | null
  custom_grup_6?: string | null
  required_date: string | null
  position_status: PositionStatus | null
  periode_probation: number | null
  main_position: string | null
  created_by: string | null
  created_by_name?: string | null
  status: 'open' | 'closed'
  closed_date: string | null
  closed_category: 'employee hired' | 'canceled' | null
  reason: string | null
  created_at: string | null
  updated_at: string | null
}

export interface JobRequestInput {
  pt_id?: string | null
  pt_pembebanan: string
  department_id?: string | null
  department: string
  job_level_id?: string | null
  job_level: string
  employment_status: EmploymentStatus | ""
  direct_manager: string
  approval_director_bu_id: string | null
  approval_director_bu?: string
  approval_director_bu_date?: string
  site: string
  working_location: string
  custom_grup_1_id: string | null
  custom_grup_2_id: string | null
  custom_grup_3_id: string | null
  custom_grup_4_id: string | null
  custom_grup_5_id: string | null
  custom_grup_6_id: string | null
  required_date: string
  position_status: PositionStatus | ""
  periode_probation: number | null
  main_position: string
  status: 'open' | 'closed'
  closed_date?: string | null
  closed_category?: 'employee hired' | 'canceled' | null
  reason?: string | null
}
