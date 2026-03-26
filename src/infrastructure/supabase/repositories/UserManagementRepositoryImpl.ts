import { supabase } from '@/infrastructure/supabase/client'
import type {
  ManagedUser,
  CreateUserInput,
  RoleOption,
  UpdateUserInput,
} from '@/domain/entities/ManagedUser'
import type { UserManagementRepository } from '@/domain/repositories/UserManagementRepository'
import type { UserRole } from '@/domain/entities/User'

export class UserManagementRepositoryImpl implements UserManagementRepository {
  async getAllUsers(): Promise<ManagedUser[]> {
    // Get all employees with their roles
    const { data: employees, error: employeeError } = await supabase
      .from('employees')
      .select(
        `id,
         username,
         email,
         first_name,
         middle_name,
         last_name,
         main_position,
         hire_location,
         date_of_birth,
         place_of_birth,
         nationality,
         marital_status,
         religion,
         gender,
        ethnic,
        blood_type,
        no_id,
        employee_code,
         department,
         employment_type,
         employment_start_date,
         emergency_contact_name,
          emergency_contact_phone,
          custom_grup_1_id,
          custom_grup_2_id,
          custom_grup_3_id,
          custom_grup_4_id,
          custom_grup_5_id,
          custom_grup_6_id,
          is_active,
          created_at,
          updated_at`,
      )
      .order('created_at', { ascending: false })

    if (employeeError) throw new Error(employeeError.message)

    if (!employees || employees.length === 0) return []

    // Get user_roles for all users
    const userIds = employees.map((p) => p.id)
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role_id, roles(name)')
      .in('user_id', userIds)

    if (rolesError) throw new Error(rolesError.message)

    // Get emails from auth.users via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw new Error(authError.message)

    const emailMap = new Map<string, string>()
    for (const u of authData.users) {
      if (u.email) emailMap.set(u.id, u.email)
    }

    // Map roles by user_id
    const roleMap = new Map<string, { role_id: string; role_name: string }>()
    if (userRoles) {
      for (const ur of userRoles) {
        const roleName = (ur as Record<string, unknown>).roles
          ? ((ur as Record<string, unknown>).roles as { name: string }).name
          : null
        roleMap.set(ur.user_id, {
          role_id: ur.role_id,
          role_name: roleName ?? '',
        })
      }
    }

    return employees.map((employee) => {
      const roleInfo = roleMap.get(employee.id)
      return {
        id: employee.id,
        email: emailMap.get(employee.id) ?? '',
        username: employee.username ?? null,
        first_name: employee.first_name ?? null,
        middle_name: employee.middle_name ?? null,
        last_name: employee.last_name ?? null,
        main_position: employee.main_position ?? null,
        hire_location: employee.hire_location ?? null,
        date_of_birth: employee.date_of_birth ?? null,
        place_of_birth: employee.place_of_birth ?? null,
        nationality: employee.nationality ?? null,
        marital_status: employee.marital_status ?? null,
        religion: employee.religion ?? null,
        gender: employee.gender ?? null,
        ethnic: employee.ethnic ?? null,
        blood_type: employee.blood_type ?? null,
        no_id: employee.no_id ?? null,
        employee_code: employee.employee_code ?? null,
        department: employee.department ?? null,
        employment_type: employee.employment_type ?? null,
        employment_start_date: employee.employment_start_date ?? null,
        emergency_contact_name: employee.emergency_contact_name ?? null,
        emergency_contact_phone: employee.emergency_contact_phone ?? null,
        custom_grup_1_id: employee.custom_grup_1_id ?? null,
        custom_grup_2_id: employee.custom_grup_2_id ?? null,
        custom_grup_3_id: employee.custom_grup_3_id ?? null,
        custom_grup_4_id: employee.custom_grup_4_id ?? null,
        custom_grup_5_id: employee.custom_grup_5_id ?? null,
        custom_grup_6_id: employee.custom_grup_6_id ?? null,
        is_active: employee.is_active ?? null,
        role: (roleInfo?.role_name as UserRole) ?? null,
        role_id: roleInfo?.role_id ?? null,
        created_at: employee.created_at ?? null,
        updated_at: employee.updated_at ?? null,
      }
    })
  }

