import { onMounted, ref } from "vue"

import type { RecruitmentTracking } from "@/domain/entities/RecruitmentTracking"
import { recruitmentTrackingRepo } from "@/infrastructure/container"
import { getRecruitmentTrackings } from "@/application/usecases/getRecruitmentTrackings"

export function useRecruitmentTrackingViewModel() {
  const trackings = ref<RecruitmentTracking[]>([])
  const loading = ref(true)
  const error = ref("")

  async function refreshTrackings() {
    loading.value = true
    error.value = ""
    try {
      trackings.value = await getRecruitmentTrackings(recruitmentTrackingRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load tracking data."
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refreshTrackings()
  })

  return {
    error,
    loading,
    refreshTrackings,
    trackings,
  }
}
