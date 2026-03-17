import type { RecruitmentTrackingRepository } from "@/domain/repositories/RecruitmentTrackingRepository"

export function uploadPostingFiles(
  repo: RecruitmentTrackingRepository,
  trackingId: string,
  files: File[],
): Promise<void> {
  return repo.uploadPostingFiles(trackingId, files)
}
