<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-8 text-gray-900">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        @click="router.back()"
      >
        ←
      </button>
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Administrator</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">
          {{ isEdit ? `Edit Role Access: ${formData.name}` : 'Add New Role' }}
        </h1>
      </div>
    </div>

    <p
      v-if="error"
      class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <!-- Loading State -->
    <div v-if="loading" class="py-10 text-center text-sm text-gray-500">
      Loading configuration...
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- General Info -->
      <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-xl font-semibold">Role Information</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Role Name *</span>
            <input
              v-model="formData.name"
              class="field disabled:bg-gray-100 disabled:text-gray-500"
              type="text"
              required
              :disabled="isEdit"
              placeholder="e.g., HR Manager"
            />
            <p v-if="isEdit" class="text-xs text-gray-500 mt-1">
              The role name cannot be changed. Only its access settings can be updated.
            </p>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Short Description</span>
            <input
              v-model="formData.description"
              class="field disabled:bg-gray-100 disabled:text-gray-500"
              type="text"
              :disabled="isEdit"
              placeholder="e.g., Full access to the staff module"
            />
          </label>
        </div>
      </section>

      <!-- Permissions Checklist -->
      <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold">Permission Settings</h2>
            <p class="mt-1 text-sm text-gray-500">
              Select which modules can be accessed by this role.
            </p>
          </div>
          <button
            type="button"
            class="text-sm text-blue-600 font-medium hover:underline"
            @click="toggleAllPermissions"
          >
            {{ isAllSelected ? 'Clear All' : 'Select All' }}
          </button>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <!-- Modul Job Request -->
          <div class="space-y-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <h3 class="font-medium text-gray-900 border-b border-gray-200 pb-2">
              Job Request Module
            </h3>
            <div class="space-y-2">
              <label
                v-for="perm in getPermissionsByPrefix('job_request')"
                :key="perm.id"
                class="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="perm.id"
                  v-model="selectedPermissionIds"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ perm.name }}</p>
                  <p class="text-xs text-gray-500">{{ perm.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Modul Approval -->
          <div class="space-y-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <h3 class="font-medium text-gray-900 border-b border-gray-200 pb-2">Approval Module</h3>
            <div class="space-y-2">
              <label
                v-for="perm in getPermissionsByPrefix('approval')"
                :key="perm.id"
                class="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="perm.id"
                  v-model="selectedPermissionIds"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ perm.name }}</p>
                  <p class="text-xs text-gray-500">{{ perm.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Modul Rekrutmen -->
          <div class="space-y-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <h3 class="font-medium text-gray-900 border-b border-gray-200 pb-2">
              Recruitment Module
            </h3>
            <div class="space-y-2">
              <label
                v-for="perm in getRecruitmentPermissions()"
                :key="perm.id"
                class="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="perm.id"
                  v-model="selectedPermissionIds"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ perm.name }}</p>
                  <p class="text-xs text-gray-500">{{ perm.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Modul Kandidat -->
          <div class="space-y-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <h3 class="font-medium text-gray-900 border-b border-gray-200 pb-2">
              Candidate Module
            </h3>
            <div class="space-y-2">
              <label
                v-for="perm in getPermissionsByPrefix('candidate_data')"
                :key="perm.id"
                class="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="perm.id"
                  v-model="selectedPermissionIds"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ perm.name }}</p>
                  <p class="text-xs text-gray-500">{{ perm.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Modul Administrator / Others -->
          <div class="space-y-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <h3 class="font-medium text-gray-900 border-b border-gray-200 pb-2">
              Administration & Others
            </h3>
            <div class="space-y-2">
              <!-- Helper method that gets any perm starting with 'user', 'role', or 'document' -->
              <label
                v-for="perm in getAdminPermissions()"
                :key="perm.id"
                class="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="perm.id"
                  v-model="selectedPermissionIds"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ perm.name }}</p>
                  <p class="text-xs text-gray-500">{{ perm.description }}</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <div class="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          class="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          :disabled="saving"
        >
          {{ saving ? 'Saving...' : isEdit ? 'Save Access Changes' : 'Create Role' }}
        </button>
        <button
          type="button"
          class="text-sm font-medium text-gray-600 hover:text-gray-900"
          :disabled="saving"
          @click="router.back()"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useRoleManagementViewModel } from '@/viewmodels/useRoleManagementViewModel'

