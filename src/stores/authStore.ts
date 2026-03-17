import { computed, ref } from "vue"
import { defineStore } from "pinia"

import type { LoginPayload } from "@/domain/repositories/AuthRepository"
import type { User, UserRole } from "@/domain/entities/User"
import { authRepo } from "@/infrastructure/container"
import { loginUser } from "@/application/usecases/loginUser"
import { logoutUser } from "@/application/usecases/logoutUser"
import { supabase } from "@/infrastructure/supabase/client"

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref("")

  const isAuthenticated = computed(() => user.value !== null)
  const userRole = computed(() => user.value?.role ?? null)
  const userPermissions = computed(() => user.value?.permissions ?? [])

  function hasPermission(permission: string): boolean {
    return userPermissions.value.includes(permission)
  }

  function hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => hasPermission(p))
  }

  async function fetchUserProfile(userId: string): Promise<Partial<User>> {
    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name, phone, avatar_url")
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
      full_name: profile?.full_name ?? undefined,
      username: profile?.username ?? undefined,
      phone: profile?.phone ?? undefined,
      avatar_url: profile?.avatar_url ?? undefined,
      role: roleName as UserRole | undefined,
      permissions,
    }
  }

  async function initAuth() {
    isLoading.value = true
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser?.email) {
        const profile = await fetchUserProfile(supabaseUser.id)
        user.value = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          ...profile,
        }
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
      const profile = await fetchUserProfile(authenticatedUser.id)
      user.value = { ...authenticatedUser, ...profile }
      return user.value
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login gagal."
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
      await logoutUser(authRepo)
      user.value = null
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout gagal."
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
