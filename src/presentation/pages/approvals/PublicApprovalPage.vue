<template>
  <div class="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-2xl">
      <!-- Loading -->
      <div v-if="loading" class="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p class="text-gray-600">Loading approval data...</p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error && !chain"
        class="rounded-xl border border-red-200 bg-red-50 p-8 text-center"
      >
        <h1 class="text-2xl font-semibold text-red-800">Invalid Link</h1>
        <p class="mt-3 text-red-700">{{ error }}</p>
      </div>

      <!-- Success message -->
      <div
        v-else-if="success"
        class="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center"
      >
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white"
        >
          ✓
        </div>
        <h1 class="text-2xl font-semibold text-emerald-800">Approval Successful</h1>
        <p class="mt-3 text-emerald-700">Thank you. Your approval has been recorded.</p>
      </div>

      <!-- Rejected message -->
      <div v-else-if="rejected" class="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-2xl text-white"
        >
          ✕
        </div>
        <h1 class="text-2xl font-semibold text-red-800">Rejected</h1>
        <p class="mt-3 text-red-700">The request has been rejected.</p>
      </div>

      <!-- Already processed -->
      <div
        v-else-if="step && step.status !== 'pending'"
        class="rounded-xl border border-gray-200 bg-white p-8 text-center"
      >
        <h1 class="text-2xl font-semibold text-gray-900">Already Processed</h1>
        <p class="mt-3 text-gray-600">
          This step was already
          <span
            :class="
              step.status === 'approved'
                ? 'text-emerald-600 font-semibold'
                : 'text-red-600 font-semibold'
            "
          >
            {{ step.status === 'approved' ? 'approved' : 'rejected' }}
          </span>
          on {{ formatDate(step.approved_at) }}.
        </p>
      </div>

      <!-- Waiting for previous step -->
      <div
        v-else-if="step && !canApprove"
        class="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center"
      >
        <h1 class="text-2xl font-semibold text-amber-800">Waiting for Previous Approval</h1>
        <p class="mt-3 text-amber-700">
          You are the approver for step {{ step.step_order }}. This request is still waiting for the
          previous approval.
        </p>
      </div>

      <!-- Main Approval View -->
      <div v-else-if="chain && step" class="space-y-6">
        <!-- Header -->
        <div class="rounded-xl border border-gray-200 bg-white p-8">
          <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Approval Request</p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
            New Employee Application
          </h1>
          <p class="mt-2 text-sm text-gray-600">
            You are requested to review and approve the following request.
          </p>

          <div class="mt-4 rounded-xl bg-blue-50 px-4 py-3">
            <p class="text-sm text-blue-800">
              <span class="font-medium">Approver:</span>
              {{ step.approver_name || step.approver_email }} (Step {{ step.step_order }} dari
              {{ chain.steps.length }})
            </p>
          </div>
        </div>

        <!-- ERF Data -->
        <div class="rounded-xl border border-gray-200 bg-white p-8">
          <h2 class="mb-6 text-xl font-semibold text-gray-900">ERF Details</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div
              v-for="field in jobRequestFields"
              :key="field.label"
              class="rounded-xl bg-gray-50 px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wider text-gray-500">{{ field.label }}</p>
              <p class="mt-1 font-medium text-gray-900">{{ field.value || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Other Steps Status -->
        <div class="rounded-xl border border-gray-200 bg-white p-8">
          <h2 class="mb-4 text-xl font-semibold text-gray-900">Approval Status</h2>
          <div class="space-y-2">
            <div
              v-for="s in chain.steps"
              :key="s.id"
              class="flex items-center gap-3 rounded-xl border px-4 py-3"
              :class="s.id === step.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'"
            >
              <div
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                :class="{
                  'bg-emerald-500 text-white': s.status === 'approved',
                  'bg-red-500 text-white': s.status === 'rejected',
                  'bg-blue-500 text-white': s.status === 'pending' && s.id === step.id,
                  'bg-gray-200 text-gray-600': s.status === 'pending' && s.id !== step.id,
                }"
              >
                {{ s.step_order }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ s.approver_name || s.approver_email }}
                </p>
              </div>
              <span
                class="rounded-full px-3 py-1 text-xs font-medium"
                :class="{
                  'bg-emerald-100 text-emerald-700': s.status === 'approved',
                  'bg-red-100 text-red-700': s.status === 'rejected',
                  'bg-amber-100 text-amber-700': s.status === 'pending',
                }"
              >
                {{
                  s.status === 'approved'
                    ? 'Approved'
                    : s.status === 'rejected'
                      ? 'Rejected'
                      : 'Pending'
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="rounded-xl border border-gray-200 bg-white p-8">
          <h2 class="mb-4 text-xl font-semibold text-gray-900">Notes & Decision</h2>
          <label class="block space-y-2">
            <span class="text-sm text-gray-600">Notes (optional)</span>
            <textarea
              v-model="notes"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-900 outline-none focus:border-blue-500"
              rows="3"
              placeholder="Add notes if needed..."
            />
          </label>

          <p
            v-if="error"
            class="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
          >
            {{ error }}
          </p>

          <div class="mt-6 flex gap-3">
            <button
              type="button"
              class="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              :disabled="saving"
              @click="handleApprove"
            >
              {{ saving ? 'Processing...' : 'Approve' }}
            </button>
            <button
              type="button"
              class="rounded-xl border border-red-300 bg-red-50 px-6 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-60"
              :disabled="saving"
              @click="handleReject"
            >
              {{ saving ? 'Processing...' : 'Reject' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { usePublicApprovalViewModel } from '@/viewmodels/usePublicApprovalViewModel'

const route = useRoute()
const { step, chain, loading, saving, error, success, rejected, loadByToken, approve, reject } =
  usePublicApprovalViewModel()

const notes = ref('')
const token = computed(() => route.params.token as string)

const canApprove = computed(() => {
  if (!step.value || !chain.value) return false
  // All previous steps must be approved
  return chain.value.steps
    .filter((s) => s.step_order < step.value!.step_order)
    .every((s) => s.status === 'approved')
})

const jobRequestFields = computed(() => {
  const jr = chain.value?.job_request
  if (!jr) return []
  return [
    { label: 'Main Position', value: jr.main_position },
    { label: 'Site', value: jr.site },
    { label: 'Employment Status', value: jr.employment_status },
    { label: 'Direct Manager', value: jr.direct_manager },
    { label: 'Cost Center PT', value: jr.pt_pembebanan },
    { label: 'Working Location', value: jr.working_location },
    { label: 'Required Date', value: jr.required_date },
    { label: 'Position Status', value: jr.position_status },
    { label: 'Probation Period', value: jr.periode_probation?.toString() },
    { label: 'Custom Group 1', value: jr.custom_grup_1 },
    { label: 'Custom Group 2', value: jr.custom_grup_2 },
    { label: 'Custom Group 3', value: jr.custom_grup_3 },
    { label: 'Custom Group 4', value: jr.custom_grup_4 },
    { label: 'Custom Group 5', value: jr.custom_grup_5 },
    { label: 'Custom Group 6', value: jr.custom_grup_6 },
  ].filter((f) => f.value)
})

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleApprove() {
  try {
    await approve(token.value, notes.value || undefined)
  } catch {
    // error handled by viewmodel
  }
}

async function handleReject() {
  try {
    await reject(token.value, notes.value || undefined)
  } catch {
    // error handled by viewmodel
  }
}

onMounted(() => {
  if (token.value) {
    loadByToken(token.value)
  }
})
</script>
