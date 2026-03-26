import type { RecruitmentTrackingRepository } from "@/domain/repositories/RecruitmentTrackingRepository"

export function sendCandidateCredentials(
  repo: RecruitmentTrackingRepository,
  invitationId: string,
): Promise<void> {
  return repo.sendCredentials(invitationId)
}
