import type { ApprovalChain, SubmitApprovalInput } from "@/domain/entities/ApprovalChain"
import type { ApprovalRepository } from "@/domain/repositories/ApprovalRepository"

export function submitForApproval(
  repo: ApprovalRepository,
  data: SubmitApprovalInput,
): Promise<ApprovalChain> {
  return repo.submitForApproval(data)
}
