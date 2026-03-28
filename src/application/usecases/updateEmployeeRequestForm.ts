import type { EmployeeRequestForm, EmployeeRequestFormInput } from "@/domain/entities/EmployeeRequestForm"
import type { EmployeeRequestFormRepository } from "@/domain/repositories/EmployeeRequestFormRepository"

export function updateEmployeeRequestForm(
  repo: EmployeeRequestFormRepository,
  id: string,
  payload: EmployeeRequestFormInput,
): Promise<EmployeeRequestForm> {
  return repo.update(id, payload)
}
