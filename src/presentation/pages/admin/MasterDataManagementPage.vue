<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-8 text-gray-900">
    <div>
      <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Administrator</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight">PT & Department Master</h1>
      <p class="mt-2 text-sm text-gray-600">
        Manage reusable master data for Cost Center PT and Department fields in ERF.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="
          activeTab === tab.value
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <section class="max-w-4xl">
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold">{{ activeLabel }} List</h2>
          <button
            type="button"
            class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            @click="openCreateModal"
          >
            Add {{ activeLabel }}
          </button>
        </div>

        <div v-if="loading" class="py-10 text-center text-sm text-gray-500">Loading...</div>
        <div v-else-if="activeItems.length === 0" class="py-10 text-center text-sm text-gray-500">
          No {{ activeLabel.toLowerCase() }} entries found.
        </div>
        <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3 font-medium">Name</th>
                <th class="px-4 py-3 font-medium">Description</th>
                <th class="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 text-gray-600">
              <tr v-for="item in activeItems" :key="item.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3">{{ item.description || '-' }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <button class="text-blue-600 hover:underline" @click="openEditModal(item)">
                      Edit
                    </button>
                    <button class="text-red-600 hover:underline" @click="handleDelete(item.id)">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-xl font-semibold">
          {{ editingItem ? `Edit ${activeLabel}` : `Add ${activeLabel}` }}
        </h3>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-gray-700">Name *</span>
            <input
              v-model="form.name"
              required
              type="text"
              class="field"
              :placeholder="`Enter ${activeLabel.toLowerCase()} name`"
            />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-gray-700">Description</span>
            <textarea
              v-model="form.description"
              class="field min-h-[100px]"
              placeholder="Brief description..."
            />
          </label>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-600 hover:underline"
              @click="showModal = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { MasterDataItem, MasterDataType } from '@/domain/entities/MasterData'
import { useMasterDataViewModel } from '@/viewmodels/useMasterDataViewModel'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'

const tabs: Array<{ label: string; value: MasterDataType }> = [
  { label: 'PT', value: 'pt' },
  { label: 'Department', value: 'department' },
]

const activeTab = ref<MasterDataType>('pt')
const showModal = ref(false)
const editingItem = ref<MasterDataItem | null>(null)
const form = reactive({
  name: '',
  description: '',
})

const { loading, saving, optionsByType, refreshOptions, loadAllOptions, create, update, remove } =
  useMasterDataViewModel()
const appToast = useAppToast()

const activeItems = computed(() => optionsByType.value[activeTab.value])
const activeLabel = computed(() => tabs.find((tab) => tab.value === activeTab.value)?.label ?? 'Item')

watch(activeTab, async (type) => {
  if (optionsByType.value[type].length > 0) return
  try {
    await refreshOptions(type)
  } catch {
    appToast.error(`Failed to load ${activeLabel.value.toLowerCase()} data.`)
  }
})

onMounted(async () => {
  try {
    await loadAllOptions()
  } catch {
    appToast.error('Failed to load master data.')
  }
})

function openCreateModal() {
  editingItem.value = null
  form.name = ''
  form.description = ''
  showModal.value = true
}

function openEditModal(item: MasterDataItem) {
  editingItem.value = item
  form.name = item.name
  form.description = item.description || ''
  showModal.value = true
}

async function handleSubmit() {
  try {
    if (editingItem.value) {
      await update(activeTab.value, editingItem.value.id, {
        name: form.name,
        description: form.description,
      })
      appToast.updated(activeLabel.value)
    } else {
      await create(activeTab.value, {
        name: form.name,
        description: form.description,
      })
      appToast.created(activeLabel.value)
    }

    showModal.value = false
  } catch (err) {
    const message = err instanceof Error ? err.message : `Failed to save ${activeLabel.value.toLowerCase()}.`
    appToast.error(message)
  }
}

async function handleDelete(id: string) {
  if (!confirm(`Delete this ${activeLabel.value.toLowerCase()} entry?`)) return

  try {
    await remove(activeTab.value, id)
    appToast.deleted(activeLabel.value)
  } catch (err) {
    const message = err instanceof Error ? err.message : `Failed to delete ${activeLabel.value.toLowerCase()}.`
    appToast.error(message)
  }
}
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(209 213 219);
  background: white;
  padding: 0.75rem 1rem;
  color: rgb(17 24 39);
  outline: none;
  transition: all 0.2s;
}

.field:focus {
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
</style>
