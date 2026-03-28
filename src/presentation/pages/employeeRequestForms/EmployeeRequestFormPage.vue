<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          @click="router.back()"
        >
          ←
        </button>
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Employee Request Form (ERF)</p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight">
            {{ pageTitle }}
          </h1>
        </div>
      </div>
      <button
        v-if="canEditFromDetail"
        type="button"
        class="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        @click="goToEdit"
      >
        Edit ERF
      </button>
    </div>

    <p v-if="error" class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </p>

    <div
      v-if="isDetail"
      class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
    >
      This ERF is shown in read-only mode. Use the edit button if you need to make changes.
    </div>

    <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <form v-if="!loading" class="grid gap-5 md:grid-cols-2" @submit.prevent="handleSubmit">
        <fieldset class="contents" :disabled="isDetail || saving">
          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-medium text-gray-700">Cost Center PT</span>
            <select v-model="form.pt_pembebanan" class="field">
              <option value="">Select PT...</option>
              <option v-for="option in ptOptions" :key="option.id" :value="option.name">
                {{ option.name }}
              </option>
            </select>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Department</span>
            <select v-model="form.department" class="field">
              <option value="">Select department...</option>
              <option v-for="option in departmentOptions" :key="option.id" :value="option.name">
                {{ option.name }}
              </option>
            </select>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Job Level</span>
            <select v-model="form.job_level" class="field">
              <option value="">Select job level...</option>
              <option v-for="option in jobLevelOptions" :key="option.id" :value="option.name">
                {{ option.name }}
              </option>
            </select>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Main Position *</span>
            <input
              v-model="form.main_position"
              class="field"
              type="text"
              required
              placeholder="e.g. Software Engineer"
            />
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
            <input
              v-model.number="form.periode_probation"
              class="field"
              type="number"
              min="0"
              @input="sanitizeNumberField(form, 'periode_probation')"
            />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Direct Manager</span>
            <div class="relative" ref="managerFieldRef">
              <input
                v-model="searchDirectManager"
                type="text"
                class="field"
                placeholder="Search for manager..."
                autocomplete="off"
                @focus="openManagerDropdown"
                @input="openManagerDropdown"
              />
              <ul
                v-show="isManagerDropdownOpen && filteredDirectManagers.length > 0"
                class="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <li
                  v-for="manager in filteredDirectManagers"
                  :key="manager.id"
                  class="cursor-pointer px-4 py-2 hover:bg-blue-50"
                  @click="selectManager(manager)"
                >
                  {{ manager.label }}
                </li>
              </ul>
            </div>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">BU Director Approval</span>
            <div class="relative" ref="approvalDirectorBuFieldRef">
              <input
                v-model="searchApprovalDirectorBu"
                type="text"
                class="field"
                placeholder="Search for BU director..."
                autocomplete="off"
                @focus="openApprovalDirectorBuDropdown"
                @input="openApprovalDirectorBuDropdown"
              />
              <ul
                v-show="isApprovalDirectorBuOpen && filteredApprovalDirectorBu.length > 0"
                class="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <li
                  v-for="manager in filteredApprovalDirectorBu"
                  :key="`approval-${manager.id}`"
                  class="cursor-pointer px-4 py-2 hover:bg-blue-50"
                  @click="selectApprovalDirectorBu(manager)"
                >
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
            <input
              v-model="form.working_location"
              class="field"
              type="text"
              placeholder="Working location"
            />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Required Date</span>
            <input v-model="form.required_date" class="field" type="date" />
          </label>

          <div class="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 md:col-span-2">
            <div class="mt-0.5 shrink-0 text-blue-500">ℹ</div>
            <div>
              <p class="text-sm font-semibold text-blue-800">Automatic Approval</p>
              <p class="mt-1 text-sm leading-relaxed text-blue-700">
                <strong>GM HRD</strong> and <strong>Director HRD</strong> are automatically filled from the active Approver Master according to their respective positions. Approval dates are filled after each step is approved.
              </p>
            </div>
          </div>

          <div class="mt-4 md:col-span-2">
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
        </fieldset>

        <div v-if="!isDetail" class="md:col-span-2 mt-6 flex gap-3">
          <button type="submit"
            class="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            :disabled="saving">
            {{ saving ? 'Saving...' : submitLabel }}
          </button>
          <button type="button"
            class="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
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
  type EmployeeRequestFormInput,
} from '@/domain/entities/EmployeeRequestForm'
import type { MasterDataItem } from '@/domain/entities/MasterData'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel'
import { useEmployeeRequestFormViewModel } from '@/viewmodels/useEmployeeRequestFormViewModel'
import { useCustomGroupViewModel } from '@/viewmodels/useCustomGroupViewModel'
import { useMasterDataViewModel } from '@/viewmodels/useMasterDataViewModel'
import { supabase } from '@/infrastructure/supabase/client'

