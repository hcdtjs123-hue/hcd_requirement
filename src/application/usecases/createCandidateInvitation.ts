import type { CandidateInvitation, CandidateInvitationInput } from "@/domain/entities/RecruitmentTracking"

import type { RecruitmentTrackingRepository } from "@/domain/repositories/RecruitmentTrackingRepository"

export function createCandidateInvitation(
  repo: RecruitmentTrackingRepository,
  data: CandidateInvitationInput,
): Promise<CandidateInvitation> {
  return repo.createInvitation(data)
}
