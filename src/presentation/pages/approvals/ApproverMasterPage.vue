<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Master Data</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">Approver Email</h1>
        <p class="mt-2 text-sm text-gray-600">
          Daftar email approver yang akan menerima link approval secara berurutan.
        </p>
      </div>
      <button
        type="button"
        class="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        @click="goToCreate"
      >
        Tambah Approver
      </button>
    </div>

    <p v-if="error" class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </p>

    <section class="max-w-4xl">
      <!-- Approver List -->
      <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Daftar Approver</h2>
          <button
            type="button"
            class="text-sm text-gray-600 transition hover:text-gray-900"
            :disabled="loading"
            @click="refresh"
          >
            {{ loading ? "Memuat..." : "Refresh" }}
          </button>
        </div>

        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search nama, email..."
            class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
          />
          <select
            v-model="activeFilter"
            class="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 sm:w-64"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3 font-medium w-14">No</th>
                <th class="px-4 py-3 font-medium min-w-[200px]">Nama</th>
                <th class="px-4 py-3 font-medium min-w-[220px]">Email</th>
                <th class="px-4 py-3 font-medium text-center">Step</th>
                <th class="px-4 py-3 font-medium text-center">Status</th>
                <th class="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(approver, idx) in pagedApprovers"
                :key="approver.id"
                class="transition hover:bg-gray-50"
              >
                <td class="px-4 py-3 align-middle text-gray-500">{{ (page - 1) * pageSize + idx + 1 }}</td>
                <td class="px-4 py-3 align-middle">
                  <p class="font-medium text-gray-900 whitespace-nowrap">{{ approver.name || "-" }}</p>
                </td>
                <td class="px-4 py-3 align-middle">
                  <p class="whitespace-nowrap">{{ approver.email || "-" }}</p>
                </td>
                <td class="px-4 py-3 text-center align-middle">
                  <span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    Step {{ approver.step_order }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center align-middle">
                  <span
                    class="inline-flex rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold"
                    :class="approver.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ approver.is_active ? "Aktif" : "Nonaktif" }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right align-middle">
                  <RowActionsMenu
                    :actions="[
                      { label: 'Edit', onClick: () => goToEdit(approver.id) },
                      {
                        label: 'Hapus',
                        tone: 'danger',
                        disabled: saving,
                        onClick: () => handleDelete(approver.id, approver.name || approver.email),
                      },
                    ]"
                  />
                </td>
              </tr>
              <tr v-if="!loading && filteredApprovers.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-sm text-gray-500">
                  Tidak ada data yang cocok.
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <TablePagination
            v-if="!loading && filteredApprovers.length > 0"
            v-model:page="page"
            :page-size="pageSize"
            :total-items="filteredApprovers.length"
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
import { useApproverMasterViewModel } from "@/viewmodels/useApproverMasterViewModel"

const router = useRouter()
const { approvers, loading, error, saving, remove, refresh } = useApproverMasterViewModel()
const appToast = useAppToast()

const searchQuery = ref("")
const activeFilter = ref("")
const pageSize = 10
const page = ref(1)

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim()
}

const filteredApprovers = computed(() => {
  const q = normalize(searchQuery.value)
  return approvers.value.filter((a) => {
    if (activeFilter.value === "active" && !a.is_active) return false
    if (activeFilter.value === "inactive" && a.is_active) return false
    if (!q) return true

    const haystack = [a.name, a.email, a.step_order, a.is_active ? "aktif" : "nonaktif"]
      .map(normalize)
      .join(" ")
    return haystack.includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredApprovers.value.length / pageSize)))
const pagedApprovers = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value)
  const start = (safePage - 1) * pageSize
  return filteredApprovers.value.slice(start, start + pageSize)
})

function resetPage() {
  page.value = 1
}

watch([searchQuery, activeFilter], resetPage)
watch(
  () => filteredApprovers.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

function goToCreate() {
  router.push("/approver-master/create")
}

function goToEdit(id: string) {
  router.push(`/approver-master/${id}/edit`)
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`Hapus approver ${name}?`)) return
  try {
    await remove(id)
    appToast.deleted("Approver")
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus approver."
    appToast.error(message)
  }
}
</script>
