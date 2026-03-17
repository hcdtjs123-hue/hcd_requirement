<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-8 text-gray-900">

    <!-- Header -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Overview</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">
          Selamat datang, <span class="font-medium text-gray-800">{{ user?.email }}</span> —
          <span class="font-semibold text-blue-600 uppercase">{{ userRole }}</span>
        </p>
      </div>
      <p class="text-xs text-gray-400">{{ currentDate }}</p>
    </div>

    <!-- KPI Cards -->
    <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="kpi in kpiCards"
        :key="kpi.label"
        class="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-gray-400">{{ kpi.label }}</p>
            <p class="mt-2 text-3xl font-bold text-gray-900">{{ kpi.value }}</p>
          </div>
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl" :class="kpi.bg">
            <component :is="kpi.icon" class="h-5 w-5" :class="kpi.color" />
          </div>
        </div>
        <p class="mt-3 text-xs text-gray-500">{{ kpi.sub }}</p>
        <div class="absolute bottom-0 left-0 h-1 w-full" :class="kpi.bar" />
      </div>
    </section>

    <!-- Main Content Grid -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Job Requests Terbaru -->
      <div class="lg:col-span-2 rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div class="flex items-center gap-2">
            <FileText class="h-4 w-4 text-blue-600" />
            <h2 class="text-sm font-semibold text-gray-900">Job Requests Terbaru</h2>
          </div>
          <RouterLink to="/job-requests" class="text-xs text-blue-600 hover:underline">Lihat semua →</RouterLink>
        </div>
        <div class="divide-y divide-gray-50">
          <div
            v-for="job in recentJobs"
            :key="job.id"
            class="flex items-center justify-between px-6 py-4 transition hover:bg-gray-50"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900">{{ job.main_position || '-' }}</p>
              <p class="mt-0.5 truncate text-xs text-gray-500">{{ job.designation || '-' }} • {{ job.site || '-' }}</p>
            </div>
            <span
              class="ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              :class="jobStatusBadge(job.position_status)"
            >{{ job.position_status || 'Draft' }}</span>
          </div>
          <div v-if="recentJobs.length === 0" class="px-6 py-10 text-center text-sm text-gray-400">
            Belum ada job request.
          </div>
        </div>
      </div>

      <!-- Status Approval -->
      <div class="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <CheckSquare class="h-4 w-4 text-emerald-600" />
          <h2 class="text-sm font-semibold text-gray-900">Status Approval</h2>
        </div>
        <div class="space-y-3 p-5">
          <div
            v-for="stat in approvalStats"
            :key="stat.label"
            class="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3"
          >
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" :class="stat.bg">
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
          class="mx-5 mb-5 flex items-center justify-center rounded-2xl border border-gray-200 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Lihat Approval Tracking
        </RouterLink>
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Kandidat Pipeline -->
      <div class="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div class="flex items-center gap-2">
            <Users class="h-4 w-4 text-purple-600" />
            <h2 class="text-sm font-semibold text-gray-900">Pipeline Kandidat</h2>
          </div>
          <RouterLink to="/candidate-management" class="text-xs text-blue-600 hover:underline">Lihat semua →</RouterLink>
        </div>
        <div class="space-y-2 p-5">
          <div
            v-for="stage in candidatePipeline"
            :key="stage.label"
            class="flex items-center gap-3"
          >
            <p class="w-36 shrink-0 text-xs text-gray-500">{{ stage.label }}</p>
            <div class="flex-1 overflow-hidden rounded-full bg-gray-100 h-2">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="stage.barColor"
                :style="{ width: totalCandidates > 0 ? `${(stage.count / totalCandidates) * 100}%` : '0%' }"
              />
            </div>
            <p class="w-6 shrink-0 text-right text-xs font-semibold text-gray-700">{{ stage.count }}</p>
          </div>
          <p v-if="totalCandidates === 0" class="py-4 text-center text-sm text-gray-400">
            Belum ada data kandidat.
          </p>
        </div>
      </div>

      <!-- Akses Cepat -->
      <div class="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <LayoutDashboard class="h-4 w-4 text-gray-600" />
          <h2 class="text-sm font-semibold text-gray-900">Akses Cepat</h2>
        </div>
        <div class="grid grid-cols-2 gap-3 p-5">
          <RouterLink
            v-for="card in quickLinks"
            :key="card.to"
            :to="card.to"
            class="flex flex-col items-start gap-2.5 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
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
import { computed } from "vue"
import { RouterLink } from "vue-router"
import {
  FileText,
  CheckSquare,
  Users,
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
} from "lucide-vue-next"

import { useAuthViewModel } from "@/viewmodels/useAuthViewModel"
import { useJobRequestViewModel } from "@/viewmodels/useJobRequestViewModel"
import { useApprovalViewModel } from "@/viewmodels/useApprovalViewModel"
import { useRecruitmentTrackingViewModel } from "@/viewmodels/useRecruitmentTrackingViewModel"

