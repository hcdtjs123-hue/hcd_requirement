<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Monitoring</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Approval Tracking</h1>
        <p class="mt-2 text-sm text-gray-600">
          Track the ERF approval status along with the detailed history of each step.
        </p>
      </div>
      <button
        type="button"
        class="text-sm text-gray-600 transition hover:text-gray-900"
        :disabled="loading"
        @click="refreshChains"
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
        placeholder="Search position, site..."
        class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
      />
      <select
        v-model="statusFilter"
        class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 sm:w-64"
      >
        <option value="">All Statuses</option>
        <option v-for="opt in statusOptions" :key="opt" :value="opt">
          {{ statusLabel(opt as ApprovalChainStatus) }}
        </option>
      </select>
    </div>

    <!-- Chains List -->
    <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th class="px-4 py-3 font-medium w-14">No</th>
              <th class="px-4 py-3 font-medium min-w-[180px]">Position</th>
              <th class="px-4 py-3 font-medium min-w-[140px]">Site</th>
              <th class="px-4 py-3 font-medium min-w-[170px]">Submitted</th>
              <th class="px-4 py-3 font-medium min-w-[160px]">Status</th>
              <th class="px-4 py-3 font-medium min-w-[360px]">Approval Steps</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(chain, idx) in pagedChains"
              :key="chain.id"
              class="transition hover:bg-gray-50"
            >
              <td class="px-4 py-3 align-top text-gray-500">
                {{ (page - 1) * pageSize + idx + 1 }}
              </td>
              <td class="px-4 py-3 align-top">
                <p class="font-semibold text-gray-900 text-base whitespace-nowrap">
                  {{ chain.job_request?.main_position || 'No Position' }}
                </p>
              </td>
              <td class="px-4 py-3 align-top">
                <p class="whitespace-nowrap">{{ chain.job_request?.site || '-' }}</p>
              </td>
              <td class="px-4 py-3 align-top">
                <p class="whitespace-nowrap">{{ formatDate(chain.created_at) }}</p>
              </td>
              <td class="px-4 py-3 align-top">
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  :class="statusClass(chain.status)"
                >
                  {{ statusLabel(chain.status) }}
                </span>
              </td>
              <td class="px-4 py-3 align-top">
                <div class="space-y-2">
                  <div
                    v-for="step in chain.steps"
                    :key="step.id"
                    class="flex items-center gap-3 rounded-xl border px-3 py-2 text-xs"
                    :class="stepBorderClass(step.status)"
                  >
                    <div
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-[10px]"
                      :class="stepIndicatorClass(step.status)"
                    >
                      <template v-if="step.status === 'approved'">✓</template>
                      <template v-else-if="step.status === 'rejected'">✕</template>
                      <template v-else>{{ step.step_order }}</template>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="font-medium text-gray-900">
                        {{ step.approver_name || step.approver_email }}
                      </p>
                      <p v-if="step.notes" class="mt-0.5 italic text-gray-500 line-clamp-1">
                        "{{ step.notes }}"
                      </p>
                    </div>
                    <div class="text-right shrink-0">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 font-medium text-[10px]"
                        :class="stepStatusBadge(step.status)"
                      >
                        {{ stepStatusLabel(step.status) }}
                      </span>
                      <p v-if="step.approved_at" class="mt-0.5 text-[10px] text-gray-400">
                        {{ formatDate(step.approved_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && filteredChains.length === 0">
              <td colspan="7" class="px-4 py-10 text-center text-sm text-gray-500">
                No matching data found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <TablePagination
        v-if="!loading && filteredChains.length > 0"
        v-model:page="page"
        :page-size="pageSize"
        :total-items="filteredChains.length"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TablePagination from '@/presentation/components/tables/TablePagination.vue'
import type { ApprovalChainStatus, ApprovalStepStatus } from '@/domain/entities/ApprovalChain'
import { useApprovalViewModel } from '@/viewmodels/useApprovalViewModel'

const { chains, loading, error, refreshChains } = useApprovalViewModel()

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
  for (const c of chains.value) {
    if (c.status) set.add(c.status)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const filteredChains = computed(() => {
  const q = normalize(searchQuery.value)
  return chains.value.filter((c) => {
    if (statusFilter.value && c.status !== statusFilter.value) return false
    if (!q) return true

    const haystack = [
      c.job_request?.main_position,
      c.job_request?.site,
      c.status,
    ]
      .map(normalize)
      .join(' ')

    return haystack.includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredChains.value.length / pageSize)))
const pagedChains = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value)
  const start = (safePage - 1) * pageSize
  return filteredChains.value.slice(start, start + pageSize)
})

function resetPage() {
  page.value = 1
}

watch([searchQuery, statusFilter], resetPage)
watch(
  () => filteredChains.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusClass(status: ApprovalChainStatus) {
  const map: Record<ApprovalChainStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

function statusLabel(status: ApprovalChainStatus) {
  const map: Record<ApprovalChainStatus, string> = {
    draft: 'Draft',
    pending: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return map[status] || status
}

function stepBorderClass(status: ApprovalStepStatus) {
  const map: Record<ApprovalStepStatus, string> = {
    pending: 'border-gray-200 bg-white',
    approved: 'border-emerald-200 bg-emerald-50',
    rejected: 'border-red-200 bg-red-50',
  }
  return map[status] || 'border-gray-200 bg-white'
}

function stepIndicatorClass(status: ApprovalStepStatus) {
  const map: Record<ApprovalStepStatus, string> = {
    pending: 'bg-gray-200 text-gray-600',
    approved: 'bg-emerald-500 text-white',
    rejected: 'bg-red-500 text-white',
  }
  return map[status] || 'bg-gray-200 text-gray-600'
}

function stepStatusBadge(status: ApprovalStepStatus) {
  const map: Record<ApprovalStepStatus, string> = {
    pending: 'bg-gray-100 text-gray-600',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

function stepStatusLabel(status: ApprovalStepStatus) {
  const map: Record<ApprovalStepStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return map[status] || status
}
</script>
