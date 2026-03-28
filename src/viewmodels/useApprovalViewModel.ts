import { onMounted, ref } from "vue"

import type { ApprovalChain, SubmitApprovalInput } from "@/domain/entities/ApprovalChain"
import { approvalRepo } from "@/infrastructure/container"
import { getApprovalChains } from "@/application/usecases/getApprovalChains"
import { submitForApproval } from "@/application/usecases/submitForApproval"
import { getChainByEmployeeRequestForm } from "@/application/usecases/getChainByEmployeeRequestForm"

export function useApprovalViewModel() {
  const chains = ref<ApprovalChain[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref("")

  async function refreshChains() {
    loading.value = true
    error.value = ""
    try {
      chains.value = await getApprovalChains(approvalRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load approval chains."
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
      error.value = err instanceof Error ? err.message : "Failed to submit for approval."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function fetchChainByEmployeeRequestForm(employeeRequestFormId: string) {
    return getChainByEmployeeRequestForm(approvalRepo, employeeRequestFormId)
  }

  async function approveAssignedStep(stepId: string, notes?: string) {
    saving.value = true
    error.value = ''
    try {
      await approvalRepo.approveAssignedStep(stepId, notes)
      await refreshChains()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to approve the request.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function rejectAssignedStep(stepId: string, notes?: string) {
    saving.value = true
    error.value = ''
    try {
      await approvalRepo.rejectAssignedStep(stepId, notes)
      await refreshChains()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reject the request.'
      throw err
    } finally {
      saving.value = false
    }
  }

  onMounted(refreshChains)

  return {
    approveAssignedStep,
    chains,
    error,
    fetchChainByEmployeeRequestForm,
    loading,
    rejectAssignedStep,
    refreshChains,
    saving,
    submitForApproval: submitApproval,
  }
}
