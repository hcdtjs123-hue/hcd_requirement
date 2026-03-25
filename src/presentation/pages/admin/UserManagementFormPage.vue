<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-8 text-gray-900">
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
          {{ isEditMode ? 'Administrator' : 'Registrasi' }}
        </p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">
          {{ isEditMode ? 'Edit User' : 'Buat Akun Baru' }}
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
      User tidak ditemukan.
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
            {{ isEditMode ? 'Password Baru' : 'Password *' }}
          </span>
          <input
            v-model="form.password"
            class="field"
            type="password"
            :required="!isEditMode"
            :minlength="isEditMode ? undefined : 6"
            :placeholder="isEditMode ? 'Kosongkan jika tidak diubah' : 'Min 6 karakter'"
          />
          <p v-if="isEditMode" class="text-xs text-gray-500">
            Isi hanya jika password user perlu diganti.
          </p>
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Nama Lengkap</span>
          <input v-model="form.full_name" class="field" type="text" placeholder="Nama lengkap" />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Role *</span>
          <select v-model="form.role_id" class="field" required>
            <option value="">Pilih role</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }} — {{ role.description || 'Tanpa deskripsi' }}
            </option>
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
                  ? 'Menyimpan...'
                  : 'Mendaftarkan...'
                : isEditMode
                  ? 'Simpan Perubahan'
                  : 'Daftarkan User'
            }}
          </button>
          <button
            type="button"
            class="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            :disabled="saving"
            @click="router.back()"
          >
            Batal
          </button>
        </div>
      </form>

      <div
        v-if="lastCreated && !isEditMode"
        class="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
      >
        <h3 class="mb-3 font-semibold text-emerald-800">✓ Akun Berhasil Dibuat</h3>
        <div class="space-y-2 text-sm text-emerald-700">
          <p><span class="font-medium">Email:</span> {{ lastCreated.email }}</p>
          <p><span class="font-medium">Username:</span> {{ lastCreated.username }}</p>
          <p><span class="font-medium">Password:</span> {{ lastCreated.password }}</p>
          <p><span class="font-medium">Role:</span> {{ lastCreated.roleName }}</p>
        </div>
        <p class="mt-4 text-xs font-medium text-emerald-600">
          Salin kredensial di atas untuk dikirim ke user yang bersangkutan.
        </p>
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
  full_name: string
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
    full_name: '',
    role_id: '',
  }
}

const form = reactive(createEmptyForm())

function populateFormFromTarget() {
  if (!targetUser.value) return
  form.email = targetUser.value.email ?? ''
  form.username = targetUser.value.username ?? ''
  form.password = ''
  form.full_name = targetUser.value.full_name ?? ''
  form.role_id = targetUser.value.role_id ?? ''
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
        throw new Error('User tidak ditemukan.')
      }

      const payload: UpdateUserInput = {
        email: form.email,
        username: form.username,
        full_name: form.full_name,
        role_id: form.role_id,
      }

      if (form.password.trim()) {
        if (form.password.trim().length < 6) {
          throw new Error('Password baru minimal 6 karakter.')
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
      full_name: form.full_name,
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

    form.email = ''
    form.username = ''
    form.password = ''
    form.full_name = ''
    form.role_id = ''
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : isEditMode.value
          ? 'Gagal mengubah user.'
          : 'Gagal membuat user.'
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
