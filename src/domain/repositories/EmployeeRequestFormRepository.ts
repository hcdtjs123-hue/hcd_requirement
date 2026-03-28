import type { EmployeeRequestForm, EmployeeRequestFormInput } from "@/domain/entities/EmployeeRequestForm"

export interface EmployeeRequestFormRepository {
  getAll(): Promise<EmployeeRequestForm[]>
  getById(id: string): Promise<EmployeeRequestForm | null>
  create(data: EmployeeRequestFormInput): Promise<EmployeeRequestForm>
  update(id: string, data: EmployeeRequestFormInput): Promise<EmployeeRequestForm>
  delete(id: string): Promise<void>
  close(id: string, category: 'employee hired' | 'canceled', reason: string): Promise<void>
}
