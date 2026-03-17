import type { CandidateApplication, CandidateApplicationInput } from "@/domain/entities/Candidate"
import type { CandidateRepository } from "@/domain/repositories/CandidateRepository"

export function updateCandidateApplication(
  repo: CandidateRepository,
  id: string,
  data: CandidateApplicationInput,
): Promise<CandidateApplication> {
  return repo.update(id, data)
}
