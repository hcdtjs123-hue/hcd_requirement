<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-8 text-gray-900">
    <!-- Header -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Overview</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">
          Welcome, <span class="font-medium text-gray-800">{{ user?.email }}</span> —
          <span class="font-semibold text-blue-600 uppercase">{{ userRole }}</span>
        </p>
      </div>
      <p class="text-xs text-gray-400">{{ currentDate }}</p>
    </div>

    <section
      v-if="dashboardIntro"
      class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 shadow-sm"
    >
      <p class="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">Dashboard Focus</p>
      <h2 class="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
        {{ dashboardIntro.title }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
        {{ dashboardIntro.description }}
      </p>
    </section>

    <!-- KPI Cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="kpi in kpiCards"
        :key="kpi.label"
        class="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-gray-400">
              {{ kpi.label }}
            </p>
            <p class="mt-2 text-3xl font-bold text-gray-900">{{ kpi.value }}</p>
          </div>
          <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="kpi.bg">
            <component :is="kpi.icon" class="h-5 w-5" :class="kpi.color" />
          </div>
        </div>
        <p class="mt-3 text-xs text-gray-500">{{ kpi.sub }}</p>
        <div class="absolute bottom-0 left-0 h-1 w-full" :class="kpi.bar" />
      </div>
    </section>

    <!-- Main Content Grid -->
    <div class="grid gap-6 lg:grid-cols-3" v-if="showOperationalOverview">
    <!-- Latest ERF Submissions -->
      <div
        v-if="showJobRequestsPanel"
        class="rounded-xl border border-gray-200 bg-white shadow-sm"
        :class="showApprovalPanel ? 'lg:col-span-2' : 'lg:col-span-3'"
      >
        <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div class="flex items-center gap-2">
            <FileText class="h-4 w-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-gray-900">Latest Employee Request Forms (ERF)</h2>
          </div>
          <RouterLink to="/job-requests" class="text-xs text-blue-600 hover:underline"
            >View all →</RouterLink
          >
        </div>
        <div class="divide-y divide-gray-50">
          <div
            v-for="job in recentJobs"
            :key="job.id"
            class="flex items-center justify-between px-6 py-4 transition hover:bg-gray-50"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900">
                {{ job.main_position || '-' }}
              </p>
              <p class="mt-0.5 truncate text-xs text-gray-500">
                {{ job.site || '-' }}
              </p>
            </div>
            <span
              class="ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              :class="jobStatusBadge(job.position_status)"
              >{{ job.position_status || 'Draft' }}</span
            >
          </div>
          <div v-if="recentJobs.length === 0" class="px-6 py-10 text-center text-sm text-gray-400">
            No ERF submissions yet.
          </div>
        </div>
      </div>

      <!-- Status Approval -->
      <div v-if="showApprovalPanel" class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <CheckSquare class="h-4 w-4 text-emerald-600" />
          <h2 class="text-sm font-semibold text-gray-900">Approval Status</h2>
        </div>
        <div class="space-y-3 p-5">
          <div
            v-for="stat in approvalStats"
            :key="stat.label"
            class="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              :class="stat.bg"
            >
              <component :is="stat.icon" class="h-4 w-4" :class="stat.color" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500">{{ stat.label }}</p>
              <p class="text-lg font-bold text-gray-900">{{ stat.count }}</p>
            </div>
          </div>
        </div>
        <RouterLink
          to="/approval-tracking"
          class="mx-5 mb-5 flex items-center justify-center rounded-xl border border-gray-200 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
        >
          View Approval Tracking
        </RouterLink>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-1">
      <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <LayoutDashboard class="h-4 w-4 text-gray-600" />
          <h2 class="text-sm font-semibold text-gray-900">Quick Access</h2>
        </div>
        <div class="grid grid-cols-2 gap-3 p-5">
          <RouterLink
            v-for="card in quickLinks"
            :key="card.to"
            :to="card.to"
            class="flex flex-col items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-xl" :class="card.bg">
              <component :is="card.icon" class="h-4 w-4" :class="card.color" />
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-800">{{ card.label }}</p>
              <p class="mt-0.5 text-[10px] text-gray-500 leading-relaxed">{{ card.desc }}</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  FileText,
  CheckSquare,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  ClipboardList,
  UserCheck,
  ShieldCheck,
  Settings,
  AlertCircle,
} from 'lucide-vue-next'

