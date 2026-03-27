import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/presentation/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/presentation/pages/dashboard/DashboardPage.vue'),
        },
        {
          path: 'job-requests',
          name: 'job-requests',
          component: () => import('@/presentation/pages/jobRequests/JobRequestList.vue'),
          meta: { requiredPermissions: ['job_request:read'] },
        },
        {
          path: 'job-requests/create',
          name: 'job-requests-create',
          component: () => import('@/presentation/pages/jobRequests/JobRequestFormPage.vue'),
          meta: { requiredPermissions: ['job_request:create'] },
        },
        {
          path: 'job-requests/:id',
          name: 'job-requests-detail',
          component: () => import('@/presentation/pages/jobRequests/JobRequestFormPage.vue'),
          meta: { requiredPermissions: ['job_request:read'] },
        },
        {
          path: 'job-requests/:id/edit',
          name: 'job-requests-edit',
          component: () => import('@/presentation/pages/jobRequests/JobRequestFormPage.vue'),
          meta: { requiredPermissions: ['job_request:update'] },
        },
        {
          path: 'candidates',
          name: 'candidates',
          component: () => import('@/presentation/pages/candidates/CandidateList.vue'),
          meta: { requiredPermissions: ['candidate_data:read', 'candidate:read'] },
        },
        {
          path: 'candidates/create',
          name: 'candidates-create',
          component: () => import('@/presentation/pages/candidates/CandidateFormPage.vue'),
          meta: { requiredPermissions: ['candidate_data:create', 'candidate:create'] },
        },
        {
          path: 'candidates/:id/edit',
          name: 'candidates-edit',
          component: () => import('@/presentation/pages/candidates/CandidateFormPage.vue'),
          meta: { requiredPermissions: ['candidate_data:update', 'candidate:update'] },
        },
        {
          path: 'applications',
          redirect: '/candidates',
        },
        {
          path: 'applications/create',
          redirect: '/candidates/create',
        },
        {
          path: 'applications/:id/edit',
          redirect: (to) => `/candidates/${to.params.id}/edit`,
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/presentation/pages/profile/ProfilePage.vue'),
        },
        // Approval Routes
        {
          path: 'approver-master',
          name: 'approver-master',
          component: () => import('@/presentation/pages/approvals/ApproverMasterPage.vue'),
          meta: {
            requiredPermissions: ['approval:read'],
            allowedRoles: ['admin', 'administrator', 'super admin', 'super_admin'],
          },
        },
        {
          path: 'approver-master/configure',
          name: 'approver-master-configure',
          component: () => import('@/presentation/pages/approvals/ApproverMasterFormPage.vue'),
          meta: {
            requiredPermissions: ['approval:read'],
            allowedRoles: ['admin', 'administrator', 'super admin', 'super_admin'],
          },
        },
        {
          path: 'approver-master/:id/edit',
          name: 'approver-master-edit',
          component: () => import('@/presentation/pages/approvals/ApproverMasterFormPage.vue'),
          meta: {
            requiredPermissions: ['approval:read'],
            allowedRoles: ['admin', 'administrator', 'super admin', 'super_admin'],
          },
        },
        {
          path: 'approval-tracking',
          name: 'approval-tracking',
          component: () => import('@/presentation/pages/approvals/ApprovalTrackingPage.vue'),
        },
        // Recruitment Routes
        {
          path: 'recruitment',
          name: 'recruitment',
          component: () => import('@/presentation/pages/recruitment/RecruitmentDashboardPage.vue'),
          meta: { requiredPermissions: ['recruitment:read', 'candidate:read'] },
        },
        {
          path: 'candidate-management',
          redirect: '/candidates',
        },
        // Admin Routes
        {
          path: 'user-management',
          name: 'user-management',
          component: () => import('@/presentation/pages/admin/UserManagementPage.vue'),
          meta: { requiredPermissions: ['user:read'] },
        },
        {
          path: 'user-management/create',
          name: 'user-management-create',
          component: () => import('@/presentation/pages/admin/UserManagementFormPage.vue'),
          meta: { requiredPermissions: ['user:create'] },
        },
        {
          path: 'user-management/:id/edit',
          name: 'user-management-edit',
          component: () => import('@/presentation/pages/admin/UserManagementFormPage.vue'),
          meta: { requiredPermissions: ['user:update'] },
        },
        {
          path: 'custom-group-management',
          name: 'custom-group-management',
          component: () => import('@/presentation/pages/admin/CustomGroupManagementPage.vue'),
          meta: {
            requiredPermissions: ['user:read'],
            allowedRoles: ['admin', 'administrator', 'super admin', 'super_admin'],
          },
        },
        {
          path: 'master-data-management',
          name: 'master-data-management',
          component: () => import('@/presentation/pages/admin/MasterDataManagementPage.vue'),
          meta: {
            requiredPermissions: ['user:read'],
            allowedRoles: ['admin', 'administrator', 'super admin', 'super_admin'],
          },
        },
        {
          path: 'role-management',
          name: 'role-management',
          component: () => import('@/presentation/pages/role/RoleManagementPage.vue'),
          meta: { requiredPermissions: ['role:manage'] },
        },
        {
          path: 'role-management/create',
          name: 'role-management-create',
          component: () => import('@/presentation/pages/role/RoleManagementFormPage.vue'),
          meta: { requiredPermissions: ['role:manage'] },
        },
        {
          path: 'role-management/:id/edit',
          name: 'role-management-edit',
          component: () => import('@/presentation/pages/role/RoleManagementFormPage.vue'),
          meta: { requiredPermissions: ['role:manage'] },
        },
      ],
    },
    // Public Routes (no auth)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/presentation/pages/auth/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/candidate-decision',
      name: 'public-candidate-decision',
      component: () => import('@/presentation/pages/recruitment/PublicCandidateDecisionPage.vue'),
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
  const { useAuthStore } = await import('@/stores/authStore')
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
    return next({
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    })
  }

  // Check permission-based access
  const requiredPermissions = to.meta.requiredPermissions as string[] | undefined
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!authStore.hasAnyPermission(requiredPermissions)) {
      // Redirect to dashboard if no access
      return next({ name: 'dashboard' })
    }
  }

  const allowedRoles = to.meta.allowedRoles as string[] | undefined
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedRole = String(authStore.userRole ?? '').toLowerCase()
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase())

    if (!normalizedAllowedRoles.includes(normalizedRole)) {
      return next({ name: 'dashboard' })
    }
  }

  next()
})

export default router
