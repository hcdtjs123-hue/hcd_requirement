import type { CandidateFormInput } from '@/domain/entities/CandidateForm'
import type { CandidateFormRepository } from '@/domain/repositories/CandidateFormRepository'

export function createCandidateForm(repo: CandidateFormRepository, payload: CandidateFormInput) {
  return repo.create(payload)
}
