import type { RecruitmentTrackingRepository } from "@/domain/repositories/RecruitmentTrackingRepository"

export function approveRecruitmentTracking(
  repo: RecruitmentTrackingRepository,
  id: string,
  notes?: string,
): Promise<void> {
  return repo.approveTracking(id, notes)
}
