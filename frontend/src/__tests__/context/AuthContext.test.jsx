import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../context/AuthContext'

// Helper component to test the context
function TestConsumer() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="isAuthenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="rol">{auth.rol || 'null'}</span>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="token">{auth.token || 'null'}</span>
      <button data-testid="btn-login" onClick={() => auth.login('acc-token', 'ref-token', { id: 1, role: 'client' })}>
        Login
      </button>
      <button data-testid="btn-logout" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  )
}

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

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('starts unauthenticated with no stored data', async () => {
    renderWithProvider()
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    expect(screen.getByTestId('rol').textContent).toBe('null')
    expect(screen.getByTestId('token').textContent).toBe('null')
  })

  it('login sets authentication state', async () => {
    renderWithProvider()
    const btn = screen.getByTestId('btn-login')

    await act(() => btn.click())

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    expect(screen.getByTestId('token').textContent).not.toBe('null')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'acc-token')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'ref-token')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', expect.any(String))
  })

  it('logout clears authentication state', async () => {
    renderWithProvider()
    // First login
    await act(() => screen.getByTestId('btn-login').click())
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')

    // Then logout
    await act(() => screen.getByTestId('btn-logout').click())
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
  })

  it('loads user from localStorage on mount', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'access_token') return 'stored-token'
      if (key === 'user') return JSON.stringify({ id: 1, role: 'director' })
      return null
    })

    renderWithProvider()
    // Wait for useEffect
    await act(async () => {})
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    expect(screen.getByTestId('rol').textContent).toBe('director')
  })
})
