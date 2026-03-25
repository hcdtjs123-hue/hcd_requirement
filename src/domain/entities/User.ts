export type UserRole = string // Dynamically retrieved from `roles` table

export interface User {
  id: string
  email: string
  role?: UserRole
  permissions?: string[] // e.g., ['job_request:read', 'user:create']
  username?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  main_position?: string
  hire_location?: string
  date_of_birth?: string
  place_of_birth?: string
  nationality?: string
  marital_status?: string
  religion?: string
  gender?: string
  ethnic?: string
  blood_type?: string
  avatar_url?: string
}
