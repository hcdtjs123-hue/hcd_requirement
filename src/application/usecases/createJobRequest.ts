import type { JobRequestInput } from "@/domain/entities/JobRequest"
import type { JobRequestRepository } from "@/domain/repositories/JobRequestRepository"

export function createJobRequest(repo: JobRequestRepository, payload: JobRequestInput) {
  return repo.create(payload)
}
