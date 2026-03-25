import { onMounted, ref } from 'vue'

import type { CandidateRecord, CandidateRecordInput } from '@/domain/entities/Candidate'
import { candidateDataRepo } from '@/infrastructure/container'
import { getCandidates } from '@/application/usecases/getCandidates'
import { createCandidate } from '@/application/usecases/createCandidate'
import { updateCandidate } from '@/application/usecases/updateCandidate'
import { deleteCandidate } from '@/application/usecases/deleteCandidate'

export function useCandidateDataViewModel() {
  const candidates = ref<CandidateRecord[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref('')

  async function refresh() {
    loading.value = true
    error.value = ''
    try {
      candidates.value = await getCandidates(candidateDataRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load candidate data.'
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CandidateRecordInput) {
    saving.value = true
    error.value = ''
    try {
      await createCandidate(candidateDataRepo, payload)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create candidate data.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: CandidateRecordInput) {
    saving.value = true
    error.value = ''
    try {
      await updateCandidate(candidateDataRepo, id, payload)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update candidate data.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    saving.value = true
    error.value = ''
    try {
      await deleteCandidate(candidateDataRepo, id)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete candidate data.'
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
