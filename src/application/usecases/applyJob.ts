import type { CandidateApplicationInput } from "@/domain/entities/Candidate"
import type { CandidateRepository } from "@/domain/repositories/CandidateRepository"

export function applyJob(repo: CandidateRepository, payload: CandidateApplicationInput) {
  return repo.create(payload)
}
