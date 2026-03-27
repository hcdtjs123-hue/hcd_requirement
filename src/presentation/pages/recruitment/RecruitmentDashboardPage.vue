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
      class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <input
      v-model="searchQuery"
      type="search"
      placeholder="Search position, site, employment, or required date..."
      class="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
    />

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th class="w-14 px-4 py-3 font-medium">No</th>
              <th class="min-w-[180px] px-4 py-3 font-medium">Position</th>
              <th class="min-w-[170px] px-4 py-3 font-medium">Designation</th>
              <th class="min-w-[140px] px-4 py-3 font-medium">Site</th>
              <th class="min-w-[160px] px-4 py-3 font-medium">Employment</th>
              <th class="min-w-[160px] px-4 py-3 font-medium">Required Date</th>
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
                <h2 class="whitespace-nowrap text-base font-semibold text-gray-900">
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
            </tr>
            <tr v-if="!loading && filteredTrackings.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-500">
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

import TablePagination from '@/presentation/components/tables/TablePagination.vue'
import { useRecruitmentTrackingViewModel } from '@/viewmodels/useRecruitmentTrackingViewModel'

const { trackings, loading, error, refreshTrackings } = useRecruitmentTrackingViewModel()

const searchQuery = ref('')
const pageSize = 10
const page = ref(1)

function normalize(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
}

const filteredTrackings = computed(() => {
  const q = normalize(searchQuery.value)
  if (!q) return trackings.value

  return trackings.value.filter((tracking) => {
    const haystack = [
      tracking.job_request?.main_position,
      tracking.job_request?.site,
      tracking.job_request?.employment_status,
      tracking.job_request?.required_date,
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

watch(searchQuery, () => {
  page.value = 1
})

watch(
  () => filteredTrackings.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)
</script>
