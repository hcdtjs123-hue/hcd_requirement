import { onMounted, ref } from "vue"

import type { Role, Permission, RolePermissionInput } from "@/domain/entities/Role"
import { roleRepo } from "@/infrastructure/container"
import { useAuthStore } from "@/stores/authStore"
import { getAllRoles } from "@/application/usecases/getAllRoles"
import { getAllPermissions } from "@/application/usecases/getAllPermissions"
import { createRole as createRoleUseCase } from "@/application/usecases/createRole"
import { updateRolePermissions as updateRolePermissionsUseCase } from "@/application/usecases/updateRolePermissions"
import { deleteRole as deleteRoleUseCase } from "@/application/usecases/deleteRole"

export function useRoleManagementViewModel() {
  const authStore = useAuthStore()

  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref("")

  async function refreshRoles() {
    loading.value = true
    error.value = ""
    try {
      roles.value = await getAllRoles(roleRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load role list."
    } finally {
      loading.value = false
    }
  }

  async function refreshPermissions() {
    try {
      permissions.value = await getAllPermissions(roleRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load master permissions."
    }
  }

  async function createRole(name: string, description?: string, permissionIds: string[] = []) {
    saving.value = true
    error.value = ""
    try {
      const newRole = await createRoleUseCase(roleRepo, name, description)
      if (permissionIds.length > 0) {
        await updateRolePermissionsUseCase(roleRepo, {
          role_id: newRole.id,
          permission_ids: permissionIds,
        })
      }
      await refreshRoles()
      if (authStore.userRole === name) {
        await authStore.fetchUserProfile(authStore.user!.id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to create role."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function updateRole(roleId: string, name: string, description?: string, permissionIds: string[] = []) {
    saving.value = true
    error.value = ""
    try {
      await updateRolePermissionsUseCase(roleRepo, {
        role_id: roleId,
        permission_ids: permissionIds,
      })
      await refreshRoles()
      const role = roles.value.find((r) => r.id === roleId)
      if (role && authStore.userRole === role.name && authStore.user?.id) {
        const profile = await authStore.fetchUserProfile(authStore.user.id)
        if (authStore.user) {
          authStore.user.permissions = profile.permissions
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to update role permissions."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteRole(roleId: string) {
    saving.value = true
    error.value = ""
    try {
      await deleteRoleUseCase(roleRepo, roleId)
      await refreshRoles()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to delete role."
      throw err
    } finally {
      saving.value = false
    }
  }

  onMounted(() => {
    refreshRoles()
    refreshPermissions()
  })

  return {
    roles,
    permissions,
    loading,
    saving,
    error,
    refreshRoles,
    refreshPermissions,
    createRole,
    updateRole,
    deleteRole,
  }
}
