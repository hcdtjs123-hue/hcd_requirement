import { onMounted, ref } from 'vue'

import type { EmployeeRequestForm, EmployeeRequestFormInput } from '@/domain/entities/EmployeeRequestForm'
import { employeeRequestFormRepo } from '@/infrastructure/container'
import { GetEmployeeRequestForms } from '@/application/usecases/getEmployeeRequestForms'
import { createEmployeeRequestForm } from '@/application/usecases/createEmployeeRequestForm'
import { updateEmployeeRequestForm } from '@/application/usecases/updateEmployeeRequestForm'
import { deleteEmployeeRequestForm } from '@/application/usecases/deleteEmployeeRequestForm'
import { closeEmployeeRequestForm } from '@/application/usecases/closeEmployeeRequestForm'

export function useEmployeeRequestFormViewModel() {
  const jobs = ref<EmployeeRequestForm[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref('')

  async function refresh() {
    loading.value = true
    error.value = ''
    try {
      jobs.value = await new GetEmployeeRequestForms(employeeRequestFormRepo).execute()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load ERFs.'
    } finally {
      loading.value = false
    }
  }

  async function create(payload: EmployeeRequestFormInput) {
    saving.value = true
    error.value = ''
    try {
      await createEmployeeRequestForm(employeeRequestFormRepo, payload)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create the ERF.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: EmployeeRequestFormInput) {
    saving.value = true
    error.value = ''
    try {
      await updateEmployeeRequestForm(employeeRequestFormRepo, id, payload)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update the ERF.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    saving.value = true
    error.value = ''
    try {
      await deleteEmployeeRequestForm(employeeRequestFormRepo, id)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete the ERF.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function close(id: string, category: 'employee hired' | 'canceled', reason: string) {
    saving.value = true
    error.value = ''
    try {
      await closeEmployeeRequestForm(employeeRequestFormRepo, id, category, reason)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to close the ERF.'
      throw err
    } finally {
      saving.value = false
    }
  }

  onMounted(refresh)

  return {
    create,
    error,
    jobs,
    loading,
    refresh,
    remove,
    close,
    saving,
    update,
  }
}
