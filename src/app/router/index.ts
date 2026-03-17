import { createRouter, createWebHistory } from "vue-router"

import AppLayout from "@/presentation/layouts/AppLayout.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "",
          redirect: "/dashboard",
        },
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/presentation/pages/dashboard/DashboardPage.vue"),
        },
        {
          path: "job-requests",
          name: "job-requests",
          component: () => import("@/presentation/pages/jobRequests/JobRequestList.vue"),
          meta: { requiredPermissions: ["job_request:read"] },
        },
        {
          path: "job-requests/create",
          name: "job-requests-create",
          component: () => import("@/presentation/pages/jobRequests/JobRequestFormPage.vue"),
          meta: { requiredPermissions: ["job_request:create"] },
        },
        {
          path: "job-requests/:id/edit",
          name: "job-requests-edit",
          component: () => import("@/presentation/pages/jobRequests/JobRequestFormPage.vue"),
          meta: { requiredPermissions: ["job_request:update"] },
        },
        {
          path: "applications",
          name: "applications",
          component: () => import("@/presentation/pages/candidates/CandidateList.vue"),
          meta: { requiredPermissions: ["job_request:read"] },
        },
        {
          path: "applications/create",
          name: "applications-create",
          component: () => import("@/presentation/pages/candidates/CandidateFormPage.vue"),
          meta: { requiredPermissions: ["job_request:read"] },
        },
        {
          path: "applications/:id/edit",
          name: "applications-edit",
          component: () => import("@/presentation/pages/candidates/CandidateFormPage.vue"),
          meta: { requiredPermissions: ["job_request:read"] },
        },
        {
          path: "profile",
          name: "profile",
          component: () => import("@/presentation/pages/profile/ProfilePage.vue"),
        },
        // Approval Routes
        {
          path: "approver-master",
          name: "approver-master",
          component: () => import("@/presentation/pages/approvals/ApproverMasterPage.vue"),
          meta: { requiredPermissions: ["approval:read"] },
        },
        {
          path: "approver-master/create",
          name: "approver-master-create",
          component: () => import("@/presentation/pages/approvals/ApproverMasterFormPage.vue"),
          meta: { requiredPermissions: ["approval:read"] },
        },
        {
          path: "approver-master/:id/edit",
          name: "approver-master-edit",
          component: () => import("@/presentation/pages/approvals/ApproverMasterFormPage.vue"),
          meta: { requiredPermissions: ["approval:read"] },
        },
        {
          path: "approval-tracking",
          name: "approval-tracking",
          component: () => import("@/presentation/pages/approvals/ApprovalTrackingPage.vue"),
          meta: { requiredPermissions: ["approval:read"] },
        },
        // Recruitment Routes
        {
          path: "recruitment",
          name: "recruitment",
          component: () => import("@/presentation/pages/recruitment/RecruitmentDashboardPage.vue"),
          meta: { requiredPermissions: ["candidate:read"] },
        },
        {
          path: "candidate-management",
          name: "candidate-management",
          component: () => import("@/presentation/pages/recruitment/CandidateManagementPage.vue"),
          meta: { requiredPermissions: ["candidate:read"] },
        },
        {
          path: "candidate-management/create",
          name: "candidate-management-create",
          component: () => import("@/presentation/pages/recruitment/CandidateManagementFormPage.vue"),
          meta: { requiredPermissions: ["candidate:create"] },
        },
        {
          path: "candidate-management/:id/edit",
          name: "candidate-management-edit",
          component: () => import("@/presentation/pages/recruitment/CandidateManagementFormPage.vue"),
          meta: { requiredPermissions: ["candidate:update"] },
        },
        // Admin Routes
        {
          path: "user-management",
          name: "user-management",
          component: () => import("@/presentation/pages/admin/UserManagementPage.vue"),
          meta: { requiredPermissions: ["user:read"] },
        },
        {
          path: "user-management/create",
          name: "user-management-create",
          component: () => import("@/presentation/pages/admin/UserManagementFormPage.vue"),
          meta: { requiredPermissions: ["user:create"] },
        },
        {
          path: "role-management",
          name: "role-management",
          component: () => import("@/presentation/pages/role/RoleManagementPage.vue"),
          meta: { requiredPermissions: ["role:manage"] },
        },
        {
          path: "role-management/create",
          name: "role-management-create",
          component: () => import("@/presentation/pages/role/RoleManagementFormPage.vue"),
          meta: { requiredPermissions: ["role:manage"] },
        },
        {
          path: "role-management/:id/edit",
          name: "role-management-edit",
          component: () => import("@/presentation/pages/role/RoleManagementFormPage.vue"),
          meta: { requiredPermissions: ["role:manage"] },
        },
      ],
    },
    // Public Routes (no auth)
    {
      path: "/login",
      name: "login",
      component: () => import("@/presentation/pages/auth/LoginPage.vue"),
      meta: { public: true },
    },
    {
      path: "/approve/:token",
      name: "public-approval",
      component: () => import("@/presentation/pages/approvals/PublicApprovalPage.vue"),
      meta: { public: true },
    },
  ],
})

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  // Allow public routes
  if (to.meta.public) {
    return next()
  }

  // Check auth
  const { useAuthStore } = await import("@/stores/authStore")
  const authStore = useAuthStore()

  // Wait for auth initialization
  if (authStore.isLoading) {
    await new Promise<void>((resolve) => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.isLoading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  if (!authStore.isAuthenticated) {
    return next({ name: "login" })
  }

  // Check permission-based access
  const requiredPermissions = to.meta.requiredPermissions as string[] | undefined
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!authStore.hasAnyPermission(requiredPermissions)) {
      // Redirect to dashboard if no access
      return next({ name: "dashboard" })
    }
  }

  next()
})

export default router
