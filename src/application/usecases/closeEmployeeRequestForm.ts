import type { EmployeeRequestFormRepository } from "@/domain/repositories/EmployeeRequestFormRepository"

export async function closeEmployeeRequestForm(
  repo: EmployeeRequestFormRepository,
  id: string,
  category: 'employee hired' | 'canceled',
  reason: string
): Promise<void> {
  return repo.close(id, category, reason)
}
