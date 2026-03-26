<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Master Form</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Employee Request Form (ERF)</h1>
      </div>
      <button
        type="button"
        class="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        @click="goToCreate"
      >
        Create ERF
      </button>
    </div>

    <p
      v-if="error"
      class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <section class="max-w-full">
      <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Request List</h2>
          <button
            type="button"
            class="text-sm text-gray-600 transition hover:text-gray-900"
            :disabled="loading"
            @click="refresh"
          >
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>

        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-1 items-center gap-2">
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search position, site, approval..."
              class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
            />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select
              v-model="siteFilter"
              class="h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
            >
              <option value="">All Sites</option>
              <option v-for="opt in siteOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <select
              v-model="positionStatusFilter"
              class="h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
            >
              <option value="">All Position Statuses</option>
              <option v-for="opt in positionStatusOptions" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
            <select
              v-model="employmentFilter"
              class="h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
            >
              <option value="">All Employment</option>
              <option v-for="opt in employmentOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
              <th class="px-4 py-3 font-medium w-14">No</th>
              <th class="px-4 py-3 font-medium min-w-[180px]">Position</th>
              <th class="px-4 py-3 font-medium min-w-[140px]">Site</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">Position Status</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">Employment</th>
              <th class="px-4 py-3 font-medium min-w-[140px]">Required Date</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">Approval Dir. BU</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">Dir. BU Date</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">Approval GM HRD</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">GM HRD Date</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">Approval HRD Director</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">HRD Director Date</th>
              <th class="px-4 py-3 font-medium min-w-[120px]">Status</th>
              <th class="px-4 py-3 text-right min-w-[220px]">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="(job, idx) in pagedJobs"
                  :key="job.id"
                  class="transition hover:bg-gray-50"
                >
                  <td class="px-4 py-3 align-middle text-gray-500">
                    {{ (page - 1) * pageSize + idx + 1 }}
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="font-medium text-gray-900 whitespace-nowrap">
                      {{ job.main_position || '-' }}
                    </p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.site || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <span
                      class="inline-flex whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gray-600"
                    >
                      {{ job.position_status || 'No Status' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.employment_status || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap text-gray-600">{{ job.required_date || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.approval_director_bu || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.approval_director_bu_date || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.approval_gm_hrd || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.approval_gm_hrd_date || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.approval_director_hrd || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.approval_director_hrd_date || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      :class="job.status === 'closed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                    >
                      {{ job.status || 'open' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right align-middle">
                    <RowActionsMenu
                      :actions="[
                        { label: 'Edit / Detail', onClick: () => goToEdit(job.id) },
                        ...(job.status !== 'closed' ? [{
                          label: 'Close Job',
                          onClick: () => openCloseModal(job.id),
                        }] : []),
                        {
                          label: 'Export PDF',
                          disabled: saving,
                          onClick: () => handleExportPdf(job),
                        },
                        {
                          label: 'Delete',
                          tone: 'danger',
                          disabled: saving,
                          onClick: () => handleDelete(job.id, job.main_position || ''),
                        },
                      ]"
                    />
                  </td>
                </tr>
                <tr v-if="!loading && filteredJobs.length === 0">
                <td colspan="13" class="px-4 py-8 text-center text-sm text-gray-500">
                    No matching data found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <TablePagination
            v-if="!loading && filteredJobs.length > 0"
            v-model:page="page"
            :page-size="pageSize"
            :total-items="filteredJobs.length"
          />
        </div>
      </div>
    </section>
  </div>

  <!-- Close ERF Modal -->
  <div v-if="showCloseModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
      <h3 class="mb-4 text-xl font-semibold text-gray-900 text-center">Close ERF</h3>
      <p class="mb-6 text-sm text-gray-600 text-center">Please provide a reason for closing this employee request form.</p>
      
      <form @submit.prevent="handleClose" class="space-y-4">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-gray-700">Category *</span>
          <select v-model="closeForm.category" required class="w-full h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600">
            <option value="" disabled>Select category</option>
            <option value="employee hired">Employee Hired</option>
            <option value="canceled">Canceled</option>
          </select>
        </label>

        <label class="block space-y-2">
          <span class="text-sm font-medium text-gray-700">Reason *</span>
          <textarea
            v-model="closeForm.reason"
            required
            placeholder="Why is this ERF being closed?"
            class="w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 resize-none"
          ></textarea>
        </label>

        <div class="mt-8 flex gap-3">
          <button
            type="button"
            @click="showCloseModal = false"
            class="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {{ saving ? 'Closing...' : 'Close ERF' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import RowActionsMenu from '@/presentation/components/menus/RowActionsMenu.vue'
import TablePagination from '@/presentation/components/tables/TablePagination.vue'
import { type JobRequest, type JobRequestInput } from '@/domain/entities/JobRequest'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { exportJobRequestPdf } from '@/presentation/utils/jobRequestPdfTemplate'
import { useJobRequestViewModel } from '@/viewmodels/useJobRequestViewModel'

const router = useRouter()
const { jobs, loading, error, saving, remove, refresh, close } = useJobRequestViewModel()
const appToast = useAppToast()

// Close Modal State
const showCloseModal = ref(false)
const selectedJobId = ref('')
const closeForm = ref({
  category: '' as 'employee hired' | 'canceled' | '',
  reason: ''
})

const searchQuery = ref('')
const siteFilter = ref('')
const positionStatusFilter = ref('')
const employmentFilter = ref('')
const pageSize = 10
const page = ref(1)

function normalize(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
}

const siteOptions = computed(() => {
  const set = new Set<string>()
  for (const j of jobs.value) {
    if (j.site) set.add(j.site)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const positionStatusOptions = computed(() => {
  const set = new Set<string>()
  for (const j of jobs.value) {
    if (j.position_status) set.add(j.position_status)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const employmentOptions = computed(() => {
  const set = new Set<string>()
  for (const j of jobs.value) {
    if (j.employment_status) set.add(j.employment_status)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const filteredJobs = computed(() => {
  const q = normalize(searchQuery.value)
  return jobs.value.filter((j) => {
    if (siteFilter.value && j.site !== siteFilter.value) return false
    if (positionStatusFilter.value && j.position_status !== positionStatusFilter.value) return false
    if (employmentFilter.value && j.employment_status !== employmentFilter.value) return false
    if (!q) return true

    const haystack = [
      j.main_position,
      j.site,
      j.position_status,
      j.employment_status,
      j.required_date,
      j.approval_director_bu,
      j.approval_director_bu_date,
      j.approval_gm_hrd,
      j.approval_gm_hrd_date,
      j.approval_director_hrd,
      j.approval_director_hrd_date,
    ]
      .map(normalize)
      .join(' ')

    return haystack.includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredJobs.value.length / pageSize)))
const pagedJobs = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value)
  const start = (safePage - 1) * pageSize
  return filteredJobs.value.slice(start, start + pageSize)
})

function resetPage() {
  page.value = 1
}

watch([searchQuery, siteFilter, positionStatusFilter, employmentFilter], resetPage)
watch(
  () => filteredJobs.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

function goToCreate() {
  router.push('/job-requests/create')
}

function goToEdit(id: string) {
  router.push(`/job-requests/${id}/edit`)
}

async function handleDelete(id: string, mainPosition: string) {
  if (!confirm(`Delete ERF ${mainPosition}?`)) return
  try {
    await remove(id)
    appToast.success('ERF deleted successfully.')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete ERF.'
    appToast.error(message)
  }
}

function handleExportPdf(job: JobRequest) {
  try {
    exportJobRequestPdf(job)
    appToast.success('PDF template opened successfully.')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to export the PDF template.'
    appToast.error(message)
  }
}

function openCloseModal(id: string) {
  selectedJobId.value = id
  closeForm.value = { category: '', reason: '' }
  showCloseModal.value = true
}

async function handleClose() {
  if (!closeForm.value.category || !closeForm.value.reason) return
  
  try {
    await close(
      selectedJobId.value,
      closeForm.value.category as 'employee hired' | 'canceled',
      closeForm.value.reason
    )
    appToast.success('ERF closed successfully.')
    showCloseModal.value = false
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to close ERF.'
    appToast.error(message)
  }
}
</script>
