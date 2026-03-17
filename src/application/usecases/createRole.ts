import type { Role, RolePermissionInput } from "@/domain/entities/Role"
import type { RoleRepository } from "@/domain/repositories/RoleRepository"

export function createRole(
  repo: RoleRepository,
  name: string,
  description?: string,
): Promise<Role> {
  return repo.createRole(name, description)
}
