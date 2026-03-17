export type UserRole = string // Dynamically retrieved from `roles` table

export interface User {
  id: string
  email: string
  role?: UserRole
  permissions?: string[] // e.g., ['job_request:read', 'user:create']
  full_name?: string
  username?: string
  phone?: string
  avatar_url?: string
}
