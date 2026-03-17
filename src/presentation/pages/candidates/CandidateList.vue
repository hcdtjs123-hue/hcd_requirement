<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Candidate Form</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Main Application</h1>
      </div>
      <button
        type="button"
        class="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        @click="goToCreate"
      >
        Buat Application
      </button>
    </div>

    <p v-if="applicationError" class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ applicationError }}
    </p>

    <section class="max-w-full">
      <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Daftar Application</h2>
            <button
              type="button"
              class="text-sm text-gray-600 transition hover:text-gray-900"
              :disabled="applicationLoading"
              @click="refreshApplications"
            >
              {{ applicationLoading ? "Memuat..." : "Refresh" }}
            </button>
          </div>

          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-1 items-center gap-2">
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search nama, email, telepon..."
                class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <select
                v-model="jobRequestFilter"
                class="h-11 rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="">Semua Job Request</option>
                <option v-for="opt in jobRequestOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th class="px-4 py-3 font-medium w-14">No</th>
                  <th class="px-4 py-3 font-medium min-w-[220px]">Nama</th>
                  <th class="px-4 py-3 font-medium min-w-[220px]">Email</th>
                  <th class="px-4 py-3 font-medium min-w-[160px]">Telepon</th>
                  <th class="px-4 py-3 font-medium min-w-[200px]">Job Request</th>
                  <th class="px-4 py-3 font-medium text-right min-w-[160px]">Aksi</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="(application, idx) in pagedApplications"
                  :key="application.id"
                  class="transition hover:bg-gray-50"
                >
                  <td class="px-4 py-3 align-middle text-gray-500">{{ (page - 1) * pageSize + idx + 1 }}</td>
                  <td class="px-4 py-3 align-middle">
                    <p class="font-medium text-gray-900 whitespace-nowrap">
                      {{ [application.first_name, application.middle_name, application.last_name].filter(Boolean).join(" ") || "-" }}
                    </p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ application.personal_email || "-" }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ application.phone_number || "-" }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <span class="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-blue-700">
                      {{ application.job_request?.main_position || "Tanpa Job Request" }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right align-middle">
                    <RowActionsMenu
                      :actions="[
                        { label: 'Edit / Detail', onClick: () => goToEdit(application.id) },
                        {
                          label: 'Hapus',
                          tone: 'danger',
                          disabled: applicationSaving,
                          onClick: () => handleDelete(application.id, application.first_name || ''),
                        },
                      ]"
                    />
                  </td>
                </tr>
                <tr v-if="!applicationLoading && filteredApplications.length === 0">
                  <td colspan="6" class="px-4 py-8 text-center text-sm text-gray-500">
                    Tidak ada data yang cocok.
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <TablePagination
              v-if="!applicationLoading && filteredApplications.length > 0"
              v-model:page="page"
              :page-size="pageSize"
              :total-items="filteredApplications.length"
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
import { useAppToast } from "@/presentation/components/feedback/useAppToast"
import { useCandidateViewModel } from "@/viewmodels/useCandidateViewModel"

const router = useRouter()
const {
  applications,
  loading: applicationLoading,
  error: applicationError,
  saving: applicationSaving,
  remove,
  refresh: refreshApplications,
} = useCandidateViewModel()

const appToast = useAppToast()

const searchQuery = ref("")
const jobRequestFilter = ref("")
const pageSize = 10
const page = ref(1)

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim()
}

const jobRequestOptions = computed(() => {
  const set = new Set<string>()
  for (const a of applications.value) {
    const label = a.job_request?.main_position
    if (label) set.add(label)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const filteredApplications = computed(() => {
  const q = normalize(searchQuery.value)
  return applications.value.filter((a) => {
    const jobLabel = a.job_request?.main_position ?? ""
    if (jobRequestFilter.value && jobLabel !== jobRequestFilter.value) return false
    if (!q) return true

    const fullName = [a.first_name, a.middle_name, a.last_name].filter(Boolean).join(" ")
    const haystack = [
      fullName,
      a.personal_email,
      a.phone_number,
      jobLabel,
    ]
      .map(normalize)
      .join(" ")

    return haystack.includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredApplications.value.length / pageSize)))
const pagedApplications = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value)
  const start = (safePage - 1) * pageSize
  return filteredApplications.value.slice(start, start + pageSize)
})

function resetPage() {
  page.value = 1
}

watch([searchQuery, jobRequestFilter], resetPage)
watch(
  () => filteredApplications.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

function goToCreate() {
  router.push("/applications/create")
}

function goToEdit(id: string) {
  router.push(`/applications/${id}/edit`)
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`Hapus application ${name}?`)) return
  try {
    await remove(id)
    appToast.deleted("Application")
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus application."
    appToast.error(message)
  }
}
</script>
