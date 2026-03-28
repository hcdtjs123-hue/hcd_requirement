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
    const accessScope = await this.getAccessScope()

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select(
        `id,
         username,
         email,
         full_name,
         phone,
         avatar_url,
          created_at`,
      )
      .order('created_at', { ascending: false })

    if (profileError) throw new Error(profileError.message)

    if (!profiles || profiles.length === 0) return []

    // Get user_roles for all users
    const userIds = profiles.map((p) => p.id)
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role_id, roles(name)')
      .in('user_id', userIds)

    if (rolesError) throw new Error(rolesError.message)

    // Get emails from auth.users via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw new Error(authError.message)

    const emailMap = new Map<string, string>()
    const creatorMap = new Map<string, string | null>()
    for (const u of authData.users) {
      if (u.email) emailMap.set(u.id, u.email)
      creatorMap.set(u.id, this.extractCreatorId(u))
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

    const filteredEmployees =
      accessScope.isStaff && accessScope.userId
        ? profiles.filter((employee) => {
            const roleInfo = roleMap.get(employee.id)
            return (
              this.normalizeRoleName(roleInfo?.role_name) === 'candidate' &&
              creatorMap.get(employee.id) === accessScope.userId
            )
          })
        : profiles

    return filteredEmployees.map((employee) => {
      const roleInfo = roleMap.get(employee.id)
      return {
        id: employee.id,
        email: emailMap.get(employee.id) ?? '',
        username: employee.username ?? null,
        full_name: employee.full_name ?? null,
        phone: employee.phone ?? null,
        first_name: employee.full_name ?? null,
        middle_name: null,
        last_name: null,
        main_position: null,
        hire_location: null,
        date_of_birth: null,
        place_of_birth: null,
        nationality: null,
        marital_status: null,
        religion: null,
        gender: null,
        ethnic: null,
        blood_type: null,
        no_id: null,
        employee_code: null,
        department: null,
        employment_type: null,
        employment_start_date: null,
        emergency_contact_name: null,
        emergency_contact_phone: employee.phone ?? null,
        custom_grup_1_id: null,
        custom_grup_2_id: null,
        custom_grup_3_id: null,
        custom_grup_4_id: null,
        custom_grup_5_id: null,
        custom_grup_6_id: null,
        is_active: true,
        role: (roleInfo?.role_name as UserRole) ?? null,
        role_id: roleInfo?.role_id ?? null,
        created_at: employee.created_at ?? null,
        updated_at: null,
      }
    })
  }

  async getRoles(): Promise<RoleOption[]> {
    const accessScope = await this.getAccessScope()
    const { data, error } = await supabase
      .from('roles')
      .select('id, name, description')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)

    const roles = data ?? []
    if (!accessScope.isStaff) {
      return roles
    }

    return roles.filter((role) => this.normalizeRoleName(role.name) === 'candidate')
  }

  async createUser(input: CreateUserInput): Promise<ManagedUser> {
    const accessScope = await this.getAccessScope()
    const roleName = await this.getRoleNameById(input.role_id)

    if (accessScope.isStaff && roleName !== 'candidate') {
      throw new Error('Staff can only create users with the candidate role.')
    }

    // 1. Create auth user via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: accessScope.userId
        ? {
            created_by: accessScope.userId,
          }
        : undefined,
    })

    if (authError) throw new Error(authError.message)
    if (!authData.user) throw new Error('Failed to create user account.')

    const userId = authData.user.id
    const fullName = input.full_name.trim()

    // 2. Update employee (trigger already inserts, so we update)
    const { error: employeeError } = await supabase
      .from('profiles')
      .update({
        username: input.username,
        email: input.email,
        full_name: fullName,
        phone: input.phone?.trim() || null,
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
    return {
      id: userId,
      email: input.email,
      username: input.username,
      full_name: fullName,
      phone: input.phone?.trim() || null,
      first_name: fullName,
      middle_name: null,
      last_name: null,
      main_position: null,
      hire_location: null,
      date_of_birth: null,
      place_of_birth: null,
      nationality: null,
      marital_status: null,
      religion: null,
      gender: null,
      ethnic: null,
      blood_type: null,
      no_id: null,
      employee_code: null,
      department: null,
      employment_type: null,
      employment_start_date: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      custom_grup_1_id: null,
      custom_grup_2_id: null,
      custom_grup_3_id: null,
      custom_grup_4_id: null,
      custom_grup_5_id: null,
      custom_grup_6_id: null,
      is_active: true,
      role: (roleName as UserRole) ?? null,
      role_id: input.role_id,
      created_at: new Date().toISOString(),
      updated_at: null,
    }
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<ManagedUser> {
    const accessScope = await this.getAccessScope()
    const roleName = await this.getRoleNameById(input.role_id)

    await this.assertCanManageUser(userId, accessScope)

    if (accessScope.isStaff && roleName !== 'candidate') {
      throw new Error('Staff can only save users with the candidate role.')
    }

    const authPayload: { email: string; password?: string } = {
      email: input.email,
    }

    if (input.password?.trim()) {
      authPayload.password = input.password.trim()
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(userId, authPayload)
    if (authError) throw new Error(authError.message)
    const fullName = input.full_name.trim()

    const { error: employeeError } = await supabase
      .from('profiles')
      .update({
        username: input.username,
        email: input.email,
        full_name: fullName,
        phone: input.phone?.trim() || null,
      })
      .eq('id', userId)

    if (employeeError) throw new Error(employeeError.message)

    const { error: deleteError } = await supabase.from('user_roles').delete().eq('user_id', userId)

    if (deleteError) throw new Error(deleteError.message)

    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: input.role_id })

    if (insertError) throw new Error(insertError.message)

    return {
      id: userId,
      email: input.email,
      username: input.username,
      full_name: fullName,
      phone: input.phone?.trim() || null,
      first_name: fullName,
      middle_name: null,
      last_name: null,
      main_position: null,
      hire_location: null,
      date_of_birth: null,
      place_of_birth: null,
      nationality: null,
      marital_status: null,
      religion: null,
      gender: null,
      ethnic: null,
      blood_type: null,
      no_id: null,
      employee_code: null,
      department: null,
      employment_type: null,
      employment_start_date: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      custom_grup_1_id: null,
      custom_grup_2_id: null,
      custom_grup_3_id: null,
      custom_grup_4_id: null,
      custom_grup_5_id: null,
      custom_grup_6_id: null,
      is_active: true,
      role: (roleName as UserRole) ?? null,
      role_id: input.role_id,
      created_at: null,
      updated_at: null,
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const accessScope = await this.getAccessScope()
    await this.assertCanManageUser(userId, accessScope)

    // Delete from auth (cascades to employees and user_roles)
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw new Error(error.message)
  }

  async updateUserRole(userId: string, roleId: string): Promise<void> {
    const accessScope = await this.getAccessScope()
    const roleName = await this.getRoleNameById(roleId)

    await this.assertCanManageUser(userId, accessScope)

    if (accessScope.isStaff && roleName !== 'candidate') {
      throw new Error('Staff can only assign the candidate role.')
    }

    // Remove old role
    const { error: deleteError } = await supabase.from('user_roles').delete().eq('user_id', userId)

    if (deleteError) throw new Error(deleteError.message)

    // Insert new role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId })

    if (insertError) throw new Error(insertError.message)
  }

  private async getAccessScope() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw new Error(userError.message)
    }

    if (!user) {
      return {
        isStaff: false,
        roleName: null as string | null,
        userId: null as string | null,
      }
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .maybeSingle()

    if (roleError) {
      throw new Error(roleError.message)
    }

    const roleName = (roleData as { roles?: { name?: string } | null } | null)?.roles?.name ?? null

    return {
      isStaff: this.isStaffRole(roleName),
      roleName,
      userId: user.id,
    }
  }

  private async getRoleNameById(roleId: string) {
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', roleId)
      .single()

    if (roleError) {
      throw new Error(roleError.message)
    }

    return this.normalizeRoleName(roleData?.name)
  }

  private async assertCanManageUser(
    userId: string,
    accessScope: { isStaff: boolean; userId: string | null },
  ) {
    if (!accessScope.isStaff || !accessScope.userId) {
      return
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)
      .maybeSingle()

    if (roleError) {
      throw new Error(roleError.message)
    }

    const targetRoleName = this.normalizeRoleName(
      (roleData as { roles?: { name?: string } | null } | null)?.roles?.name,
    )

    if (targetRoleName !== 'candidate') {
      throw new Error('Staff can only manage users with the candidate role.')
    }

    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw new Error(authError.message)

    const targetUser = authData.users.find((item) => item.id === userId)
    if (!targetUser) {
      throw new Error('User account was not found.')
    }

    if (this.extractCreatorId(targetUser) !== accessScope.userId) {
      throw new Error('You can only manage candidate accounts that you created.')
    }
  }

  private extractCreatorId(user: { app_metadata?: unknown; user_metadata?: unknown }) {
    const userMetadata = (user.user_metadata ?? {}) as Record<string, unknown>
    const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>

    const creatorId = userMetadata.created_by ?? appMetadata.created_by
    return typeof creatorId === 'string' && creatorId.trim() ? creatorId : null
  }

  private normalizeRoleName(roleName: unknown) {
    return String(roleName ?? '')
      .toLowerCase()
      .trim()
  }

  private isStaffRole(roleName: unknown) {
    return this.normalizeRoleName(roleName).startsWith('staff')
  }
}
