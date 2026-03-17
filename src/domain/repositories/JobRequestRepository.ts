import type { JobRequest, JobRequestInput } from "@/domain/entities/JobRequest"

export interface JobRequestRepository {
  getAll(): Promise<JobRequest[]>
  getById(id: string): Promise<JobRequest | null>
  create(data: JobRequestInput): Promise<JobRequest>
  update(id: string, data: JobRequestInput): Promise<JobRequest>
  delete(id: string): Promise<void>
}
