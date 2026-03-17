import type { ManagedUser, CreateUserInput } from "@/domain/entities/ManagedUser"
import type { UserManagementRepository } from "@/domain/repositories/UserManagementRepository"

export function createManagedUser(
  repo: UserManagementRepository,
  data: CreateUserInput,
): Promise<ManagedUser> {
  return repo.createUser(data)
}
