import { describe, it, expect, vi } from 'vitest'
import { AuthService } from '../../api/authService'

vi.mock('../../api/axios', () => {
  const mockPost = vi.fn()
  return {
    default: {
      post: mockPost,
      defaults: { baseURL: 'http://test:8000/api' },
    },
  }
})

import apiClient from '../../api/axios'

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login calls POST /auth/login/', () => {
    const credentials = {
      email: 'test@test.com',
      password: 'pass123',
      captcha_token: 'captcha-abc',
    }
    AuthService.login(credentials)
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login/', credentials)
  })

  it('register calls POST /auth/register/', () => {
    const data = {
      first_name: 'Test',
      last_name: 'User',
      password: 'securepass123',
      email: 'test@test.com',
      phone: '3001112233',
    }
    AuthService.register(data)
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register/', data)
  })

  it('logout calls POST /auth/logout/', () => {
    AuthService.logout('refresh-token-xyz')
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout/', {
      refresh: 'refresh-token-xyz',
    })
  })

  it('refreshToken calls POST /auth/token-refresh/', () => {
    AuthService.refreshToken('old-refresh-token')
    expect(apiClient.post).toHaveBeenCalledWith('/auth/token-refresh/', {
      refresh: 'old-refresh-token',
    })
  })

  it('recoverPassword calls POST /auth/recover-password/', () => {
    AuthService.recoverPassword('test@test.com', 'captcha-abc')
    expect(apiClient.post).toHaveBeenCalledWith('/auth/recover-password/', {
      identifier: 'test@test.com',
      captcha_token: 'captcha-abc',
    })
  })

  it('resetPassword calls POST /auth/reset-password/{token}/', () => {
    AuthService.resetPassword('reset-token', 'newpass123', 'captcha-xyz')
    expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password/reset-token/', {
      new_password: 'newpass123',
      captcha_token: 'captcha-xyz',
    })
  })
})
