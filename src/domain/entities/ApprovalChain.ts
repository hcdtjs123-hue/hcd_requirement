// ===========================
// Approval Chain & Steps
// ===========================

export type ApprovalChainStatus = "draft" | "pending" | "approved" | "rejected"
export type ApprovalStepStatus = "pending" | "approved" | "rejected"

export interface ApprovalStep {
  id: string
  chain_id: string
  step_order: number
  approver_email: string
  approver_name: string | null
  token: string
  status: ApprovalStepStatus
  approved_at: string | null
  notes: string | null
  created_at: string | null
}

export interface ApprovalChain {
  id: string
  job_request_id: string
  created_by: string | null
  status: ApprovalChainStatus
  created_at: string | null
  updated_at: string | null
  steps: ApprovalStep[]
  job_request?: {
    id: string
    main_position: string | null
    site: string | null
    employment_status: string | null
    direct_manager: string | null
    pt_pembebanan: string | null
    working_location: string | null
    required_date: string | null
    position_status: string | null
    periode_probation: number | null
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

// ===========================
// Approver Master (reusable template)
// ===========================

export interface ApproverMaster {
  id: string
  employee_id: string
  step_order: number
  created_by: string | null
  created_at: string | null
  employee?: {
    first_name: string
    middle_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
    main_position: string | null
  }
}

// ===========================
// Input Types
// ===========================

export interface ApproverMasterInput {
  employee_id: string
  step_order: number
}

export interface SubmitApprovalInput {
  job_request_id: string
}
