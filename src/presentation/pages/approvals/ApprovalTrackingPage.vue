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
      class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search position, site..."
        class="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
      />
      <select
        v-model="statusFilter"
        class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 sm:w-64"
      >
        <option value="">All Statuses</option>
        <option v-for="opt in statusOptions" :key="opt" :value="opt">
          {{ statusLabel(opt as ApprovalChainStatus) }}
        </option>
      </select>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
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
                  {{ trackingStatusLabel(chain) }}
                </span>
              </td>
              <td class="px-4 py-3 align-top">
                <div class="space-y-2">
                  <component
                    :is="canOpenTrackingStage(chain, stage) ? 'button' : 'div'"
                    v-for="stage in buildTrackingStages(chain)"
                    :key="stage.key"
                    class="flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-xs"
                    :class="[
                      trackingStageBorderClass(stage.state),
                      canOpenTrackingStage(chain, stage)
                        ? 'cursor-pointer transition hover:shadow-sm hover:ring-2 hover:ring-blue-100'
                        : '',
                    ]"
                    :disabled="!canOpenTrackingStage(chain, stage)"
                    @click="openTrackingStageDetail(chain.id, stage)"
                  >
                    <div
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-[10px]"
                      :class="trackingStageIndicatorClass(stage.state)"
                    >
                      <template v-if="stage.state === 'completed'">✓</template>
                      <template v-else-if="stage.state === 'rejected'">✕</template>
                      <template v-else>{{ stage.order }}</template>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="font-medium text-gray-900">
                        {{ stage.label }}
                      </p>
                      <p v-if="stage.actor" class="mt-0.5 text-gray-500">{{ stage.actor }}</p>
                    </div>
                    <div class="text-right shrink-0">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 font-medium text-[10px]"
                        :class="trackingStageBadgeClass(stage.state)"
                      >
                        {{ trackingStageStatusLabel(stage.state) }}
                      </span>
                      <p v-if="stage.date" class="mt-0.5 text-[10px] text-gray-400">
                        {{ formatDate(stage.date) }}
                      </p>
                    </div>
                  </component>
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

    <div
      v-if="selectedChain && selectedStep"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div class="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Approval Detail</p>
            <h2 class="mt-2 text-2xl font-semibold text-gray-900">
              {{ selectedChain.job_request?.main_position || 'No Position' }}
            </h2>
            <p class="mt-2 text-sm text-gray-500">
              {{ approvalRoleLabel(selectedStep.step_order) }} | {{ stepApproverName(selectedStep) }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
            @click="closeStepDetail"
          >
            Close
          </button>
        </div>

        <div class="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section class="space-y-4">
            <div class="rounded-xl border border-gray-200 bg-white p-5">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500">
                ERF Detail
              </h3>
              <div class="mt-4 grid gap-3 md:grid-cols-2">
                <div
                  v-for="field in buildJobRequestFields(selectedChain)"
                  :key="field.label"
                  class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <p class="text-[10px] uppercase tracking-wider text-gray-500">{{ field.label }}</p>
                  <p class="mt-1 text-sm font-medium text-gray-900">{{ field.value }}</p>
                </div>
              </div>
            </div>
          </section>

          <aside class="space-y-4">
            <div class="rounded-xl border border-gray-200 bg-white p-5">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Approval Scope
              </h3>
              <div class="mt-4 rounded-xl bg-gray-50 px-4 py-3">
                <p class="text-sm font-medium text-gray-900">
                  {{ approvalRoleLabel(selectedStep.step_order) }} | {{ stepApproverName(selectedStep) }}
                </p>
                <p class="mt-1 text-xs text-gray-500">
                  Signed in as {{ user?.email || '-' }}
                </p>
              </div>

              <div
                v-if="isAdminRole"
                class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                Administrator accounts can review all approval tracking data, but cannot approve or
                reject any request.
              </div>
              <div
                v-else-if="canApproveSelectedStep"
                class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              >
                This request is ready for your decision.
              </div>
              <div
                v-else-if="isWaitingPreviousStage(selectedChain, selectedStep)"
                class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                This request is still waiting for the previous approval stage to be completed.
              </div>
              <div
                v-else-if="selectedStep.status === 'approved'"
                class="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
              >
                This step was approved on {{ formatDate(selectedStep.approved_at) }}.
              </div>
              <div
                v-else-if="selectedStep.status === 'rejected'"
                class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                This step was rejected on {{ formatDate(selectedStep.approved_at) }}.
              </div>
              <div
                v-else
                class="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
              >
                You can only process approvals assigned to your own approver email.
              </div>
            </div>

            <div
              v-if="canApproveSelectedStep"
              class="rounded-xl border border-gray-200 bg-white p-5"
            >
              <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Approval Decision
              </h3>
              <label class="mt-4 block space-y-2">
                <span class="text-sm text-gray-600">Notes (optional)</span>
                <textarea
                  v-model="notesByStep[selectedStep.id]"
                  rows="4"
                  class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-600"
                  placeholder="Add your approval notes..."
                />
              </label>

              <div class="mt-4 flex gap-3">
                <button
                  type="button"
                  class="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  :disabled="saving"
                  @click="handleApprove"
                >
                  {{ saving ? 'Processing...' : 'Approve' }}
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-60"
                  :disabled="saving"
                  @click="handleReject"
                >
                  {{ saving ? 'Processing...' : 'Reject' }}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import TablePagination from '@/presentation/components/tables/TablePagination.vue'
import type { ApprovalChain, ApprovalChainStatus, ApprovalStep } from '@/domain/entities/ApprovalChain'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useApprovalViewModel } from '@/viewmodels/useApprovalViewModel'
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel'

