<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Recruitment Team</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Recruitment Dashboard</h1>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
        @click="handleRefresh"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <p
      v-if="combinedError"
      class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ combinedError }}
    </p>

    <section>
      <div
        class="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-500 p-6 text-white shadow-sm"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-blue-100">
          Open Position
        </p>
        <p class="mt-4 text-5xl font-semibold tracking-tight">{{ openPositionsCount }}</p>
        
      </div>
    </section>

    <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div
        class="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
            Hiring Summary
          </p>
          <p class="mt-1 text-sm text-gray-500">
            Department distribution by job level, based on approved ERF that are still open.
          </p>
        </div>

        <label class="block w-full lg:max-w-md">
          <span class="sr-only">Search open positions</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search department, position, site, PT, or level..."
            class="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-600"
          />
        </label>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] border-separate border-spacing-0 text-sm text-gray-600">
          <thead class="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th class="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium">
                Department
              </th>
              <th
                v-for="column in effectiveSummaryColumns"
                :key="column.key"
                class="border-b border-r border-gray-200 px-4 py-3 text-center font-medium last:border-r-0"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in summaryRows"
              :key="row.department"
              class="transition hover:bg-gray-50/80"
            >
              <td
                class="sticky left-0 border-b border-r border-gray-200 bg-white px-4 py-3 font-medium text-gray-900"
              >
                {{ row.department }}
              </td>
              <td
                v-for="column in effectiveSummaryColumns"
                :key="`${row.department}-${column.key}`"
                class="border-b border-r border-gray-200 px-4 py-3 text-center text-gray-700 last:border-r-0"
              >
                {{ row.counts[column.key] }}
              </td>
            </tr>

            <tr v-if="!loading && summaryRows.length === 0">
              <td
                :colspan="effectiveSummaryColumns.length + 1"
                class="px-4 py-10 text-center text-sm text-gray-500"
              >
                No open position data found.
              </td>
            </tr>
          </tbody>

          <tfoot v-if="summaryRows.length > 0" class="bg-gray-50 text-sm font-semibold text-gray-900">
            <tr>
              <th
                class="sticky left-0 z-10 border-r border-gray-200 bg-gray-50 px-4 py-3 text-left"
              >
                Total
              </th>
              <th
                v-for="column in effectiveSummaryColumns"
                :key="`total-${column.key}`"
                class="border-r border-gray-200 px-4 py-3 text-center last:border-r-0"
              >
                {{ summaryTotals[column.key] }}
              </th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="border-t border-gray-100 px-6 py-4 text-xs text-gray-500">
        Job level uses the Job Level master value. If older ERF data does not have it yet, the
        dashboard falls back to Custom Group or position title heuristics.
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { RecruitmentTracking } from '@/domain/entities/RecruitmentTracking'
import { useRecruitmentTrackingViewModel } from '@/viewmodels/useRecruitmentTrackingViewModel'
import { useMasterDataViewModel } from '@/viewmodels/useMasterDataViewModel'

type SummaryColumn = {
  key: string
  label: string
}

type EnrichedTracking = RecruitmentTracking & {
  departmentLabel: string
  levelKey: string
  levelLabel: string
}

const { trackings, loading, error, refreshTrackings } = useRecruitmentTrackingViewModel()
const {
  optionsByType,
  error: masterDataError,
  loadAllOptions: loadMasterDataOptions,
} = useMasterDataViewModel()

const searchQuery = ref('')

