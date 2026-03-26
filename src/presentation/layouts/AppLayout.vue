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
          class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white px-5 py-6 transition-transform duration-200 ease-out"
          :class="isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-5">
              <p class="text-[10px] uppercase tracking-[0.4em] font-bold text-blue-600">HCD Platform</p>
              <h1 class="mt-2 text-xl font-bold tracking-tight text-gray-900">HCD Workspace</h1>
            </div>

            <button
              type="button"
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-900 transition hover:bg-gray-100"
              @click="closeMobileSidebar"
              aria-label="Close menu"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <nav class="mt-8 flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            <div
              v-for="section in filteredNavigationSections"
              :key="section.label"
              class="group"
            >
              <!-- Section Header (Collapsible) -->
              <button
                v-if="section.items.length > 0"
                @click="toggleSection(section.label)"
                class="flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 transition hover:text-gray-900"
              >
                <div class="flex items-center gap-3">
                   <component :is="section.icon" v-if="section.icon" class="h-4 w-4 shrink-0" />
                   <span>{{ section.label }}</span>
                </div>
                <component 
                  :is="isSectionOpen(section.label) ? ChevronUp : ChevronDown" 
                  class="h-3.5 w-3.5 transition-transform duration-200"
                />
              </button>

              <!-- Section Items -->
              <div 
                v-show="isSectionOpen(section.label)"
                class="relative ml-4 mt-1 space-y-1 border-l-2 border-slate-200 py-1 pl-4"
              >
                <RouterLink
                  v-for="item in section.items"
                  :key="item.to"
                  :to="item.to"
                  class="relative flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition"
                  :class="
                    isActiveRoute(item.to)
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-100 ring-4 ring-gray-100/50'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  "
                  @click="closeMobileSidebar"
                >
                  <div class="flex items-center justify-between w-full">
                    <!-- Connector horizontal line for mobile -->
                    <div class="absolute -left-4 top-1/2 h-[2px] w-4 bg-slate-200" :class="isActiveRoute(item.to) ? 'bg-blue-400' : ''" />
                    
                    <div class="flex items-center gap-3">
                      <component :is="item.icon" class="h-4 w-4 shrink-0" :class="isActiveRoute(item.to) ? 'text-blue-600' : ''" />
                      <span>{{ item.label }}</span>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </nav>

          <footer class="mt-auto pt-6 border-t border-gray-50">
             <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p class="text-[10px] uppercase tracking-widest font-bold text-gray-400">Signed In</p>
              <p class="mt-2 break-all text-xs font-semibold text-gray-900">{{ user?.email ?? '-' }}</p>
              <p
                v-if="userRole"
                class="mt-2 inline-block rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest"
              >
                {{ userRole }}
              </p>
            </div>
          </footer>
        </aside>
      </div>

      <!-- Desktop Sidebar -->
      <aside
        class="hidden w-72 shrink-0 border-r border-gray-200 bg-gray-50/30 px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col"
      >
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p class="text-[10px] uppercase tracking-[0.4em] font-bold text-blue-600">HCD Platform</p>
          <h1 class="mt-2 text-xl font-extrabold tracking-tight text-gray-900">HCD Workspace</h1>
        </div>

        <nav class="mt-8 flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div v-for="section in filteredNavigationSections" :key="section.label" class="space-y-2">
            <!-- Section Header -->
            <button
              @click="toggleSection(section.label)"
              class="flex w-full items-center justify-between rounded-xl px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 transition hover:text-gray-900"
            >
              <div class="flex items-center gap-2">
                 <component :is="section.icon" v-if="section.icon" class="h-3.5 w-3.5" />
                 <span>{{ section.label }}</span>
              </div>
              <component 
                :is="isSectionOpen(section.label) ? ChevronUp : ChevronDown" 
                class="h-3 w-3 transition-transform duration-200"
              />
            </button>

            <!-- Section Items with Tree Styling -->
            <div 
              v-show="isSectionOpen(section.label)"
              class="relative ml-2 space-y-1 py-1"
            >
              <!-- Vertical Tree Line -->
              <div class="absolute left-0 top-0 bottom-4 w-[2px] bg-slate-200 rounded-full" />
              
              <RouterLink
                v-for="item in section.items"
                :key="item.to"
                :to="item.to"
                class="group relative ml-4 flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition"
                :class="
                  isActiveRoute(item.to)
                    ? 'bg-white text-gray-900 shadow-md border border-gray-100'
                    : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                "
              >
                <!-- Curve / Connector Line -->
                <div 
                  class="absolute -left-4 top-1/2 h-[2px] w-4 bg-slate-200 rounded-r-full group-hover:bg-blue-300 transition-colors" 
                  :class="isActiveRoute(item.to) ? 'bg-blue-400' : ''"
                />

                <div class="flex items-center gap-3">
                  <component :is="item.icon" class="h-4 w-4 shrink-0 transition-colors" :class="isActiveRoute(item.to) ? 'text-blue-600' : 'group-hover:text-blue-600'" />
                  <span>{{ item.label }}</span>
                </div>
              </RouterLink>
            </div>
          </div>
        </nav>

        <footer class="mt-6 pt-6 border-t border-gray-100">
          <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p class="text-[10px] uppercase tracking-widest font-bold text-gray-400">Signed In</p>
            <p class="mt-2 break-all text-xs font-semibold text-gray-900">{{ user?.email ?? '-' }}</p>
            <div class="mt-3 flex items-center justify-between">
              <span
                v-if="userRole"
                class="inline-block rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest"
              >
                {{ userRole }}
              </span>
            </div>
          </div>
        </footer>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
          <div
            class="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
          >
            <div class="flex min-w-0 items-start gap-4">
              <button
                type="button"
                class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-900 transition hover:bg-gray-100 lg:hidden"
                @click="openMobileSidebar"
                aria-label="Open menu"
              >
                <Menu class="h-5 w-5" />
              </button>
              <div class="min-w-0">
                <p class="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Workspace</p>
                <h2 class="mt-1 truncate text-2xl font-extrabold tracking-tight text-gray-900">{{ pageTitle }}</h2>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-5 text-sm font-bold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isLoading"
                @click="handleLogout"
              >
                {{ isLoading ? 'Processing...' : 'Logout' }}
              </button>
            </div>
          </div>
        </header>

        <main class="flex-1 px-5 py-8 sm:px-6 lg:px-8 bg-gray-50/50">
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
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next'

