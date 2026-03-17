<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 text-gray-900">
    <section class="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl shadow-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.25em] text-blue-600">Account Details</p>
          <h1 class="mt-4 text-4xl font-semibold tracking-tight">Profil Pengguna</h1>
        </div>
        <div 
          v-if="userRole" 
          class="rounded-2xl bg-white px-4 py-2 border border-gray-200 shadow-sm"
        >
          <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400">Role Anda</p>
          <p class="text-sm font-bold text-blue-600 uppercase">{{ userRole }}</p>
        </div>
      </div>
      
      <p class="mt-6 text-sm text-gray-600 leading-relaxed">
        Berikut adalah rincian akun Anda dan daftar hak akses (*permissions*) yang diberikan sesuai dengan role yang Anda miliki saat ini.
      </p>

      <div class="mt-8 grid gap-6 md:grid-cols-2">
        <div class="rounded-2xl border border-gray-200 bg-white p-6">
          <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Informasi Dasar</p>
          <div class="space-y-4">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">User ID</p>
              <p class="mt-1 break-all text-sm font-medium text-gray-900">{{ user?.id ?? "-" }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">Email Address</p>
              <p class="mt-1 text-sm font-medium text-gray-900">{{ user?.email ?? "-" }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-6">
          <div class="flex items-center justify-between mb-4">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Permissions</p>
            <span class="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
              {{ permissions.length }} Active
            </span>
          </div>
          
          <div v-if="permissions.length > 0" class="flex flex-wrap gap-2">
            <span 
              v-for="perm in permissions" 
              :key="perm"
              class="rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs text-gray-600 font-medium"
            >
              {{ perm }}
            </span>
          </div>
          <p v-else class="text-xs text-gray-400 italic">
            Belum ada permissions khusus yang diberikan.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useAuthViewModel } from "@/viewmodels/useAuthViewModel"

const { user, userRole } = useAuthViewModel()

const permissions = computed(() => user.value?.permissions ?? [])
</script>
