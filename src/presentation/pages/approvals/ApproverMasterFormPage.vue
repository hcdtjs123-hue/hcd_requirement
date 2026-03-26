<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-8 text-gray-900 pb-12">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        @click="router.back()"
      >
        ←
      </button>
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600 font-inter">Master Data</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">Approver Configuration</h1>
      </div>
    </div>

    <p
      v-if="error"
      class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <div v-if="loading" class="py-20 text-center text-sm text-gray-500">Loading data...</div>

    <form v-else class="space-y-8 font-inter" @submit.prevent="handleSubmit">
      <!-- Section 1: GM HRD -->
      <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center gap-3">
          <span class="h-8 w-1 rounded-full bg-purple-500"></span>
          <h2 class="text-lg font-semibold text-gray-800">1. GM HRD</h2>
          <span class="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
            Approval Step 1
          </span>
        </div>

        <div class="grid gap-5">
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Select Employee *</span>
            <div class="relative" ref="gmFieldRef">
              <input
                v-model="searchGm"
                type="text"
                class="field"
                placeholder="Search employee name or position..."
                @focus="isGmDropdownOpen = true"
                @input="isGmDropdownOpen = true"
                autocomplete="off"
                required
              />
              <ul
                v-show="isGmDropdownOpen && filteredGmEmployees.length > 0"
                class="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl"
              >
                <li
                  v-for="emp in filteredGmEmployees"
                  :key="emp.id"
                  class="cursor-pointer px-4 py-3 hover:bg-blue-50 transition border-b border-gray-50 last:border-0 text-sm"
                  @click="selectEmployee('gm', emp)"
                >
                  {{ emp.label }}
                </li>
              </ul>
            </div>
          </label>
          
          <div v-if="gmForm.employee_id" class="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <div class="space-y-1">
              <p class="text-[10px] font-bold uppercase text-gray-400">Position</p>
              <p class="text-sm font-medium">{{ getSelectedEmployee('gm')?.rawPosition || '-' }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[10px] font-bold uppercase text-gray-400">Email</p>
              <p class="text-sm font-medium">{{ getSelectedEmployee('gm')?.email || '-' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: Director HRD -->
      <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center gap-3">
          <span class="h-8 w-1 rounded-full bg-indigo-500"></span>
          <h2 class="text-lg font-semibold text-gray-800">2. Director HRD</h2>
          <span class="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            Approval Step 2
          </span>
        </div>

        <div class="grid gap-5">
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Select Employee *</span>
            <div class="relative" ref="directorFieldRef">
              <input
                v-model="searchDirector"
                type="text"
                class="field"
                placeholder="Search employee name or position..."
                @focus="isDirectorDropdownOpen = true"
                @input="isDirectorDropdownOpen = true"
                autocomplete="off"
                required
              />
              <ul
                v-show="isDirectorDropdownOpen && filteredDirectorEmployees.length > 0"
                class="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl"
              >
                <li
                  v-for="emp in filteredDirectorEmployees"
                  :key="emp.id"
                  class="cursor-pointer px-4 py-3 hover:bg-blue-50 transition border-b border-gray-50 last:border-0 text-sm"
                  @click="selectEmployee('director', emp)"
                >
                   {{ emp.label }}
                </li>
              </ul>
            </div>
          </label>

          <div v-if="directorForm.employee_id" class="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <div class="space-y-1">
              <p class="text-[10px] font-bold uppercase text-gray-400">Position</p>
              <p class="text-sm font-medium">{{ getSelectedEmployee('director')?.rawPosition || '-' }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[10px] font-bold uppercase text-gray-400">Email</p>
              <p class="text-sm font-medium">{{ getSelectedEmployee('director')?.email || '-' }}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="flex gap-4 sticky bottom-4">
        <button
          type="submit"
          class="flex-1 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-2xl transition hover:bg-blue-700 disabled:opacity-60"
          :disabled="saving"
        >
          {{ saving ? 'Saving Changes...' : 'Save All Configuration' }}
        </button>
        <button
          type="button"
          class="rounded-xl border border-gray-200 bg-white px-8 py-4 text-sm font-semibold text-gray-700 shadow-md transition hover:bg-gray-50"
          :disabled="saving"
          @click="router.back()"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch, ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import type { ApproverMasterInput } from '@/domain/entities/ApprovalChain'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useApproverMasterViewModel } from '@/viewmodels/useApproverMasterViewModel'
import { supabase } from '@/infrastructure/supabase/client'

const router = useRouter()
const { approvers, loading, error, saving, create, update, refresh } = useApproverMasterViewModel()
const appToast = useAppToast()
const isSubmittingConfig = ref(false)

// Employee selection state
const employees = ref<EmployeeOption[]>([])
const searchGm = ref('')
const searchDirector = ref('')
const isGmDropdownOpen = ref(false)
const isDirectorDropdownOpen = ref(false)
const gmFieldRef = ref<HTMLElement | null>(null)
const directorFieldRef = ref<HTMLElement | null>(null)

type EmployeeOption = {
  id: string
  label: string
  rawName: string
  rawPosition: string
  email: string | null
}

function createEmptyForm(step: number): ApproverMasterInput & { id?: string } {
  return {
    employee_id: '',
    step_order: step,
  }
}

const gmForm = reactive(createEmptyForm(1))
const directorForm = reactive(createEmptyForm(2))

type ApproverFormState = ApproverMasterInput & { id?: string }

async function loadEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select(`id, first_name, middle_name, last_name, main_position, email`)

  if (error) return

  employees.value = (data ?? []).map((emp) => {
    const fullName = [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(' ').trim()
    const position = emp.main_position ?? 'No position'
    return {
      id: emp.id,
      label: `${fullName || 'Unnamed'} — ${position}`,
      rawName: fullName || 'Unnamed',
      rawPosition: position,
      email: emp.email ?? null,
    }
  })
}

function getSelectedEmployee(type: 'gm' | 'director') {
  const id = type === 'gm' ? gmForm.employee_id : directorForm.employee_id
  return employees.value.find(e => e.id === id)
}

function filterEmployees(term: string) {
  const q = term.toLowerCase().trim()
  if (!q) return employees.value
  return employees.value.filter((emp) => emp.label.toLowerCase().includes(q))
}

const filteredGmEmployees = computed(() => filterEmployees(searchGm.value))
const filteredDirectorEmployees = computed(() => filterEmployees(searchDirector.value))

function selectEmployee(type: 'gm' | 'director', emp: EmployeeOption) {
  if (type === 'gm') {
    searchGm.value = emp.rawName
    gmForm.employee_id = emp.id
    isGmDropdownOpen.value = false
  } else {
    searchDirector.value = emp.rawName
    directorForm.employee_id = emp.id
    isDirectorDropdownOpen.value = false
  }
}

function handleClickOutside(event: MouseEvent) {
  if (gmFieldRef.value && !gmFieldRef.value.contains(event.target as Node)) {
    isGmDropdownOpen.value = false
  }
  if (directorFieldRef.value && !directorFieldRef.value.contains(event.target as Node)) {
    isDirectorDropdownOpen.value = false
  }
}

function loadData() {
  if (isSubmittingConfig.value) return

  if (!loading.value && approvers.value.length > 0) {
    const gm = approvers.value.find((a) => a.step_order === 1)
    if (gm) {
      Object.assign(gmForm, {
        id: gm.id,
        employee_id: gm.employee_id,
        step_order: gm.step_order,
      })
      const emp = employees.value.find(e => e.id === gm.employee_id)
      if (emp) searchGm.value = emp.rawName
    }

    const director = approvers.value.find((a) => a.step_order === 2)
    if (director) {
      Object.assign(directorForm, {
        id: director.id,
        employee_id: director.employee_id,
        step_order: director.step_order,
      })
      const emp = employees.value.find(e => e.id === director.employee_id)
      if (emp) searchDirector.value = emp.rawName
    }
  }
}

watch([loading, approvers, employees], loadData)

onMounted(() => {
  if (approvers.value.length === 0) {
    refresh()
  } else {
    loadData()
  }
  loadEmployees()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

async function saveRecord(form: ApproverFormState) {
  const { id, ...data } = form
  if (!data.employee_id) return // Skip if no employee selected
  
  if (id) {
    await update(id, data)
  } else {
    await create(data)
  }
}

async function handleSubmit() {
  if (!gmForm.employee_id || !directorForm.employee_id) {
      appToast.error('Please select an employee for both roles.')
      return
  }
  
  try {
    isSubmittingConfig.value = true

    const gmPayload: ApproverFormState = {
      id: gmForm.id,
      employee_id: gmForm.employee_id,
      step_order: gmForm.step_order,
    }

    const directorPayload: ApproverFormState = {
      id: directorForm.id,
      employee_id: directorForm.employee_id,
      step_order: directorForm.step_order,
    }

    await saveRecord(gmPayload)
    await saveRecord(directorPayload)
    await refresh()
    
    appToast.success('Configuration updated successfully.')
    router.push('/approver-master')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save configuration.'
    appToast.error(message)
  } finally {
    isSubmittingConfig.value = false
  }
}
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(209 213 219);
  background: white;
  padding: 0.75rem 1rem;
  color: rgb(17 24 39);
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}
.field:focus {
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
.bg-gray-50 {
  background: rgb(249 250 251);
}
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
