import { describe, it, expect, vi } from 'vitest'
import type { RecruitmentTrackingRepository } from '@/domain/repositories/RecruitmentTrackingRepository'
import { getRecruitmentTrackings } from '../getRecruitmentTrackings'
import { approveRecruitmentTracking } from '../approveRecruitmentTracking'
import { uploadPostingFiles } from '../uploadPostingFiles'
import { getAllCandidateInvitations } from '../getAllCandidateInvitations'
import { createCandidateInvitation } from '../createCandidateInvitation'
import { sendCandidateCredentials } from '../sendCandidateCredentials'
import { scheduleInterview } from '../scheduleInterview'
import { confirmInterviewAttendance } from '../confirmInterviewAttendance'

describe('RecruitmentTracking & Invitation Use Cases', () => {
  const mockRepo = {
    getAll: vi.fn(),
    approveTracking: vi.fn(),
    uploadPostingFiles: vi.fn(),
    getAllInvitations: vi.fn(),
    createInvitation: vi.fn(),
    sendCredentials: vi.fn(),
    scheduleInterview: vi.fn(),
    confirmAttendance: vi.fn(),
  } as unknown as RecruitmentTrackingRepository

  it('getRecruitmentTrackings calls repo.getAll', async () => {
    mockRepo.getAll = vi.fn().mockResolvedValue([{ id: '1' }])
    const result = await getRecruitmentTrackings(mockRepo)
    expect(mockRepo.getAll).toHaveBeenCalled()
    expect(result[0]?.id).toBe('1')
  })

  it('approveRecruitmentTracking calls repo.approveTracking', async () => {
    mockRepo.approveTracking = vi.fn().mockResolvedValue(undefined)
    await approveRecruitmentTracking(mockRepo, '1', 'OK')
    expect(mockRepo.approveTracking).toHaveBeenCalledWith('1', 'OK')
  })

  it('uploadPostingFiles calls repo.uploadPostingFiles', async () => {
    mockRepo.uploadPostingFiles = vi.fn().mockResolvedValue(undefined)
    const files = [new File([], 'test.pdf')]
    await uploadPostingFiles(mockRepo, '1', files)
    expect(mockRepo.uploadPostingFiles).toHaveBeenCalledWith('1', files)
  })

  it('getAllCandidateInvitations calls repo.getAllInvitations', async () => {
    mockRepo.getAllInvitations = vi.fn().mockResolvedValue([{ id: 'inv-1' }])
    const result = await getAllCandidateInvitations(mockRepo)
    expect(mockRepo.getAllInvitations).toHaveBeenCalled()
    expect(result[0]?.id).toBe('inv-1')
  })

  it('createCandidateInvitation calls repo.createInvitation', async () => {
    const data = { candidate_name: 'Jane' } as any
    mockRepo.createInvitation = vi.fn().mockResolvedValue({ id: 'inv-1', ...data })
    const result = await createCandidateInvitation(mockRepo, data)
    expect(mockRepo.createInvitation).toHaveBeenCalledWith(data)
    expect(result.id).toBe('inv-1')
  })

  it('sendCandidateCredentials calls repo.sendCredentials', async () => {
    mockRepo.sendCredentials = vi.fn().mockResolvedValue(undefined)
    await sendCandidateCredentials(mockRepo, 'inv-1', 'user-1')
    expect(mockRepo.sendCredentials).toHaveBeenCalledWith('inv-1', 'user-1')
  })

  it('scheduleInterview calls repo.scheduleInterview', async () => {
    const data = { invitation_id: 'inv-1' } as any
    mockRepo.scheduleInterview = vi.fn().mockResolvedValue({ id: 'sch-1', ...data })
    const result = await scheduleInterview(mockRepo, data)
    expect(mockRepo.scheduleInterview).toHaveBeenCalledWith(data)
    expect(result.id).toBe('sch-1')
  })

  it('confirmInterviewAttendance calls repo.confirmAttendance', async () => {
    mockRepo.confirmAttendance = vi.fn().mockResolvedValue(undefined)
    await confirmInterviewAttendance(mockRepo, 'sch-1')
    expect(mockRepo.confirmAttendance).toHaveBeenCalledWith('sch-1')
  })
})
