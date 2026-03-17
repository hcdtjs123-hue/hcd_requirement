import type { JobRequestRepository } from "@/domain/repositories/JobRequestRepository"

export class GetJobRequests {
  constructor(private readonly repo: JobRequestRepository) {}

  async execute() {
    return this.repo.getAll()
  }
}
