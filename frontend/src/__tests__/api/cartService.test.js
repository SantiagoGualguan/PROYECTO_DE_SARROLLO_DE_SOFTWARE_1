import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGet, mockPost, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
}))

vi.mock('../../api/axios', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
}))

import { CartService } from '../../api/cartService'

describe('CartService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getActiveCart calls GET /cart/', () => {
    CartService.getActiveCart()
    expect(mockGet).toHaveBeenCalledWith('/cart/')
  })

  it('addItem calls POST /cart/items/ with coreography_id', () => {
    CartService.addItem(42)
    expect(mockPost).toHaveBeenCalledWith('/cart/items/', { coreography_id: 42 })
  })

  it('addItem calls POST /cart/items/ with string id', () => {
    CartService.addItem('10')
    expect(mockPost).toHaveBeenCalledWith('/cart/items/', { coreography_id: '10' })
  })

  it('removeItem calls DELETE /cart/items/{id}/', () => {
    CartService.removeItem(7)
    expect(mockDelete).toHaveBeenCalledWith('/cart/items/7/')
  })

  it('clearCart calls DELETE /cart/', () => {
    CartService.clearCart()
    expect(mockDelete).toHaveBeenCalledWith('/cart/')
  })

  it('getActiveCart returns a promise', () => {
    mockGet.mockResolvedValue({ data: { items: [] } })
    const result = CartService.getActiveCart()
    expect(result).toBeInstanceOf(Promise)
  })
})
