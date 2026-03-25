import type { CandidateDataRepository } from '@/domain/repositories/CandidateDataRepository'

export function deleteCandidate(repo: CandidateDataRepository, id: string): Promise<void> {
  return repo.delete(id)
}
