import { supabase } from "@/infrastructure/supabase/client"
import type { ManagedUser, CreateUserInput, RoleOption } from "@/domain/entities/ManagedUser"
import type { UserManagementRepository } from "@/domain/repositories/UserManagementRepository"
import type { UserRole } from "@/domain/entities/User"

export class UserManagementRepositoryImpl implements UserManagementRepository {
  async getAllUsers(): Promise<ManagedUser[]> {
    // Get all profiles with their roles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, full_name, phone, created_at")
      .order("created_at", { ascending: false })

    if (profileError) throw new Error(profileError.message)

    if (!profiles || profiles.length === 0) return []

    // Get user_roles for all users
    const userIds = profiles.map((p) => p.id)
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role_id, roles(name)")
      .in("user_id", userIds)

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
          role_name: roleName ?? "",
        })
      }
    }

    return profiles.map((profile) => {
      const roleInfo = roleMap.get(profile.id)
      return {
        id: profile.id,
        email: emailMap.get(profile.id) ?? "",
        username: profile.username,
        full_name: profile.full_name,
        phone: profile.phone,
        role: (roleInfo?.role_name as UserRole) ?? null,
        role_id: roleInfo?.role_id ?? null,
        created_at: profile.created_at,
      }
    })
  }

  async getRoles(): Promise<RoleOption[]> {
    const { data, error } = await supabase
      .from("roles")
      .select("id, name, description")
      .order("name", { ascending: true })

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
    if (!authData.user) throw new Error("Gagal membuat akun user.")

    const userId = authData.user.id

    // 2. Update profile (trigger already inserts, so we update)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        username: input.username,
        full_name: input.full_name,
      })
      .eq("id", userId)

    if (profileError) throw new Error(profileError.message)

    // 3. Assign role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role_id: input.role_id,
      })

    if (roleError) throw new Error(roleError.message)

    // 4. Get the role name
    const { data: roleData } = await supabase
      .from("roles")
      .select("name")
      .eq("id", input.role_id)
      .single()

    return {
      id: userId,
      email: input.email,
      username: input.username,
      full_name: input.full_name,
      phone: null,
      role: (roleData?.name as UserRole) ?? null,
      role_id: input.role_id,
      created_at: new Date().toISOString(),
    }
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete from auth (cascades to profiles and user_roles)
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw new Error(error.message)
  }

  async updateUserRole(userId: string, roleId: string): Promise<void> {
    // Remove old role
    const { error: deleteError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)

    if (deleteError) throw new Error(deleteError.message)

    // Insert new role
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role_id: roleId })

    if (insertError) throw new Error(insertError.message)
  }
}
