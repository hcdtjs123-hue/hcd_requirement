import type { CandidateApplication } from "@/domain/entities/Candidate"
import type { CandidateRepository } from "@/domain/repositories/CandidateRepository"

export function getCandidateApplications(repo: CandidateRepository): Promise<CandidateApplication[]> {
  return repo.getAll()
}
