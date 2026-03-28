import type { CandidateForm, CandidateFormInput } from '@/domain/entities/CandidateForm'

export interface CandidateFormRepository {
  getAll(): Promise<CandidateForm[]>
  getById(id: string): Promise<CandidateForm | null>
  create(data: CandidateFormInput): Promise<CandidateForm>
  update(id: string, data: CandidateFormInput): Promise<CandidateForm>
  delete(id: string): Promise<void>
}
