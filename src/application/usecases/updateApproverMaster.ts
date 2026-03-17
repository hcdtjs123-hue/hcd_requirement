import type { ApproverMaster, ApproverMasterInput } from "@/domain/entities/ApprovalChain"
import type { ApprovalRepository } from "@/domain/repositories/ApprovalRepository"

export function updateApproverMaster(
  repo: ApprovalRepository,
  id: string,
  data: ApproverMasterInput,
): Promise<ApproverMaster> {
  return repo.updateApproverMaster(id, data)
}
