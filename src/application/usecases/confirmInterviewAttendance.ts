import type { RecruitmentTrackingRepository } from "@/domain/repositories/RecruitmentTrackingRepository"

export function confirmInterviewAttendance(
  repo: RecruitmentTrackingRepository,
  scheduleId: string,
): Promise<void> {
  return repo.confirmAttendance(scheduleId)
}