type TrackingStageState = 'completed' | 'current' | 'upcoming' | 'rejected'

type TrackingStage = {
  key: string
  order: number
  label: string
  actor: string | null
  date: string | null
  state: TrackingStageState
  stepId: string | null
}

const { user, userRole } = useAuthViewModel()
const { chains, loading, saving, error, refreshChains, approveAssignedStep, rejectAssignedStep } =
  useApprovalViewModel()
const appToast = useAppToast()

const searchQuery = ref('')
const statusFilter = ref('')
const selectedChainId = ref('')
const selectedStepId = ref('')
const notesByStep = ref<Record<string, string>>({})
const pageSize = 10
const page = ref(1)

function normalize(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
}

const isAdminRole = computed(() =>
  ['admin', 'administrator', 'super admin', 'super_admin'].includes(normalize(userRole.value)),
)

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
      c.job_request?.department,
      c.status,
      ...c.steps.map((step) => `${approvalRoleLabel(step.step_order)} ${stepApproverName(step)}`),
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

const selectedChain = computed(
  () => chains.value.find((chain) => chain.id === selectedChainId.value) ?? null,
)
const selectedStep = computed(
  () => selectedChain.value?.steps.find((step) => step.id === selectedStepId.value) ?? null,
)

const canApproveSelectedStep = computed(() => {
  if (!selectedChain.value || !selectedStep.value) return false
  return canProcessStep(selectedChain.value, selectedStep.value)
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
    draft: 'Requested',
    pending: 'Pending Approval',
    approved: 'Request Approved',
    rejected: 'Request Rejected',
  }
  return map[status] || status
}

function approvalRoleLabel(stepOrder: number) {
  const map: Record<number, string> = {
    1: 'BU Director',
    2: 'GM HRD',
    3: 'HR Director',
  }
  return map[stepOrder] || `Step ${stepOrder}`
}

function stepApproverName(step: ApprovalStep) {
  return String(step.approver_name ?? step.approver_email ?? '').trim() || '-'
}

function stepAssignedToCurrentUser(step: ApprovalStep) {
  return normalize(step.approver_email) === normalize(user.value?.email)
}

function arePreviousStepsApproved(chain: ApprovalChain, step: ApprovalStep) {
  return chain.steps
    .filter((item) => item.step_order < step.step_order)
    .every((item) => item.status === 'approved')
}

function canOpenStepDetail(step: ApprovalStep) {
  return isAdminRole.value || stepAssignedToCurrentUser(step)
}