import { useAuthViewModel } from '@/viewmodels/useAuthViewModel'
import { useJobRequestViewModel } from '@/viewmodels/useJobRequestViewModel'
import { useApprovalViewModel } from '@/viewmodels/useApprovalViewModel'
import { useRecruitmentTrackingViewModel } from '@/viewmodels/useRecruitmentTrackingViewModel'
import { useCandidateDataViewModel } from '@/viewmodels/useCandidateDataViewModel'

const { user, userRole, hasAnyPermission } = useAuthViewModel()
const { jobs } = useJobRequestViewModel()
const { chains } = useApprovalViewModel()
const { trackings } = useRecruitmentTrackingViewModel()
const { candidates } = useCandidateDataViewModel()

const currentDate = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
)

const normalizedRole = computed(() => (userRole.value ?? '').toLowerCase())

const canReadJobRequests = computed(() => hasAnyPermission(['job_request:read']))
const canReadApprovals = computed(() => hasAnyPermission(['approval:read']))
const canReadRecruitment = computed(() => hasAnyPermission(['recruitment:read', 'candidate:read']))
const canReadCandidates = computed(() =>
  hasAnyPermission(['candidate_data:read', 'candidate:read']),
)
const canManageUsers = computed(() => hasAnyPermission(['user:read']))
const isCandidateRole = computed(() => normalizedRole.value === 'candidate')
const isManagerRole = computed(() => normalizedRole.value === 'manager')
const isAdminRole = computed(() =>
  ['admin', 'administrator', 'super admin', 'super_admin'].includes(normalizedRole.value),
)

const dashboardIntro = computed(() => {
  if (isCandidateRole.value) {
    return {
      title: 'Summary of your candidate data',
      description:
        'This dashboard focuses on monitoring your candidate profile and quick access to forms that need updating.',
    }
  }

  if (isManagerRole.value) {
    return {
      title: 'Monitor approvals and approvers you manage',
      description:
        'As a manager, you are focused on submissions requiring approval monitoring and the master approvers you have entered.',
    }
  }

  if (isAdminRole.value) {
    return {
      title: 'Manage operations and system access',
      description:
        'The administrator dashboard highlights cross-process modules, from employee request form (erf), approval, recruitment, up to user and role management.',
    }
  }

  if (canReadRecruitment.value) {
    return {
      title: 'Focus on approved recruitment requests',
      description:
        'This dashboard highlights approved ERF records that are ready for recruitment processing and shortcuts to the most frequently used modules.',
    }
  }

  return {
    title: 'Work summary according to your access rights',
    description:
      'Dashboard content is tailored based on the modules you can access, allowing you to jump straight into the most relevant work.',
  }
})

const showJobRequestsPanel = computed(() => canReadJobRequests.value)
const showApprovalPanel = computed(() => canReadApprovals.value && !isCandidateRole.value)
const showOperationalOverview = computed(
  () => showJobRequestsPanel.value || showApprovalPanel.value,
)

// ─── KPI Cards ────────────────────────────
const kpiCards = computed(() => {
  const cards = []

  if (showJobRequestsPanel.value) {
    cards.push({
      label: 'Total ERF',
      value: jobs.value.length,
      sub: 'All position requests',
      icon: FileText,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
      bar: 'bg-blue-500',
    })
  }

  if (canReadApprovals.value) {
    cards.push({
      label: 'Awaiting Approval',
      value: chains.value.filter((c) => c.status === 'pending').length,
      sub: isManagerRole.value ? 'Approvals you monitor' : 'Requires approver action',
      icon: Clock,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
      bar: 'bg-amber-500',
    })
    cards.push({
      label: 'Approved',
      value: chains.value.filter((c) => c.status === 'approved').length,
      sub: 'Approved submissions',
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
      bar: 'bg-emerald-500',
    })
  }

  if (canReadRecruitment.value) {
    cards.push({
      label: 'Hiring Queue',
      value: trackings.value.length,
      sub: 'Approved ERF ready for recruitment handling',
      icon: Briefcase,
      bg: 'bg-purple-50',
      color: 'text-purple-600',
      bar: 'bg-purple-500',
    })
  }

  if (canReadCandidates.value) {
    cards.push({
      label: isCandidateRole.value ? 'Your Candidate Form' : 'Candidate Data',
      value: candidates.value.length,
      sub: isCandidateRole.value
        ? 'Candidate records available in your account'
        : 'Candidate records available in the system',
      icon: ClipboardList,
      bg: 'bg-indigo-50',
      color: 'text-indigo-600',
      bar: 'bg-indigo-500',
    })
  }

  if (canManageUsers.value) {
    cards.push({
      label: 'User Administration',
      value: 'RBAC',
      sub: 'Manage user accounts and access',
      icon: Settings,
      bg: 'bg-slate-100',
      color: 'text-slate-700',
      bar: 'bg-slate-500',
    })
  }

  return cards.slice(0, 4)
})

