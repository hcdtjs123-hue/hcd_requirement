import type {
  ApprovalChain,
  ApproverMaster,
  ApproverMasterInput,
  SubmitApprovalInput,
} from '@/domain/entities/ApprovalChain'

export interface ApprovalRepository {
  // Approval Chain
  getChainsByUser(): Promise<ApprovalChain[]>
  getChainByEmployeeRequestForm(employeeRequestFormId: string): Promise<ApprovalChain | null>
  submitForApproval(data: SubmitApprovalInput): Promise<ApprovalChain>

  approveAssignedStep(stepId: string, notes?: string): Promise<void>
  rejectAssignedStep(stepId: string, notes?: string): Promise<void>

  // Approver Master Data
  getAllApproverMasters(): Promise<ApproverMaster[]>
  createApproverMaster(data: ApproverMasterInput): Promise<ApproverMaster>
  updateApproverMaster(id: string, data: ApproverMasterInput): Promise<ApproverMaster>
  deleteApproverMaster(id: string): Promise<void>
}