function canProcessStep(chain: ApprovalChain, step: ApprovalStep) {
  if (isAdminRole.value) return false
  if (!stepAssignedToCurrentUser(step)) return false
  if (step.status !== 'pending') return false
  return arePreviousStepsApproved(chain, step)
}

function isWaitingPreviousStage(chain: ApprovalChain, step: ApprovalStep) {
  if (!stepAssignedToCurrentUser(step)) return false
  if (step.status !== 'pending') return false
  return !arePreviousStepsApproved(chain, step)
}

function getCurrentPendingStep(chain: ApprovalChain) {
  return chain.steps.find((step) => step.status === 'pending') ?? null
}

function getFinalStatusDate(chain: ApprovalChain) {
  if (chain.status === 'approved') {
    const hrDirectorStep = chain.steps.find((step) => approvalRoleLabel(step.step_order) === 'HR Director')

    return (
      hrDirectorStep?.approved_at
      ?? chain.job_request?.approval_director_hrd_date
      ?? null
    )
  }

  if (chain.status === 'rejected') {
    return chain.steps.find((step) => step.status === 'rejected')?.approved_at ?? null
  }

  return null
}

function resolveTrackingStageState(
  step: ApprovalStep,
  currentPendingStep: ApprovalStep | null,
): TrackingStageState {
  if (step.status === 'approved') return 'completed'
  if (step.status === 'rejected') return 'rejected'
  if (currentPendingStep?.id === step.id) return 'current'
  return 'upcoming'
}

function buildTrackingStages(chain: ApprovalChain): TrackingStage[] {
  const currentPendingStep = getCurrentPendingStep(chain)
  const approvalStages = chain.steps.map((step) => ({
    key: step.id,
    order: step.step_order + 1,
    label:
      resolveTrackingStageState(step, currentPendingStep) === 'completed'
        ? 'Approved'
        : resolveTrackingStageState(step, currentPendingStep) === 'rejected'
          ? 'Rejected'
          : 'Waiting for',
    actor: `${approvalRoleLabel(step.step_order)} | ${stepApproverName(step)}`,
    date: step.approved_at,
    state: resolveTrackingStageState(step, currentPendingStep),
    stepId: step.id,
  }))

  const finalState: TrackingStageState =
    chain.status === 'approved'
      ? 'completed'
      : chain.status === 'rejected'
        ? 'rejected'
        : 'upcoming'

  return [
    {
      key: `${chain.id}-requested`,
      order: 1,
      label: 'Requested',
      actor: null,
      date: chain.created_at,
      state: 'completed',
      stepId: null,
    },
    ...approvalStages,
    {
      key: `${chain.id}-final`,
      order: 5,
      label: chain.status === 'rejected' ? 'Request Rejected' : 'Request Approved',
      actor: null,
      date: getFinalStatusDate(chain),
      state: finalState,
      stepId: null,
    },
  ]
}

function trackingStatusLabel(chain: ApprovalChain) {
  if (chain.status === 'approved' || chain.status === 'rejected' || chain.status === 'draft') {
    return statusLabel(chain.status)
  }

  const currentPendingStep = getCurrentPendingStep(chain)
  if (!currentPendingStep) return statusLabel(chain.status)

  return `Waiting for ${approvalRoleLabel(currentPendingStep.step_order)}`
}

function trackingStageBorderClass(state: TrackingStageState) {
  const map: Record<TrackingStageState, string> = {
    completed: 'border-emerald-200 bg-emerald-50',
    current: 'border-amber-200 bg-amber-50',
    upcoming: 'border-gray-200 bg-white',
    rejected: 'border-red-200 bg-red-50',
  }
  return map[state]
}

function trackingStageIndicatorClass(state: TrackingStageState) {
  const map: Record<TrackingStageState, string> = {
    completed: 'bg-emerald-500 text-white',
    current: 'bg-amber-500 text-white',
    upcoming: 'bg-gray-200 text-gray-600',
    rejected: 'bg-red-500 text-white',
  }
  return map[state]
}