function normalize(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function compactText(value: unknown) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractLevelCandidates(employeeRequestForm: RecruitmentTracking['employee_request_form']) {
  if (!employeeRequestForm) return []

  return [
    employeeRequestForm.job_level,
    employeeRequestForm.custom_grup_1,
    employeeRequestForm.custom_grup_2,
    employeeRequestForm.custom_grup_3,
    employeeRequestForm.custom_grup_4,
    employeeRequestForm.custom_grup_5,
    employeeRequestForm.custom_grup_6,
    employeeRequestForm.main_position,
  ]
    .map(compactText)
    .filter(Boolean)
}

const masterJobLevelLabels = computed(() =>
  optionsByType.value.job_level
    .map((item) => compactText(item.name))
    .filter(Boolean),
)

const normalizedJobLevelMap = computed(
  () => new Map(masterJobLevelLabels.value.map((label) => [normalize(label), label])),
)

function resolveLevel(employeeRequestForm: RecruitmentTracking['employee_request_form']) {
  const candidates = extractLevelCandidates(employeeRequestForm)

  for (const candidate of candidates) {
    const matchedMasterLabel = normalizedJobLevelMap.value.get(normalize(candidate))
    if (matchedMasterLabel) {
      return {
        key: matchedMasterLabel,
        label: matchedMasterLabel,
      }
    }
  }

  return {
    key: 'Others',
    label: 'Others',
  }
}

function formatDate(value: string | null) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

async function handleRefresh() {
  await Promise.allSettled([refreshTrackings(), loadMasterDataOptions()])
}

onMounted(() => {
  loadMasterDataOptions().catch(() => null)
})

const combinedError = computed(() => error.value || masterDataError.value || '')

const enrichedTrackings = computed<EnrichedTracking[]>(() =>
  trackings.value.map((tracking) => {
    const departmentLabel = compactText(tracking.employee_request_form?.department) || 'No Department'
    const level = resolveLevel(tracking.employee_request_form ?? null)

    return {
      ...tracking,
      departmentLabel,
      levelKey: level.key,
      levelLabel: level.label,
    }
  }),
)

const openTrackings = computed(() =>
  enrichedTrackings.value.filter((tracking) => tracking.employee_request_form?.status !== 'closed'),
)

const filteredOpenTrackings = computed(() => {
  const query = normalize(searchQuery.value)
  if (!query) return openTrackings.value

  return openTrackings.value.filter((tracking) => {
    const haystack = [
      tracking.departmentLabel,
      tracking.employee_request_form?.pt_pembebanan,
      tracking.employee_request_form?.main_position,
      tracking.employee_request_form?.site,
      tracking.levelLabel,
      ...extractLevelCandidates(tracking.employee_request_form ?? null),
    ]
      .map(normalize)
      .join(' ')

    return haystack.includes(query)
  })
})

const openPositionsCount = computed(() => openTrackings.value.length)
const openPositionCaption = computed(() => {
  if (filteredOpenTrackings.value.length !== openTrackings.value.length) {
    return `${filteredOpenTrackings.value.length} open position(s) match the current search filter.`
  }

  return 'Approved ERF with status open and ready to be processed by the recruitment team.'
})

const departmentOptions = computed(() =>
  optionsByType.value.department
    .map((item) => compactText(item.name))
    .filter(Boolean),
)

const summaryDepartmentLabels = computed(() => {
  const dataDepartments = filteredOpenTrackings.value.map((tracking) => tracking.departmentLabel)
  const baseDepartments = searchQuery.value
    ? [...departmentOptions.value.filter((department) => normalize(department).includes(normalize(searchQuery.value))), ...dataDepartments]
    : [...departmentOptions.value, ...dataDepartments]

  return Array.from(new Set(baseDepartments)).sort((left, right) => left.localeCompare(right))
})

const hasOthersColumn = computed(() =>
  filteredOpenTrackings.value.some((tracking) => tracking.levelKey === 'Others'),
)

const summaryColumns = computed<SummaryColumn[]>(() => {
  const masterColumns = masterJobLevelLabels.value.map((label) => ({
    key: label,
    label,
  }))

  return hasOthersColumn.value
    ? [...masterColumns, { key: 'Others', label: 'Others' }]
    : masterColumns
})

function createEmptyCounts(columns: SummaryColumn[]) {
  return Object.fromEntries(columns.map((column) => [column.key, 0])) as Record<string, number>
}

const visibleSummaryColumns = computed(() => {
  const query = normalize(searchQuery.value)
  if (!query) return summaryColumns.value

  return summaryColumns.value.filter((column) => normalize(column.label).includes(query))
})

const effectiveSummaryColumns = computed(() =>
  visibleSummaryColumns.value.length > 0 ? visibleSummaryColumns.value : summaryColumns.value,
)

const summaryRows = computed(() =>
  summaryDepartmentLabels.value.map((department) => {
    const counts = createEmptyCounts(summaryColumns.value)

    for (const tracking of filteredOpenTrackings.value) {
      if (tracking.departmentLabel === department) {
        counts[tracking.levelKey] = (counts[tracking.levelKey] ?? 0) + 1
      }
    }

    return {
      department,
      counts,
    }
  }),
)

const summaryTotals = computed(() => {
  const totals = createEmptyCounts(summaryColumns.value)

  for (const tracking of filteredOpenTrackings.value) {
    totals[tracking.levelKey] = (totals[tracking.levelKey] ?? 0) + 1
  }

  return totals
})

</script>
