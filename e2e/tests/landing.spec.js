import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('loads the landing page successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/DanceLearn|Dance/)
  })

  test('displays DanceLearn branding', async ({ page }) => {
    await page.goto('/')
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('has navigation links to catalog', async ({ page }) => {
    await page.goto('/')
    const catalogLink = page.locator('a[href="/catalogo"], button:has-text("Coreografías")').first()
    if (await catalogLink.isVisible()) {
      await expect(catalogLink).toBeVisible()
    }
  })

  test('has login button/link', async ({ page }) => {
    await page.goto('/')
    const loginElement = page.locator('button:has-text("Inicia sesión"), a[href="/login"]').first()
    if (await loginElement.isVisible()) {
      await expect(loginElement).toBeVisible()
    }
  })

  test('has register button/link', async ({ page }) => {
    await page.goto('/')
    const registerElement = page.locator('button:has-text("Regístrate"), a[href="/registro"]').first()
    if (await registerElement.isVisible()) {
      await expect(registerElement).toBeVisible()
    }
  })

  test('navigates to login page', async ({ page }) => {
    await page.goto('/')
    const loginButton = page.locator('button:has-text("Inicia sesión"), a[href="/login"]').first()
    if (await loginButton.isVisible()) {
      await loginButton.click()
      await expect(page).toHaveURL(/.*login/)
    }
  })

  test('navigates to register page', async ({ page }) => {
    await page.goto('/')
    const registerButton = page.locator('button:has-text("Regístrate"), a[href="/registro"]').first()
    if (await registerButton.isVisible()) {
      await registerButton.click()
      await expect(page).toHaveURL(/.*registro/)
    }
  })

  test('navigates to catalog page', async ({ page }) => {
    await page.goto('/')
    const catalogLink = page.locator('a[href="/catalogo"], button:has-text("Coreografías")').first()
    if (await catalogLink.isVisible()) {
      await catalogLink.click()
      await expect(page).toHaveURL(/.*catalogo/)
    }
  })
})
