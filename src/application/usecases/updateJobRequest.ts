import type { JobRequest, JobRequestInput } from "@/domain/entities/JobRequest"
import type { JobRequestRepository } from "@/domain/repositories/JobRequestRepository"

export function updateJobRequest(
  repo: JobRequestRepository,
  id: string,
  payload: JobRequestInput,
): Promise<JobRequest> {
  return repo.update(id, payload)
}
