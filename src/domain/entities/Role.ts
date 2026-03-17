export interface Permission {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface Role {
  id: string
  name: string
  description?: string
  created_at: string
  permissions?: Permission[]
}

export interface RolePermissionInput {
  role_id: string
  permission_ids: string[]
}
