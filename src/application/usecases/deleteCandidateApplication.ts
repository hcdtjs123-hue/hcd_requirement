import type { CandidateRepository } from "@/domain/repositories/CandidateRepository"

export function deleteCandidateApplication(repo: CandidateRepository, id: string): Promise<void> {
  return repo.delete(id)
}