const { user, userRole, hasAnyPermission } = useAuthViewModel()
const { jobs } = useJobRequestViewModel()
const { chains } = useApprovalViewModel()
const { invitations } = useRecruitmentTrackingViewModel()

const currentDate = computed(() =>
  new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
)

// ─── KPI Cards ────────────────────────────
const kpiCards = computed(() => [
  {
    label: "Total Job Request",
    value: jobs.value.length,
    sub: "Semua permintaan posisi",
    icon: FileText,
    bg: "bg-blue-50",
    color: "text-blue-600",
    bar: "bg-blue-500",
  },
  {
    label: "Menunggu Approval",
    value: chains.value.filter((c) => c.status === "pending").length,
    sub: "Perlu tindakan approver",
    icon: Clock,
    bg: "bg-amber-50",
    color: "text-amber-600",
    bar: "bg-amber-500",
  },
  {
    label: "Approved",
    value: chains.value.filter((c) => c.status === "approved").length,
    sub: "Siap diproses rekrutmen",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    bar: "bg-emerald-500",
  },
  {
    label: "Total Kandidat",
    value: invitations.value.length,
    sub: "Dalam pipeline rekrutmen",
    icon: Users,
    bg: "bg-purple-50",
    color: "text-purple-600",
    bar: "bg-purple-500",
  },
])

// ─── Recent Jobs ──────────────────────────
const recentJobs = computed(() => jobs.value.slice(0, 6))

function jobStatusBadge(status: string | null) {
  const map: Record<string, string> = {
    New: "bg-blue-100 text-blue-700",
    Replacement: "bg-orange-100 text-orange-700",
    Upgrade: "bg-purple-100 text-purple-700",
  }
  return map[status ?? ""] || "bg-gray-100 text-gray-600"
}

// ─── Approval Stats ───────────────────────
const approvalStats = computed(() => [
  {
    label: "Draft",
    count: chains.value.filter((c) => c.status === "draft").length,
    icon: FileText,
    bg: "bg-gray-100",
    color: "text-gray-500",
  },
  {
    label: "Menunggu",
    count: chains.value.filter((c) => c.status === "pending").length,
    icon: AlertCircle,
    bg: "bg-amber-100",
    color: "text-amber-600",
  },
  {
    label: "Disetujui",
    count: chains.value.filter((c) => c.status === "approved").length,
    icon: CheckCircle2,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
  {
    label: "Ditolak",
    count: chains.value.filter((c) => c.status === "rejected").length,
    icon: XCircle,
    bg: "bg-red-100",
    color: "text-red-500",
  },
])

// ─── Candidate Pipeline ───────────────────
const totalCandidates = computed(() => invitations.value.length)

const candidatePipeline = computed(() => [
  { label: "Diundang", count: invitations.value.filter((i) => i.status === "invited").length, barColor: "bg-gray-400" },
  { label: "Cred. Terkirim", count: invitations.value.filter((i) => i.status === "credentials_sent").length, barColor: "bg-blue-400" },
  { label: "Isi Form", count: invitations.value.filter((i) => i.status === "form_in_progress").length, barColor: "bg-amber-400" },
  { label: "Form Selesai", count: invitations.value.filter((i) => i.status === "form_completed").length, barColor: "bg-indigo-500" },
  { label: "Interview", count: invitations.value.filter((i) => i.status === "interview_scheduled").length, barColor: "bg-purple-500" },
  { label: "Dikonfirmasi", count: invitations.value.filter((i) => i.status === "confirmed").length, barColor: "bg-emerald-500" },
])

// ─── Quick Links ──────────────────────────
const quickLinks = computed(() => {
  const all = [
    { to: "/job-requests/create", label: "Buat Job Request", desc: "Form permintaan posisi baru", icon: FileText, bg: "bg-blue-100", color: "text-blue-700", permissions: ["job_request:create"] },
    { to: "/approver-master/create", label: "Tambah Approver", desc: "Daftarkan approver baru", icon: UserCheck, bg: "bg-amber-100", color: "text-amber-700", permissions: ["approval:read"] },
    { to: "/recruitment", label: "Review Rekrutmen", desc: "Approve job request masuk", icon: Briefcase, bg: "bg-emerald-100", color: "text-emerald-700", permissions: ["candidate:read"] },
    { to: "/candidate-management/create", label: "Tambah Kandidat", desc: "Undang kandidat baru", icon: ClipboardList, bg: "bg-purple-100", color: "text-purple-700", permissions: ["candidate:create"] },
    { to: "/user-management/create", label: "Tambah User", desc: "Daftarkan akun staf baru", icon: Settings, bg: "bg-gray-100", color: "text-gray-700", permissions: ["user:create"] },
    { to: "/role-management", label: "Atur Role RBAC", desc: "Kelola hak akses system", icon: ShieldCheck, bg: "bg-red-100", color: "text-red-700", permissions: ["role:manage"] },
  ]
  return all.filter((link) => !link.permissions || hasAnyPermission(link.permissions))
})
</script>
