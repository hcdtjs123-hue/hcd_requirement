import { onMounted, ref } from "vue"

import type {
  RecruitmentTracking,
  CandidateInvitation,
  CandidateInvitationInput,
  InterviewScheduleInput,
} from "@/domain/entities/RecruitmentTracking"
import { recruitmentTrackingRepo } from "@/infrastructure/container"
import { getRecruitmentTrackings } from "@/application/usecases/getRecruitmentTrackings"
import { approveRecruitmentTracking } from "@/application/usecases/approveRecruitmentTracking"
import { uploadPostingFiles } from "@/application/usecases/uploadPostingFiles"
import { getAllCandidateInvitations } from "@/application/usecases/getAllCandidateInvitations"
import { createCandidateInvitation } from "@/application/usecases/createCandidateInvitation"
import { sendCandidateCredentials } from "@/application/usecases/sendCandidateCredentials"
import { scheduleInterview } from "@/application/usecases/scheduleInterview"
import { confirmInterviewAttendance } from "@/application/usecases/confirmInterviewAttendance"

export function useRecruitmentTrackingViewModel() {
  const trackings = ref<RecruitmentTracking[]>([])
  const invitations = ref<CandidateInvitation[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref("")

  async function refreshTrackings() {
    loading.value = true
    error.value = ""
    try {
      trackings.value = await getRecruitmentTrackings(recruitmentTrackingRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal memuat data tracking."
    } finally {
      loading.value = false
    }
  }

  async function refreshInvitations() {
    loading.value = true
    error.value = ""
    try {
      invitations.value = await getAllCandidateInvitations(recruitmentTrackingRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal memuat data kandidat."
    } finally {
      loading.value = false
    }
  }

  async function approve(id: string, notes?: string) {
    saving.value = true
    error.value = ""
    try {
      await approveRecruitmentTracking(recruitmentTrackingRepo, id, notes)
      await refreshTrackings()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal approve tracking."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function uploadFiles(trackingId: string, files: File[]) {
    saving.value = true
    error.value = ""
    try {
      await uploadPostingFiles(recruitmentTrackingRepo, trackingId, files)
      await refreshTrackings()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal upload file."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function createInvitation(data: CandidateInvitationInput) {
    saving.value = true
    error.value = ""
    try {
      await createCandidateInvitation(recruitmentTrackingRepo, data)
      await refreshInvitations()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal membuat undangan kandidat."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function sendCredentials(invitationId: string, userId: string) {
    saving.value = true
    error.value = ""
    try {
      await sendCandidateCredentials(recruitmentTrackingRepo, invitationId, userId)
      await refreshInvitations()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal mengirim credential."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function createInterview(data: InterviewScheduleInput) {
    saving.value = true
    error.value = ""
    try {
      await scheduleInterview(recruitmentTrackingRepo, data)
      await refreshInvitations()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal menjadwalkan interview."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function confirmAttendance(scheduleId: string) {
    saving.value = true
    error.value = ""
    try {
      await confirmInterviewAttendance(recruitmentTrackingRepo, scheduleId)
      await refreshInvitations()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal konfirmasi kehadiran."
      throw err
    } finally {
      saving.value = false
    }
  }

  onMounted(() => {
    refreshTrackings()
    refreshInvitations()
  })

  return {
    approveTracking: approve,
    confirmAttendance,
    createInvitation,
    error,
    invitations,
    loading,
    refreshInvitations,
    refreshTrackings,
    saving,
    scheduleInterview: createInterview,
    sendCredentials,
    trackings,
    uploadPostingFiles: uploadFiles,
  }
}
