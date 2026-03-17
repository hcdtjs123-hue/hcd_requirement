import { describe, it, expect, vi } from 'vitest'
import type { JobRequestRepository } from '@/domain/repositories/JobRequestRepository'
import { createJobRequest } from '../createJobRequest'
import { updateJobRequest } from '../updateJobRequest'
import { deleteJobRequest } from '../deleteJobRequest'
import { GetJobRequests } from '../getJobRequests'

describe('JobRequest Use Cases', () => {
  const mockRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as JobRequestRepository

  it('createJobRequest calls repo.create', async () => {
    const data = { main_position: 'Developer', request_type: 'New' } as any
    mockRepo.create = vi.fn().mockResolvedValue({ id: '1', ...data })
    const result = await createJobRequest(mockRepo, data)
    expect(mockRepo.create).toHaveBeenCalledWith(data)
    expect(result.id).toBe('1')
  })

  it('getJobRequests calls repo.getAll', async () => {
    mockRepo.getAll = vi.fn().mockResolvedValue([{ id: '1' }])
    const usecase = new GetJobRequests(mockRepo)
    const result = await usecase.execute()
    expect(mockRepo.getAll).toHaveBeenCalled()
    expect(result).toHaveLength(1)
  })

  it('updateJobRequest calls repo.update', async () => {
    const data = { main_position: 'Senior Developer' } as any
    mockRepo.update = vi.fn().mockResolvedValue({ id: '1', ...data })
    const result = await updateJobRequest(mockRepo, '1', data)
    expect(mockRepo.update).toHaveBeenCalledWith('1', data)
    expect(result.main_position).toBe('Senior Developer')
  })

  it('deleteJobRequest calls repo.delete', async () => {
    mockRepo.delete = vi.fn().mockResolvedValue(undefined)
    await deleteJobRequest(mockRepo, '1')
    expect(mockRepo.delete).toHaveBeenCalledWith('1')
  })
})
