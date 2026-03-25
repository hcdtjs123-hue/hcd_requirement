<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <div class="flex min-h-screen">
      <!-- Mobile drawer -->
      <div class="lg:hidden">
        <div
          v-show="isMobileSidebarOpen"
          class="fixed inset-0 z-40 bg-gray-900/40"
          @click="closeMobileSidebar"
          aria-hidden="true"
        />
        <aside
          class="fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white px-5 py-6 transition-transform duration-200 ease-out"
          :class="isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
              <p class="text-xs uppercase tracking-[0.35em] text-blue-600">HCD Platform</p>
              <h1 class="mt-3 text-2xl font-semibold tracking-tight">HCD Workspace</h1>
            </div>

            <button
              type="button"
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 transition hover:bg-gray-100"
              @click="closeMobileSidebar"
              aria-label="Close menu"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <nav class="mt-6 flex-1 space-y-4">
            <div
              v-for="section in filteredNavigationSections"
              :key="section.label"
              class="space-y-1"
            >
              <p class="mb-2 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                {{ section.label }}
              </p>
              <RouterLink
                v-for="item in section.items"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition"
                :class="
                  isActiveRoute(item.to)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                "
                @click="closeMobileSidebar"
              >
                <component :is="item.icon" class="h-4 w-4 shrink-0" />
                {{ item.label }}
              </RouterLink>
            </div>
          </nav>

          <div class="rounded-3xl border border-gray-200 bg-gray-50 p-4">
            <p class="text-xs uppercase tracking-[0.25em] text-gray-500">Signed In</p>
            <p class="mt-2 break-all text-sm text-gray-900">{{ user?.email ?? '-' }}</p>
            <p
              v-if="userRole"
              class="mt-1 rounded-full bg-blue-100 px-3 py-0.5 text-center text-xs font-medium text-blue-700"
            >
              {{ userRole }}
            </p>
          </div>
        </aside>
      </div>

      <aside
        class="hidden w-72 shrink-0 border-r border-gray-200 bg-white px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col"
      >
        <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
          <p class="text-xs uppercase tracking-[0.35em] text-blue-600">HCD Platform</p>
          <h1 class="mt-3 text-2xl font-semibold tracking-tight">HCD Workspace</h1>
        </div>

        <nav class="mt-6 flex-1 space-y-4 overflow-y-auto">
          <div v-for="section in filteredNavigationSections" :key="section.label" class="space-y-1">
            <p class="mb-2 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              {{ section.label }}
            </p>
            <RouterLink
              v-for="item in section.items"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition"
              :class="
                isActiveRoute(item.to)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              "
            >
              <component :is="item.icon" class="h-4 w-4 shrink-0" />
              {{ item.label }}
            </RouterLink>
          </div>
        </nav>

        <div class="sticky bottom-0 mt-6 rounded-3xl border border-gray-200 bg-gray-50 p-4">
          <p class="text-xs uppercase tracking-[0.25em] text-gray-500">Signed In</p>
          <p class="mt-2 break-all text-sm text-gray-900">{{ user?.email ?? '-' }}</p>
          <p
            v-if="userRole"
            class="mt-1 rounded-full bg-blue-100 px-3 py-0.5 text-center text-xs font-medium text-blue-700"
          >
            {{ userRole }}
          </p>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-40 border-b border-gray-200 bg-white">
          <div
            class="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
          >
            <div class="flex min-w-0 items-start gap-3">
              <button
                type="button"
                class="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 transition hover:bg-gray-100 lg:hidden"
                @click="openMobileSidebar"
                aria-label="Open menu"
              >
                <Menu class="h-5 w-5" />
              </button>
              <div class="min-w-0">
                <p class="text-xs uppercase tracking-[0.3em] text-gray-500">Workspace</p>
                <h2 class="mt-1 truncate text-2xl font-semibold tracking-tight">{{ pageTitle }}</h2>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isLoading"
                @click="handleLogout"
              >
                {{ isLoading ? 'Processing...' : 'Logout' }}
              </button>
            </div>
          </div>
        </header>

        <main class="flex-1 px-5 py-6 sm:px-6 lg:px-8">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  UserCheck,
  CheckSquare,
  Briefcase,
  Users,
  ClipboardList,
  UserCircle,
  Settings,
  ShieldCheck,
} from 'lucide-vue-next'

