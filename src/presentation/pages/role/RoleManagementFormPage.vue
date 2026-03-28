<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-8 text-gray-900">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
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
      class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <!-- Loading State -->
    <div v-if="loading" class="py-10 text-center text-sm text-gray-500">
      Loading configuration...
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- General Info -->
      <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
      <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold">Permission Settings</h2>
            <p class="mt-1 text-sm text-gray-500">
              Select which modules and actions can be accessed by this role.
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
          <!-- Employee Request Form -->
          <div class="space-y-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 border-l-4 border-blue-500 pl-3">
              Employee Request Form
            </h3>
            <p class="text-xs text-gray-500">
              Access to employee request form submission, creation, update, and follow-up.
            </p>
            <div class="space-y-2">
              <label
                v-for="perm in getPermissionsByPrefix('employee_request_form')"
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

          <!-- Approval -->
          <div class="space-y-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <h3 class="font-medium text-gray-900 border-b border-gray-200 pb-2">Approval</h3>
            <p class="text-xs text-gray-500">
              Access to approval tracking, approval flow monitoring, and approver configuration.
            </p>
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

          <!-- Hiring -->
          <div class="space-y-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <h3 class="font-medium text-gray-900 border-b border-gray-200 pb-2">Hiring</h3>
            <p class="text-xs text-gray-500">
              Access to the recruitment dashboard and approved employee request form queue.
            </p>
            <div class="space-y-2">
              <label
                v-for="perm in getHiringPermissions()"
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

          <!-- Candidate Form -->
          <div class="space-y-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <h3 class="font-medium text-gray-900 border-b border-gray-200 pb-2">Candidate Form</h3>
            <p class="text-xs text-gray-500">
              Access to candidate form records and candidate profile updates.
            </p>
            <div class="space-y-2">
              <label
                v-for="perm in getPermissionsByPrefix('candidate_form')"
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

          <!-- System Admin -->
          <div class="space-y-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <h3 class="font-medium text-gray-900 border-b border-gray-200 pb-2">System Admin</h3>
            <p class="text-xs text-gray-500">
              Access to user management, role management, and other administrative settings.
            </p>
            <div class="space-y-2">
              <label
                v-for="perm in getSystemAdminPermissions()"
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
          class="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
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
  'job_request:create': ['employee_request_form:create'],
  'job_request:read': ['employee_request_form:read'],
  'job_request:update': ['employee_request_form:update'],
  'job_request:delete': ['employee_request_form:delete'],
  'candidate:create': ['candidate_form:create'],
  'candidate:read': ['candidate_form:read'],
  'candidate:update': ['candidate_form:update'],
  'candidate:delete': ['candidate_form:delete'],
  'candidate_data:create': ['candidate_form:create'],
  'candidate_data:read': ['candidate_form:read'],
  'candidate_data:update': ['candidate_form:update'],
  'candidate_data:delete': ['candidate_form:delete'],
}

function getManageablePermissions() {
  return permissions.value
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

function getSystemAdminPermissions() {
  return permissions.value.filter((p) => {
    return (
      p.name.startsWith('user:') || p.name.startsWith('role:') || p.name.startsWith('document:')
    )
  })
}

function getHiringPermissions() {
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
  // ensure roles and permissions are loaded
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
      appToast.updated(`Access rights for role ${formData.name}`)
    } else {
      await createRole(formData.name, formData.description, selectedPermissionIds.value)
      appToast.created(`Role ${formData.name}`)
    }
    router.push('/role-management')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save role.'
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
