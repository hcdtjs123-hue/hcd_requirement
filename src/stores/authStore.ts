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
    // Fetch employee profile
    const { data: employee } = await supabase
      .from("employees")
      .select(
        "username, first_name, middle_name, last_name, main_position, hire_location, date_of_birth, place_of_birth, nationality, marital_status, religion, gender, ethnic, blood_type, avatar_url",
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
      username: employee?.username ?? undefined,
      first_name: employee?.first_name ?? undefined,
      middle_name: employee?.middle_name ?? undefined,
      last_name: employee?.last_name ?? undefined,
      main_position: employee?.main_position ?? undefined,
      hire_location: employee?.hire_location ?? undefined,
      date_of_birth: employee?.date_of_birth ?? undefined,
      place_of_birth: employee?.place_of_birth ?? undefined,
      nationality: employee?.nationality ?? undefined,
      marital_status: employee?.marital_status ?? undefined,
      religion: employee?.religion ?? undefined,
      gender: employee?.gender ?? undefined,
      ethnic: employee?.ethnic ?? undefined,
      blood_type: employee?.blood_type ?? undefined,
      avatar_url: employee?.avatar_url ?? undefined,
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
