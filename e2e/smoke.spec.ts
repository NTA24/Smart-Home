import { test, expect } from '@playwright/test'

test.describe('Navigation smoke tests', () => {
  test('root redirects to /home/tenant', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/home\/tenant/)
  })

  test('login page renders and navigates home', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('button')).toBeVisible()
    await page.click('button')
    await expect(page).toHaveURL(/\/home\/tenant/)
  })

  test('dashboard route loads', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/dashboard')
  })

  test('unknown route does not crash (no white screen)', async ({ page }) => {
    const response = await page.goto('/this-does-not-exist-xyz')
    // SPA should still serve the shell (index.html) with 200
    expect(response?.status()).toBe(200)
    // The page body should contain something (not a blank crash)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('redirect aliases work', async ({ page }) => {
    await page.goto('/fire-alarm')
    await expect(page).toHaveURL(/\/fire-alarm-dashboard/)
  })
})
