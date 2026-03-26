import { onMounted, ref } from 'vue'

import type {
  ManagedUser,
  CreateUserInput,
  RoleOption,
  UpdateUserInput,
} from '@/domain/entities/ManagedUser'
import { userManagementRepo } from '@/infrastructure/container'
import { getAllUsers } from '@/application/usecases/getAllUsers'
import { createManagedUser } from '@/application/usecases/createManagedUser'
import { deleteManagedUser } from '@/application/usecases/deleteManagedUser'
import { updateManagedUserRole } from '@/application/usecases/updateManagedUserRole'
import { updateManagedUser } from '@/application/usecases/updateManagedUser'

export function useUserManagementViewModel() {
  const users = ref<ManagedUser[]>([])
  const roles = ref<RoleOption[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref('')

  async function refreshUsers() {
    loading.value = true
    error.value = ''
    try {
      users.value = await getAllUsers(userManagementRepo)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user list.'
    } finally {
      loading.value = false
    }
  }

  async function refreshRoles() {
    try {
      roles.value = await userManagementRepo.getRoles()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load roles.'
    }
  }

  async function createUser(data: CreateUserInput) {
    saving.value = true
    error.value = ''
    try {
      await createManagedUser(userManagementRepo, data)
      await refreshUsers()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteUser(userId: string) {
    saving.value = true
    error.value = ''
    try {
      await deleteManagedUser(userManagementRepo, userId)
      await refreshUsers()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function updateUser(userId: string, data: UpdateUserInput) {
    saving.value = true
    error.value = ''
    try {
      await updateManagedUser(userManagementRepo, userId, data)
      await refreshUsers()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user.'
      throw err
    } finally {
      saving.value = false
    }
  }

  async function updateUserRole(userId: string, roleId: string) {
    saving.value = true
    error.value = ''
    try {
      await updateManagedUserRole(userManagementRepo, userId, roleId)
      await refreshUsers()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update role.'
      throw err
    } finally {
      saving.value = false
    }
  }

  onMounted(() => {
    refreshUsers()
    refreshRoles()
  })

  return {
    createUser,
    deleteUser,
    error,
    loading,
    refreshRoles,
    refreshUsers,
    roles,
    saving,
    updateUser,
    updateUserRole,
    users,
  }
}
