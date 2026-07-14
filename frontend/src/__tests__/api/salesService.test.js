import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}))

vi.mock('../../api/axios', () => ({
  default: {
    get: mockGet,
    post: mockPost,
  },
}))

import { SalesService } from '../../api/salesService'

describe('SalesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createPurchase calls POST /sales/', () => {
    const data = { payment_method: 'pm_card_visa', currency: 'usd' }
    SalesService.createPurchase(data)
    expect(mockPost).toHaveBeenCalledWith('/sales/', data)
  })

  it('getPurchaseHistory calls GET /sales/', () => {
    SalesService.getPurchaseHistory()
    expect(mockGet).toHaveBeenCalledWith('/sales/')
  })

  it('getPurchaseDetail calls GET /sales/{id}/', () => {
    SalesService.getPurchaseDetail(7)
    expect(mockGet).toHaveBeenCalledWith('/sales/7/')
  })

  it('getPurchaseDetail calls GET with string id', () => {
    SalesService.getPurchaseDetail('12')
    expect(mockGet).toHaveBeenCalledWith('/sales/12/')
  })

  it('confirmItems calls POST /sales/confirm-items/ without cartId', () => {
    SalesService.confirmItems()
    expect(mockPost).toHaveBeenCalledWith('/sales/confirm-items/', {})
  })

  it('confirmItems calls POST /sales/confirm-items/ with cartId', () => {
    SalesService.confirmItems(5)
    expect(mockPost).toHaveBeenCalledWith('/sales/confirm-items/', { cart_id: 5 })
  })

  it('confirmBilling calls POST /sales/confirm-billing/', () => {
    const billingData = {
      email_address: 'buyer@test.com',
      titular_name: 'Test Buyer',
      document_number: '100200300',
    }
    SalesService.confirmBilling(billingData)
    expect(mockPost).toHaveBeenCalledWith('/sales/confirm-billing/', billingData)
  })

  it('confirmPayment calls POST /sales/confirm-payment/', () => {
    const paymentData = {
      payment_method: 'pm_card_visa',
      currency: 'usd',
    }
    SalesService.confirmPayment(paymentData)
    expect(mockPost).toHaveBeenCalledWith('/sales/confirm-payment/', paymentData)
  })

  it('confirmPayment includes billing data when combined', () => {
    const paymentData = {
      payment_method: 'pm_card_visa',
      email_address: 'buyer@test.com',
      titular_name: 'Buyer',
      document_number: '123',
    }
    SalesService.confirmPayment(paymentData)
    expect(mockPost).toHaveBeenCalledWith('/sales/confirm-payment/', paymentData)
  })
})
