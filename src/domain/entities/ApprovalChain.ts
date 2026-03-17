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
    designation: string | null
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
  } | null
}

// ===========================
// Approver Master (reusable template)
// ===========================

export interface ApproverMaster {
  id: string
  email: string
  name: string | null
  step_order: number
  is_active: boolean
  created_by: string | null
  created_at: string | null
}

// ===========================
// Input Types
// ===========================

export interface ApproverMasterInput {
  email: string
  name: string
  step_order: number
  is_active?: boolean
}

export interface SubmitApprovalInput {
  job_request_id: string
}
