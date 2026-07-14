import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGet, mockPost, mockPut, mockPatch, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockPatch: vi.fn(),
  mockDelete: vi.fn(),
}))

vi.mock('../../api/axios', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    delete: mockDelete,
  },
}))

import { CoreographyService, VideoService } from '../../api/choreographyService'

describe('CoreographyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll calls GET /choreographies/ with params', () => {
    CoreographyService.getAll({ genero: 'salsa', nivel: 'basico' })
    expect(mockGet).toHaveBeenCalledWith('/choreographies/', {
      params: { genero: 'salsa', nivel: 'basico' },
    })
  })

  it('getAll calls GET /choreographies/ without params', () => {
    CoreographyService.getAll()
    expect(mockGet).toHaveBeenCalledWith('/choreographies/', { params: undefined })
  })

  it('getById calls GET /choreographies/{id}/', () => {
    CoreographyService.getById(5)
    expect(mockGet).toHaveBeenCalledWith('/choreographies/5/')
  })

  it('getById calls GET with string id', () => {
    CoreographyService.getById('12')
    expect(mockGet).toHaveBeenCalledWith('/choreographies/12/')
  })

  it('create calls POST /choreographies/', () => {
    const data = { c_name: 'New Dance', price: '10000' }
    CoreographyService.create(data)
    expect(mockPost).toHaveBeenCalledWith('/choreographies/', data)
  })

  it('update calls PUT /choreographies/{id}/', () => {
    const data = { c_name: 'Updated' }
    CoreographyService.update(3, data)
    expect(mockPut).toHaveBeenCalledWith('/choreographies/3/', data)
  })

  it('partialUpdate calls PATCH /choreographies/{id}/', () => {
    const data = { price: '20000' }
    CoreographyService.partialUpdate(3, data)
    expect(mockPatch).toHaveBeenCalledWith('/choreographies/3/', data)
  })

  it('delete calls DELETE /choreographies/{id}/', () => {
    CoreographyService.delete(3)
    expect(mockDelete).toHaveBeenCalledWith('/choreographies/3/')
  })

  it('getTopSelling calls GET /choreographies/top-selling/', () => {
    CoreographyService.getTopSelling()
    expect(mockGet).toHaveBeenCalledWith('/choreographies/top-selling/')
  })
})

describe('VideoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getByCoreography calls GET /videos/ with coreography param', () => {
    VideoService.getByCoreography(5)
    expect(mockGet).toHaveBeenCalledWith('/videos/', {
      params: { coreography: 5 },
    })
  })

  it('getById calls GET /videos/{id}/', () => {
    VideoService.getById(3)
    expect(mockGet).toHaveBeenCalledWith('/videos/3/')
  })

  it('create calls POST /videos/', () => {
    const data = { url: 'https://example.com/video.mp4', coreography: 1 }
    VideoService.create(data)
    expect(mockPost).toHaveBeenCalledWith('/videos/', data)
  })

  it('update calls PUT /videos/{id}/', () => {
    const data = { url: 'https://updated.com/video.mp4' }
    VideoService.update(2, data)
    expect(mockPut).toHaveBeenCalledWith('/videos/2/', data)
  })

  it('partialUpdate calls PATCH /videos/{id}/', () => {
    const data = { url: 'https://patched.com/video.mp4' }
    VideoService.partialUpdate(2, data)
    expect(mockPatch).toHaveBeenCalledWith('/videos/2/', data)
  })

  it('delete calls DELETE /videos/{id}/', () => {
    VideoService.delete(4)
    expect(mockDelete).toHaveBeenCalledWith('/videos/4/')
  })
})
