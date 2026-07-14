import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}))

vi.mock('../../api/axios', () => ({
  default: {
    get: mockGet,
  },
}))

import { DashboardService } from '../../api/dashboardService'

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAdminDashboard calls GET /dashboard/admin/', () => {
    DashboardService.getAdminDashboard()
    expect(mockGet).toHaveBeenCalledWith('/dashboard/admin/')
  })

  it('getProfesorDashboard calls GET /dashboard/profesor/', () => {
    DashboardService.getProfesorDashboard()
    expect(mockGet).toHaveBeenCalledWith('/dashboard/profesor/')
  })

  it('getClienteDashboard calls GET /dashboard/cliente/', () => {
    DashboardService.getClienteDashboard()
    expect(mockGet).toHaveBeenCalledWith('/dashboard/cliente/')
  })

  it('getAdminDashboard returns a promise', () => {
    mockGet.mockResolvedValue({ data: { total_users: 0 } })
    const result = DashboardService.getAdminDashboard()
    expect(result).toBeInstanceOf(Promise)
  })

  it('getProfesorDashboard returns a promise', () => {
    mockGet.mockResolvedValue({ data: { my_choreographies_count: 0 } })
    const result = DashboardService.getProfesorDashboard()
    expect(result).toBeInstanceOf(Promise)
  })

  it('getClienteDashboard returns a promise', () => {
    mockGet.mockResolvedValue({ data: { purchased_choreographies_count: 0 } })
    const result = DashboardService.getClienteDashboard()
    expect(result).toBeInstanceOf(Promise)
  })
})
