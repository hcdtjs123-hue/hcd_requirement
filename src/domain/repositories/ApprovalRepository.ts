import type {
  ApprovalChain,
  ApprovalStep,
  ApproverMaster,
  ApproverMasterInput,
  SubmitApprovalInput,
} from "@/domain/entities/ApprovalChain"

export interface ApprovalRepository {
  // Approval Chain
  getChainsByUser(): Promise<ApprovalChain[]>
  getChainByEmployeeRequestForm(employeeRequestFormId: string): Promise<ApprovalChain | null>
  submitForApproval(data: SubmitApprovalInput): Promise<ApprovalChain>

  // Public Approval (no auth)
  getStepByToken(token: string): Promise<{
    step: ApprovalStep
    chain: ApprovalChain
  } | null>
  approveStep(token: string, notes?: string): Promise<void>
  rejectStep(token: string, notes?: string): Promise<void>
  approveAssignedStep(stepId: string, notes?: string): Promise<void>
  rejectAssignedStep(stepId: string, notes?: string): Promise<void>

  // Approver Master Data
  getAllApproverMasters(): Promise<ApproverMaster[]>
  createApproverMaster(data: ApproverMasterInput): Promise<ApproverMaster>
  updateApproverMaster(id: string, data: ApproverMasterInput): Promise<ApproverMaster>
  deleteApproverMaster(id: string): Promise<void>
}
