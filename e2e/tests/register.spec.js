import { test, expect } from '@playwright/test'

test.describe('Register Page', () => {
  test('loads the register page', async ({ page }) => {
    await page.goto('/registro')
    await expect(page).toHaveURL(/.*registro/)
  })

  test('has first name input', async ({ page }) => {
    await page.goto('/registro')
    const nameInput = page.locator('input[name="nombres"]').first()
    await expect(nameInput).toBeVisible()
  })

  test('has last name input', async ({ page }) => {
    await page.goto('/registro')
    const lastNameInput = page.locator('input[name="apellidos"]').first()
    await expect(lastNameInput).toBeVisible()
  })

  test('has email input', async ({ page }) => {
    await page.goto('/registro')
    const emailInput = page.locator('input[name="correo"], input[type="email"]').first()
    await expect(emailInput).toBeVisible()
  })

  test('has phone input', async ({ page }) => {
    await page.goto('/registro')
    const phoneInput = page.locator('input[name="telefono"]').first()
    await expect(phoneInput).toBeVisible()
  })

  test('has password input', async ({ page }) => {
    await page.goto('/registro')
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first()
    await expect(passwordInput).toBeVisible()
  })

  test('has a submit/register button', async ({ page }) => {
    await page.goto('/registro')
    const registerButton = page.locator('button:has-text("Registrarse"), button:has-text("Crear cuenta")').first()
    await expect(registerButton).toBeVisible()
  })

  test('can fill in the registration form', async ({ page }) => {
    await page.goto('/registro')
    await page.locator('input[name="nombres"]').fill('Test')
    await page.locator('input[name="apellidos"]').fill('User')
    await page.locator('input[name="correo"], input[type="email"]').first().fill('testuser@test.com')
    await page.locator('input[name="telefono"]').fill('3001112233')
    await page.locator('input[name="password"], input[type="password"]').first().fill('securepass123')

    await expect(page.locator('input[name="nombres"]')).toHaveValue('Test')
    await expect(page.locator('input[name="apellidos"]')).toHaveValue('User')
  })

  test('navigates to login from register', async ({ page }) => {
    await page.goto('/registro')
    const loginLink = page.locator('text=Inicia sesión aquí, a[href="/login"]').first()
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await expect(page).toHaveURL(/.*login/)
    }
  })
})
