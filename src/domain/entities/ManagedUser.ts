import type { UserRole } from "@/domain/entities/User"

export interface ManagedUser {
  id: string
  email: string
  username: string | null
  full_name: string | null
  phone: string | null
  role: UserRole | null
  role_id: string | null
  created_at: string | null
}

export interface CreateUserInput {
  email: string
  username: string
  password: string
  full_name: string
  role_id: string
}

export interface RoleOption {
  id: string
  name: string
  description: string | null
}
