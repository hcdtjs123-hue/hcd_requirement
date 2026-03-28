<template>
  <div class="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-xs text-gray-500">
      Showing <span class="font-medium text-gray-700">{{ startItem }}</span>–<span class="font-medium text-gray-700">{{ endItem }}</span>
      of <span class="font-medium text-gray-700">{{ totalItems }}</span>
    </p>

    <div class="flex items-center justify-end gap-2">
      <button
        type="button"
        class="inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        Prev
      </button>
      <p class="text-xs text-gray-600">
        Page <span class="font-medium text-gray-800">{{ page }}</span> / <span class="font-medium text-gray-800">{{ totalPages }}</span>
      </p>
      <button
        type="button"
        class="inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  pageSize?: number
  totalItems: number
}>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
}>()

const pageSize = computed(() => props.pageSize ?? 10)
const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / pageSize.value)))
const startItem = computed(() => (props.totalItems === 0 ? 0 : (props.page - 1) * pageSize.value + 1))
const endItem = computed(() => Math.min(props.totalItems, props.page * pageSize.value))
</script>
