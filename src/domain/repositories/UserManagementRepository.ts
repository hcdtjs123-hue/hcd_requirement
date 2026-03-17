import type { ManagedUser, CreateUserInput, RoleOption } from "@/domain/entities/ManagedUser"

export interface UserManagementRepository {
  getAllUsers(): Promise<ManagedUser[]>
  getRoles(): Promise<RoleOption[]>
  createUser(data: CreateUserInput): Promise<ManagedUser>
  deleteUser(userId: string): Promise<void>
  updateUserRole(userId: string, roleId: string): Promise<void>
}
