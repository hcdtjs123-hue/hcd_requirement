import { computed, ref } from "vue"
import { defineStore } from "pinia"

import type { LoginPayload } from "@/domain/repositories/AuthRepository"
import type { User, UserRole } from "@/domain/entities/User"
import { authRepo } from "@/infrastructure/container"
import { loginUser } from "@/application/usecases/loginUser"
import { logoutUser } from "@/application/usecases/logoutUser"
import { supabase } from "@/infrastructure/supabase/client"

export const useAuthStore = defineStore("auth", () => {
  const CANDIDATE_ACTIVE_DAYS = 3
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref("")
  let candidateExpiryTimer: number | null = null

  const isAuthenticated = computed(() => user.value !== null)
  const userRole = computed(() => user.value?.role ?? null)
  const userPermissions = computed(() => user.value?.permissions ?? [])

  function hasPermission(permission: string): boolean {
    return userPermissions.value.includes(permission)
  }

  function hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => hasPermission(p))
  }

  function clearCandidateExpiryTimer() {
    if (candidateExpiryTimer !== null) {
      window.clearTimeout(candidateExpiryTimer)
      candidateExpiryTimer = null
    }
  }

  async function fetchUserProfile(userId: string): Promise<Partial<User>> {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "username, full_name, phone, avatar_url, created_at, email",
      )
      .eq("id", userId)
      .maybeSingle()

    // Fetch role from junction table along with permissions
    const { data: userRoleData } = await supabase
      .from("user_roles")
      .select(`
        role_id,
        roles (
          name,
          role_permissions (
            permissions ( name )
          )
        )
      `)
      .eq("user_id", userId)
      .maybeSingle()

    let roleName: string | undefined
    const permissions: string[] = []

    if (userRoleData && (userRoleData as any).roles) {
      const rolesData = (userRoleData as any).roles
      roleName = rolesData.name
      
      if (rolesData.role_permissions && Array.isArray(rolesData.role_permissions)) {
        rolesData.role_permissions.forEach((rp: any) => {
          if (rp.permissions && rp.permissions.name) {
            permissions.push(rp.permissions.name)
          }
        })
      }
    }

    return {
      username: profile?.username ?? undefined,
      phone: profile?.phone ?? undefined,
      full_name: profile?.full_name ?? undefined,
      first_name: profile?.full_name ?? undefined,
      middle_name: undefined,
      last_name: undefined,
      avatar_url: profile?.avatar_url ?? undefined,
      created_at: profile?.created_at ?? undefined,
      is_active: true,
      role: roleName as UserRole | undefined,
      permissions,
    }
  }

  async function expireCandidateIfNeeded(userId: string, profile: Partial<User>) {
    const normalizedRole = String(profile.role ?? "").toLowerCase()
    if (normalizedRole !== "candidate") {
      return profile
    }

    if (!profile.created_at) {
      return profile
    }

    const createdAt = new Date(profile.created_at)
    if (Number.isNaN(createdAt.getTime())) {
      return profile
    }

    const expiresAt = createdAt.getTime() + CANDIDATE_ACTIVE_DAYS * 24 * 60 * 60 * 1000
    if (Date.now() <= expiresAt) {
      return profile
    }

    return {
      ...profile,
      is_active: false,
    }
  }

  async function forceCandidateLogout(message: string) {
    clearCandidateExpiryTimer()
    error.value = message
    await supabase.auth.signOut()
    user.value = null

    if (window.location.pathname !== "/login") {
      window.location.assign("/login")
    }
  }

  async function enforceUserAccess(userId: string, profile: Partial<User>) {
    const syncedProfile = await expireCandidateIfNeeded(userId, profile)
    const normalizedRole = String(syncedProfile.role ?? "").toLowerCase()

    if (normalizedRole === "candidate" && syncedProfile.is_active === false) {
      await forceCandidateLogout("Akun candidate sudah tidak aktif. Masa akses kandidat hanya 3 hari.")
      throw new Error("Akun candidate sudah tidak aktif. Masa akses kandidat hanya 3 hari.")
    }

    return syncedProfile
  }

  function scheduleCandidateExpiry(userId: string, profile: Partial<User>) {
    clearCandidateExpiryTimer()

    const normalizedRole = String(profile.role ?? "").toLowerCase()
    if (normalizedRole !== "candidate" || profile.is_active === false || !profile.created_at) {
      return
    }

    const createdAt = new Date(profile.created_at)
    if (Number.isNaN(createdAt.getTime())) {
      return
    }

    const expiresAt = createdAt.getTime() + CANDIDATE_ACTIVE_DAYS * 24 * 60 * 60 * 1000
    const remainingMs = expiresAt - Date.now()

    if (remainingMs <= 0) {
      void forceCandidateLogout("Akun candidate sudah tidak aktif. Masa akses kandidat hanya 3 hari.")
      return
    }

    candidateExpiryTimer = window.setTimeout(async () => {
      try {
        await expireCandidateIfNeeded(userId, profile)
        await forceCandidateLogout("Akun candidate sudah tidak aktif. Masa akses kandidat hanya 3 hari.")
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Gagal menonaktifkan akun candidate yang sudah kedaluwarsa."
        error.value = message
      }
    }, remainingMs)
  }

  async function initAuth() {
    isLoading.value = true
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser?.email) {
        const rawProfile = await fetchUserProfile(supabaseUser.id)
        const profile = await enforceUserAccess(supabaseUser.id, rawProfile)
        user.value = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          ...profile,
        }
        scheduleCandidateExpiry(supabaseUser.id, profile)
      }
    } catch (err) {
      console.error("Failed to initialize auth:", err)
    } finally {
      isLoading.value = false
    }
  }

  async function login(payload: LoginPayload) {
    isLoading.value = true
    error.value = ""

    try {
      const authenticatedUser = await loginUser(authRepo, payload)
      const rawProfile = await fetchUserProfile(authenticatedUser.id)
      const profile = await enforceUserAccess(authenticatedUser.id, rawProfile)
      user.value = { ...authenticatedUser, ...profile }
      scheduleCandidateExpiry(authenticatedUser.id, profile)
      return user.value
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed."
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    error.value = ""

    try {
      clearCandidateExpiryTimer()
      await logoutUser(authRepo)
      user.value = null
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed."
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    error,
    fetchUserProfile,
    hasPermission,
    hasAnyPermission,
    initAuth,
    isAuthenticated,
    isLoading,
    login,
    logout,
    user,
    userRole,
    userPermissions,
  }
})
