<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-8 text-gray-900">
    <div>
      <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Administrator</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight">Custom Group Management</h1>
      <p class="mt-2 text-sm text-gray-600">
        Manage master data for all 6 Custom Groups used in employee applications and records.
      </p>
    </div>

    <!-- Tabs for 6 Groups -->
    <div class="flex flex-wrap gap-2 border-b border-gray-200">
      <button
        v-for="i in 6"
        :key="i"
        type="button"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="activeTab === i ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
        @click="activeTab = i"
      >
        Group {{ i }}
      </button>
    </div>

    <section class="max-w-4xl">
      <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Custom Group {{ activeTab }} List</h2>
          <button
            type="button"
            class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            @click="openCreateModal"
          >
            Add Item
          </button>
        </div>

        <div v-if="loading" class="py-10 text-center text-sm text-gray-500">Loading...</div>
        <div v-else-if="items.length === 0" class="py-10 text-center text-sm text-gray-500">
          No items found in Group {{ activeTab }}.
        </div>
        <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3 font-medium">Name</th>
                <th class="px-4 py-3 font-medium">Description</th>
                <th class="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 text-gray-600">
              <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-4 py-3">{{ item.description || '-' }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <button @click="openEditModal(item)" class="text-blue-600 hover:underline">Edit</button>
                    <button @click="handleDelete(item.id)" class="text-red-600 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Modal (Simple) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-xl font-semibold">{{ editingItem ? 'Edit Item' : 'Add New Item' }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-gray-700">Name *</span>
            <input v-model="form.name" required type="text" class="field" placeholder="Entry name" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-gray-700">Description</span>
            <textarea v-model="form.description" class="field min-h-[100px]" placeholder="Brief description..."></textarea>
          </label>
          <div class="mt-6 flex justify-end gap-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:underline">Cancel</button>
            <button type="submit" :disabled="saving" class="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { customGroupRepo } from '@/infrastructure/supabase/repositories/CustomGroupRepositoryImpl'
import type { CustomGroup } from '@/domain/entities/CustomGroup'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'

const activeTab = ref(1)
const items = ref<CustomGroup[]>([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingItem = ref<CustomGroup | null>(null)
const appToast = useAppToast()

const form = reactive({
  name: '',
  description: ''
})

async function fetchItems() {
  loading.value = true
  try {
    items.value = await customGroupRepo.getAll(activeTab.value)
  } catch (err) {
    appToast.error('Failed to load items')
  } finally {
    loading.value = false
  }
}

watch(activeTab, fetchItems)

onMounted(fetchItems)

function openCreateModal() {
  editingItem.value = null
  form.name = ''
  form.description = ''
  showModal.value = true
}

function openEditModal(item: CustomGroup) {
  editingItem.value = item
  form.name = item.name
  form.description = item.description || ''
  showModal.value = true
}

async function handleSubmit() {
  saving.value = true
  try {
    if (editingItem.value) {
      await customGroupRepo.update(activeTab.value, editingItem.value.id, {
        name: form.name,
        description: form.description
      })
      appToast.updated(`Custom Group ${activeTab.value} entry`)
    } else {
      await customGroupRepo.create(activeTab.value, {
        name: form.name,
        description: form.description
      })
      appToast.created(`Custom Group ${activeTab.value} entry`)
    }
    showModal.value = false
    fetchItems()
  } catch (err) {
    appToast.error('Failed to save')
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: string) {
  if (!confirm('Are you sure you want to delete this item?')) return
  try {
    await customGroupRepo.delete(activeTab.value, id)
    appToast.deleted('Item')
    fetchItems()
  } catch (err) {
    appToast.error('Failed to delete')
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
