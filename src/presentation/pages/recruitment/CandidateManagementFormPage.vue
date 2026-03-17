<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-8 text-gray-900">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        @click="router.back()"
      >
        ←
      </button>
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Staff Rekrutmen</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">
          {{ isEdit ? "Detail Kandidat" : "Tambah Kandidat Baru" }}
        </h1>
      </div>
    </div>

    <p v-if="error" class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </p>

    <div v-if="loading && isEdit" class="py-10 text-center text-sm text-gray-500">
      Memuat data...
    </div>

    <template v-else>
      <!-- Create Invitation Form -->
      <section v-if="!isEdit" class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleCreateInvitation">
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Nama Lengkap *</span>
            <input v-model="invForm.candidate_name" class="field" type="text" required>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Email *</span>
            <input v-model="invForm.candidate_email" class="field" type="email" required>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Posisi Dilamar</span>
            <input v-model="invForm.position_applied" class="field" type="text">
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Tracking ID *</span>
            <select v-model="invForm.tracking_id" class="field" required>
              <option value="">Pilih Job Request</option>
              <option v-for="t in trackings" :key="t.id" :value="t.id">
                {{ t.job_request?.main_position || t.id }}
              </option>
            </select>
          </label>
          <div class="flex gap-3 pt-4 border-t border-gray-100 md:col-span-2">
            <button
              type="submit"
              class="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              :disabled="saving"
            >
              {{ saving ? "Menyimpan..." : "Tambah Kandidat" }}
            </button>
            <button
              type="button"
              class="rounded-2xl border border-gray-200 px-8 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              :disabled="saving"
              @click="router.back()"
            >
              Batal
            </button>
          </div>
        </form>
      </section>

      <!-- Selected Invitation Detail -->
      <section v-else-if="selectedInvitation" class="space-y-6">
        <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-xl font-semibold">{{ selectedInvitation.candidate_name }}</h2>

          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-2xl bg-gray-50 px-4 py-3">
              <p class="text-xs uppercase tracking-wider text-gray-500 font-medium">Email</p>
              <p class="mt-1 text-sm font-medium truncate" :title="selectedInvitation.candidate_email">{{ selectedInvitation.candidate_email }}</p>
            </div>
            <div class="rounded-2xl bg-gray-50 px-4 py-3">
              <p class="text-xs uppercase tracking-wider text-gray-500 font-medium">Status</p>
              <p class="mt-1 text-sm font-medium text-blue-700">{{ invStatusLabel(selectedInvitation.status) }}</p>
            </div>
            <div class="rounded-2xl bg-gray-50 px-4 py-3">
              <p class="text-xs uppercase tracking-wider text-gray-500 font-medium">Credential Sent</p>
              <p class="mt-1 text-sm font-medium">{{ formatDate(selectedInvitation.credential_sent_at) }}</p>
            </div>
            <div class="rounded-2xl bg-gray-50 px-4 py-3">
              <p class="text-xs uppercase tracking-wider text-gray-500 font-medium">Form Progress</p>
              <div class="mt-1 flex items-center gap-2">
                <div class="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    class="h-full rounded-full bg-blue-500 transition-all"
                    :style="{ width: `${selectedInvitation.form_progress}%` }"
                  />
                </div>
                <span class="text-sm font-medium">{{ selectedInvitation.form_progress }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Send Credentials -->
        <div v-if="selectedInvitation.status === 'invited'" class="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
          <h3 class="mb-4 text-lg font-semibold text-blue-900">Kirim Credential Form Aplikasi</h3>
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="credentialUserId"
              class="flex-1 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="text"
              placeholder="User ID (dari admin panel untuk kandidat login)"
            >
            <button
              type="button"
              class="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              :disabled="saving || !credentialUserId"
              @click="handleSendCredentials"
            >
              Kirim Credential
            </button>
          </div>
        </div>

        <!-- Schedule Interview -->
        <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 class="mb-4 text-lg font-semibold text-gray-900">Jadwalkan Interview</h3>
          <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleScheduleInterview">
            <label class="space-y-2">
              <span class="text-sm font-medium text-gray-700">Meeting Link *</span>
              <input v-model="interviewForm.meeting_link" class="field" type="url" required placeholder="https://zoom.us/...">
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-gray-700">Tipe Media</span>
              <select v-model="interviewForm.meeting_type" class="field">
                <option value="zoom">Zoom</option>
                <option value="gmeet">Google Meet</option>
                <option value="other">Lainnya</option>
              </select>
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-gray-700">Tanggal & Waktu</span>
              <input v-model="interviewForm.scheduled_at" class="field" type="datetime-local">
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-gray-700">Catatan</span>
              <input v-model="interviewForm.notes" class="field" type="text" placeholder="Info tambahan...">
            </label>
            <div class="pt-2 md:col-span-2">
              <button
                type="submit"
                class="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                :disabled="saving"
              >
                Kirim Link Interview
              </button>
            </div>
          </form>

          <!-- Interview History -->
          <div v-if="selectedInvitation.interviews.length > 0" class="mt-8 pt-6 border-t border-gray-100 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Histori Interview & Jadwal</h3>
            <div
              v-for="interview in selectedInvitation.interviews"
              :key="interview.id"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4"
            >
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">
                  <span class="uppercase tracking-wider text-xs text-gray-500 mr-2">{{ interview.meeting_type }}</span>
                  <a :href="interview.meeting_link" target="_blank" class="text-blue-600 hover:text-blue-800 hover:underline transition">
                    {{ interview.meeting_link }}
                  </a>
                </p>
                <p class="mt-1.5 text-sm text-gray-600">
                  <span class="font-medium">{{ formatDate(interview.scheduled_at) }}</span>
                  <span v-if="interview.notes" class="ml-2 italic text-gray-500">"{{ interview.notes }}"</span>
                </p>
              </div>
              <div class="shrink-0 pt-2 sm:pt-0">
                <span
                  v-if="interview.attendance_confirmed"
                  class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Hadir
                </span>
                <button
                  v-else
                  type="button"
                  class="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
                  :disabled="saving"
                  @click="handleConfirmAttendance(interview.id)"
                >
                  Konfirmasi Kehadiran
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div v-else-if="isEdit && !selectedInvitation" class="py-10 text-center text-sm text-gray-500">
        Data kandidat tidak ditemukan.
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"

import type { CandidateInvitationInput, CandidateInvitationStatus } from "@/domain/entities/RecruitmentTracking"
import { useAppToast } from "@/presentation/components/feedback/useAppToast"
import { useRecruitmentTrackingViewModel } from "@/viewmodels/useRecruitmentTrackingViewModel"

const route = useRoute()
const router = useRouter()
const {
  trackings,
  invitations,
  loading,
  saving,
  error,
  refreshInvitations,
  refreshTrackings,
  createInvitation,
  sendCredentials,
  scheduleInterview,
  confirmAttendance,
} = useRecruitmentTrackingViewModel()
const appToast = useAppToast()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)
const credentialUserId = ref("")

