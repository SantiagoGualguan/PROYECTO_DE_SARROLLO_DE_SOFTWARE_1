import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CartProvider, useCart } from '../../context/CartContext'

function TestConsumer({ onMount }) {
  const cart = useCart()
  if (onMount) onMount(cart)
  return null
}

describe('CartContext', () => {
  it('starts with empty items and total 0', () => {
    let cart
    render(
      <CartProvider>
        <TestConsumer onMount={(c) => { cart = c }} />
      </CartProvider>
    )
    expect(cart.items).toEqual([])
    expect(cart.total).toBe(0)
  })

  it('addItem throws TODO error', () => {
    let cart
    render(
      <CartProvider>
        <TestConsumer onMount={(c) => { cart = c }} />
      </CartProvider>
    )
    expect(() => cart.addItem()).toThrow('TODO')
  })

  it('removeItem throws TODO error', () => {
    let cart
    render(
      <CartProvider>
        <TestConsumer onMount={(c) => { cart = c }} />
      </CartProvider>
    )
    expect(() => cart.removeItem()).toThrow('TODO')
  })

  it('clearCart throws TODO error', () => {
    let cart
    render(
      <CartProvider>
        <TestConsumer onMount={(c) => { cart = c }} />
      </CartProvider>
    )
    expect(() => cart.clearCart()).toThrow('TODO')
  })
})
