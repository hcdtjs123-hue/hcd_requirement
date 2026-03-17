import { storeToRefs } from "pinia"

import { useAuthStore } from "@/stores/authStore"
import type { LoginPayload } from "@/domain/repositories/AuthRepository"

export function useAuthViewModel() {
  const authStore = useAuthStore()
  const { error, isAuthenticated, isLoading, user, userRole } = storeToRefs(authStore)

  async function login(payload: LoginPayload) {
    return authStore.login(payload)
  }

  async function logout() {
    return authStore.logout()
  }

  function hasPermission(permission: string) {
    return authStore.hasPermission(permission)
  }

  function hasAnyPermission(permissions: string[]) {
    return authStore.hasAnyPermission(permissions)
  }

  return {
    error,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    user,
    userRole,
  }
}
