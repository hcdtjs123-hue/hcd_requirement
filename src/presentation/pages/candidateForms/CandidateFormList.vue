<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Candidate Forms</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Candidate Forms</h1>
        <p class="mt-2 text-sm text-gray-600">
          Manage candidate profiles and link each record to an Employee Request Form (ERF).
        </p>
      </div>
      <button
        type="button"
        class="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        @click="goToCreate"
      >
        Add Candidate
      </button>
    </div>

    <p
      v-if="candidateError"
      class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ candidateError }}
    </p>

    <section class="max-w-full">
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Candidate Form List</h2>
          <button
            type="button"
            class="text-sm text-gray-600 transition hover:text-gray-900"
            :disabled="candidateLoading"
            @click="refreshCandidates"
          >
            {{ candidateLoading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>

        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-1 items-center gap-2">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search name, email, or phone..."
              class="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
            />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select
              v-model="employeeRequestFormFilter"
              class="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
            >
              <option value="">All ERF</option>
              <option v-for="opt in employeeRequestFormOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th class="px-4 py-3 font-medium w-14">No</th>
                  <th class="px-4 py-3 font-medium min-w-[220px]">Name</th>
                  <th class="px-4 py-3 font-medium min-w-[220px]">Email</th>
                  <th class="px-4 py-3 font-medium min-w-[160px]">Phone</th>
                  <th class="px-4 py-3 font-medium min-w-[200px]">ERF</th>
                  <th class="px-4 py-3 font-medium text-right min-w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="(candidate, idx) in pagedCandidates"
                  :key="candidate.id"
                  class="transition hover:bg-gray-50"
                >
                  <td class="px-4 py-3 align-middle text-gray-500">
                    {{ (page - 1) * pageSize + idx + 1 }}
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="font-medium text-gray-900 whitespace-nowrap">
                      {{
                        [candidate.first_name, candidate.middle_name, candidate.last_name]
                          .filter(Boolean)
                          .join(' ') || '-'
                      }}
                    </p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ candidate.personal_email || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <p class="whitespace-nowrap">{{ candidate.phone_number || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-middle">
                    <span
                      class="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-blue-700"
                    >
                      {{ candidate.employee_request_form?.main_position || 'No ERF' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right align-middle">
                    <RowActionsMenu
                      :actions="[
                        { label: 'Edit / Details', onClick: () => goToEdit(candidate.id) },
                        {
                          label: 'Delete',
                          tone: 'danger',
                          disabled: candidateSaving,
                          onClick: () => handleDelete(candidate.id, candidate.first_name || ''),
                        },
                      ]"
                    />
                  </td>
                </tr>
                <tr v-if="!candidateLoading && filteredCandidates.length === 0">
                  <td colspan="6" class="px-4 py-8 text-center text-sm text-gray-500">
                    No matching data found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <TablePagination
            v-if="!candidateLoading && filteredCandidates.length > 0"
            v-model:page="page"
            :page-size="pageSize"
            :total-items="filteredCandidates.length"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import RowActionsMenu from '@/presentation/components/menus/RowActionsMenu.vue'
import TablePagination from '@/presentation/components/tables/TablePagination.vue'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useCandidateFormViewModel } from '@/viewmodels/useCandidateFormViewModel'

const router = useRouter()
const {
  candidates,
  loading: candidateLoading,
  error: candidateError,
  saving: candidateSaving,
  remove,
  refresh: refreshCandidates,
} = useCandidateFormViewModel()

const appToast = useAppToast()

const searchQuery = ref('')
const employeeRequestFormFilter = ref('')
const pageSize = 10
const page = ref(1)

function normalize(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
}

const employeeRequestFormOptions = computed(() => {
  const set = new Set<string>()
  for (const a of candidates.value) {
    const label = a.employee_request_form?.main_position
    if (label) set.add(label)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const filteredCandidates = computed(() => {
  const q = normalize(searchQuery.value)
  return candidates.value.filter((a) => {
    const jobLabel = a.employee_request_form?.main_position ?? ''
    if (employeeRequestFormFilter.value && jobLabel !== employeeRequestFormFilter.value) return false
    if (!q) return true

    const fullName = [a.first_name, a.middle_name, a.last_name].filter(Boolean).join(' ')
    const haystack = [fullName, a.personal_email, a.phone_number, jobLabel].map(normalize).join(' ')

    return haystack.includes(q)
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCandidates.value.length / pageSize)),
)
const pagedCandidates = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value)
  const start = (safePage - 1) * pageSize
  return filteredCandidates.value.slice(start, start + pageSize)
})

function resetPage() {
  page.value = 1
}

watch([searchQuery, employeeRequestFormFilter], resetPage)
watch(
  () => filteredCandidates.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

function goToCreate() {
  router.push('/candidate-forms/create')
}

function goToEdit(id: string) {
  router.push(`/candidate-forms/${id}/edit`)
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`Delete candidate form for ${name}?`)) return
  try {
    await remove(id)
    appToast.deleted('Candidate Form')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete the candidate form.'
    appToast.error(message)
  }
}
</script>