const route = useRoute()
const router = useRouter()
const { jobs, loading, saving, error, create, update, refresh } = useEmployeeRequestFormViewModel()
const { groupedOptions, loadAllOptions } = useCustomGroupViewModel()
const { optionsByType, loadAllOptions: loadMasterDataOptions } = useMasterDataViewModel()
const { hasPermission } = useAuthViewModel()
const appToast = useAppToast()

const id = computed(() => route.params.id as string | undefined)
const isDetail = computed(() => route.name === 'employee-request-forms-detail')
const isEdit = computed(() => route.name === 'employee-request-forms-edit')
const isExistingRecord = computed(() => Boolean(id.value))
const canEditFromDetail = computed(() => isDetail.value && hasPermission('employee_request_form:update'))
const pageTitle = computed(() => {
  if (isDetail.value) return 'ERF Detail'
  if (isEdit.value) return 'Edit ERF'
  return 'New ERF'
})
const submitLabel = computed(() => (isEdit.value ? 'Update ERF' : 'Save ERF'))

function createEmptyForm(): EmployeeRequestFormInput {
  return {
    pt_pembebanan: '',
    department: '',
    job_level_id: null,
    job_level: '',
    main_position: '',
    employment_status: '',
    position_status: '',
    direct_manager: '',
    approval_director_bu_id: null,
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

const form = reactive<EmployeeRequestFormInput>(createEmptyForm())
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

function withCurrentOption(options: MasterDataItem[], currentValue: string) {
  const normalizedValue = currentValue.trim()
  if (!normalizedValue) return options
  if (options.some((option) => option.name === normalizedValue)) return options

  return [
    {
      id: `current-${normalizedValue}`,
      name: normalizedValue,
      description: 'Existing ERF value',
      created_at: null,
      updated_at: null,
    },
    ...options,
  ]
}

const ptOptions = computed(() => withCurrentOption(optionsByType.value.pt, form.pt_pembebanan))
const departmentOptions = computed(() =>
  withCurrentOption(optionsByType.value.department, form.department),
)
const jobLevelOptions = computed(() =>
  withCurrentOption(optionsByType.value.job_level, form.job_level),
)

async function loadDirectManagers() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`id, full_name, username`)

  if (error) return

  directManagers.value = (data ?? []).map((employee) => {
    const fullName = String(employee.full_name ?? employee.username ?? '').trim()
    const position = employee.username ? `@${employee.username}` : 'No username'

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
  form.approval_director_bu_id = manager.id
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
  if (isExistingRecord.value && id.value) {
    const job = jobs.value.find((j) => j.id === id.value)
    if (job) {
      Object.assign(form, {
        pt_pembebanan: job.pt_pembebanan ?? '',
        department: job.department ?? '',
        job_level: job.job_level ?? '',
        main_position: job.main_position,
        employment_status: job.employment_status ?? '',
        position_status: job.position_status ?? '',
        direct_manager: job.direct_manager ?? '',
        approval_director_bu_id: job.approval_director_bu_id ?? null,
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
      appToast.error('ERF data not found.')
      router.back()
    }
  }
}

watch(() => jobs.value, loadData, { immediate: true })

onMounted(() => {
  if (isExistingRecord.value && jobs.value.length === 0) refresh()
  loadDirectManagers()
  loadAllOptions()
  loadMasterDataOptions().catch(() => {
    appToast.error('Failed to load PT, Department, and Job Level master data.')
  })
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function goToEdit() {
  if (!id.value) return
  router.push(`/employee-request-forms/${id.value}/edit`)
}

async function handleSubmit() {
  if (isDetail.value) return

  try {
    if (isEdit.value && id.value) {
      await update(id.value, { ...form })
      appToast.updated('ERF')
    } else {
      await create({ ...form })
      appToast.created('ERF')
    }
    router.push('/employee-request-forms')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save ERF.'
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
