<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-8 text-gray-900">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Administrator</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight">User History</h1>
        <p class="mt-2 text-sm text-gray-600">
          Review user accounts that are no longer active, including expired candidate accounts.
        </p>
      </div>
      <button
        type="button"
        class="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        @click="refreshUsers"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <p
      v-if="error"
      class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ error }}
    </p>

    <section class="max-w-5xl">
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Inactive User List</h2>
        </div>

        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search name, email, username, position..."
            class="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
          />
          <select
            v-model="roleFilter"
            class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-600 sm:w-64"
          >
            <option value="">All Roles</option>
            <option v-for="opt in roleOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th class="px-4 py-3 font-medium w-14">No</th>
                  <th class="px-4 py-3 font-medium min-w-[200px]">Name</th>
                  <th class="px-4 py-3 font-medium min-w-[220px]">Email</th>
                  <th class="px-4 py-3 font-medium min-w-[160px]">Username</th>
                  <th class="px-4 py-3 font-medium">Role</th>
                  <th class="px-4 py-3 font-medium min-w-[160px]">Updated</th>
                  <th class="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(u, idx) in pagedUsers" :key="u.id" class="transition hover:bg-gray-50">
                  <td class="px-4 py-3 align-top text-gray-500">
                    {{ (page - 1) * pageSize + idx + 1 }}
                  </td>
                  <td class="px-4 py-3 align-top">
                    <p class="font-medium text-gray-900 whitespace-nowrap">{{ getDisplayName(u) }}</p>
                  </td>
                  <td class="px-4 py-3 align-top">
                    <p class="whitespace-nowrap">{{ u.email || '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-top">
                    <p class="whitespace-nowrap">{{ u.username ? `@${u.username}` : '-' }}</p>
                  </td>
                  <td class="px-4 py-3 align-top">
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      :class="roleBadge(u.role)"
                    >
                      {{ u.role || 'No Role' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 align-top">
                    <p class="whitespace-nowrap">{{ formatDate(u.updated_at) }}</p>
                  </td>
                  <td class="px-4 py-3 text-right align-top">
                    <RowActionsMenu
                      :actions="[
                        {
                          label: 'Edit',
                          disabled: saving || !hasPermission('user:update'),
                          onClick: () => goToEdit(u.id),
                        },
                        {
                          label: 'Delete',
                          tone: 'danger',
                          disabled: saving,
                          onClick: () => handleDelete(u.id, u.email),
                        },
                      ]"
                    />
                  </td>
                </tr>
                <tr v-if="!loading && filteredUsers.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-500">
                    No inactive user history found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <TablePagination
            v-if="!loading && filteredUsers.length > 0"
            v-model:page="page"
            :page-size="pageSize"
            :total-items="filteredUsers.length"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import RowActionsMenu from '@/presentation/components/menus/RowActionsMenu.vue'
import TablePagination from '@/presentation/components/tables/TablePagination.vue'
import type { UserRole } from '@/domain/entities/User'
import type { ManagedUser } from '@/domain/entities/ManagedUser'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel'
import { useUserManagementViewModel } from '@/viewmodels/useUserManagementViewModel'

const router = useRouter()
const { users, loading, saving, error, refreshUsers, deleteUser } = useUserManagementViewModel()
const { hasPermission } = useAuthViewModel()
const appToast = useAppToast()

const searchQuery = ref('')
const roleFilter = ref('')
const pageSize = 10
const page = ref(1)

function normalize(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
}

function getDisplayName(user: ManagedUser) {
  const fullName = [user.first_name, user.middle_name, user.last_name]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(' ')

  return fullName || '-'
}

function formatDate(value: string | null) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const roleOptions = computed(() => {
  const set = new Set<string>()
  for (const u of users.value) {
    if (u.is_active !== false) continue
    set.add(u.role || 'No Role')
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const filteredUsers = computed(() => {
  const q = normalize(searchQuery.value)
  return users.value.filter((u) => {
    if (u.is_active !== false) return false

    const roleLabel = u.role || 'No Role'
    if (roleFilter.value && roleLabel !== roleFilter.value) return false
    if (!q) return true

    const haystack = [
      getDisplayName(u),
      u.email,
      u.username ? `@${u.username}` : '',
      u.main_position ?? '',
      u.hire_location ?? '',
      u.no_id ?? '',
      roleLabel,
    ]
      .map(normalize)
      .join(' ')

    return haystack.includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize)))
const pagedUsers = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value)
  const start = (safePage - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

function resetPage() {
  page.value = 1
}

watch([searchQuery, roleFilter], resetPage)
watch(
  () => filteredUsers.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

function goToEdit(userId: string) {
  router.push(`/user-management/${userId}/edit`)
}

function roleBadge(role: UserRole | null) {
  const map: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-purple-100 text-purple-700',
    staff: 'bg-blue-100 text-blue-700',
    candidate: 'bg-emerald-100 text-emerald-700',
  }
  return role ? map[role] || 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-500'
}

async function handleDelete(userId: string, email: string) {
  if (!confirm(`Delete account ${email}? This action cannot be undone.`)) return
  try {
    await deleteUser(userId)
    appToast.deleted('User')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete user.'
    appToast.error(message)
  }
}
</script>