// ─── Recent Jobs ──────────────────────────
const recentJobs = computed(() => jobs.value.slice(0, 6))

function jobStatusBadge(status: string | null) {
  const map: Record<string, string> = {
    New: 'bg-blue-100 text-blue-700',
    Replacement: 'bg-orange-100 text-orange-700',
    Upgrade: 'bg-purple-100 text-purple-700',
  }
  return map[status ?? ''] || 'bg-gray-100 text-gray-600'
}

// ─── Approval Stats ───────────────────────
const approvalStats = computed(() => [
  {
    label: 'Draft',
    count: chains.value.filter((c) => c.status === 'draft').length,
    icon: FileText,
    bg: 'bg-gray-100',
    color: 'text-gray-500',
  },
  {
    label: 'Awaiting',
    count: chains.value.filter((c) => c.status === 'pending').length,
    icon: AlertCircle,
    bg: 'bg-amber-100',
    color: 'text-amber-600',
  },
  {
    label: 'Approved',
    count: chains.value.filter((c) => c.status === 'approved').length,
    icon: CheckCircle2,
    bg: 'bg-emerald-100',
    color: 'text-emerald-600',
  },
  {
    label: 'Rejected',
    count: chains.value.filter((c) => c.status === 'rejected').length,
    icon: XCircle,
    bg: 'bg-red-100',
    color: 'text-red-500',
  },
])

// ─── Quick Links ──────────────────────────
const quickLinks = computed(() => {
  const all = [
    {
      to: '/job-requests/create',
      label: 'Create ERF',
      desc: 'New position request form',
      icon: FileText,
      bg: 'bg-blue-100',
      color: 'text-blue-700',
      permissions: ['job_request:create'],
    },
    {
      to: '/approver-master/create',
      label: 'Add Approver',
      desc: 'Register new approver',
      icon: UserCheck,
      bg: 'bg-amber-100',
      color: 'text-amber-700',
      permissions: ['approval:read'],
      adminOnly: true,
    },
    {
      to: '/recruitment',
      label: 'Hiring Dashboard',
      desc: 'Monitor positions ready for processing',
      icon: Briefcase,
      bg: 'bg-emerald-100',
      color: 'text-emerald-700',
      permissions: ['recruitment:read', 'candidate:read'],
    },
    {
      to: '/candidates',
      label: 'Candidate Form',
      desc: 'Manage candidate profiles and forms',
      icon: ClipboardList,
      bg: 'bg-indigo-100',
      color: 'text-indigo-700',
      permissions: ['candidate_data:read', 'candidate:read'],
    },
    {
      to: '/user-management/create',
      label: 'Add User',
      desc: 'Register new staff account',
      icon: Settings,
      bg: 'bg-gray-100',
      color: 'text-gray-700',
      permissions: ['user:create'],
    },
    {
      to: '/role-management',
      label: 'Configure RBAC Role',
      desc: 'Manage system access rights',
      icon: ShieldCheck,
      bg: 'bg-red-100',
      color: 'text-red-700',
      permissions: ['role:manage'],
    },
  ]
  const filtered = all.filter(
    (link) =>
      (!link.permissions || hasAnyPermission(link.permissions)) &&
      (!link.adminOnly || isAdminRole.value),
  )

  if (isCandidateRole.value) {
    return filtered.filter((link) => ['/candidates'].includes(link.to))
  }

  if (isManagerRole.value) {
    return filtered.filter((link) =>
      ['/job-requests/create', '/approver-master/create', '/recruitment'].includes(link.to),
    )
  }

  if (isAdminRole.value) {
    return filtered
  }

  return filtered.slice(0, 6)
})
</script>
