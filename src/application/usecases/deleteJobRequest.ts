import type { JobRequestRepository } from "@/domain/repositories/JobRequestRepository"

export function deleteJobRequest(repo: JobRequestRepository, id: string): Promise<void> {
  return repo.delete(id)
}
