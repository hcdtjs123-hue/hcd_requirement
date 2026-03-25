<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-8 text-gray-900">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        @click="router.back()"
      >
        ←
      </button>
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">
          {{ isEditMode ? 'Administrator' : 'Registration' }}
        </p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">
          {{ isEditMode ? 'Edit Employee Account' : 'Create Employee Account' }}
        </h1>
      </div>
    </div>

    <p
      v-if="error"
      class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <p
      v-if="isEditMode && !targetUser && !loading"
      class="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      User not found.
    </p>

    <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
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
          <span class="text-sm font-medium text-gray-700">Role *</span>
          <select v-model="form.role_id" class="field" required>
            <option value="">Select a role</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }} — {{ role.description || 'No description' }}
            </option>
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">First Name</span>
          <input v-model="form.first_name" class="field" type="text" placeholder="First name" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Middle Name</span>
          <input
            v-model="form.middle_name"
            class="field"
            type="text"
            placeholder="Middle name"
          />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Last Name</span>
          <input v-model="form.last_name" class="field" type="text" placeholder="Last name" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">No ID</span>
          <input v-model="form.no_id" class="field" type="text" placeholder="National ID number" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Main Position</span>
          <input
            v-model="form.main_position"
            class="field"
            type="text"
            placeholder="Main position"
          />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Hire Location</span>
          <input
            v-model="form.hire_location"
            class="field"
            type="text"
            placeholder="Hire location"
          />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Date of Birth</span>
          <input v-model="form.date_of_birth" class="field" type="date" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Place of Birth</span>
          <input
            v-model="form.place_of_birth"
            class="field"
            type="text"
            placeholder="Place of birth"
          />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Nationality</span>
          <input
            v-model="form.nationality"
            class="field"
            type="text"
            placeholder="Nationality"
          />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Marital Status</span>
          <select v-model="form.marital_status" class="field">
            <option value="">Select marital status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Religion</span>
          <input v-model="form.religion" class="field" type="text" placeholder="Religion" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Gender</span>
          <select v-model="form.gender" class="field">
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Ethnic</span>
          <input v-model="form.ethnic" class="field" type="text" placeholder="Ethnic group" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Blood Type</span>
          <select v-model="form.blood_type" class="field">
            <option value="">Select blood type</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </select>
        </label>

        <div class="mt-6 flex gap-3 md:col-span-2">
          <button
            type="submit"
            class="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            :disabled="saving || loading || (isEditMode && !targetUser)"
          >
            {{
              saving
                ? isEditMode
                  ? 'Saving...'
                  : 'Registering...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Register User'
            }}
          </button>
          <button
            type="button"
            class="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            :disabled="saving"
            @click="router.back()"
          >
            Cancel
          </button>
        </div>
      </form>

      <div
        v-if="lastCreated && !isEditMode"
        class="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
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
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { CreateUserInput, UpdateUserInput } from '@/domain/entities/ManagedUser'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useUserManagementViewModel } from '@/viewmodels/useUserManagementViewModel'

type UserFormState = {
  email: string
  username: string
  password: string
  first_name: string
  middle_name: string
  last_name: string
  main_position: string
  hire_location: string
  date_of_birth: string
  place_of_birth: string
  nationality: string
  marital_status: string
  religion: string
  gender: string
  ethnic: string
  blood_type: string
  no_id: string
  role_id: string
}

const router = useRouter()
const route = useRoute()
const { roles, users, loading, error, saving, createUser, updateUser, refreshUsers, refreshRoles } =
  useUserManagementViewModel()
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

function createEmptyForm(): UserFormState {
  return {
    email: '',
    username: '',
    password: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    main_position: '',
    hire_location: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: '',
    marital_status: '',
    religion: '',
    gender: '',
    ethnic: '',
    blood_type: '',
    no_id: '',
    role_id: '',
  }
}

const form = reactive(createEmptyForm())

function populateFormFromTarget() {
  if (!targetUser.value) return
  form.email = targetUser.value.email ?? ''
  form.username = targetUser.value.username ?? ''
  form.password = ''
  form.first_name = targetUser.value.first_name ?? ''
  form.middle_name = targetUser.value.middle_name ?? ''
  form.last_name = targetUser.value.last_name ?? ''
  form.main_position = targetUser.value.main_position ?? ''
  form.hire_location = targetUser.value.hire_location ?? ''
  form.date_of_birth = targetUser.value.date_of_birth ?? ''
  form.place_of_birth = targetUser.value.place_of_birth ?? ''
  form.nationality = targetUser.value.nationality ?? ''
  form.marital_status = targetUser.value.marital_status ?? ''
  form.religion = targetUser.value.religion ?? ''
  form.gender = targetUser.value.gender ?? ''
  form.ethnic = targetUser.value.ethnic ?? ''
  form.blood_type = targetUser.value.blood_type ?? ''
  form.no_id = targetUser.value.no_id ?? ''
  form.role_id = targetUser.value.role_id ?? ''
}

function resetForm() {
  Object.assign(form, createEmptyForm())
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

async function handleSubmit() {
  try {
    const selectedRole = roles.value.find((r) => r.id === form.role_id)

    if (isEditMode.value) {
      if (!targetUser.value) {
        throw new Error('User not found.')
      }

      const payload: UpdateUserInput = {
        email: form.email,
        username: form.username,
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        main_position: form.main_position,
        hire_location: form.hire_location,
        date_of_birth: form.date_of_birth,
        place_of_birth: form.place_of_birth,
        nationality: form.nationality,
        marital_status: form.marital_status,
        religion: form.religion,
        gender: form.gender,
      ethnic: form.ethnic,
      blood_type: form.blood_type,
      no_id: form.no_id,
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
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      main_position: form.main_position,
      hire_location: form.hire_location,
      date_of_birth: form.date_of_birth,
      place_of_birth: form.place_of_birth,
      nationality: form.nationality,
      marital_status: form.marital_status,
      religion: form.religion,
      gender: form.gender,
      ethnic: form.ethnic,
      blood_type: form.blood_type,
      no_id: form.no_id,
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