function trackingStageBadgeClass(state: TrackingStageState) {
  const map: Record<TrackingStageState, string> = {
    completed: 'bg-emerald-100 text-emerald-700',
    current: 'bg-amber-100 text-amber-700',
    upcoming: 'bg-gray-100 text-gray-600',
    rejected: 'bg-red-100 text-red-700',
  }
  return map[state]
}

function trackingStageStatusLabel(state: TrackingStageState) {
  const map: Record<TrackingStageState, string> = {
    completed: 'Done',
    current: 'Current',
    upcoming: 'Pending',
    rejected: 'Rejected',
  }
  return map[state]
}

function buildJobRequestFields(chain: ApprovalChain) {
  const jobRequest = chain.job_request

  return [
    { label: 'Department', value: jobRequest?.department || '-' },
    { label: 'Main Position', value: jobRequest?.main_position || '-' },
    { label: 'Site', value: jobRequest?.site || '-' },
    { label: 'Employment Status', value: jobRequest?.employment_status || '-' },
    { label: 'Position Status', value: jobRequest?.position_status || '-' },
    { label: 'Required Date', value: formatDate(jobRequest?.required_date || null) },
    { label: 'Probation Period', value: jobRequest?.periode_probation?.toString() || '-' },
    { label: 'Cost Center PT', value: jobRequest?.pt_pembebanan || '-' },
    { label: 'Direct Manager', value: jobRequest?.direct_manager || '-' },
    { label: 'Working Location', value: jobRequest?.working_location || '-' },
    { label: 'BU Director', value: jobRequest?.approval_director_bu || '-' },
    { label: 'BU Director Date', value: formatDate(jobRequest?.approval_director_bu_date || null) },
    { label: 'GM HRD', value: jobRequest?.approval_gm_hrd || '-' },
    { label: 'GM HRD Date', value: formatDate(jobRequest?.approval_gm_hrd_date || null) },
    { label: 'HR Director', value: jobRequest?.approval_director_hrd || '-' },
    { label: 'HR Director Date', value: formatDate(jobRequest?.approval_director_hrd_date || null) },
    { label: 'Custom Group 1', value: jobRequest?.custom_grup_1 || '-' },
    { label: 'Custom Group 2', value: jobRequest?.custom_grup_2 || '-' },
    { label: 'Custom Group 3', value: jobRequest?.custom_grup_3 || '-' },
    { label: 'Custom Group 4', value: jobRequest?.custom_grup_4 || '-' },
    { label: 'Custom Group 5', value: jobRequest?.custom_grup_5 || '-' },
    { label: 'Custom Group 6', value: jobRequest?.custom_grup_6 || '-' },
  ]
}

function getTrackingStageStep(chain: ApprovalChain, stage: TrackingStage) {
  if (!stage.stepId) return null
  return chain.steps.find((step) => step.id === stage.stepId) ?? null
}

function canOpenTrackingStage(chain: ApprovalChain, stage: TrackingStage) {
  const step = getTrackingStageStep(chain, stage)
  if (!step) return false
  return canOpenStepDetail(step)
}

function openTrackingStageDetail(chainId: string, stage: TrackingStage) {
  if (!stage.stepId) return
  openStepDetail(chainId, stage.stepId)
}

function openStepDetail(chainId: string, stepId: string) {
  const chain = chains.value.find((item) => item.id === chainId)
  const step = chain?.steps.find((item) => item.id === stepId)
  if (!chain || !step || !canOpenStepDetail(step)) return

  selectedChainId.value = chainId
  selectedStepId.value = stepId
}

function closeStepDetail() {
  selectedChainId.value = ''
  selectedStepId.value = ''
}

async function handleApprove() {
  if (!selectedStep.value) return

  try {
    await approveAssignedStep(selectedStep.value.id, notesByStep.value[selectedStep.value.id] || undefined)
    appToast.success('Approval recorded successfully.')
    closeStepDetail()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to record approval.'
    appToast.error(message)
  }
}

async function handleReject() {
  if (!selectedStep.value) return

  try {
    await rejectAssignedStep(selectedStep.value.id, notesByStep.value[selectedStep.value.id] || undefined)
    appToast.success('Rejection recorded successfully.')
    closeStepDetail()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to record rejection.'
    appToast.error(message)
  }
}
</script>
