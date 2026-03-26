import type {
  RecruitmentTracking,
  CandidateInvitation,
  CandidateInvitationInput,
  InterviewSchedule,
  InterviewScheduleInput,
} from "@/domain/entities/RecruitmentTracking"

export interface RecruitmentTrackingRepository {
  // Recruitment Tracking
  getAll(): Promise<RecruitmentTracking[]>
  getById(id: string): Promise<RecruitmentTracking | null>
  approveTracking(id: string, notes?: string): Promise<void>
  uploadPostingFiles(trackingId: string, files: File[]): Promise<void>

  // Candidate Invitations
  getInvitationsByTracking(trackingId: string): Promise<CandidateInvitation[]>
  getAllInvitations(): Promise<CandidateInvitation[]>
  createInvitation(data: CandidateInvitationInput): Promise<CandidateInvitation>
  sendCredentials(invitationId: string): Promise<void>
  updateInvitationStatus(id: string, status: string): Promise<void>

  // Interview Scheduling
  scheduleInterview(data: InterviewScheduleInput): Promise<InterviewSchedule>
  confirmAttendance(scheduleId: string): Promise<void>
}
