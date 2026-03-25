import { describe, it, expect, vi } from 'vitest'
import type { CandidateDataRepository } from '@/domain/repositories/CandidateDataRepository'
import { getCandidates } from '../getCandidates'
import { updateCandidate } from '../updateCandidate'
import { deleteCandidate } from '../deleteCandidate'
import { createCandidate } from '../createCandidate'

describe('Candidate Data Use Cases', () => {
  const mockRepo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as CandidateDataRepository

  it('getCandidates calls repo.getAll', async () => {
    mockRepo.getAll = vi.fn().mockResolvedValue([{ id: '1' }])
    const result = await getCandidates(mockRepo)
    expect(mockRepo.getAll).toHaveBeenCalled()
    expect(result[0]?.id).toBe('1')
  })

  it('createCandidate calls repo.create', async () => {
    const data = { fullname: 'John Doe' } as any
    mockRepo.create = vi.fn().mockResolvedValue({ id: '1', ...data })
    const result = await createCandidate(mockRepo, data)
    expect(mockRepo.create).toHaveBeenCalledWith(data)
    expect(result.id).toBe('1')
  })

  it('updateCandidate calls repo.update', async () => {
    const data = { notes: 'Good' } as any
    mockRepo.update = vi.fn().mockResolvedValue({ id: '1', ...data })
    const result = await updateCandidate(mockRepo, '1', data)
    expect(mockRepo.update).toHaveBeenCalledWith('1', data)
    expect(result.id).toBe('1')
  })

  it('deleteCandidate calls repo.delete', async () => {
    mockRepo.delete = vi.fn().mockResolvedValue(undefined)
    await deleteCandidate(mockRepo, '1')
    expect(mockRepo.delete).toHaveBeenCalledWith('1')
  })
})
