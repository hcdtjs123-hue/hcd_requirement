
import type { RolePermissionInput } from "@/domain/entities/Role"
import type { RoleRepository } from "@/domain/repositories/RoleRepository"

export function updateRolePermissions(
  repo: RoleRepository,
  input: RolePermissionInput,
): Promise<void> {
  return repo.updateRolePermissions(input)
}
