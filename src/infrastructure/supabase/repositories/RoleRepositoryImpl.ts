import type { Role, Permission, RolePermissionInput } from '@/domain/entities/Role'
import type { RoleRepository } from '@/domain/repositories/RoleRepository'
import { supabase } from '../client'

export class RoleRepositoryImpl implements RoleRepository {
  async getAllRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select(
        'id, name, description, created_at, role_permissions(permissions(id, name, description, created_at))',
      )
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    if (!data) return []

    // Map the nested permissions relation flat
    return data.map((role: any) => {
      const perms = (role.role_permissions || []).map((rp: any) => rp.permissions)
      return {
        id: role.id,
        name: role.name,
        description: role.description,
        created_at: role.created_at,
        permissions: perms,
      }
    })
  }

  async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)

    const permissions = data || []
    return this.ensureModulePermissions(permissions)
  }

  private async ensureModulePermissions(existingPermissions: Permission[]): Promise<Permission[]> {
    const requiredPermissions = [
      {
        name: 'recruitment:create',
        description: 'Add candidates to the recruitment pipeline',
      },
      {
        name: 'recruitment:read',
        description: 'View recruitment dashboard and pipeline',
      },
      {
        name: 'recruitment:update',
        description: 'Modify candidate recruitment pipeline process',
      },
      {
        name: 'can:upload',
        description: 'Upload recruitment posting files and evidence',
      },
      {
        name: 'recruitment:delete',
        description: 'Delete candidate recruitment pipeline data',
      },
      {
        name: 'candidate_data:create',
        description: 'Add new candidate data',
      },
      {
        name: 'candidate_data:read',
        description: 'View list and details of candidate data',
      },
      {
        name: 'candidate_data:update',
        description: 'Modify candidate profile and form data',
      },
      {
        name: 'candidate_data:delete',
        description: 'Delete candidate data',
      },
    ]

    const existingNames = new Set(existingPermissions.map((permission) => permission.name))
    const missingPermissions = requiredPermissions.filter(
      (permission) => !existingNames.has(permission.name),
    )

    if (missingPermissions.length === 0) {
      return existingPermissions
    }

    const { data, error } = await supabase
      .from('permissions')
      .insert(missingPermissions)
      .select('*')

    if (error) throw new Error(error.message)

    return [...existingPermissions, ...(data || [])].sort((a, b) => a.name.localeCompare(b.name))
  }

  async createRole(name: string, description?: string): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert({ name, description })
      .select()
      .single()

    if (error) throw new Error(`Failed to create role: ${error.message}`)
    return { ...data, permissions: [] }
  }

  async updateRolePermissions(input: RolePermissionInput): Promise<void> {
    const { role_id, permission_ids } = input

    // 1. Hapus semua konfigurasi permission lama untuk role ini
    const { error: delError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', role_id)

    if (delError) throw new Error(`Failed to reset old permissions: ${delError.message}`)

    // 2. Insert konfigurasi permission baru (jika ada)
    if (permission_ids && permission_ids.length > 0) {
      const inserts = permission_ids.map((permId) => ({
        role_id,
        permission_id: permId,
      }))
      const { error: insError } = await supabase.from('role_permissions').insert(inserts)

      if (insError) throw new Error(`Failed to save new permissions: ${insError.message}`)
    }
  }

  async deleteRole(id: string): Promise<void> {
    const { error } = await supabase.from('roles').delete().eq('id', id)
    if (error) throw new Error(`Failed to delete role: ${error.message}`)
  }
}
