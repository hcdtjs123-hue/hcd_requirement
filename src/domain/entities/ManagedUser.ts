import type { UserRole } from '@/domain/entities/User'

export interface ManagedUser {
  id: string
  email: string
  username: string | null
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  main_position: string | null
  hire_location: string | null
  date_of_birth: string | null
  place_of_birth: string | null
  nationality: string | null
  marital_status: string | null
  religion: string | null
  gender: string | null
  ethnic: string | null
  blood_type: string | null
  no_id: string | null
  employee_code: string | null
  department: string | null
  employment_type: string | null
  employment_start_date: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  custom_grup_1_id: string | null
  custom_grup_2_id: string | null
  custom_grup_3_id: string | null
  custom_grup_4_id: string | null
  custom_grup_5_id: string | null
  custom_grup_6_id: string | null
  is_active: boolean | null
  role: UserRole | null
  role_id: string | null
  created_at: string | null
  updated_at: string | null
}

export interface CreateUserInput {
  email: string
  username: string
  password: string
  first_name: string
  middle_name: string
  last_name: string
  main_position: string
  hire_location: string
  date_of_birth: string
  place_of_birth: string
  nationality: string
  marital_status: string
  religion: string
  gender: string
  ethnic: string
  blood_type: string
  no_id: string
  employee_code?: string
  department?: string
  employment_type?: string
  employment_start_date?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  custom_grup_1_id: string | null
  custom_grup_2_id: string | null
  custom_grup_3_id: string | null
  custom_grup_4_id: string | null
  custom_grup_5_id: string | null
  custom_grup_6_id: string | null
  is_active?: boolean
  role_id: string
}

export interface UpdateUserInput {
  email: string
  username: string
  password?: string
  first_name: string
  middle_name: string
  last_name: string
  main_position: string
  hire_location: string
  date_of_birth: string
  place_of_birth: string
  nationality: string
  marital_status: string
  religion: string
  gender: string
  ethnic: string
  blood_type: string
  no_id: string
  employee_code?: string
  department?: string
  employment_type?: string
  employment_start_date?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  custom_grup_1_id: string | null
  custom_grup_2_id: string | null
  custom_grup_3_id: string | null
  custom_grup_4_id: string | null
  custom_grup_5_id: string | null
  custom_grup_6_id: string | null
  is_active?: boolean
  role_id: string
}

export interface RoleOption {
  id: string
  name: string
  description: string | null
}
