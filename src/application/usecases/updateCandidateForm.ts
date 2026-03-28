import type { CandidateForm, CandidateFormInput } from '@/domain/entities/CandidateForm'
import type { CandidateFormRepository } from '@/domain/repositories/CandidateFormRepository'

export function updateCandidateForm(
  repo: CandidateFormRepository,
  id: string,
  data: CandidateFormInput,
): Promise<CandidateForm> {
  return repo.update(id, data)
}
