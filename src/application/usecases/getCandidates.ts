import type { CandidateRecord } from '@/domain/entities/Candidate'
import type { CandidateDataRepository } from '@/domain/repositories/CandidateDataRepository'

export function getCandidates(repo: CandidateDataRepository): Promise<CandidateRecord[]> {
  return repo.getAll()
}
