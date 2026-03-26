<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-8 text-gray-900">
    <div class="flex items-center gap-4">
      <button type="button"
        class="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        @click="router.back()">
        ←
      </button>
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Job Request</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">
          {{ isEdit ? 'Edit Job Request' : 'New Job Request Form' }}
        </h1>
      </div>
    </div>

    <p v-if="error" class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </p>

    <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <form v-if="!loading" class="grid gap-5 md:grid-cols-2" @submit.prevent="handleSubmit">
        <label class="space-y-2 md:col-span-2">
          <span class="text-sm font-medium text-gray-700">Cost Center PT</span>
          <input v-model="form.pt_pembebanan" class="field" type="text" placeholder="Enter PT" />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Main Position *</span>
          <input v-model="form.main_position" class="field" type="text" required
            placeholder="e.g. Software Engineer" />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Employment Status</span>
          <select v-model="form.employment_status" class="field">
            <option value="">Select status...</option>
            <option v-for="option in employmentStatusOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Position Status</span>
          <select v-model="form.position_status" class="field">
            <option value="">Select status...</option>
            <option v-for="option in positionStatusOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Probation Period (Months)</span>
          <input v-model.number="form.periode_probation" class="field" type="number" min="0"
            @input="sanitizeNumberField(form, 'periode_probation')" />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Direct Manager</span>
          <div class="relative" ref="managerFieldRef">
            <input v-model="searchDirectManager" type="text" class="field" placeholder="Search for manager..."
              @focus="openManagerDropdown" @input="openManagerDropdown" autocomplete="off" />
            <ul v-show="isManagerDropdownOpen && filteredDirectManagers.length > 0"
              class="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
              <li v-for="manager in filteredDirectManagers" :key="manager.id"
                class="cursor-pointer px-4 py-2 hover:bg-blue-50" @click="selectManager(manager)">
                {{ manager.label }}
              </li>
            </ul>
          </div>
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">BU Director Approval</span>
          <div class="relative" ref="approvalDirectorBuFieldRef">
            <input v-model="searchApprovalDirectorBu" type="text" class="field"
              placeholder="Search for BU director..." @focus="openApprovalDirectorBuDropdown"
              @input="openApprovalDirectorBuDropdown" autocomplete="off" />
            <ul v-show="isApprovalDirectorBuOpen && filteredApprovalDirectorBu.length > 0"
              class="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
              <li v-for="manager in filteredApprovalDirectorBu" :key="`approval-${manager.id}`"
                class="cursor-pointer px-4 py-2 hover:bg-blue-50" @click="selectApprovalDirectorBu(manager)">
                {{ manager.label }}
              </li>
            </ul>
          </div>
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Site</span>
          <input v-model="form.site" class="field" type="text" placeholder="Site location" />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Working Location</span>
          <input v-model="form.working_location" class="field" type="text" placeholder="Working location" />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Required Date</span>
          <input v-model="form.required_date" class="field" type="date" />
        </label>

        <!-- Approval Auto Info Box -->
        <div class="md:col-span-2 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 flex gap-3">
          <div class="mt-0.5 text-blue-500 shrink-0">ℹ</div>
          <div>
            <p class="text-sm font-semibold text-blue-800">Automatic Approval</p>
            <p class="mt-1 text-sm text-blue-700 leading-relaxed">
              <strong>GM HRD</strong> and <strong>HRD Director</strong> are automatically filled from the active Approver Master according to their respective positions. Approval date is filled once approved.
            </p>
          </div>
        </div>

        <div class="md:col-span-2 mt-4">
          <hr class="border-gray-100" />
        </div>

        <label v-for="index in 6" :key="index" class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Custom Group {{ index }}</span>
          <select v-model="form[`custom_grup_${index}_id` as keyof typeof form]" class="field">
            <option :value="null">Select...</option>
            <option v-for="opt in groupedOptions[index]" :key="opt.id" :value="opt.id">
              {{ opt.name }}
            </option>
          </select>
        </label>

        <div class="md:col-span-2 mt-6 flex gap-3">
          <button type="submit"
            class="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            :disabled="saving">
            {{ saving ? 'Saving...' : isEdit ? 'Update Job Request' : 'Save Job Request' }}
          </button>
          <button type="button"
            class="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            :disabled="saving" @click="router.back()">
            Cancel
          </button>
        </div>
      </form>
      <div v-else class="py-10 text-center text-sm text-gray-500">Loading data...</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, watch, ref, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  employmentStatusOptions,
  positionStatusOptions,
  type JobRequestInput,
} from '@/domain/entities/JobRequest'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useJobRequestViewModel } from '@/viewmodels/useJobRequestViewModel'
import { useCustomGroupViewModel } from '@/viewmodels/useCustomGroupViewModel'
import { supabase } from '@/infrastructure/supabase/client'

const route = useRoute()
const router = useRouter()
const { jobs, loading, saving, error, create, update, refresh } = useJobRequestViewModel()
const { groupedOptions, loadAllOptions } = useCustomGroupViewModel()
const appToast = useAppToast()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)

