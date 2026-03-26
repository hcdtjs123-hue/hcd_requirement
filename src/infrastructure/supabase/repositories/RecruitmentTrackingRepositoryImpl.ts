import { supabase } from "@/infrastructure/supabase/client"
import type {
  RecruitmentTracking,
  CandidateInvitation,
  CandidateInvitationInput,
  InterviewSchedule,
  InterviewScheduleInput,
} from "@/domain/entities/RecruitmentTracking"
import type { RecruitmentTrackingRepository } from "@/domain/repositories/RecruitmentTrackingRepository"

const trackingSelect = `
  *,
  files:job_posting_files(*),
  job_request:new_employee_application_form(
    id,
    main_position,
    site,
    employment_status,
    required_date,
    approval_director_bu,
    approval_director_bu_date,
    approval_gm_hrd,
    approval_gm_hrd_date,
    approval_director_hrd,
    approval_director_hrd_date
  )
`

const invitationSelect = `
  *,
  interviews:interview_schedules(*)
`

export class RecruitmentTrackingRepositoryImpl implements RecruitmentTrackingRepository {
  // ========================
  // Recruitment Tracking
  // ========================

  async getAll(): Promise<RecruitmentTracking[]> {
    const { data, error } = await supabase
      .from("recruitment_tracking")
      .select(trackingSelect)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)

    return (data ?? []).map(this.normalizeTracking)
  }

  async getById(id: string): Promise<RecruitmentTracking | null> {
    const { data, error } = await supabase
      .from("recruitment_tracking")
      .select(trackingSelect)
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(error.message)

    return data ? this.normalizeTracking(data) : null
  }

  async approveTracking(id: string, notes?: string): Promise<void> {
    const user = await supabase.auth.getUser()

    const { error } = await supabase
      .from("recruitment_tracking")
      .update({
        status: "approved",
        staff_id: user.data.user?.id ?? null,
        staff_approved_at: new Date().toISOString(),
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw new Error(error.message)
  }

  async uploadPostingFiles(trackingId: string, files: File[]): Promise<void> {
    for (const file of files) {
      const filePath = `postings/${trackingId}/${Date.now()}_${file.name}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("job-postings")
        .upload(filePath, file)

      if (uploadError) throw new Error(`Failed to upload file ${file.name}: ${uploadError.message}`)

      // Record in database
      const { error: insertError } = await supabase
        .from("job_posting_files")
        .insert({
          tracking_id: trackingId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type.includes("pdf") ? "pdf" : "image",
        })

      if (insertError) throw new Error(insertError.message)
    }

    // Update tracking status
    await supabase
      .from("recruitment_tracking")
      .update({
        status: "posting_uploaded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", trackingId)
  }

  // ========================
  // Candidate Invitations
  // ========================

  async getInvitationsByTracking(trackingId: string): Promise<CandidateInvitation[]> {
    const { data, error } = await supabase
      .from("candidate_invitations")
      .select(invitationSelect)
      .eq("tracking_id", trackingId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)

    return (data ?? []).map(this.normalizeInvitation)
  }

  async getAllInvitations(): Promise<CandidateInvitation[]> {
    const { data, error } = await supabase
      .from("candidate_invitations")
      .select(invitationSelect)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)

    return (data ?? []).map(this.normalizeInvitation)
  }

  async createInvitation(input: CandidateInvitationInput): Promise<CandidateInvitation> {
    const user = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("candidate_invitations")
      .insert({
        tracking_id: input.tracking_id,
        candidate_name: input.candidate_name,
        candidate_email: input.candidate_email,
        position_applied: input.position_applied || null,
        user_id: input.user_id || null,
        status: "invited",
        created_by: user.data.user?.id ?? null,
      })
      .select(invitationSelect)
      .single()

    if (error) throw new Error(error.message)

    return this.normalizeInvitation(data)
  }

  async sendCredentials(invitationId: string): Promise<void> {
    const { data: invitation, error: invitationError } = await supabase
      .from("candidate_invitations")
      .select("id, candidate_email")
      .eq("id", invitationId)
      .single()

    if (invitationError) throw new Error(invitationError.message)

    const candidateEmail = invitation.candidate_email?.trim().toLowerCase()
    if (!candidateEmail) {
      throw new Error("Candidate email is missing. Please complete the invitation data first.")
    }

    const { data: candidateAccount, error: accountError } = await supabase
      .from("employees")
      .select("id, email")
      .ilike("email", candidateEmail)
      .maybeSingle()

    if (accountError) throw new Error(accountError.message)
    if (!candidateAccount?.id) {
      throw new Error(
        `No candidate account was found for ${candidateEmail}. Please create the candidate user account first.`,
      )
    }

    const { error } = await supabase
      .from("candidate_invitations")
      .update({
        user_id: candidateAccount.id,
        status: "credentials_sent",
        credential_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitationId)

    if (error) throw new Error(error.message)
  }

  async updateInvitationStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from("candidate_invitations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw new Error(error.message)
  }

  // ========================
  // Interview Scheduling
  // ========================

  async scheduleInterview(input: InterviewScheduleInput): Promise<InterviewSchedule> {
    const user = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("interview_schedules")
      .insert({
        invitation_id: input.invitation_id,
        meeting_link: input.meeting_link,
        meeting_type: input.meeting_type || "zoom",
        scheduled_at: input.scheduled_at || null,
        notes: input.notes || null,
        sent_by: user.data.user?.id ?? null,
      })
      .select("*")
      .single()

    if (error) throw new Error(error.message)

    // Update invitation status
    await supabase
      .from("candidate_invitations")
      .update({
        status: "interview_scheduled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.invitation_id)

    return data as InterviewSchedule
  }

  async confirmAttendance(scheduleId: string): Promise<void> {
    const { data: schedule, error: fetchError } = await supabase
      .from("interview_schedules")
      .select("invitation_id")
      .eq("id", scheduleId)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    const { error } = await supabase
      .from("interview_schedules")
      .update({
        attendance_confirmed: true,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", scheduleId)

    if (error) throw new Error(error.message)

    // Update invitation status
    await supabase
      .from("candidate_invitations")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", schedule.invitation_id)
  }

  // ========================
  // Helpers
  // ========================

  private normalizeTracking(data: Record<string, unknown>): RecruitmentTracking {
    return {
      ...(data as unknown as RecruitmentTracking),
      files: Array.isArray(data.files) ? data.files as RecruitmentTracking["files"] : [],
    }
  }

  private normalizeInvitation(data: Record<string, unknown>): CandidateInvitation {
    return {
      ...(data as unknown as CandidateInvitation),
      interviews: Array.isArray(data.interviews)
        ? data.interviews as CandidateInvitation["interviews"]
        : [],
    }
  }
}
