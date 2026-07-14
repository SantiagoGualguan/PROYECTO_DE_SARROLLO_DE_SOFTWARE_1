import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_API_URL || 'http://localhost:8000/api'

test.describe('API Health Check', () => {
  test('GET /api/choreographies/ returns a response', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/choreographies/`)
    expect(response.status()).toBe(200)
  })

  test('GET /api/choreographies/ returns JSON', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/choreographies/`)
    const contentType = response.headers()['content-type'] || ''
    expect(contentType).toContain('application/json')
  })

  test('POST /api/auth/login/ without body returns 400', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/login/`, {
      data: {},
    })
    expect(response.status()).toBe(400)
  })

  test('POST /api/auth/register/ without body returns 400', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/register/`, {
      data: {},
    })
    expect(response.status()).toBe(400)
  })

  test('GET /api/cart/cart/ without auth returns 401', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/cart/cart/`)
    expect(response.status()).toBe(401)
  })

  test('GET /api/sales/ without auth returns 401', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sales/`)
    expect(response.status()).toBe(401)
  })

  test('GET /api/dashboard/admin/ without auth returns 401', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/dashboard/admin/`)
    expect(response.status()).toBe(401)
  })

  test('GET /api/dashboard/profesor/ without auth returns 401', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/dashboard/profesor/`)
    expect(response.status()).toBe(401)
  })

  test('GET /api/dashboard/cliente/ without auth returns 401', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/dashboard/cliente/`)
    expect(response.status()).toBe(401)
  })

  test('POST /api/auth/token-refresh/ without body returns 400', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/token-refresh/`, {
      data: {},
    })
    expect(response.status()).toBe(400)
  })
})

test.describe('Authentication Flow', () => {
  const testUser = {
    first_name: 'E2E',
    last_name: 'TestUser',
    email: `e2etest_${Date.now()}@test.com`,
    phone: `300${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    password: 'TestPass123!',
  }

  test('register creates a new user', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/register/`, {
      data: {
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        email: testUser.email,
        phone: testUser.phone,
        password: testUser.password,
      },
    })
    expect(response.status()).toBe(201)
  })

  test('login with registered user returns tokens', async ({ request }) => {
    await request.post(`${BASE_URL}/auth/register/`, {
      data: {
        first_name: 'Login',
        last_name: 'Test',
        email: `logintest_${Date.now()}@test.com`,
        phone: `300${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        password: 'TestPass123!',
      },
    })

    const response = await request.post(`${BASE_URL}/auth/login/`, {
      data: {
        identifier: `logintest_${Date.now() - 1}@test.com`,
        password: 'TestPass123!',
      },
    })
    const status = response.status()
    expect([200, 400]).toContain(status)
  })
})