  async getRoles(): Promise<RoleOption[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('id, name, description')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return data ?? []
  }

  async createUser(input: CreateUserInput): Promise<ManagedUser> {
    // 1. Create auth user via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    })

    if (authError) throw new Error(authError.message)
    if (!authData.user) throw new Error('Failed to create user account.')

    const userId = authData.user.id

    // 2. Update employee (trigger already inserts, so we update)
    const { error: employeeError } = await supabase
      .from('employees')
      .update({
        username: input.username,
        email: input.email,
        first_name: input.first_name,
        middle_name: input.middle_name,
        last_name: input.last_name,
        main_position: input.main_position,
        hire_location: input.hire_location,
        date_of_birth: input.date_of_birth || null,
        place_of_birth: input.place_of_birth,
        nationality: input.nationality,
        marital_status: input.marital_status,
        religion: input.religion,
        gender: input.gender,
        ethnic: input.ethnic,
        blood_type: input.blood_type,
        no_id: input.no_id,
        employee_code: input.employee_code ?? null,
        department: input.department ?? null,
        employment_type: input.employment_type ?? null,
        employment_start_date: input.employment_start_date || null,
        emergency_contact_name: input.emergency_contact_name ?? null,
        emergency_contact_phone: input.emergency_contact_phone ?? null,
        custom_grup_1_id: input.custom_grup_1_id ?? null,
        custom_grup_2_id: input.custom_grup_2_id ?? null,
        custom_grup_3_id: input.custom_grup_3_id ?? null,
        custom_grup_4_id: input.custom_grup_4_id ?? null,
        custom_grup_5_id: input.custom_grup_5_id ?? null,
        custom_grup_6_id: input.custom_grup_6_id ?? null,
        is_active: input.is_active ?? true,
      })
      .eq('id', userId)

    if (employeeError) throw new Error(employeeError.message)

    // 3. Assign role
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: userId,
      role_id: input.role_id,
    })

    if (roleError) throw new Error(roleError.message)

    // 4. Get the role name
    const { data: roleData } = await supabase
      .from('roles')
      .select('name')
      .eq('id', input.role_id)
      .single()

    return {
      id: userId,
      email: input.email,
      username: input.username,
      first_name: input.first_name,
      middle_name: input.middle_name,
      last_name: input.last_name,
      main_position: input.main_position,
      hire_location: input.hire_location,
      date_of_birth: input.date_of_birth,
      place_of_birth: input.place_of_birth,
      nationality: input.nationality,
      marital_status: input.marital_status,
      religion: input.religion,
      gender: input.gender,
      ethnic: input.ethnic,
      blood_type: input.blood_type,
      no_id: input.no_id,
      employee_code: input.employee_code ?? null,
      department: input.department ?? null,
      employment_type: input.employment_type ?? null,
      employment_start_date: input.employment_start_date ?? null,
      emergency_contact_name: input.emergency_contact_name ?? null,
      emergency_contact_phone: input.emergency_contact_phone ?? null,
      custom_grup_1_id: input.custom_grup_1_id ?? null,
      custom_grup_2_id: input.custom_grup_2_id ?? null,
      custom_grup_3_id: input.custom_grup_3_id ?? null,
      custom_grup_4_id: input.custom_grup_4_id ?? null,
      custom_grup_5_id: input.custom_grup_5_id ?? null,
      custom_grup_6_id: input.custom_grup_6_id ?? null,
      is_active: input.is_active ?? true,
      role: (roleData?.name as UserRole) ?? null,
      role_id: input.role_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<ManagedUser> {
    const authPayload: { email: string; password?: string } = {
      email: input.email,
    }

    if (input.password?.trim()) {
      authPayload.password = input.password.trim()
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(userId, authPayload)
    if (authError) throw new Error(authError.message)

    const { error: employeeError } = await supabase
      .from('employees')
      .update({
        username: input.username,
        email: input.email,
        first_name: input.first_name,
        middle_name: input.middle_name,
        last_name: input.last_name,
        main_position: input.main_position,
        hire_location: input.hire_location,
        date_of_birth: input.date_of_birth || null,
        place_of_birth: input.place_of_birth,
        nationality: input.nationality,
        marital_status: input.marital_status,
        religion: input.religion,
        gender: input.gender,
        ethnic: input.ethnic,
        blood_type: input.blood_type,
        no_id: input.no_id,
        employee_code: input.employee_code ?? null,
        department: input.department ?? null,
        employment_type: input.employment_type ?? null,
        employment_start_date: input.employment_start_date || null,
        emergency_contact_name: input.emergency_contact_name ?? null,
        emergency_contact_phone: input.emergency_contact_phone ?? null,
        custom_grup_1_id: input.custom_grup_1_id ?? null,
        custom_grup_2_id: input.custom_grup_2_id ?? null,
        custom_grup_3_id: input.custom_grup_3_id ?? null,
        custom_grup_4_id: input.custom_grup_4_id ?? null,
        custom_grup_5_id: input.custom_grup_5_id ?? null,
        custom_grup_6_id: input.custom_grup_6_id ?? null,
        is_active: input.is_active ?? true,
      })
      .eq('id', userId)

    if (employeeError) throw new Error(employeeError.message)

    const { error: deleteError } = await supabase.from('user_roles').delete().eq('user_id', userId)

    if (deleteError) throw new Error(deleteError.message)

    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: input.role_id })

    if (insertError) throw new Error(insertError.message)

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', input.role_id)
      .single()

    if (roleError) throw new Error(roleError.message)

    return {
      id: userId,
      email: input.email,
      username: input.username,
      first_name: input.first_name,
      middle_name: input.middle_name,
      last_name: input.last_name,
      main_position: input.main_position,
      hire_location: input.hire_location,
      date_of_birth: input.date_of_birth,
      place_of_birth: input.place_of_birth,
      nationality: input.nationality,
      marital_status: input.marital_status,
      religion: input.religion,
      gender: input.gender,
      ethnic: input.ethnic,
      blood_type: input.blood_type,
      no_id: input.no_id,
      employee_code: input.employee_code ?? null,
      department: input.department ?? null,
      employment_type: input.employment_type ?? null,
      employment_start_date: input.employment_start_date ?? null,
      emergency_contact_name: input.emergency_contact_name ?? null,
      emergency_contact_phone: input.emergency_contact_phone ?? null,
      custom_grup_1_id: input.custom_grup_1_id ?? null,
      custom_grup_2_id: input.custom_grup_2_id ?? null,
      custom_grup_3_id: input.custom_grup_3_id ?? null,
      custom_grup_4_id: input.custom_grup_4_id ?? null,
      custom_grup_5_id: input.custom_grup_5_id ?? null,
      custom_grup_6_id: input.custom_grup_6_id ?? null,
      is_active: input.is_active ?? true,
      role: (roleData?.name as UserRole) ?? null,
      role_id: input.role_id,
      created_at: null,
      updated_at: new Date().toISOString(),
    }
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete from auth (cascades to employees and user_roles)
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw new Error(error.message)
  }

  async updateUserRole(userId: string, roleId: string): Promise<void> {
    // Remove old role
    const { error: deleteError } = await supabase.from('user_roles').delete().eq('user_id', userId)

    if (deleteError) throw new Error(deleteError.message)

    // Insert new role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId })

    if (insertError) throw new Error(insertError.message)
  }
}
