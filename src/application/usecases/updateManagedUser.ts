import type { ManagedUser, UpdateUserInput } from '@/domain/entities/ManagedUser'
import type { UserManagementRepository } from '@/domain/repositories/UserManagementRepository'

export function updateManagedUser(
  repo: UserManagementRepository,
  userId: string,
  data: UpdateUserInput,
): Promise<ManagedUser> {
  return repo.updateUser(userId, data)
}
