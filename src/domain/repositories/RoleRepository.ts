import type { Role, Permission, RolePermissionInput } from "@/domain/entities/Role"

export interface RoleRepository {
  /**
   * Mengambil semua roles beserta permissions-nya
   */
  getAllRoles(): Promise<Role[]>

  /**
   * Mengambil semua daftar permissions master
   */
  getAllPermissions(): Promise<Permission[]>

  /**
   * Membuat role baru (dengan atau tanpa initial permissions)
   */
  createRole(name: string, description?: string): Promise<Role>

  /**
   * Menyimpan perubahan daftar permissions untuk suatu role tertentu (Replace All)
   */
  updateRolePermissions(input: RolePermissionInput): Promise<void>

  /**
   * Menghapus sebuah role berdasar ID
   */
  deleteRole(id: string): Promise<void>
}
