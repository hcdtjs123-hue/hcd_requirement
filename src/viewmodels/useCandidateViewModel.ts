import { onMounted, ref } from "vue"

import type { CandidateApplication, CandidateApplicationInput } from "@/domain/entities/Candidate"
import { candidateRepo } from "@/infrastructure/container"
import { getCandidateApplications } from "@/application/usecases/getCandidateApplications"
import { applyJob } from "@/application/usecases/applyJob"
import { updateCandidateApplication } from "@/application/usecases/updateCandidateApplication"
import { deleteCandidateApplication } from "@/application/usecases/deleteCandidateApplication"

export function useCandidateViewModel() {
  const applications = ref<CandidateApplication[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref("")

  async function refresh() {
    loading.value = true
    error.value = ""
    try {
      applications.value = await getCandidateApplications(candidateRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal memuat data application."
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CandidateApplicationInput) {
    saving.value = true
    error.value = ""
    try {
      await applyJob(candidateRepo, payload)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal membuat application."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: CandidateApplicationInput) {
    saving.value = true
    error.value = ""
    try {
      await updateCandidateApplication(candidateRepo, id, payload)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal memperbarui application."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    saving.value = true
    error.value = ""
    try {
      await deleteCandidateApplication(candidateRepo, id)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal menghapus application."
      throw err
    } finally {
      saving.value = false
    }
  }

  onMounted(refresh)

  return {
    applications,
    create,
    error,
    loading,
    refresh,
    remove,
    saving,
    update,
  }
}
