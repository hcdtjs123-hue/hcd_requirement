// ===========================
// Recruitment Tracking
// ===========================

export type RecruitmentStatus =
  | "pending_review"
  | "approved"
  | "posting_uploaded"
  | "candidates_invited"

export interface JobPostingFile {
  id: string
  tracking_id: string
  file_name: string
  file_path: string
  file_type: string | null
  uploaded_at: string | null
}

export interface RecruitmentTracking {
  id: string
  job_request_id: string
  chain_id: string | null
  staff_id: string | null
  status: RecruitmentStatus
  staff_approved_at: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
  files: JobPostingFile[]
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

// ===========================
// Candidate Invitation
// ===========================

export type CandidateInvitationStatus =
  | "invited"
  | "credentials_sent"
  | "form_in_progress"
  | "form_completed"
  | "interview_scheduled"
  | "confirmed"
  | "rejected"

export interface CandidateInvitation {
  id: string
  tracking_id: string | null
  candidate_name: string
  candidate_email: string
  position_applied: string | null
  user_id: string | null
  credential_sent_at: string | null
  form_progress: number
  status: CandidateInvitationStatus
  created_by: string | null
  created_at: string | null
  updated_at: string | null
  interviews: InterviewSchedule[]
}

// ===========================
// Interview Schedule
// ===========================

export interface InterviewSchedule {
  id: string
  invitation_id: string
  meeting_link: string
  meeting_type: string
  scheduled_at: string | null
  notes: string | null
  attendance_confirmed: boolean
  confirmed_at: string | null
  sent_by: string | null
  created_at: string | null
}

// ===========================
// Input Types
// ===========================

export interface CandidateInvitationInput {
  tracking_id: string
  candidate_name: string
  candidate_email: string
  position_applied: string
  user_id?: string | null
}

export interface InterviewScheduleInput {
  invitation_id: string
  meeting_link: string
  meeting_type: string
  scheduled_at: string
  notes: string
}
