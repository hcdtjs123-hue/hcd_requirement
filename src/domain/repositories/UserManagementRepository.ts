import type {
  ManagedUser,
  CreateUserInput,
  RoleOption,
  UpdateUserInput,
} from '@/domain/entities/ManagedUser'

export interface UserManagementRepository {
  getAllUsers(): Promise<ManagedUser[]>
  getRoles(): Promise<RoleOption[]>
  createUser(data: CreateUserInput): Promise<ManagedUser>
  updateUser(userId: string, data: UpdateUserInput): Promise<ManagedUser>
  deleteUser(userId: string): Promise<void>
  updateUserRole(userId: string, roleId: string): Promise<void>
}
