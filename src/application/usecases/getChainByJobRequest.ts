import type { ApprovalChain } from "@/domain/entities/ApprovalChain"
import type { ApprovalRepository } from "@/domain/repositories/ApprovalRepository"

export function getChainByJobRequest(
  repo: ApprovalRepository,
  jobRequestId: string,
): Promise<ApprovalChain | null> {
  return repo.getChainByJobRequest(jobRequestId)
}
