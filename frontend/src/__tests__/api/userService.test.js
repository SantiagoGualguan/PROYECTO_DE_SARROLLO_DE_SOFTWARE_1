import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGet, mockPost, mockPatch, mockPut, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
  mockPut: vi.fn(),
  mockDelete: vi.fn(),
}))

vi.mock('../../api/axios', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    put: mockPut,
    delete: mockDelete,
  },
}))

import { UserService } from '../../api/userService'

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getInternalUsers calls GET /users/internal/ with params', () => {
    UserService.getInternalUsers('admin', 'Carlos')
    expect(mockGet).toHaveBeenCalledWith('/users/internal/', {
      params: { rol: 'admin', search: 'Carlos' },
    })
  })

  it('getInternalUsers omits empty params', () => {
    UserService.getInternalUsers()
    expect(mockGet).toHaveBeenCalledWith('/users/internal/', {
      params: {},
    })
  })

  it('createInternalUser calls POST /users/internal/', () => {
    const data = { nombre: 'New', rol: 'admin', correo: 'a@b.com', contrasena: 'pass', identificacion: '123' }
    UserService.createInternalUser(data)
    expect(mockPost).toHaveBeenCalledWith('/users/internal/', data)
  })

  it('getInternalUserDetail calls GET /users/internal/{id}/', () => {
    UserService.getInternalUserDetail(5)
    expect(mockGet).toHaveBeenCalledWith('/users/internal/5/')
  })

  it('updateInternalUser calls PATCH /users/internal/{id}/', () => {
    const data = { nombre: 'Updated' }
    UserService.updateInternalUser(5, data)
    expect(mockPatch).toHaveBeenCalledWith('/users/internal/5/', data)
  })

  it('deleteInternalUser calls DELETE /users/internal/{id}/', () => {
    UserService.deleteInternalUser(3)
    expect(mockDelete).toHaveBeenCalledWith('/users/internal/3/')
  })

  it('getClientProfile calls GET /users/clients/me/', () => {
    UserService.getClientProfile()
    expect(mockGet).toHaveBeenCalledWith('/users/clients/me/')
  })

  it('updateClientProfile calls PUT /users/clients/me/', () => {
    const data = { nombre: 'Cliente' }
    UserService.updateClientProfile(data)
    expect(mockPut).toHaveBeenCalledWith('/users/clients/me/', data)
  })

  it('getClientPurchaseHistory calls GET /users/clients/me/history/', () => {
    UserService.getClientPurchaseHistory()
    expect(mockGet).toHaveBeenCalledWith('/users/clients/me/history/')
  })
})
