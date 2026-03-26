<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Recruitment Team</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Recruitment Dashboard</h1>
        <p class="mt-2 text-sm text-gray-600">
          Employee Request Forms (ERF) that are fully approved and ready to be processed.
        </p>
      </div>
      <button
        type="button"
        class="text-sm text-gray-600 transition hover:text-gray-900"
        :disabled="loading"
        @click="refreshTrackings"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <p
      v-if="error"
      class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search position, site, notes..."
        class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
      />
      <select
        v-model="statusFilter"
        class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 sm:w-64"
      >
        <option value="">All Statuses</option>
        <option v-for="opt in statusOptions" :key="opt" :value="opt">
          {{ trackingStatusLabel(opt as RecruitmentStatus) }}
        </option>
      </select>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th class="px-4 py-3 font-medium w-14">No</th>
              <th class="px-4 py-3 font-medium min-w-[180px]">Position</th>
              <th class="px-4 py-3 font-medium min-w-[170px]">Designation</th>
              <th class="px-4 py-3 font-medium min-w-[140px]">Site</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">Employment</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">Required Date</th>
              <th class="px-4 py-3 font-medium min-w-[180px]">Status</th>
              <th class="px-4 py-3 font-medium min-w-[260px]">Posting Files</th>
              <th class="px-4 py-3 font-medium min-w-[220px]">Notes</th>
              <th class="px-4 py-3 font-medium min-w-[170px]">Approved At</th>
              <th class="px-4 py-3 font-medium min-w-[280px]">Recruitment Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(tracking, idx) in pagedTrackings"
              :key="tracking.id"
              class="transition hover:bg-gray-50"
            >
              <td class="px-4 py-3 align-top text-gray-500">
                {{ (page - 1) * pageSize + idx + 1 }}
              </td>
              <td class="px-4 py-3 align-top">
                <h2 class="font-semibold text-gray-900 text-base whitespace-nowrap">
                  {{ tracking.job_request?.main_position || 'No Position' }}
                </h2>
              </td>
              <td class="px-4 py-3 align-top">
                <p class="whitespace-nowrap">{{ tracking.job_request?.main_position || '-' }}</p>
              </td>
              <td class="px-4 py-3 align-top">
                <p class="whitespace-nowrap">{{ tracking.job_request?.site || '-' }}</p>
              </td>
              <td class="px-4 py-3 align-top">
                <p class="whitespace-nowrap">
                  {{ tracking.job_request?.employment_status || '-' }}
                </p>
              </td>
              <td class="px-4 py-3 align-top">
                <p class="whitespace-nowrap">{{ tracking.job_request?.required_date || '-' }}</p>
              </td>

              <td class="px-4 py-3 align-top">
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider mb-3"
                  :class="trackingStatusClass(tracking.status)"
                >
                  {{ trackingStatusLabel(tracking.status) }}
                </span>
              </td>

              <td class="px-4 py-3 align-top">
                <p v-if="tracking.files.length === 0" class="text-xs italic text-gray-400">-</p>
                <div v-else class="flex flex-wrap gap-1.5">
                  <button
                    v-for="file in tracking.files"
                    :key="file.id"
                    type="button"
                    @click="handleDownload(file.file_path)"
                    class="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700 transition hover:bg-blue-100 font-medium"
                  >
                    📎 {{ file.file_name }}
                  </button>
                </div>
              </td>

              <td class="px-4 py-3 align-top">
                <p v-if="!tracking.notes" class="text-xs italic text-gray-400">-</p>
                <p v-else class="text-xs text-gray-700">
                  {{ tracking.notes }}
                </p>
              </td>

              <td class="px-4 py-3 align-top">
                <p class="whitespace-nowrap">
                  {{ tracking.staff_approved_at ? formatDate(tracking.staff_approved_at) : '-' }}
                </p>
              </td>

              <!-- Col 3: Actions -->
              <td class="px-4 py-3 align-top">
                <!-- Approve (if pending_review) -->
                <div v-if="tracking.status === 'pending_review'">
                  <button
                    type="button"
                    class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    :disabled="saving"
                    @click="handleApprove(tracking.id)"
                  >
                    {{ saving ? 'Processing...' : 'Approve & Continue' }}
                  </button>
                </div>

                <!-- Upload Files (if approved) -->
                <div v-if="tracking.status === 'approved'" class="space-y-2">
                  <p class="text-xs font-medium text-gray-700">Upload Posting Evidence:</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    class="block w-full rounded-xl border border-gray-200 bg-white px-2 py-2 text-xs file:mr-2 file:rounded file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-blue-700"
                    @change="handleFileSelect($event, tracking.id)"
                  />
                  <button
                    v-if="selectedFiles.length > 0 && selectedTrackingId === tracking.id"
                    type="button"
                    class="w-full mt-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    :disabled="saving"
                    @click="handleUpload(tracking.id)"
                  >
                    {{ saving ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)` }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && filteredTrackings.length === 0">
              <td colspan="11" class="px-4 py-10 text-center text-sm text-gray-500">
                No matching data found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <TablePagination
        v-if="!loading && filteredTrackings.length > 0"
        v-model:page="page"
        :page-size="pageSize"
        :total-items="filteredTrackings.length"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { RecruitmentStatus } from '@/domain/entities/RecruitmentTracking'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import TablePagination from '@/presentation/components/tables/TablePagination.vue'
import { useRecruitmentTrackingViewModel } from '@/viewmodels/useRecruitmentTrackingViewModel'
import { supabase } from '@/infrastructure/supabase/client'

const { trackings, loading, saving, error, refreshTrackings, approveTracking, uploadPostingFiles } =
  useRecruitmentTrackingViewModel()
const appToast = useAppToast()

const selectedFiles = ref<File[]>([])
const selectedTrackingId = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const pageSize = 10
const page = ref(1)

function normalize(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
}

const statusOptions = computed(() => {
  const set = new Set<string>()
  for (const t of trackings.value) {
    if (t.status) set.add(t.status)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const filteredTrackings = computed(() => {
  const q = normalize(searchQuery.value)
  return trackings.value.filter((t) => {
    if (statusFilter.value && t.status !== statusFilter.value) return false
    if (!q) return true

    const files = (t.files ?? []).map((f) => f.file_name).join(' ')
    const haystack = [
      t.job_request?.main_position,
      t.job_request?.site,
      t.job_request?.employment_status,
      t.job_request?.required_date,
      t.status,
      files,
      t.notes,
    ]
      .map(normalize)
      .join(' ')

    return haystack.includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTrackings.value.length / pageSize)))
const pagedTrackings = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value)
  const start = (safePage - 1) * pageSize
  return filteredTrackings.value.slice(start, start + pageSize)
})

function resetPage() {
  page.value = 1
}

watch([searchQuery, statusFilter], resetPage)
watch(
  () => filteredTrackings.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleDownload(filePath: string) {
  try {
    const { data, error } = await supabase.storage
      .from('job-postings')
      .createSignedUrl(filePath, 60) // valid for 60 seconds

    if (error) throw error
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  } catch (err) {
    appToast.error('Failed to open file. Ensure you have access.')
  }
}

function trackingStatusClass(status: RecruitmentStatus) {
  const map: Record<RecruitmentStatus, string> = {
    pending_review: 'bg-amber-100 text-amber-800',
    approved: 'bg-blue-100 text-blue-800',
    posting_uploaded: 'bg-emerald-100 text-emerald-800',
    candidates_invited: 'bg-purple-100 text-purple-800',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

function trackingStatusLabel(status: RecruitmentStatus) {
  const map: Record<RecruitmentStatus, string> = {
    pending_review: 'Pending Review',
    approved: 'Approved - Upload Posting',
    posting_uploaded: 'Posting Uploaded',
    candidates_invited: 'Candidates Invited',
  }
  return map[status] || status
}

function handleFileSelect(event: Event, trackingId: string) {
  const input = event.target as HTMLInputElement
  selectedFiles.value = input.files ? Array.from(input.files) : []
  selectedTrackingId.value = trackingId
}

async function handleApprove(trackingId: string) {
  try {
    await approveTracking(trackingId)
    appToast.success('ERF successfully approved by staff.')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to approve.'
    appToast.error(message)
  }
}

async function handleUpload(trackingId: string) {
  try {
    await uploadPostingFiles(trackingId, selectedFiles.value)
    appToast.success('Vacancy file successfully uploaded.')
    selectedFiles.value = []
    selectedTrackingId.value = ''
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upload file.'
    appToast.error(message)
  }
}
</script>
