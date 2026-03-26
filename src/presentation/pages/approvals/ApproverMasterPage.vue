<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-8 text-gray-900 pb-12">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600 font-inter">Master Data</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Approver Master</h1>
      </div>
      <button
        type="button"
        class="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
        @click="goToEdit"
      >
        Edit Configuration
      </button>
    </div>

    <p
      v-if="error"
      class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <div v-if="loading" class="py-20 text-center text-sm text-gray-500">Loading configurations...</div>

    <div v-else class="grid gap-6 md:grid-cols-2">
      <!-- GM HRD Card -->
      <div 
        class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:border-blue-200"
      >
        <div class="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-blue-50 opacity-50 transition group-hover:scale-150"></div>
        
        <div class="relative items-start justify-between flex mb-6">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <span class="text-xl font-bold">1</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">GM HRD</h2>
              <p class="text-sm text-gray-500 uppercase tracking-wider font-semibold">Approval Step 1</p>
            </div>
          </div>
          <span 
            class="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
            :class="gmApprover ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
          >
            {{ gmApprover ? 'Configured' : 'Not Set' }}
          </span>
        </div>

        <div v-if="gmApprover?.employee" class="space-y-6">
          <div class="space-y-1">
            <p class="text-xs font-bold uppercase text-gray-400">Full Name</p>
            <p class="text-lg font-semibold text-gray-800">{{ getFullName(gmApprover.employee) }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
             <div class="space-y-1">
              <p class="text-xs font-bold uppercase text-gray-400">Position</p>
              <p class="text-sm font-medium text-gray-700">{{ gmApprover.employee.main_position || '-' }}</p>
            </div>
             <div class="space-y-1">
              <p class="text-xs font-bold uppercase text-gray-400">Phone</p>
              <p class="text-sm font-medium text-gray-700">{{ gmApprover.employee.phone || '-' }}</p>
            </div>
          </div>

          <div class="space-y-1 pt-4 border-t border-gray-50">
            <p class="text-xs font-bold uppercase text-gray-400">Email Address</p>
            <p class="text-sm font-medium text-blue-600">{{ gmApprover.employee.email }}</p>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-10 text-gray-400">
          <p class="text-sm">No GM HRD configuration found.</p>
        </div>
      </div>

      <!-- Director HRD Card -->
      <div 
        class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:border-indigo-200"
      >
        <div class="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-indigo-50 opacity-50 transition group-hover:scale-150"></div>
        
        <div class="relative items-start justify-between flex mb-6">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <span class="text-xl font-bold">2</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Director HRD</h2>
              <p class="text-sm text-gray-500 uppercase tracking-wider font-semibold">Approval Step 2</p>
            </div>
          </div>
          <span 
            class="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
            :class="directorApprover ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
          >
            {{ directorApprover ? 'Configured' : 'Not Set' }}
          </span>
        </div>

        <div v-if="directorApprover?.employee" class="space-y-6">
          <div class="space-y-1">
            <p class="text-xs font-bold uppercase text-gray-400">Full Name</p>
            <p class="text-lg font-semibold text-gray-800">{{ getFullName(directorApprover.employee) }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
             <div class="space-y-1">
              <p class="text-xs font-bold uppercase text-gray-400">Position</p>
              <p class="text-sm font-medium text-gray-700">{{ directorApprover.employee.main_position || '-' }}</p>
            </div>
             <div class="space-y-1">
              <p class="text-xs font-bold uppercase text-gray-400">Phone</p>
              <p class="text-sm font-medium text-gray-700">{{ directorApprover.employee.phone || '-' }}</p>
            </div>
          </div>

          <div class="space-y-1 pt-4 border-t border-gray-50">
            <p class="text-xs font-bold uppercase text-gray-400">Email Address</p>
            <p class="text-sm font-medium text-indigo-600">{{ directorApprover.employee.email }}</p>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-10 text-gray-400">
          <p class="text-sm">No Director HRD configuration found.</p>
        </div>
      </div>
    </div>

    <!-- Info Section -->
    <div class="rounded-xl border border-blue-50 bg-blue-50/30 p-8 flex gap-4">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">ℹ</div>
      <div>
        <h3 class="font-bold text-blue-900">Configuration Guide</h3>
        <p class="mt-2 text-sm text-blue-800 leading-relaxed">
          These two roles are critical for the recruitment workflow. The <strong>GM HRD</strong> handles the first stage of HR approval, followed by the <strong>Director HRD</strong>. Both names will be automatically populated into new ERF submissions based on these configurations.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApproverMasterViewModel } from '@/viewmodels/useApproverMasterViewModel'

const router = useRouter()
const { approvers, loading, error, refresh } = useApproverMasterViewModel()

onMounted(() => {
  refresh()
})

const gmApprover = computed(() => 
  approvers.value.find(a => a.step_order === 1)
)

const directorApprover = computed(() => 
  approvers.value.find(a => a.step_order === 2)
)

function getFullName(emp: any) {
  return [emp.first_name, emp.middle_name, emp.last_name]
    .filter(Boolean)
    .join(' ')
}

function goToEdit() {
  router.push('/approver-master/configure')
}
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
