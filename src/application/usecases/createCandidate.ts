import type { CandidateRecordInput } from '@/domain/entities/Candidate'
import type { CandidateDataRepository } from '@/domain/repositories/CandidateDataRepository'

export function createCandidate(repo: CandidateDataRepository, payload: CandidateRecordInput) {
  return repo.create(payload)
}
