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
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Master Data</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">
          {{ isEdit ? "Edit Approver" : "Tambah Approver Baru" }}
        </h1>
      </div>
    </div>

    <p v-if="error" class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </p>

    <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <form v-if="!loading" class="grid gap-5 md:grid-cols-2" @submit.prevent="handleSubmit">
        <label class="space-y-2 md:col-span-2">
          <span class="text-sm font-medium text-gray-700">Email Approver *</span>
          <input v-model="form.email" class="field" type="email" required placeholder="manager@company.com">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Nama</span>
          <input v-model="form.name" class="field" type="text" placeholder="Nama Approver">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Urutan Step *</span>
          <input v-model.number="form.step_order" class="field" type="number" min="1" required>
        </label>
        <label class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 md:col-span-2">
          <input v-model="form.is_active" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600">
          <span class="text-sm font-medium text-gray-900">Status Aktif</span>
        </label>

        <div class="md:col-span-2 mt-6 flex gap-3">
          <button
            type="submit"
            class="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            :disabled="saving"
          >
            {{ saving ? "Menyimpan..." : isEdit ? "Update Approver" : "Simpan Approver" }}
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
      <div v-else class="py-10 text-center text-sm text-gray-500">
        Memuat data...
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import type { ApproverMasterInput } from "@/domain/entities/ApprovalChain"
import { useAppToast } from "@/presentation/components/feedback/useAppToast"
import { useApproverMasterViewModel } from "@/viewmodels/useApproverMasterViewModel"

const route = useRoute()
const router = useRouter()
const { approvers, loading, error, saving, create, update, refresh } = useApproverMasterViewModel()
const appToast = useAppToast()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)

function createEmptyForm(): ApproverMasterInput & { is_active: boolean } {
  return {
    email: "",
    name: "",
    step_order: 1,
    is_active: true,
  }
}

const form = reactive(createEmptyForm())

function loadData() {
  if (isEdit.value && id.value) {
    const approver = approvers.value.find((a) => a.id === id.value)
    if (approver) {
      Object.assign(form, {
        email: approver.email,
        name: approver.name ?? "",
        step_order: approver.step_order,
        is_active: approver.is_active,
      })
    } else if (!loading.value) {
      appToast.error("Data Approver tidak ditemukan.")
      router.back()
    }
  }
}

watch(() => approvers.value, loadData, { immediate: true })

onMounted(() => {
  if (isEdit.value && approvers.value.length === 0) {
    refresh()
  }
})

async function handleSubmit() {
  try {
    if (isEdit.value && id.value) {
      await update(id.value, { ...form })
      appToast.updated("Approver")
    } else {
      await create({ ...form })
      appToast.created("Approver")
    }
    router.push("/approver-master")
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan approver."
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
