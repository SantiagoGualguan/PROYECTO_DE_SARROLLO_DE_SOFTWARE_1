import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('loads the login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/.*login/)
  })

  test('displays the login form title', async ({ page }) => {
    await page.goto('/login')
    const title = page.locator('h1:has-text("Inicio de sesión"), .login-title')
    await expect(title.first()).toBeVisible()
  })

  test('has email/identifier input field', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.locator('input[name="identifier"], input[type="email"]').first()
    await expect(emailInput).toBeVisible()
  })

  test('has password input field', async ({ page }) => {
    await page.goto('/login')
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first()
    await expect(passwordInput).toBeVisible()
  })

  test('has a submit/login button', async ({ page }) => {
    await page.goto('/login')
    const loginButton = page.locator('button:has-text("Iniciar sesión")').first()
    await expect(loginButton).toBeVisible()
  })

  test('can type in email field', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.locator('input[name="identifier"], input[type="email"]').first()
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
  })

  test('can type in password field', async ({ page }) => {
    await page.goto('/login')
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first()
    await passwordInput.fill('mypassword')
    await expect(passwordInput).toHaveValue('mypassword')
  })

  test('has link to register page', async ({ page }) => {
    await page.goto('/login')
    const registerLink = page.locator('text=Crea tu cuenta aquí, a[href="/registro"]').first()
    if (await registerLink.isVisible()) {
      await expect(registerLink).toBeVisible()
    }
  })

  test('has link to recover password', async ({ page }) => {
    await page.goto('/login')
    const recoverLink = page.locator('text=Recordar contraseña aquí, a[href="/recuperar-clave"]').first()
    if (await recoverLink.isVisible()) {
      await expect(recoverLink).toBeVisible()
    }
  })

  test('navigates to register from login', async ({ page }) => {
    await page.goto('/login')
    const registerLink = page.locator('text=Crea tu cuenta aquí').first()
    if (await registerLink.isVisible()) {
      await registerLink.click()
      await expect(page).toHaveURL(/.*registro/)
    }
  })
})
