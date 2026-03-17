import { describe, it, expect, vi } from 'vitest'
import type { AuthRepository } from '@/domain/repositories/AuthRepository'
import { loginUser } from '../loginUser'
import { logoutUser } from '../logoutUser'

describe('Auth Use Cases', () => {
  const mockRepo = {
    login: vi.fn(),
    logout: vi.fn(),
  } as unknown as AuthRepository

  it('loginUser calls repo.login', async () => {
    const payload = { identifier: 'admin@hcd.com', password: 'password' }
    mockRepo.login = vi.fn().mockResolvedValue({ id: 'u1', email: 'admin@hcd.com' })
    const result = await loginUser(mockRepo, payload)
    expect(mockRepo.login).toHaveBeenCalledWith(payload)
    expect(result.id).toBe('u1')
  })

  it('logoutUser calls repo.logout', async () => {
    mockRepo.logout = vi.fn().mockResolvedValue(undefined)
    await logoutUser(mockRepo)
    expect(mockRepo.logout).toHaveBeenCalled()
  })
})
