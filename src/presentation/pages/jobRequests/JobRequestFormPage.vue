<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-8 text-gray-900">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        @click="router.back()"
      >
        ←
      </button>
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Job Request</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">
          {{ isEdit ? "Edit Job Request" : "Form Job Request Baru" }}
        </h1>
      </div>
    </div>

    <p v-if="error" class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </p>

    <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <form v-if="!loading" class="grid gap-5 md:grid-cols-2" @submit.prevent="handleSubmit">
        <label class="space-y-2 md:col-span-2">
          <span class="text-sm font-medium text-gray-700">PT Pembebanan</span>
          <input v-model="form.pt_pembebanan" class="field" type="text" placeholder="Masukkan PT">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Main Position *</span>
          <input v-model="form.main_position" class="field" type="text" required placeholder="Contoh: Software Engineer">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Employment Status</span>
          <select v-model="form.employment_status" class="field">
            <option value="">Pilih status</option>
            <option v-for="option in employmentStatusOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Position Status</span>
          <select v-model="form.position_status" class="field">
            <option value="">Pilih status</option>
            <option v-for="option in positionStatusOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Direct Manager</span>
          <input v-model="form.direct_manager" class="field" type="text" placeholder="Nama Manager">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Designation</span>
          <input v-model="form.designation" class="field" type="text" placeholder="Designation">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Site</span>
          <input v-model="form.site" class="field" type="text" placeholder="Lokasi Site">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Working Location</span>
          <input v-model="form.working_location" class="field" type="text" placeholder="Lokasi Kerja">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Required Date</span>
          <input v-model="form.required_date" class="field" type="date">
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Periode Probation (Bulan)</span>
          <input
            v-model.number="form.periode_probation"
            class="field"
            type="number"
            min="0"
            @input="sanitizeNumberField(form, 'periode_probation')"
          >
        </label>
        
        <div class="md:col-span-2 mt-4"><hr class="border-gray-100"></div>

        <label v-for="index in 6" :key="index" class="space-y-2">
          <span class="text-sm font-medium text-gray-700">Custom Grup {{ index }}</span>
          <input v-model="form[`custom_grup_${index}` as keyof typeof form]" class="field" type="text" placeholder="...">
        </label>

        <div class="md:col-span-2 mt-6 flex gap-3">
          <button
            type="submit"
            class="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            :disabled="saving"
          >
            {{ saving ? "Menyimpan..." : isEdit ? "Update Job Request" : "Simpan Job Request" }}
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

import {
  employmentStatusOptions,
  positionStatusOptions,
  type JobRequestInput,
} from "@/domain/entities/JobRequest"
import { useAppToast } from "@/presentation/components/feedback/useAppToast"
import { useJobRequestViewModel } from "@/viewmodels/useJobRequestViewModel"

const route = useRoute()
const router = useRouter()
const { jobs, loading, saving, error, create, update, refresh } = useJobRequestViewModel()
const appToast = useAppToast()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)

function createEmptyForm(): JobRequestInput {
  return {
    pt_pembebanan: "",
    main_position: "",
    employment_status: "",
    position_status: "",
    direct_manager: "",
    designation: "",
    site: "",
    working_location: "",
    custom_grup_1: "",
    custom_grup_2: "",
    custom_grup_3: "",
    custom_grup_4: "",
    custom_grup_5: "",
    custom_grup_6: "",
    required_date: "",
    periode_probation: 0,
  }
}

const form = reactive<JobRequestInput>(createEmptyForm())

function sanitizeNumberField(target: Record<string, any>, field: string) {
  if (target[field] < 0) {
    target[field] = 0
  }
}

function loadData() {
  if (isEdit.value && id.value) {
    const job = jobs.value.find((j) => j.id === id.value)
    if (job) {
      Object.assign(form, {
        pt_pembebanan: job.pt_pembebanan ?? "",
        main_position: job.main_position,
        employment_status: job.employment_status ?? "",
        position_status: job.position_status ?? "",
        direct_manager: job.direct_manager ?? "",
        designation: job.designation ?? "",
        site: job.site ?? "",
        working_location: job.working_location ?? "",
        custom_grup_1: job.custom_grup_1 ?? "",
        custom_grup_2: job.custom_grup_2 ?? "",
        custom_grup_3: job.custom_grup_3 ?? "",
        custom_grup_4: job.custom_grup_4 ?? "",
        custom_grup_5: job.custom_grup_5 ?? "",
        custom_grup_6: job.custom_grup_6 ?? "",
        required_date: job.required_date ?? "",
        periode_probation: job.periode_probation ?? 0,
      })
    } else if (!loading.value) {
      appToast.error("Data Job Request tidak ditemukan.")
      router.back()
    }
  }
}

watch(() => jobs.value, loadData, { immediate: true })

onMounted(() => {
  if (isEdit.value && jobs.value.length === 0) {
    refresh()
  }
})

async function handleSubmit() {
  try {
    if (isEdit.value && id.value) {
      await update(id.value, { ...form })
      appToast.updated("Job Request")
    } else {
      await create({ ...form })
      appToast.created("Job Request")
    }
    router.push("/job-requests")
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan job request."
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
