<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-8 text-gray-900">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        @click="router.back()"
      >
        ←
      </button>
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">
          {{ isStaffUser ? 'Recruitment Staff' : isEditMode ? 'Administrator' : 'Registration' }}
        </p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">
          {{
            isEditMode
              ? isStaffUser
                ? 'Edit Candidate Account'
                : 'Edit User Account'
              : isStaffUser
                ? 'Create Candidate Account'
                : 'Create User Account'
          }}
        </h1>
      </div>
    </div>

    <p
      v-if="error"
      class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <p
      v-if="isEditMode && !targetUser && !loading"
      class="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      User not found.
    </p>

    <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <form class="grid gap-5 md:grid-cols-2" @submit.prevent="handleSubmit">
        <label class="space-y-2 md:col-span-2">
          <span class="text-sm font-medium text-gray-700">Email *</span>
          <input
            v-model="form.email"
            class="field"
            type="email"
            required
            placeholder="user@company.com"
          />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Username *</span>
          <input
            v-model="form.username"
            class="field"
            type="text"
            required
            placeholder="username"
          />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">
            {{ isEditMode ? 'New Password' : 'Password *' }}
          </span>
          <input
            v-model="form.password"
            class="field"
            type="password"
            :required="!isEditMode"
            :minlength="isEditMode ? undefined : 6"
            :placeholder="
              isEditMode ? 'Leave blank to keep current password' : 'Minimum 6 characters'
            "
          />
          <p v-if="isEditMode" class="text-xs text-gray-500">
            Fill this only if the user's password needs to be changed.
          </p>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Full Name *</span>
          <input
            v-model="form.full_name"
            class="field"
            type="text"
            required
            placeholder="Full name"
          />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Role *</span>
          <div
            v-if="isStaffUser"
            class="field flex min-h-12 items-center bg-gray-100 text-sm text-gray-700"
          >
            {{ candidateRole?.name || 'Candidate' }}
          </div>
          <select v-else v-model="form.role_id" class="field" required>
            <option value="">Select a role</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }} — {{ role.description || 'No description' }}
            </option>
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Phone</span>
          <input
            v-model="form.phone"
            class="field"
            type="tel"
            placeholder="+62..."
          />
          <p class="text-xs text-gray-500">Optional. Saved to `profiles.phone`.</p>
        </label>

        <div class="mt-6 flex gap-3 md:col-span-2">
          <button
            type="submit"
            class="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            :disabled="saving || loading || (isEditMode && !targetUser)"
          >
            {{
              saving
                ? isEditMode
                  ? 'Saving...'
                  : isStaffUser
                    ? 'Creating Candidate...'
                    : 'Registering...'
                : isEditMode
                  ? 'Save Changes'
                  : isStaffUser
                    ? 'Create Candidate'
                    : 'Register User'
            }}
          </button>
          <button
            type="button"
            class="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            :disabled="saving"
            @click="router.back()"
          >
            Cancel
          </button>
        </div>
      </form>

      <div
        v-if="lastCreated && !isEditMode"
        class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
      >
        <h3 class="mb-3 font-semibold text-emerald-800">✓ Account Created Successfully</h3>
        <div class="space-y-2 text-sm text-emerald-700">
          <p><span class="font-medium">Email:</span> {{ lastCreated.email }}</p>
          <p><span class="font-medium">Username:</span> {{ lastCreated.username }}</p>
          <p><span class="font-medium">Password:</span> {{ lastCreated.password }}</p>
          <p><span class="font-medium">Role:</span> {{ lastCreated.roleName }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { CreateUserInput, UpdateUserInput } from '@/domain/entities/ManagedUser'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel'
import { useUserManagementViewModel } from '@/viewmodels/useUserManagementViewModel'

type UserFormState = {
  email: string
  username: string
  password: string
  full_name: string
  phone: string
  role_id: string
}

const router = useRouter()
const route = useRoute()
const { roles, users, loading, error, saving, createUser, updateUser, refreshUsers, refreshRoles } =
  useUserManagementViewModel()
const { userRole } = useAuthViewModel()
const appToast = useAppToast()

const lastCreated = ref<{
  email: string
  username: string
  password: string
  roleName: string
} | null>(null)
const editUserId = computed(() => String(route.params.id ?? ''))
const isEditMode = computed(() => Boolean(editUserId.value))
const targetUser = computed(() => users.value.find((user) => user.id === editUserId.value) ?? null)
const isStaffUser = computed(() => normalizeRole(userRole.value).startsWith('staff'))
const candidateRole = computed(
  () => roles.value.find((role) => normalizeRole(role.name) === 'candidate') ?? null,
)

function createEmptyForm(): UserFormState {
  return {
    email: '',
    username: '',
    password: '',
    full_name: '',
    phone: '',
    role_id: '',
  }
}

const form = reactive(createEmptyForm())

function normalizeRole(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
}

function populateFormFromTarget() {
  if (!targetUser.value) return
  form.email = targetUser.value.email ?? ''
  form.username = targetUser.value.username ?? ''
  form.password = ''
  form.full_name = targetUser.value.full_name ?? targetUser.value.first_name ?? ''
  form.phone = targetUser.value.phone ?? targetUser.value.emergency_contact_phone ?? ''
  form.role_id = targetUser.value.role_id ?? ''
}

function resetForm() {
  Object.assign(form, createEmptyForm())
  if (isStaffUser.value && candidateRole.value) {
    form.role_id = candidateRole.value.id
  }
}

async function loadDependencies() {
  if (roles.value.length === 0) {
    await refreshRoles()
  }

  if (users.value.length === 0 || (isEditMode.value && !targetUser.value)) {
    await refreshUsers()
  }

  if (isEditMode.value) {
    populateFormFromTarget()
  }
}

onMounted(() => {
  loadDependencies()
})

watch(
  [isStaffUser, candidateRole],
  () => {
    if (isStaffUser.value && candidateRole.value) {
      form.role_id = candidateRole.value.id
    }
  },
  { immediate: true },
)

async function handleSubmit() {
  try {
    const fullName = form.full_name.trim()
    if (!fullName) {
      throw new Error('Full name is required.')
    }

    if (isStaffUser.value && candidateRole.value) {
      form.role_id = candidateRole.value.id
    }

    const selectedRole =
      roles.value.find((r) => r.id === form.role_id) ??
      (isStaffUser.value ? candidateRole.value : null)

    if (isEditMode.value) {
      if (!targetUser.value) {
        throw new Error('User not found.')
      }

      const payload: UpdateUserInput = {
        email: form.email,
        username: form.username,
        full_name: fullName,
        phone: form.phone.trim() || undefined,
        role_id: form.role_id,
      }

      if (form.password.trim()) {
        if (form.password.trim().length < 6) {
          throw new Error('The new password must be at least 6 characters.')
        }
        payload.password = form.password.trim()
      }

      await updateUser(targetUser.value.id, payload)
      appToast.updated('User')
      await router.push('/user-management')
      return
    }

    const payload: CreateUserInput = {
      email: form.email,
      username: form.username,
      password: form.password,
      full_name: fullName,
      phone: form.phone.trim() || undefined,
      role_id: form.role_id,
    }

    await createUser(payload)
    lastCreated.value = {
      email: form.email,
      username: form.username,
      password: form.password,
      roleName: selectedRole?.name ?? '-',
    }
    appToast.created('User')

    resetForm()
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : isEditMode.value
          ? 'Failed to update the user.'
          : 'Failed to create the user.'
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
