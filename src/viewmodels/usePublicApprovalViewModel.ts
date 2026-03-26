import { ref } from "vue"

import type { ApprovalChain, ApprovalStep } from "@/domain/entities/ApprovalChain"
import { ApprovalRepositoryImpl } from "@/infrastructure/supabase/repositories/ApprovalRepositoryImpl"

const repo = new ApprovalRepositoryImpl()

export function usePublicApprovalViewModel() {
  const step = ref<ApprovalStep | null>(null)
  const chain = ref<ApprovalChain | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref("")
  const success = ref(false)
  const rejected = ref(false)

  async function loadByToken(token: string) {
    loading.value = true
    error.value = ""
    try {
      const result = await repo.getStepByToken(token)
      if (!result) {
        error.value = "Approval link is invalid or has expired."
        return
      }
      step.value = result.step
      chain.value = result.chain
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load approval data."
    } finally {
      loading.value = false
    }
  }

  async function approve(token: string, notes?: string) {
    saving.value = true
    error.value = ""
    try {
      await repo.approveStep(token, notes)
      success.value = true
      // Reload to show updated status
      await loadByToken(token)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to approve."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function reject(token: string, notes?: string) {
    saving.value = true
    error.value = ""
    try {
      await repo.rejectStep(token, notes)
      rejected.value = true
      await loadByToken(token)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to reject."
      throw err
    } finally {
      saving.value = false
    }
  }

  return {
    approve,
    chain,
    error,
    loading,
    loadByToken,
    reject,
    rejected,
    saving,
    step,
    success,
  }
}
