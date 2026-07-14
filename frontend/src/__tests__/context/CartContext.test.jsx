import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CartProvider, useCart } from '../../context/CartContext'

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

function TestConsumer({ onMount }) {
  const cart = useCart()
  if (onMount) onMount(cart)
  return (
    <div>
      <span data-testid="itemCount">{cart.itemCount}</span>
      <span data-testid="total">{cart.total}</span>
      <span data-testid="loading">{String(cart.loading)}</span>
      <span data-testid="cartId">{cart.cartId || 'null'}</span>
      <span data-testid="error">{cart.error || 'null'}</span>
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

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('starts with empty items and total 0', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } })

    let cart
    await act(async () => {
      render(
        <CartProvider>
          <TestConsumer onMount={(c) => { cart = c }} />
        </CartProvider>
      )
    })

    expect(cart.items).toEqual([])
    expect(cart.total).toBe(0)
    expect(cart.itemCount).toBe(0)
    expect(cart.cartId).toBeNull()
  })

  it('sets loading false after initial fetch', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } })

    let cart
    await act(async () => {
      render(
        <CartProvider>
          <TestConsumer onMount={(c) => { cart = c }} />
        </CartProvider>
      )
    })

    expect(cart.loading).toBe(false)
  })

  it('fetches cart from API when token exists', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'access_token') return 'test-token'
      return null
    })

    mockGet.mockResolvedValue({
      data: {
        cart_id: 1,
        items: [
          { cart_item_id: 1, coreography: { c_name: 'Salsa' }, unit_price: '10000.00' },
        ],
      },
    })

    let cart
    await act(async () => {
      render(
        <CartProvider>
          <TestConsumer onMount={(c) => { cart = c }} />
        </CartProvider>
      )
    })

    expect(mockGet).toHaveBeenCalledWith('/cart/')
    expect(cart.items).toHaveLength(1)
    expect(cart.cartId).toBe(1)
    expect(cart.total).toBe(10000)
  })

  it('calculates total from multiple items', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'access_token') return 'test-token'
      return null
    })

    mockGet.mockResolvedValue({
      data: {
        cart_id: 1,
        items: [
          { cart_item_id: 1, unit_price: '10000.00' },
          { cart_item_id: 2, unit_price: '25000.00' },
        ],
      },
    })

    let cart
    await act(async () => {
      render(
        <CartProvider>
          <TestConsumer onMount={(c) => { cart = c }} />
        </CartProvider>
      )
    })

    expect(cart.total).toBe(35000)
    expect(cart.itemCount).toBe(2)
  })

  it('does not fetch cart when no token', async () => {
    localStorageMock.getItem.mockReturnValue(null)

    let cart
    await act(async () => {
      render(
        <CartProvider>
          <TestConsumer onMount={(c) => { cart = c }} />
        </CartProvider>
      )
    })

    expect(mockGet).not.toHaveBeenCalled()
    expect(cart.items).toEqual([])
    expect(cart.loading).toBe(false)
  })

  it('addItem calls CartService.addItem and updates items', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'access_token') return 'test-token'
      return null
    })

    mockGet.mockRejectedValue({ response: { status: 404 } })

    let cart
    await act(async () => {
      render(
        <CartProvider>
          <TestConsumer onMount={(c) => { cart = c }} />
        </CartProvider>
      )
    })

    mockPost.mockResolvedValue({
      data: {
        cart_id: 1,
        items: [{ cart_item_id: 1, unit_price: '15000.00' }],
      },
    })

    await act(async () => {
      await cart.addItem(42)
    })

    expect(mockPost).toHaveBeenCalledWith('/cart/items/', { coreography_id: 42 })
    expect(cart.items).toHaveLength(1)
    expect(cart.total).toBe(15000)
  })

  it('removeItem calls CartService.removeItem and filters items', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'access_token') return 'test-token'
      return null
    })

    mockGet.mockResolvedValue({
      data: {
        cart_id: 1,
        items: [
          { cart_item_id: 1, unit_price: '10000.00' },
          { cart_item_id: 2, unit_price: '20000.00' },
        ],
      },
    })

    let cart
    await act(async () => {
      render(
        <CartProvider>
          <TestConsumer onMount={(c) => { cart = c }} />
        </CartProvider>
      )
    })

    mockDelete.mockResolvedValue({})

    await act(async () => {
      await cart.removeItem(1)
    })

    expect(mockDelete).toHaveBeenCalledWith('/cart/items/1/')
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].cart_item_id).toBe(2)
  })

  it('clearCart calls CartService.clearCart and empties items', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'access_token') return 'test-token'
      return null
    })

    mockGet.mockResolvedValue({
      data: {
        cart_id: 1,
        items: [{ cart_item_id: 1, unit_price: '10000.00' }],
      },
    })

    let cart
    await act(async () => {
      render(
        <CartProvider>
          <TestConsumer onMount={(c) => { cart = c }} />
        </CartProvider>
      )
    })

    mockDelete.mockResolvedValue({})

    await act(async () => {
      await cart.clearCart()
    })

    expect(mockDelete).toHaveBeenCalledWith('/cart/')
    expect(cart.items).toEqual([])
    expect(cart.cartId).toBeNull()
    expect(cart.total).toBe(0)
  })
})
