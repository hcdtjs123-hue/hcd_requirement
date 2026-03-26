import type { JobRequestRepository } from "@/domain/repositories/JobRequestRepository"

export async function closeJobRequest(
  repo: JobRequestRepository,
  id: string,
  category: 'employee hired' | 'canceled',
  reason: string
): Promise<void> {
  return repo.close(id, category, reason)
}
