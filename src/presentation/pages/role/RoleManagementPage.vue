<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Administrator</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Role Management</h1>
        <p class="mt-2 text-sm text-gray-600">
          Atur master role dan hak akses fitur (permissions) untuk setiap role di sistem.
        </p>
      </div>
      <button
        type="button"
        class="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        :disabled="loading"
        @click="goToCreate"
      >
        Tambah Role Baru
      </button>
    </div>

    <p v-if="error" class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </p>

    <!-- Roles List -->
    <section class="max-w-5xl">
      <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Daftar Roles</h2>
          <button
            type="button"
            class="text-sm text-gray-600 transition hover:text-gray-900"
            :disabled="loading"
            @click="refreshRoles"
          >
            {{ loading ? "Memuat..." : "Refresh" }}
          </button>
        </div>

        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search nama role, deskripsi, permission..."
            class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
          />
          <select
            v-model="permissionFilter"
            class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 sm:w-64"
          >
            <option value="">Semua</option>
            <option value="with">Dengan permission</option>
            <option value="without">Tanpa permission</option>
          </select>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3 font-medium w-14">No</th>
                <th class="px-4 py-3 font-medium min-w-[160px]">Nama Role</th>
                <th class="px-4 py-3 font-medium min-w-[240px]">Deskripsi</th>
                <th class="px-4 py-3 font-medium">Hak Akses (Permissions)</th>
                <th class="px-4 py-3 text-right font-medium min-w-[120px]">Aksi</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
              <tr v-for="(role, idx) in pagedRoles" :key="role.id" class="transition hover:bg-gray-50">
                <td class="px-4 py-3 align-top text-gray-500">{{ (page - 1) * pageSize + idx + 1 }}</td>
                <td class="px-4 py-3 align-top">
                  <p class="font-semibold text-gray-900 text-base whitespace-nowrap">{{ role.name }}</p>
                </td>
                <td class="px-4 py-3 align-top">
                  <p v-if="role.description" class="text-xs text-gray-500">
                    {{ role.description }}
                  </p>
                  <p v-else class="text-xs italic text-gray-400">-</p>
                </td>
                <td class="px-4 py-3 align-top">
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="perm in role.permissions"
                      :key="perm.id"
                      class="inline-flex rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 border border-blue-100"
                      :title="perm.description"
                    >
                      {{ perm.name }}
                    </span>
                    <span v-if="!role.permissions || role.permissions.length === 0" class="text-xs italic text-gray-400">
                      Belum ada permission diatur
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-right align-top">
                  <RowActionsMenu
                    :actions="[
                      { label: 'Ubah Akses', disabled: saving, onClick: () => goToEdit(role.id) },
                      ...(role.name !== 'admin'
                        ? [
                            {
                              label: 'Hapus',
                              tone: 'danger' as const,
                              disabled: saving,
                              onClick: () => handleDelete(role.id, role.name),
                            },
                          ]
                        : []),
                    ]"
                  />
                </td>
              </tr>
              <tr v-if="!loading && filteredRoles.length === 0">
                <td colspan="5" class="px-4 py-10 text-center text-sm text-gray-500">
                  Tidak ada data yang cocok.
                </td>
              </tr>
              <tr v-if="loading && roles.length === 0">
                <td colspan="5" class="px-4 py-10 text-center text-sm text-gray-500">
                  Memuat data roles...
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <TablePagination
            v-if="!loading && filteredRoles.length > 0"
            v-model:page="page"
            :page-size="pageSize"
            :total-items="filteredRoles.length"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"

import RowActionsMenu from "@/presentation/components/menus/RowActionsMenu.vue"
import TablePagination from "@/presentation/components/tables/TablePagination.vue"
import { useAppToast } from "@/presentation/components/feedback/useAppToast"
import { useRoleManagementViewModel } from "@/viewmodels/useRoleManagementViewModel"

const router = useRouter()
const { roles, loading, saving, error, refreshRoles, deleteRole } = useRoleManagementViewModel()
const appToast = useAppToast()

const searchQuery = ref("")
const permissionFilter = ref("")
const pageSize = 10
const page = ref(1)

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim()
}

const filteredRoles = computed(() => {
  const q = normalize(searchQuery.value)
  return roles.value.filter((r) => {
    const hasPerms = (r.permissions?.length ?? 0) > 0
    if (permissionFilter.value === "with" && !hasPerms) return false
    if (permissionFilter.value === "without" && hasPerms) return false
    if (!q) return true

    const perms = (r.permissions ?? []).map((p) => p.name).join(" ")
    const haystack = [r.name, r.description, perms].map(normalize).join(" ")
    return haystack.includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRoles.value.length / pageSize)))
const pagedRoles = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value)
  const start = (safePage - 1) * pageSize
  return filteredRoles.value.slice(start, start + pageSize)
})

function resetPage() {
  page.value = 1
}

watch([searchQuery, permissionFilter], resetPage)
watch(
  () => filteredRoles.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

function goToCreate() {
  router.push("/role-management/create")
}

function goToEdit(roleId: string) {
  router.push(`/role-management/${roleId}/edit`)
}

async function handleDelete(roleId: string, name: string) {
  if (!confirm(`Hapus role "${name}"? Semua user dengan role ini mungkin akan kehilangan hak aksesnya. Tindakan ini tidak bisa dibatalkan.`)) return
  try {
    await deleteRole(roleId)
    appToast.deleted("Role")
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus role."
    appToast.error(message)
  }
}
</script>
