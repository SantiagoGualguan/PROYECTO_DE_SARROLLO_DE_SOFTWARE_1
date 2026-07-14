import { test, expect } from '@playwright/test'

test.describe('Catalog Page', () => {
  test('loads the public catalog page', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page).toHaveURL(/.*catalogo/)
  })

  test('has content on the page', async ({ page }) => {
    await page.goto('/catalogo')
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})

test.describe('Recover Password Page', () => {
  test('loads the recover password page', async ({ page }) => {
    await page.goto('/recuperar-clave')
    await expect(page).toHaveURL(/.*recuperar/)
  })
})

test.describe('Teacher Application Page', () => {
  test('loads the teacher application page', async ({ page }) => {
    await page.goto('/solicitud-profesor')
    await expect(page).toHaveURL(/.*solicitud/)
  })
})

test.describe('Landing Page V2', () => {
  test('loads the landing page v2', async ({ page }) => {
    await page.goto('/landing-v2')
    await expect(page).toHaveURL(/.*landing-v2/)
  })
})

test.describe('404 Page', () => {
  test('shows NotFound for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-12345')
    await expect(page.locator('text=NotFound').first()).toBeVisible()
  })
})
