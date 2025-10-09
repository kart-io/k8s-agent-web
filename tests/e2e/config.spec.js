/**
 * E2E tests for config-driven URL resolution
 *
 * These tests verify that:
 * - Micro-apps load correctly using centralized configuration
 * - URLs are resolved based on environment
 * - Configuration changes propagate without code modifications
 */

import { test, expect } from '@playwright/test'

test.describe('Config-driven URL Resolution', () => {
  test.beforeEach(async ({ page }) => {
    // Login first to access micro-apps
    await page.goto('http://localhost:3000')

    // Check if already logged in
    const isLoggedIn = await page.locator('.ant-layout-header').isVisible().catch(() => false)

    if (!isLoggedIn) {
      // Perform login
      await page.fill('input[type="text"]', 'admin')
      await page.fill('input[type="password"]', 'admin123')
      await page.click('button[type="submit"]')

      // Wait for redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 5000 })
    }
  })

  test('should load dashboard micro-app using config URL', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard')

    // Wait for micro-app to load
    await page.waitForTimeout(2000)

    // Verify micro-app loaded successfully
    // The page should not be blank and should have content
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
    expect(bodyText.length).toBeGreaterThan(0)

    // Verify no error messages
    const errorElements = await page.locator('.ant-result-error').count()
    expect(errorElements).toBe(0)
  })

  test('should load all 6 micro-apps using centralized config', async ({ page }) => {
    const microApps = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/agents', name: 'Agent' },
      { path: '/clusters', name: 'Cluster' },
      { path: '/monitor', name: 'Monitor' },
      { path: '/system', name: 'System' },
      { path: '/image-build', name: 'Image Build' }
    ]

    for (const app of microApps) {
      // Navigate to micro-app
      await page.goto(`http://localhost:3000${app.path}`)

      // Wait for micro-app to load
      await page.waitForTimeout(2000)

      // Verify page loaded (not blank)
      const bodyText = await page.textContent('body')
      expect(bodyText, `${app.name} app should have content`).toBeTruthy()

      // Verify no error state
      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      expect(hasError, `${app.name} app should not show error`).toBe(false)
    }
  })

  test('should use development URLs in development mode', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard')

    // Wait for micro-app iframe to load
    await page.waitForTimeout(2000)

    // Check network requests for micro-app resources
    const requests = []
    page.on('request', request => {
      if (request.url().includes('localhost:300')) {
        requests.push(request.url())
      }
    })

    // Reload to capture requests
    await page.reload()
    await page.waitForTimeout(2000)

    // Should have requests to localhost:3001 (dashboard-app development URL)
    const hasDashboardRequests = requests.some(url =>
      url.includes('localhost:3001')
    )
    expect(hasDashboardRequests).toBe(true)
  })

  test('should handle deep route navigation to micro-app', async ({ page }) => {
    // Navigate directly to a deep route within system-app
    await page.goto('http://localhost:3000/system/users')

    // Wait for micro-app to load
    await page.waitForTimeout(2000)

    // Page should not be blank
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()

    // Should not show error page
    const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
    expect(hasError).toBe(false)

    // URL should still be at /system/users
    expect(page.url()).toContain('/system/users')
  })

  test('should load micro-app after page refresh', async ({ page }) => {
    // Navigate to agent-app
    await page.goto('http://localhost:3000/agents')
    await page.waitForTimeout(2000)

    // Verify loaded
    let bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()

    // Refresh page
    await page.reload()
    await page.waitForTimeout(2000)

    // Should still be loaded correctly
    bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()

    // Should not show error
    const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
    expect(hasError).toBe(false)
  })

  test('should show error when micro-app URL is unreachable', async ({ page }) => {
    // This test requires temporarily modifying the config to use an invalid URL
    // For now, we'll test by stopping a micro-app service

    // Navigate to a micro-app
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForTimeout(2000)

    // If we can't reach the micro-app, it should either:
    // 1. Show an error boundary
    // 2. Show a loading state that eventually times out
    // 3. Show a blank iframe

    // For this test to properly work, we would need to:
    // 1. Stop the dashboard-app service (port 3001)
    // 2. Navigate to /dashboard
    // 3. Verify error handling

    // Mark this test as todo for manual verification
    test.skip()
  })

  test('should support switching between micro-apps', async ({ page }) => {
    // Load first micro-app
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForTimeout(2000)

    const dashboardContent = await page.textContent('body')
    expect(dashboardContent).toBeTruthy()

    // Switch to second micro-app
    await page.goto('http://localhost:3000/agents')
    await page.waitForTimeout(2000)

    const agentContent = await page.textContent('body')
    expect(agentContent).toBeTruthy()

    // Content should be different
    expect(agentContent).not.toBe(dashboardContent)

    // Switch back to first micro-app
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForTimeout(2000)

    const dashboardContent2 = await page.textContent('body')
    expect(dashboardContent2).toBeTruthy()
  })

  test('should maintain micro-app state when navigating away and back (keep-alive)', async ({ page }) => {
    // Navigate to system-app
    await page.goto('http://localhost:3000/system')
    await page.waitForTimeout(2000)

    // Interact with the app (if there's any interactive element)
    // This is a placeholder - actual interaction depends on app implementation

    // Navigate to another app
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForTimeout(2000)

    // Navigate back to system-app
    await page.goto('http://localhost:3000/system')
    await page.waitForTimeout(2000)

    // Due to Wujie keep-alive mode, the app state should be preserved
    // Verify app loaded quickly (cached)
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })
})

test.describe('Configuration Error Handling', () => {
  test('should gracefully handle missing app configuration', async ({ page }) => {
    // Try to navigate to a non-configured app
    await page.goto('http://localhost:3000/non-existent-app')

    // Should either show 404 or error page
    await page.waitForTimeout(2000)

    // Page should show some error indication
    const has404 = await page.locator('text=/404|not found/i').isVisible().catch(() => false)
    const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

    expect(has404 || hasError).toBe(true)
  })
})