const route = useRoute()
const router = useRouter()
const {
  roles,
  permissions,
  loading,
  saving,
  error,
  refreshRoles,
  refreshPermissions,
  createRole,
  updateRole,
} = useRoleManagementViewModel()

const appToast = useAppToast()

const roleId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!roleId.value)

const formData = reactive({
  name: '',
  description: '',
})

const selectedPermissionIds = ref<string[]>([])

const legacyPermissionMap: Record<string, string[]> = {
  'candidate:create': ['recruitment:create'],
  'candidate:read': ['recruitment:read', 'candidate_data:read'],
  'candidate:update': ['recruitment:update', 'candidate_data:update'],
  'candidate:delete': ['recruitment:delete', 'candidate_data:delete'],
}

function getManageablePermissions() {
  return permissions.value.filter((permission) => !permission.name.startsWith('candidate:'))
}

const isAllSelected = computed({
  get: () => {
    const manageablePermissions = getManageablePermissions()
    return (
      manageablePermissions.length > 0 &&
      manageablePermissions.every((permission) =>
        selectedPermissionIds.value.includes(permission.id),
      )
    )
  },
  set: (val) => {
    if (val) {
      selectedPermissionIds.value = getManageablePermissions().map((permission) => permission.id)
    } else {
      selectedPermissionIds.value = []
    }
  },
})

function toggleAllPermissions() {
  isAllSelected.value = !isAllSelected.value
}

function getPermissionsByPrefix(prefix: string) {
  return permissions.value.filter((p) => p.name.startsWith(`${prefix}:`))
}

function getAdminPermissions() {
  return permissions.value.filter((p) => {
    return (
      p.name.startsWith('user:') || p.name.startsWith('role:') || p.name.startsWith('document:')
    )
  })
}

function getRecruitmentPermissions() {
  return permissions.value.filter((p) => {
    return p.name.startsWith('recruitment:')
  })
}

function mapLegacyPermissionsToCurrentIds(permissionNames: string[]) {
  const selectedIds = new Set<string>()

  for (const permissionName of permissionNames) {
    const mappedNames = legacyPermissionMap[permissionName]

    if (!mappedNames) {
      const directPermission = permissions.value.find(
        (permission) => permission.name === permissionName,
      )
      if (directPermission) {
        selectedIds.add(directPermission.id)
      }
    }

    for (const mappedName of mappedNames || []) {
      const mappedPermission = permissions.value.find(
        (permission) => permission.name === mappedName,
      )
      if (mappedPermission) {
        selectedIds.add(mappedPermission.id)
      }
    }
  }

  return Array.from(selectedIds)
}

// Load initial data
onMounted(async () => {
  // pastikan list roles dan permisions termuat
  if (permissions.value.length === 0) {
    await refreshPermissions()
  }
  if (roles.value.length === 0) {
    await refreshRoles()
  }

  setupFormData()
})

// watch roles if they get fetched late
watch(
  () => roles.value,
  () => {
    setupFormData()
  },
  { deep: true },
)

watch(
  () => permissions.value,
  () => {
    setupFormData()
  },
  { deep: true },
)

function setupFormData() {
  if (isEdit.value && roles.value.length > 0) {
    const role = roles.value.find((r) => r.id === roleId.value)
    if (role) {
      formData.name = role.name
      formData.description = role.description || ''
      selectedPermissionIds.value = mapLegacyPermissionsToCurrentIds(
        (role.permissions || []).map((p) => p.name),
      )
    }
  }
}

async function handleSubmit() {
  try {
    if (isEdit.value && roleId.value) {
      await updateRole(
        roleId.value,
        formData.name,
        formData.description,
        selectedPermissionIds.value,
      )
      appToast.updated(`Hak akses role ${formData.name}`)
    } else {
      await createRole(formData.name, formData.description, selectedPermissionIds.value)
      appToast.created(`Role ${formData.name}`)
    }
    router.push('/role-management')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan role.'
    appToast.error(message)
  }
}
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(209 213 219);
  background: rgb(249 250 251);
  padding: 0.75rem 1rem;
  color: rgb(17 24 39);
  outline: none;
  transition: all 0.2s;
}

.field:focus {
  border-color: rgb(37 99 235);
  background: white;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
</style>
