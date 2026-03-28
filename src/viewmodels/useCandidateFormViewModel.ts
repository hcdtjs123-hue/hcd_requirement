import { onMounted, ref } from 'vue'

import type { CandidateForm, CandidateFormInput } from '@/domain/entities/CandidateForm'
import { candidateFormRepo } from '@/infrastructure/container'
import { getCandidateForms } from '@/application/usecases/getCandidateForms'
import { createCandidateForm } from '@/application/usecases/createCandidateForm'
import { updateCandidateForm } from '@/application/usecases/updateCandidateForm'
import { deleteCandidateForm } from '@/application/usecases/deleteCandidateForm'

export function useCandidateFormViewModel() {
  const candidates = ref<CandidateForm[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref('')

  async function refresh() {
    loading.value = true
    error.value = ''
    try {
      candidates.value = await getCandidateForms(candidateFormRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load candidate forms.'
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CandidateFormInput) {
    saving.value = true
    error.value = ''
    try {
      await createCandidateForm(candidateFormRepo, payload)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create the candidate form.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: CandidateFormInput) {
    saving.value = true
    error.value = ''
    try {
      await updateCandidateForm(candidateFormRepo, id, payload)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update the candidate form.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    saving.value = true
    error.value = ''
    try {
      await deleteCandidateForm(candidateFormRepo, id)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete the candidate form.'
      throw err
    } finally {
      saving.value = false
    }
  }

  onMounted(refresh)

  return {
    candidates,
    create,
    error,
    loading,
    refresh,
    remove,
    saving,
    update,
  }
}