import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useAuthViewModel } from '@/viewmodels/useAuthViewModel'
import { useJobRequestViewModel } from '@/viewmodels/useJobRequestViewModel'
import { useApprovalViewModel } from '@/viewmodels/useApprovalViewModel'

const route = useRoute()
const router = useRouter()
const { isLoading, logout, user, userRole, hasAnyPermission } = useAuthViewModel()
const { jobs } = useJobRequestViewModel()
const { chains } = useApprovalViewModel()
const appToast = useAppToast()

const isMobileSidebarOpen = ref(false)
const openSections = ref<string[]>(['Overview', 'ERF Management', 'Hiring'])

interface NavItem {
  to: string
  label: string
  icon: Component
  permissions?: string[]
  count?: number
  badgeClass?: string
}

interface NavSection {
  label: string
  icon?: Component
  items: NavItem[]
}

const navigationSections = computed((): NavSection[] => [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'ERF Management',
    icon: FileText,
    items: [
      {
        to: '/job-requests',
        label: 'ERF Submissions',
        icon: FileText,
        permissions: ['job_request:read'],
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
    label: 'Hiring',
    icon: Briefcase,
    items: [
      {
        to: '/recruitment',
        label: 'Hiring Dashboard',
        icon: Briefcase,
        permissions: ['recruitment:read', 'candidate:read'],
      },
      {
        to: '/recruitment/pipeline',
        label: 'Hiring Pipeline',
        icon: Users,
        permissions: ['recruitment:read', 'candidate:read'],
      },
      {
        to: '/candidates',
        label: 'Candidate Form',
        icon: ClipboardList,
        permissions: ['candidate_data:read', 'candidate:read'],
      },
    ],
  },
  {
    label: 'Master Data',
    icon: Settings,
    items: [
      {
        to: '/approver-master',
        label: 'Approver Master',
        icon: UserCheck,
        permissions: ['approval:read'],
      },
      {
        to: '/custom-group-management',
        label: 'Custom Groups',
        icon: Settings,
        permissions: ['user:read'],
      },
    ],
  },
  {
    label: 'Personal',
    icon: UserCircle,
    items: [{ to: '/profile', label: 'Profile', icon: UserCircle }],
  },
  {
    label: 'System Admin',
    icon: ShieldCheck,
    items: [
      {
        to: '/user-management',
        label: 'User Management',
        icon: Settings,
        permissions: ['user:read'],
      },
      {
        to: '/user-management/history',
        label: 'User History',
        icon: ClipboardList,
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
])

const filteredNavigationSections = computed(() =>
  navigationSections.value
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.permissions || hasAnyPermission(item.permissions),
      ),
    }))
    .filter((section) => section.items.length > 0),
)

function toggleSection(label: string) {
  const index = openSections.value.indexOf(label)
  if (index === -1) {
    openSections.value.push(label)
  } else {
    openSections.value.splice(index, 1)
  }
}

function isSectionOpen(label: string) {
  return openSections.value.includes(label) || route.path.includes(label.toLowerCase().replace(' ', '-'))
}

function isActiveRoute(targetPath: string) {
  return route.path === targetPath || route.path.startsWith(`${targetPath}/`)
}

const pageTitle = computed(() => {
  const titleMatchers: Array<{ prefix: string; title: string }> = [
    { prefix: '/dashboard', title: 'Dashboard' },
    { prefix: '/job-requests', title: 'ERF' },
    { prefix: '/approver-master', title: 'Approver Master' },
    { prefix: '/approval-tracking', title: 'Approval Tracking' },
    { prefix: '/recruitment/pipeline', title: 'Hiring Pipeline' },
    { prefix: '/candidate-management', title: 'Hiring Pipeline' },
    { prefix: '/recruitment', title: 'Hiring Dashboard' },
    { prefix: '/candidates', title: 'Candidate Form' },
    { prefix: '/applications', title: 'Candidate Form' },
    { prefix: '/profile', title: 'Profile' },
    { prefix: '/user-management/history', title: 'User History' },
    { prefix: '/user-management', title: 'User Management' },
    { prefix: '/role-management', title: 'Role Management' },
    { prefix: '/custom-group-management', title: 'Custom Group Management' },
  ]

  const match = titleMatchers.find(
    (item) => route.path === item.prefix || route.path.startsWith(`${item.prefix}/`),
  )

  return match ? match.title : 'HCD Workspace'
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
