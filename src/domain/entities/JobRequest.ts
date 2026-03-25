export const employmentStatusOptions = ["Harian", "Probation", "Kontrak"] as const
export const positionStatusOptions = [
  "Pengganti",
  "Posisi Baru MPP",
  "Posisi Baru Non MPP",
  "Magang",
] as const

export type EmploymentStatus = (typeof employmentStatusOptions)[number]
export type PositionStatus = (typeof positionStatusOptions)[number]

export interface JobRequest {
  id: string
  pt_pembebanan: string | null
  employment_status: EmploymentStatus | null
  direct_manager: string | null
  approval_director_bu: string | null
  approval_director_bu_date: string | null
  approval_gm_hrd: string | null
  approval_gm_hrd_date: string | null
  approval_director_hrd: string | null
  approval_director_hrd_date: string | null
  site: string | null
  working_location: string | null
  custom_grup_1: string | null
  custom_grup_2: string | null
  custom_grup_3: string | null
  custom_grup_4: string | null
  custom_grup_5: string | null
  custom_grup_6: string | null
  required_date: string | null
  position_status: PositionStatus | null
  periode_probation: number | null
  main_position: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

export interface JobRequestInput {
  pt_pembebanan: string
  employment_status: EmploymentStatus | ""
  direct_manager: string
  approval_director_bu?: string
  approval_director_bu_date?: string
  site: string
  working_location: string
  custom_grup_1: string
  custom_grup_2: string
  custom_grup_3: string
  custom_grup_4: string
  custom_grup_5: string
  custom_grup_6: string
  required_date: string
  position_status: PositionStatus | ""
  periode_probation: number | null
  main_position: string
}
