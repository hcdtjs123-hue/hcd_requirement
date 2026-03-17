import type { ManagedUser } from "@/domain/entities/ManagedUser"
import type { UserManagementRepository } from "@/domain/repositories/UserManagementRepository"

export function getAllUsers(repo: UserManagementRepository): Promise<ManagedUser[]> {
  return repo.getAllUsers()
}
