import { describe, it, expect, vi, beforeEach } from 'vitest'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Match the actual Vite proxy config
vi.stubGlobal('import', { meta: { env: { VITE_API_URL: 'http://localhost:8000/api' } } })

import apiClient from '../../api/axios'

describe('AxiosInstance', () => {
  it('creates an axios instance with correct baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:8000/api')
  })

  it('attaches request interceptor', () => {
    const interceptors = apiClient.interceptors.request
    expect(interceptors).toBeDefined()
  })

  it('attaches response interceptor', () => {
    const interceptors = apiClient.interceptors.response
    expect(interceptors).toBeDefined()
  })
})

describe('RequestInterceptor', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('adds Authorization header when token exists', async () => {
    localStorageMock.setItem('access_token', 'test-token-123')

    const config = { headers: {} }
    const result = await apiClient.interceptors.request.handlers[0].fulfilled(config)

    expect(result.headers.Authorization).toBe('Bearer test-token-123')
  })

  it('does not add header when no token', async () => {
    const config = { headers: {} }
    const result = await apiClient.interceptors.request.handlers[0].fulfilled(config)

    expect(result.headers.Authorization).toBeUndefined()
  })
})
