import type { CandidateInvitation } from "@/domain/entities/RecruitmentTracking"
import type { RecruitmentTrackingRepository } from "@/domain/repositories/RecruitmentTrackingRepository"

export function getAllCandidateInvitations(
  repo: RecruitmentTrackingRepository,
): Promise<CandidateInvitation[]> {
  return repo.getAllInvitations()
}
