import { onMounted, ref } from "vue"

import type { ApproverMaster, ApproverMasterInput } from "@/domain/entities/ApprovalChain"
import { approvalRepo } from "@/infrastructure/container"
import { getApproverMasters } from "@/application/usecases/getApproverMasters"
import { createApproverMaster } from "@/application/usecases/createApproverMaster"
import { updateApproverMaster } from "@/application/usecases/updateApproverMaster"
import { deleteApproverMaster } from "@/application/usecases/deleteApproverMaster"

export function useApproverMasterViewModel() {
  const approvers = ref<ApproverMaster[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref("")

  async function refresh() {
    loading.value = true
    error.value = ""
    try {
      approvers.value = await getApproverMasters(approvalRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal memuat data approver."
    } finally {
      loading.value = false
    }
  }

  async function create(data: ApproverMasterInput) {
    saving.value = true
    error.value = ""
    try {
      await createApproverMaster(approvalRepo, data)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal menambah approver."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, data: ApproverMasterInput) {
    saving.value = true
    error.value = ""
    try {
      await updateApproverMaster(approvalRepo, id, data)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal memperbarui approver."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    saving.value = true
    error.value = ""
    try {
      await deleteApproverMaster(approvalRepo, id)
      await refresh()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Gagal menghapus approver."
      throw err
    } finally {
      saving.value = false
    }
  }

  onMounted(refresh)

  return {
    approvers,
    create,
    error,
    loading,
    refresh,
    remove,
    saving,
    update,
  }
}
