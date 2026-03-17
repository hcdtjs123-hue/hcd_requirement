import { describe, it, expect, vi } from 'vitest'
import type { UserManagementRepository } from '@/domain/repositories/UserManagementRepository'
import { getAllUsers } from '../getAllUsers'
import { createManagedUser } from '../createManagedUser'
import { deleteManagedUser } from '../deleteManagedUser'
import { updateManagedUserRole } from '../updateManagedUserRole'

describe('UserManagement Use Cases', () => {
  const mockRepo = {
    getAllUsers: vi.fn(),
    getRoles: vi.fn(),
    createUser: vi.fn(),
    deleteUser: vi.fn(),
    updateUserRole: vi.fn(),
  } as unknown as UserManagementRepository

  it('getAllUsers calls repo.getAllUsers', async () => {
    mockRepo.getAllUsers = vi.fn().mockResolvedValue([{ id: '1' }])
    const result = await getAllUsers(mockRepo)
    expect(mockRepo.getAllUsers).toHaveBeenCalled()
    expect(result[0]?.id).toBe('1')
  })

  it('createManagedUser calls repo.createUser', async () => {
    const data = { email: 'test@hcd.com', password: 'pass', role_id: 'r1' }
    mockRepo.createUser = vi.fn().mockResolvedValue({ id: 'u1', email: 'test@hcd.com' })
    const result = await createManagedUser(mockRepo, data as any)
    expect(mockRepo.createUser).toHaveBeenCalledWith(data)
    expect(result.id).toBe('u1')
  })

  it('updateManagedUserRole calls repo.updateUserRole', async () => {
    mockRepo.updateUserRole = vi.fn().mockResolvedValue(undefined)
    await updateManagedUserRole(mockRepo, 'u1', 'r2')
    expect(mockRepo.updateUserRole).toHaveBeenCalledWith('u1', 'r2')
  })

  it('deleteManagedUser calls repo.deleteUser', async () => {
    mockRepo.deleteUser = vi.fn().mockResolvedValue(undefined)
    await deleteManagedUser(mockRepo, 'u1')
    expect(mockRepo.deleteUser).toHaveBeenCalledWith('u1')
  })
})
