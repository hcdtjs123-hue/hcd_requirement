<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Master Form</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Job Request</h1>
      </div>
      <button
        type="button"
        class="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        @click="goToCreate"
      >
        Buat Job Request
      </button>
    </div>

    <p v-if="error" class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </p>

    <section class="max-w-full">
      <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Daftar Request</h2>
            <button
              type="button"
              class="text-sm text-gray-600 transition hover:text-gray-900"
              :disabled="loading"
              @click="refresh"
            >
              {{ loading ? "Memuat..." : "Refresh" }}
            </button>
          </div>

          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-1 items-center gap-2">
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search posisi, designation, site..."
                class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <select
                v-model="siteFilter"
                class="h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="">Semua Site</option>
                <option v-for="opt in siteOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <select
                v-model="positionStatusFilter"
                class="h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="">Semua Status Posisi</option>
                <option v-for="opt in positionStatusOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <select
                v-model="employmentFilter"
                class="h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="">Semua Employment</option>
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
                  <th class="px-4 py-3 font-medium min-w-[180px]">Posisi</th>
                  <th class="px-4 py-3 font-medium min-w-[160px]">Designation</th>
                  <th class="px-4 py-3 font-medium min-w-[140px]">Site</th>
                  <th class="px-4 py-3 font-medium min-w-[160px]">Status Posisi</th>
                  <th class="px-4 py-3 font-medium min-w-[160px]">Employment</th>
                  <th class="px-4 py-3 font-medium min-w-[140px]">Required Date</th>
                  <th class="px-4 py-3 font-medium text-right min-w-[220px]">Aksi</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="(job, idx) in pagedJobs"
                  :key="job.id"
                  class="transition hover:bg-gray-50"
                >
                  <td class="px-4 py-3 align-middle text-gray-500">{{ (page - 1) * pageSize + idx + 1 }}</td>
                  <td class="px-4 py-3 align-middle">
                    <p class="font-medium text-gray-900 whitespace-nowrap">{{ job.main_position || "-" }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.designation || "-" }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.site || "-" }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <span class="inline-flex whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gray-600">
                      {{ job.position_status || "Tanpa Status" }}
                    </span>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ job.employment_status || "-" }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap text-gray-600">{{ job.required_date || "-" }}</p>
                  </td>
                  <td class="px-4 py-3 text-right align-middle">
                    <RowActionsMenu
                      :actions="[
                        { label: 'Edit / Detail', onClick: () => goToEdit(job.id) },
                        {
                          label: approvalSaving ? 'Memproses...' : 'Kirim Approval',
                          disabled: approvalSaving,
                          onClick: () => handleSubmitApproval(job.id),
                        },
                        {
                          label: 'Hapus',
                          tone: 'danger',
                          disabled: saving,
                          onClick: () => handleDelete(job.id, job.main_position || ''),
                        },
                      ]"
                    />
                  </td>
                </tr>
                <tr v-if="!loading && filteredJobs.length === 0">
                  <td colspan="8" class="px-4 py-8 text-center text-sm text-gray-500">
                    Tidak ada data yang cocok.
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"

import RowActionsMenu from "@/presentation/components/menus/RowActionsMenu.vue"
import TablePagination from "@/presentation/components/tables/TablePagination.vue"
import {
  type JobRequest,
  type JobRequestInput,
} from "@/domain/entities/JobRequest"
import { useAppToast } from "@/presentation/components/feedback/useAppToast"
import { useJobRequestViewModel } from "@/viewmodels/useJobRequestViewModel"
import { useApprovalViewModel } from "@/viewmodels/useApprovalViewModel"

const router = useRouter()
const { jobs, loading, error, saving, remove, refresh } = useJobRequestViewModel()
const { saving: approvalSaving, submitForApproval } = useApprovalViewModel()
const appToast = useAppToast()

const searchQuery = ref("")
const siteFilter = ref("")
const positionStatusFilter = ref("")
const employmentFilter = ref("")
const pageSize = 10
const page = ref(1)

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim()
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
      j.designation,
      j.site,
      j.position_status,
      j.employment_status,
      j.required_date,
    ]
      .map(normalize)
      .join(" ")

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
  router.push("/job-requests/create")
}

function goToEdit(id: string) {
  router.push(`/job-requests/${id}/edit`)
}

async function handleDelete(id: string, mainPosition: string) {
  if (!confirm(`Hapus job request ${mainPosition}?`)) return
  try {
    await remove(id)
    appToast.deleted("Job request")
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus job request."
    appToast.error(message)
  }
}

async function handleSubmitApproval(jobRequestId: string) {
  try {
    await submitForApproval({ job_request_id: jobRequestId })
    appToast.success("Job request berhasil dikirim untuk approval.")
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mengirim approval."
    appToast.error(message)
  }
}
</script>