import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel'

const route = useRoute()
const router = useRouter()
const { isLoading, logout, user, userRole, hasAnyPermission, hasPermission } = useAuthViewModel()
const appToast = useAppToast()

const isMobileSidebarOpen = ref(false)

interface NavItem {
  to: string
  label: string
  icon: Component
  permissions?: string[]
}

interface NavSection {
  label: string
  items: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    label: 'General',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Workflow',
    items: [
      {
        to: '/job-requests',
        label: 'Job Requests',
        icon: FileText,
        permissions: ['job_request:read'],
      },
      {
        to: '/approver-master',
        label: 'Approver Master',
        icon: UserCheck,
        permissions: ['approval:read'],
      },
      {
        to: '/approval-tracking',
        label: 'Approval Tracking',
        icon: CheckSquare,
        permissions: ['approval:read'],
      },
    ],
  },
  {
    label: 'Recruitment',
    items: [
      {
        to: '/recruitment',
        label: 'Recruitment Dashboard',
        icon: Briefcase,
        permissions: ['recruitment:read', 'candidate:read'],
      },
      {
        to: '/recruitment/pipeline',
        label: 'Recruitment Pipeline',
        icon: Users,
        permissions: ['recruitment:read', 'candidate:read'],
      },
    ],
  },
  {
    label: 'Candidates',
    items: [
      {
        to: '/candidates',
        label: 'Candidate Database',
        icon: ClipboardList,
        permissions: ['candidate_data:read', 'candidate:read'],
      },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile', icon: UserCircle },
      {
        to: '/user-management',
        label: 'User Management',
        icon: Settings,
        permissions: ['user:read'],
      },
      {
        to: '/role-management',
        label: 'Role Management',
        icon: ShieldCheck,
        permissions: ['role:manage'],
      },
    ],
  },
]

const filteredNavigationSections = computed(() =>
  navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.permissions || hasAnyPermission(item.permissions),
      ),
    }))
    .filter((section) => section.items.length > 0),
)

function isActiveRoute(targetPath: string) {
  return route.path === targetPath || route.path.startsWith(`${targetPath}/`)
}

const pageTitle = computed(() => {
  const titleMatchers: Array<{ prefix: string; title: string }> = [
    { prefix: '/dashboard', title: 'Dashboard' },
    { prefix: '/job-requests', title: 'Job Requests' },
    { prefix: '/approver-master', title: 'Approver Master' },
    { prefix: '/approval-tracking', title: 'Approval Tracking' },
    { prefix: '/recruitment/pipeline', title: 'Recruitment Pipeline' },
    { prefix: '/candidate-management', title: 'Recruitment Pipeline' },
    { prefix: '/recruitment', title: 'Recruitment Dashboard' },
    { prefix: '/candidates', title: 'Candidate Database' },
    { prefix: '/applications', title: 'Candidate Database' },
    { prefix: '/profile', title: 'Profile' },
    { prefix: '/user-management', title: 'User Management' },
    { prefix: '/role-management', title: 'Role Management' },
  ]

  const match = titleMatchers.find(
    (item) => route.path === item.prefix || route.path.startsWith(`${item.prefix}/`),
  )

  if (match) {
    return match.title
  }

  return 'HCD Workspace'
})

function openMobileSidebar() {
  isMobileSidebarOpen.value = true
}

function closeMobileSidebar() {
  isMobileSidebarOpen.value = false
}

watch(
  () => route.path,
  () => {
    closeMobileSidebar()
  },
)

async function handleLogout() {
  try {
    await logout()
    appToast.success('Logged out successfully.')
    await router.push({ name: 'login' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Logout failed.'
    appToast.error(message)
  }
}
</script>
