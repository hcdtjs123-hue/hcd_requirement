<template>
  <div class="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <template v-if="outcome === 'approved'">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white"
        >
          ✓
        </div>
        <h1 class="text-2xl font-semibold text-emerald-900">Kandidat disetujui</h1>
        <p class="mt-3 text-emerald-800">Status screening telah diperbarui.</p>
      </template>
      <template v-else-if="outcome === 'rejected'">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-2xl text-white"
        >
          ✕
        </div>
        <h1 class="text-2xl font-semibold text-red-900">Kandidat ditolak</h1>
        <p class="mt-3 text-red-800">Status screening telah diperbarui.</p>
      </template>
      <template v-else-if="outcome === 'expired'">
        <h1 class="text-2xl font-semibold text-amber-900">Link kedaluwarsa</h1>
        <p class="mt-3 text-amber-800">{{ message || "Silakan minta email baru dari tim HR." }}</p>
      </template>
      <template v-else-if="outcome === 'used'">
        <h1 class="text-2xl font-semibold text-gray-900">Sudah diproses</h1>
        <p class="mt-3 text-gray-600">
          Link ini sudah digunakan
          <span v-if="previous" class="font-medium">({{ previous }})</span>.
        </p>
      </template>
      <template v-else>
        <h1 class="text-2xl font-semibold text-red-900">Tidak dapat memproses</h1>
        <p class="mt-3 text-red-800">{{ message || "Terjadi kesalahan." }}</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

const outcome = computed(() => {
  const v = route.query.outcome
  return typeof v === "string" ? v : ""
})

const message = computed(() => {
  const v = route.query.message
  return typeof v === "string" ? v : ""
})

const previous = computed(() => {
  const v = route.query.previous
  return typeof v === "string" ? v : ""
})
</script>
