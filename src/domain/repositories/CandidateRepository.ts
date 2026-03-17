import type { CandidateApplication, CandidateApplicationInput } from "@/domain/entities/Candidate"

export interface CandidateRepository {
  getAll(): Promise<CandidateApplication[]>
  getById(id: string): Promise<CandidateApplication | null>
  create(data: CandidateApplicationInput): Promise<CandidateApplication>
  update(id: string, data: CandidateApplicationInput): Promise<CandidateApplication>
  delete(id: string): Promise<void>
}
