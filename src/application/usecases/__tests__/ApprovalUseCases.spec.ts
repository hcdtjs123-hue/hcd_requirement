import { describe, it, expect, vi } from 'vitest'
import type { ApprovalRepository } from '@/domain/repositories/ApprovalRepository'
import { getApprovalChains } from '../getApprovalChains'
import { getChainByJobRequest } from '../getChainByJobRequest'
import { submitForApproval } from '../submitForApproval'

describe('Approval Use Cases', () => {
  const mockRepo = {
    getChainsByUser: vi.fn(),
    getChainByJobRequest: vi.fn(),
    submitForApproval: vi.fn(),
  } as unknown as ApprovalRepository

  it('getApprovalChains calls repo.getChainsByUser', async () => {
    mockRepo.getChainsByUser = vi.fn().mockResolvedValue([{ id: '1' }])
    const result = await getApprovalChains(mockRepo)
    expect(mockRepo.getChainsByUser).toHaveBeenCalled()
    expect(result[0]?.id).toBe('1')
  })

  it('getChainByJobRequest calls repo.getChainByJobRequest', async () => {
    mockRepo.getChainByJobRequest = vi.fn().mockResolvedValue({ id: '2' })
    const result = await getChainByJobRequest(mockRepo, 'job-1')
    expect(mockRepo.getChainByJobRequest).toHaveBeenCalledWith('job-1')
    expect(result?.id).toBe('2')
  })

  it('submitForApproval calls repo.submitForApproval', async () => {
    const data = { job_request_id: 'job-1' } as any
    mockRepo.submitForApproval = vi.fn().mockResolvedValue({ id: '1', ...data })
    const result = await submitForApproval(mockRepo, data)
    expect(mockRepo.submitForApproval).toHaveBeenCalledWith(data)
    expect(result.id).toBe('1')
  })
})
