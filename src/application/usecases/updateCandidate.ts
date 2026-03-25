import type { CandidateRecord, CandidateRecordInput } from '@/domain/entities/Candidate'
import type { CandidateDataRepository } from '@/domain/repositories/CandidateDataRepository'

export function updateCandidate(
  repo: CandidateDataRepository,
  id: string,
  data: CandidateRecordInput,
): Promise<CandidateRecord> {
  return repo.update(id, data)
}
