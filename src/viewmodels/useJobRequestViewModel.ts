import { onMounted, ref } from 'vue'

import type { JobRequest, JobRequestInput } from '@/domain/entities/JobRequest'
import { jobRequestRepo } from '@/infrastructure/container'
import { GetJobRequests } from '@/application/usecases/getJobRequests'
import { createJobRequest } from '@/application/usecases/createJobRequest'
import { updateJobRequest } from '@/application/usecases/updateJobRequest'
import { deleteJobRequest } from '@/application/usecases/deleteJobRequest'
import { closeJobRequest } from '@/application/usecases/closeJobRequest'

export function useJobRequestViewModel() {
  const jobs = ref<JobRequest[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref('')

  async function refresh() {
    loading.value = true
    error.value = ''
    try {
      jobs.value = await new GetJobRequests(jobRequestRepo).execute()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load ERFs.'
    } finally {
      loading.value = false
    }
  }

  async function create(payload: JobRequestInput) {
    saving.value = true
    error.value = ''
    try {
      await createJobRequest(jobRequestRepo, payload)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create the ERF.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: JobRequestInput) {
    saving.value = true
    error.value = ''
    try {
      await updateJobRequest(jobRequestRepo, id, payload)
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
      await deleteJobRequest(jobRequestRepo, id)
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
      await closeJobRequest(jobRequestRepo, id, category, reason)
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
