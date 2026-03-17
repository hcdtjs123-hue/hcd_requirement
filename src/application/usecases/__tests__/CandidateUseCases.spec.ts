import { describe, it, expect, vi } from 'vitest'
import type { CandidateRepository } from '@/domain/repositories/CandidateRepository'
import { getCandidateApplications } from '../getCandidateApplications'
import { updateCandidateApplication } from '../updateCandidateApplication'
import { deleteCandidateApplication } from '../deleteCandidateApplication'
import { applyJob } from '../applyJob'

describe('Candidate Use Cases', () => {
  const mockRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as CandidateRepository

  it('getCandidateApplications calls repo.getAll', async () => {
    mockRepo.getAll = vi.fn().mockResolvedValue([{ id: '1' }])
    const result = await getCandidateApplications(mockRepo)
    expect(mockRepo.getAll).toHaveBeenCalled()
    expect(result[0]?.id).toBe('1')
  })

  it('applyJob calls repo.create', async () => {
    const data = { fullname: 'John Doe' } as any
    mockRepo.create = vi.fn().mockResolvedValue({ id: '1', ...data })
    const result = await applyJob(mockRepo, data)
    expect(mockRepo.create).toHaveBeenCalledWith(data)
    expect(result.id).toBe('1')
  })

  it('updateCandidateApplication calls repo.update', async () => {
    const data = { notes: 'Good' } as any
    mockRepo.update = vi.fn().mockResolvedValue({ id: '1', ...data })
    const result = await updateCandidateApplication(mockRepo, '1', data)
    expect(mockRepo.update).toHaveBeenCalledWith('1', data)
    expect(result.id).toBe('1')
  })

  it('deleteCandidateApplication calls repo.delete', async () => {
    mockRepo.delete = vi.fn().mockResolvedValue(undefined)
    await deleteCandidateApplication(mockRepo, '1')
    expect(mockRepo.delete).toHaveBeenCalledWith('1')
  })
})
