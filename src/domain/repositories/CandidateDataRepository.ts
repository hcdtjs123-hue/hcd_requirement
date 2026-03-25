import type { CandidateRecord, CandidateRecordInput } from '@/domain/entities/Candidate'

export interface CandidateDataRepository {
  getAll(): Promise<CandidateRecord[]>
  getById(id: string): Promise<CandidateRecord | null>
  create(data: CandidateRecordInput): Promise<CandidateRecord>
  update(id: string, data: CandidateRecordInput): Promise<CandidateRecord>
  delete(id: string): Promise<void>
}
