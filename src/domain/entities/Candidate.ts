export const genderOptions = ["Male", "Female"] as const
export const maritalStatusOptions = ["Single", "Married", "Divorced"] as const
export const bloodTypeOptions = ["A", "B", "AB", "O"] as const
export const educationLevelOptions = [
  "SD",
  "SMP",
  "SMA",
  "Diploma",
  "S1",
  "S2",
  "S3",
] as const

export type Gender = (typeof genderOptions)[number]
export type MaritalStatus = (typeof maritalStatusOptions)[number]
export type BloodType = (typeof bloodTypeOptions)[number]
export type EducationLevel = (typeof educationLevelOptions)[number]

export interface FamilyEmergency {
  id: string
  application_id: string
  name: string | null
  relationship: string | null
  gender: Gender | null
  place_and_date_of_birth: string | null
  education: string | null
  description: string | null
}

export interface EducationHistory {
  id: string
  application_id: string
  level: EducationLevel | null
  institution: string | null
  city: string | null
  major: string | null
  from_year: number | null
  to_year: number | null
  category: string | null
  description: string | null
}

export interface WorkHistory {
  id: string
  application_id: string
  company: string | null
  position: string | null
  from_year: number | null
  to_year: number | null
  reason_to_quitting: string | null
  last_salary: number | null
  benefit: string | null
  description: string | null
}

export interface PersonalStatement {
  id: string
  application_id: string
  contract: boolean | null
  contract_period: string | null
  legal_issues: string | null
  reference_check_reason: string | null
  family_details: string | null
  detailed_care: string | null
  serious_accident: string | null
  psychological_test_details: string | null
  business_trip: boolean | null
  expected_salary: number | null
}

export interface CandidateApplication {
  id: string
  job_request_id: string | null
  candidate_id: string | null
  date_application: string | null
  notice_period: string | null
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  hire_location: string | null
  date_of_birth: string | null
  place_of_birth: string | null
  nationality: string | null
  marital_status: MaritalStatus | null
  religion: string | null
  gender: Gender | null
  ethnic: string | null
  blood_type: BloodType | null
  id_card_address: string | null
  residential_address: string | null
  personal_email: string | null
  instagram: string | null
  linkedin: string | null
  phone_number: string | null
  id_type: string | null
  id_no: string | null
  reference_name: string | null
  reference_no: string | null
  reference_relationship: string | null
  reference_position: string | null
  reference_transportation: string | null
  reference_ownership: string | null
  reference_residence: string | null
  created_at: string | null
  updated_at: string | null
  job_request?: {
    id: string
    main_position: string | null
    designation: string | null
    site: string | null
  } | null
  family_and_emergency: FamilyEmergency[]
  education: EducationHistory[]
  work_history: WorkHistory[]
  personal_statement: PersonalStatement | null
}

export interface FamilyEmergencyInput {
  id?: string
  name: string
  relationship: string
  gender: Gender | ""
  place_and_date_of_birth: string
  education: string
  description: string
}

export interface EducationHistoryInput {
  id?: string
  level: EducationLevel | ""
  institution: string
  city: string
  major: string
  from_year: number | null
  to_year: number | null
  category: string
  description: string
}

export interface WorkHistoryInput {
  id?: string
  company: string
  position: string
  from_year: number | null
  to_year: number | null
  reason_to_quitting: string
  last_salary: number | null
  benefit: string
  description: string
}

export interface PersonalStatementInput {
  contract: boolean
  contract_period: string
  legal_issues: string
  reference_check_reason: string
  family_details: string
  detailed_care: string
  serious_accident: string
  psychological_test_details: string
  business_trip: boolean
  expected_salary: number | null
}

export interface CandidateApplicationInput {
  job_request_id: string
  candidate_id?: string | null
  date_application: string
  notice_period: string
  first_name: string
  middle_name: string
  last_name: string
  hire_location: string
  date_of_birth: string
  place_of_birth: string
  nationality: string
  marital_status: MaritalStatus | ""
  religion: string
  gender: Gender | ""
  ethnic: string
  blood_type: BloodType | ""
  id_card_address: string
  residential_address: string
  personal_email: string
  instagram: string
  linkedin: string
  phone_number: string
  id_type: string
  id_no: string
  reference_name: string
  reference_no: string
  reference_relationship: string
  reference_position: string
  reference_transportation: string
  reference_ownership: string
  reference_residence: string
  family_and_emergency: FamilyEmergencyInput[]
  education: EducationHistoryInput[]
  work_history: WorkHistoryInput[]
  personal_statement: PersonalStatementInput
}
