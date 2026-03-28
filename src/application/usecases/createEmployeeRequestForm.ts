import type { EmployeeRequestFormInput } from "@/domain/entities/EmployeeRequestForm"
import type { EmployeeRequestFormRepository } from "@/domain/repositories/EmployeeRequestFormRepository"

export function createEmployeeRequestForm(repo: EmployeeRequestFormRepository, payload: EmployeeRequestFormInput) {
  return repo.create(payload)
}
