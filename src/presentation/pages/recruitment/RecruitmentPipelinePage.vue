<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Recruitment Team</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Recruitment Pipeline</h1>
        <p class="mt-2 text-sm text-gray-600">
          Manage candidates being processed by the recruitment team, from invitation through
          interview.
        </p>
      </div>
      <button
        type="button"
        class="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        @click="goToCreate"
      >
        Add Candidate to Pipeline
      </button>
    </div>

    <p
      v-if="error"
      class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <section class="max-w-full">
      <!-- Invitation List -->
      <div class="space-y-4">
        <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Candidates in Pipeline</h2>
            <button
              type="button"
              class="text-sm text-gray-600 transition hover:text-gray-900"
              :disabled="loading"
              @click="refreshInvitations"
            >
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>

          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search name, email, position..."
              class="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
            />
            <select
              v-model="statusFilter"
              class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 sm:w-64"
            >
              <option value="">All Statuses</option>
              <option v-for="opt in statusOptions" :key="opt" :value="opt">
                {{ invStatusLabel(opt as CandidateInvitationStatus) }}
              </option>
            </select>
          </div>

          <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th class="px-4 py-3 font-medium w-14">No</th>
                    <th class="px-4 py-3 font-medium">Candidate</th>
                    <th class="px-4 py-3 font-medium">Position</th>
                    <th class="px-4 py-3 font-medium min-w-[160px]">Status</th>
                    <th class="px-4 py-3 font-medium min-w-[140px]">Form Progress</th>
                    <th class="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr
                    v-for="(inv, idx) in pagedInvitations"
                    :key="inv.id"
                    class="transition hover:bg-gray-50 bg-white"
                  >
                    <td class="px-4 py-3 align-middle text-gray-500">
                      {{ (page - 1) * pageSize + idx + 1 }}
                    </td>
                    <td class="px-4 py-3 align-middle">
                      <p class="font-medium text-gray-900">{{ inv.candidate_name }}</p>
                      <p class="mt-0.5 text-xs text-gray-500">{{ inv.candidate_email }}</p>
                    </td>
                    <td class="px-4 py-3 align-middle">
                      <span
                        class="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] tracking-wider text-gray-600"
                      >
                        {{ inv.position_applied || '-' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 align-middle">
                      <span
                        class="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                        :class="invStatusBadge(inv.status)"
                      >
                        {{ invStatusLabel(inv.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 align-middle">
                      <!-- Progress bar -->
                      <div class="flex flex-col">
                        <div class="h-1.5 w-28 overflow-hidden rounded-full bg-gray-200">
                          <div
                            class="h-full rounded-full bg-blue-500 transition-all"
                            :style="{ width: `${inv.form_progress}%` }"
                          />
                        </div>
                        <p class="mt-1 whitespace-nowrap text-[10px] text-gray-400">
                          {{ inv.form_progress }}%
                        </p>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right align-middle">
                      <RowActionsMenu
                        :actions="[{ label: 'Process / Details', onClick: () => goToEdit(inv.id) }]"
                      />
                    </td>
                  </tr>
                  <tr v-if="!loading && filteredInvitations.length === 0">
                    <td colspan="6" class="px-4 py-8 text-center text-sm text-gray-500">
                      No matching data found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <TablePagination
              v-if="!loading && filteredInvitations.length > 0"
              v-model:page="page"
              :page-size="pageSize"
              :total-items="filteredInvitations.length"
            />
          </div>
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
import type { CandidateInvitationStatus } from '@/domain/entities/RecruitmentTracking'
import { useRecruitmentTrackingViewModel } from '@/viewmodels/useRecruitmentTrackingViewModel'

const router = useRouter()
const { invitations, loading, error, refreshInvitations } = useRecruitmentTrackingViewModel()

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
  for (const inv of invitations.value) {
    if (inv.status) set.add(inv.status)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const filteredInvitations = computed(() => {
  const q = normalize(searchQuery.value)
  return invitations.value.filter((inv) => {
    if (statusFilter.value && inv.status !== statusFilter.value) return false
    if (!q) return true

    const haystack = [inv.candidate_name, inv.candidate_email, inv.position_applied, inv.status]
      .map(normalize)
      .join(' ')

    return haystack.includes(q)
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredInvitations.value.length / pageSize)),
)
const pagedInvitations = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value)
  const start = (safePage - 1) * pageSize
  return filteredInvitations.value.slice(start, start + pageSize)
})

function resetPage() {
  page.value = 1
}

watch([searchQuery, statusFilter], resetPage)
watch(
  () => filteredInvitations.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

function goToCreate() {
  router.push('/recruitment/pipeline/create')
}

function goToEdit(id: string) {
  router.push(`/recruitment/pipeline/${id}/edit`)
}

function invStatusBadge(status: CandidateInvitationStatus) {
  const map: Record<CandidateInvitationStatus, string> = {
    invited: 'bg-gray-100 text-gray-700',
    credentials_sent: 'bg-blue-100 text-blue-700',
    form_in_progress: 'bg-amber-100 text-amber-700',
    form_completed: 'bg-emerald-100 text-emerald-700',
    interview_scheduled: 'bg-purple-100 text-purple-700',
    confirmed: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

function invStatusLabel(status: CandidateInvitationStatus) {
  const map: Record<CandidateInvitationStatus, string> = {
    invited: 'Invited',
    credentials_sent: 'Credentials Sent',
    form_in_progress: 'Filling Form',
    form_completed: 'Form Completed',
    interview_scheduled: 'Interview Scheduled',
    confirmed: 'Attendance Confirmed',
    rejected: 'Rejected',
  }
  return map[status] || status
}
</script>
