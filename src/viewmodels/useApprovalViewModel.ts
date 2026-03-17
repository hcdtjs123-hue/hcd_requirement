import { onMounted, ref } from "vue"

import type { ApprovalChain, SubmitApprovalInput } from "@/domain/entities/ApprovalChain"
import { approvalRepo } from "@/infrastructure/container"
import { getApprovalChains } from "@/application/usecases/getApprovalChains"
import { submitForApproval } from "@/application/usecases/submitForApproval"
import { getChainByJobRequest } from "@/application/usecases/getChainByJobRequest"

export function useApprovalViewModel() {
  const chains = ref<ApprovalChain[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref("")

  async function refreshChains() {
    loading.value = true
    error.value = ""
    try {
      chains.value = await getApprovalChains(approvalRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal memuat approval chains."
    } finally {
      loading.value = false
    }
  }

  async function submitApproval(data: SubmitApprovalInput) {
    saving.value = true
    error.value = ""
    try {
      await submitForApproval(approvalRepo, data)
      await refreshChains()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal mengirim untuk approval."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function fetchChainByJobRequest(jobRequestId: string) {
    return getChainByJobRequest(approvalRepo, jobRequestId)
  }

  onMounted(refreshChains)

  return {
    chains,
    error,
    fetchChainByJobRequest,
    loading,
    refreshChains,
    saving,
    submitForApproval: submitApproval,
  }
}
