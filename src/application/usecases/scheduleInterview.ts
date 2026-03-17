import type { InterviewSchedule, InterviewScheduleInput } from "@/domain/entities/RecruitmentTracking"
import type { RecruitmentTrackingRepository } from "@/domain/repositories/RecruitmentTrackingRepository"

export function scheduleInterview(
  repo: RecruitmentTrackingRepository,
  data: InterviewScheduleInput,
): Promise<InterviewSchedule> {
  return repo.scheduleInterview(data)
}
