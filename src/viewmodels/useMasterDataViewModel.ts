import { ref } from 'vue'
import type { MasterDataInput, MasterDataItem, MasterDataType } from '@/domain/entities/MasterData'
import { masterDataRepo } from '@/infrastructure/supabase/repositories/MasterDataRepositoryImpl'

type MasterDataOptionState = Record<MasterDataType, MasterDataItem[]>

export function useMasterDataViewModel() {
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const optionsByType = ref<MasterDataOptionState>({
    pt: [],
    department: [],
    job_level: [],
  })

  async function refreshOptions(type: MasterDataType) {
    loading.value = true
    error.value = null
    try {
      optionsByType.value[type] = await masterDataRepo.getAll(type)
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Failed to load ${type} options.`
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadAllOptions() {
    loading.value = true
    error.value = null
    try {
      const [pt, department, jobLevel] = await Promise.all([
        masterDataRepo.getAll('pt'),
        masterDataRepo.getAll('department'),
        masterDataRepo.getAll('job_level'),
      ])
      optionsByType.value.pt = pt
      optionsByType.value.department = department
      optionsByType.value.job_level = jobLevel
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load master data options.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function create(type: MasterDataType, input: MasterDataInput) {
    saving.value = true
    error.value = null
    try {
      const created = await masterDataRepo.create(type, input)
      optionsByType.value[type] = [...optionsByType.value[type], created].sort((a, b) =>
        a.name.localeCompare(b.name),
      )
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Failed to create ${type}.`
      throw err
    } finally {
      saving.value = false
    }
  }

  async function update(type: MasterDataType, id: string, input: MasterDataInput) {
    saving.value = true
    error.value = null
    try {
      const updated = await masterDataRepo.update(type, id, input)
      optionsByType.value[type] = optionsByType.value[type]
        .map((item) => (item.id === id ? updated : item))
        .sort((a, b) => a.name.localeCompare(b.name))
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Failed to update ${type}.`
      throw err
    } finally {
      saving.value = false
    }
  }

  async function remove(type: MasterDataType, id: string) {
    saving.value = true
    error.value = null
    try {
      await masterDataRepo.delete(type, id)
      optionsByType.value[type] = optionsByType.value[type].filter((item) => item.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : `Failed to delete ${type}.`
      throw err
    } finally {
      saving.value = false
    }
  }

  return {
    loading,
    saving,
    error,
    optionsByType,
    refreshOptions,
    loadAllOptions,
    create,
    update,
    remove,
  }
}
