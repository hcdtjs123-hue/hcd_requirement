import type { ApproverMaster, ApproverMasterInput } from "@/domain/entities/ApprovalChain"
import type { ApprovalRepository } from "@/domain/repositories/ApprovalRepository"

export function createApproverMaster(
  repo: ApprovalRepository,
  data: ApproverMasterInput,
): Promise<ApproverMaster> {
  return repo.createApproverMaster(data)
}
