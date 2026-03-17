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
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Registrasi</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">Buat Akun Baru</h1>
      </div>
    </div>

    <p v-if="error" class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </p>

    <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <form class="grid gap-5 md:grid-cols-2" @submit.prevent="handleCreate">
        <label class="space-y-2 md:col-span-2">
          <span class="text-sm font-medium text-gray-700">Email *</span>
          <input v-model="form.email" class="field" type="email" required placeholder="user@company.com">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Username *</span>
          <input v-model="form.username" class="field" type="text" required placeholder="username">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Password *</span>
          <input v-model="form.password" class="field" type="password" required placeholder="Min 6 karakter" minlength="6">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Nama Lengkap</span>
          <input v-model="form.full_name" class="field" type="text" placeholder="Nama lengkap">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Role *</span>
          <select v-model="form.role_id" class="field" required>
            <option value="">Pilih role</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }} — {{ role.description || "Tanpa deskripsi" }}
            </option>
          </select>
        </label>

        <div class="md:col-span-2 mt-6 flex gap-3">
          <button
            type="submit"
            class="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            :disabled="saving"
          >
            {{ saving ? "Mendaftarkan..." : "Daftarkan User" }}
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

      <!-- Credential Preview -->
      <div v-if="lastCreated" class="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
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
import { reactive, ref, onMounted } from "vue"
import { useRouter } from "vue-router"

import type { CreateUserInput } from "@/domain/entities/ManagedUser"
import { useAppToast } from "@/presentation/components/feedback/useAppToast"
import { useUserManagementViewModel } from "@/viewmodels/useUserManagementViewModel"

const router = useRouter()
const { roles, loading, error, saving, createUser, refreshUsers } = useUserManagementViewModel()
const appToast = useAppToast()

const lastCreated = ref<{ email: string; username: string; password: string; roleName: string } | null>(null)

function createEmptyForm(): CreateUserInput {
  return {
    email: "",
    username: "",
    password: "",
    full_name: "",
    role_id: "",
  }
}

const form = reactive(createEmptyForm())

onMounted(() => {
  if (roles.value.length === 0) refreshUsers()
})

async function handleCreate() {
  try {
    const selectedRole = roles.value.find((r) => r.id === form.role_id)
    await createUser({ ...form })
    lastCreated.value = {
      email: form.email,
      username: form.username,
      password: form.password,
      roleName: selectedRole?.name ?? "-",
    }
    appToast.created("User")
    
    // Clear form
    form.email = ""
    form.username = ""
    form.password = ""
    form.full_name = ""
    form.role_id = ""
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat user."
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