function createEmptyForm(): JobRequestInput {
  return {
    pt_pembebanan: '',
    main_position: '',
    employment_status: '',
    position_status: '',
    direct_manager: '',
    approval_director_bu: '',
    approval_director_bu_date: '',
    site: '',
    working_location: '',
    custom_grup_1_id: null,
    custom_grup_2_id: null,
    custom_grup_3_id: null,
    custom_grup_4_id: null,
    custom_grup_5_id: null,
    custom_grup_6_id: null,
    required_date: '',
    periode_probation: 0,
    status: 'open',
  }
}

const form = reactive<JobRequestInput>(createEmptyForm())
const directManagers = ref<DirectManagerOption[]>([])
const searchDirectManager = ref('')
const searchApprovalDirectorBu = ref('')
const isManagerDropdownOpen = ref(false)
const isApprovalDirectorBuOpen = ref(false)
const managerFieldRef = ref<HTMLElement | null>(null)
const approvalDirectorBuFieldRef = ref<HTMLElement | null>(null)

function sanitizeNumberField(target: Record<string, any>, field: string) {
  if (target[field] < 0) {
    target[field] = 0
  }
}

type DirectManagerOption = {
  id: string
  label: string
}

function filterManagers(term: string) {
  const q = term.toLowerCase().trim()
  if (!q) return directManagers.value
  return directManagers.value.filter((manager) => manager.label.toLowerCase().includes(q))
}

const filteredDirectManagers = computed(() => filterManagers(searchDirectManager.value))
const filteredApprovalDirectorBu = computed(() => filterManagers(searchApprovalDirectorBu.value))

async function loadDirectManagers() {
  const { data, error } = await supabase
    .from('employees')
    .select(`id, first_name, middle_name, last_name, main_position`)

  if (error) return

  directManagers.value = (data ?? []).map((employee) => {
    const fullName = [employee.first_name, employee.middle_name, employee.last_name]
      .filter(Boolean)
      .join(' ')
      .trim()
    const position = employee.main_position ?? 'Unknown position'
    return {
      id: employee.id,
      label: `${fullName || 'Unnamed'} — ${position}`,
    }
  })
}

function openManagerDropdown() { isManagerDropdownOpen.value = true }
function closeManagerDropdown() { isManagerDropdownOpen.value = false }

function selectManager(manager: DirectManagerOption) {
  searchDirectManager.value = manager.label
  form.direct_manager = manager.label
  isManagerDropdownOpen.value = false
}

function openApprovalDirectorBuDropdown() { isApprovalDirectorBuOpen.value = true }
function closeApprovalDirectorBuDropdown() { isApprovalDirectorBuOpen.value = false }

function selectApprovalDirectorBu(manager: DirectManagerOption) {
  searchApprovalDirectorBu.value = manager.label
  form.approval_director_bu = manager.label
  isApprovalDirectorBuOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (managerFieldRef.value && !managerFieldRef.value.contains(event.target as Node) && isManagerDropdownOpen.value) {
    closeManagerDropdown()
  }
  if (approvalDirectorBuFieldRef.value && !approvalDirectorBuFieldRef.value.contains(event.target as Node) && isApprovalDirectorBuOpen.value) {
    closeApprovalDirectorBuDropdown()
  }
}

function loadData() {
  if (isEdit.value && id.value) {
    const job = jobs.value.find((j) => j.id === id.value)
    if (job) {
      Object.assign(form, {
        pt_pembebanan: job.pt_pembebanan ?? '',
        main_position: job.main_position,
        employment_status: job.employment_status ?? '',
        position_status: job.position_status ?? '',
        direct_manager: job.direct_manager ?? '',
        approval_director_bu: job.approval_director_bu ?? '',
        approval_director_bu_date: job.approval_director_bu_date ?? '',
        site: job.site ?? '',
        working_location: job.working_location ?? '',
        custom_grup_1_id: job.custom_grup_1_id ?? null,
        custom_grup_2_id: job.custom_grup_2_id ?? null,
        custom_grup_3_id: job.custom_grup_3_id ?? null,
        custom_grup_4_id: job.custom_grup_4_id ?? null,
        custom_grup_5_id: job.custom_grup_5_id ?? null,
        custom_grup_6_id: job.custom_grup_6_id ?? null,
        required_date: job.required_date ?? '',
        periode_probation: job.periode_probation ?? 0,
      })
      searchDirectManager.value = job.direct_manager ?? ''
      searchApprovalDirectorBu.value = job.approval_director_bu ?? ''
    } else if (!loading.value) {
      appToast.error('Job request data not found.')
      router.back()
    }
  }
}

watch(() => jobs.value, loadData, { immediate: true })

onMounted(() => {
  if (isEdit.value && jobs.value.length === 0) refresh()
  loadDirectManagers()
  loadAllOptions()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

async function handleSubmit() {
  try {
    if (isEdit.value && id.value) {
      await update(id.value, { ...form })
      appToast.updated('Job Request')
    } else {
      await create({ ...form })
      appToast.created('Job Request')
    }
    router.push('/job-requests')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save job request.'
    appToast.error(message)
  }
}
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(209 213 219);
  background: rgb(249 250 251);
  padding: 0.75rem 1rem;
  color: rgb(17 24 39);
  outline: none;
  transition: all 0.2s;
}

.field:focus {
  border-color: rgb(37 99 235);
  background: white;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
</style>