const selectedInvitationId = computed(() => id.value ?? "")

const selectedInvitation = computed(() =>
  invitations.value.find((inv) => inv.id === selectedInvitationId.value) ?? null,
)

// Invitation form
const invForm = reactive<CandidateInvitationInput>({
  tracking_id: "",
  candidate_name: "",
  candidate_email: "",
  position_applied: "",
})

// Interview form
const interviewForm = reactive({
  meeting_link: "",
  meeting_type: "zoom",
  scheduled_at: "",
  notes: "",
})

onMounted(() => {
  if (trackings.value.length === 0) refreshTrackings()
  if (invitations.value.length === 0) refreshInvitations()
})

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function invStatusLabel(status: CandidateInvitationStatus) {
  const map: Record<CandidateInvitationStatus, string> = {
    invited: "Diundang",
    credentials_sent: "Credential Terkirim",
    form_in_progress: "Mengisi Form",
    form_completed: "Form Selesai",
    interview_scheduled: "Interview Dijadwalkan",
    confirmed: "Hadir Dikonfirmasi",
    rejected: "Ditolak",
  }
  return map[status] || status
}

async function handleCreateInvitation() {
  try {
    await createInvitation({ ...invForm })
    appToast.created("Kandidat")
    router.push("/candidate-management")
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menambah kandidat."
    appToast.error(message)
  }
}

async function handleSendCredentials() {
  if (!selectedInvitationId.value || !credentialUserId.value) return
  try {
    await sendCredentials(selectedInvitationId.value, credentialUserId.value)
    appToast.success("Credential berhasil dikirim.")
    credentialUserId.value = ""
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal kirim credential."
    appToast.error(message)
  }
}

async function handleScheduleInterview() {
  if (!selectedInvitationId.value) return
  try {
    await scheduleInterview({
      invitation_id: selectedInvitationId.value,
      meeting_link: interviewForm.meeting_link,
      meeting_type: interviewForm.meeting_type,
      scheduled_at: interviewForm.scheduled_at,
      notes: interviewForm.notes,
    })
    appToast.success("Link interview berhasil dikirim.")
    interviewForm.meeting_link = ""
    interviewForm.meeting_type = "zoom"
    interviewForm.scheduled_at = ""
    interviewForm.notes = ""
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal jadwalkan interview."
    appToast.error(message)
  }
}

async function handleConfirmAttendance(scheduleId: string) {
  try {
    await confirmAttendance(scheduleId)
    appToast.success("Kehadiran dikonfirmasi.")
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal konfirmasi kehadiran."
    appToast.error(message)
  }
}
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(209 213 219);
  background: rgb(249 250 251);
  padding: 0.75rem 1rem;
  color: rgb(17 24 39);
  outline: none;
  transition: all 0.2s;
}

.field:focus {
  border-color: rgb(37 99 235);
  background: white;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
</style>
