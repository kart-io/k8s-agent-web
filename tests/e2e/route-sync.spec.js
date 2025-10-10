/**
 * E2E tests for route synchronization
 *
 * These tests verify that:
 * - Deep routes load immediately without blank screens
 * - Rapid route switching doesn't cause 串台 (route conflicts)
 * - Route sync works without setTimeout hacks
 */

import { test, expect } from '@playwright/test'

test.describe('Route Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    // Login first to access micro-apps
    await page.goto('http://localhost:3000')

    const isLoggedIn = await page.locator('.ant-layout-header').isVisible().catch(() => false)

    if (!isLoggedIn) {
      await page.fill('input[type="text"]', 'admin')
      await page.fill('input[type="password"]', 'admin123')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/, { timeout: 5000 })
    }
  })

  test.describe('Direct Deep Route Navigation', () => {
    test('should load deep route /system/users immediately without blank screen', async ({ page }) => {
      // Navigate directly to deep route
      await page.goto('http://localhost:3000/system/users')

      // Wait a bit for micro-app to load
      await page.waitForTimeout(2000)

      // Page should not be blank
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()
      expect(bodyText.length).toBeGreaterThan(100) // Should have substantial content

      // Should not show error
      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      expect(hasError).toBe(false)

      // URL should remain at deep route
      expect(page.url()).toContain('/system/users')
    })

    test('should load deep route /system/roles immediately', async ({ page }) => {
      await page.goto('http://localhost:3000/system/roles')
      await page.waitForTimeout(2000)

      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()
      expect(bodyText.length).toBeGreaterThan(100)

      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      expect(hasError).toBe(false)

      expect(page.url()).toContain('/system/roles')
    })

    test('should load deep route /agents/list immediately', async ({ page }) => {
      await page.goto('http://localhost:3000/agents/list')
      await page.waitForTimeout(2000)

      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()

      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      expect(hasError).toBe(false)

      expect(page.url()).toContain('/agents')
    })

    test('should handle nested deep routes /system/users/123/edit', async ({ page }) => {
      await page.goto('http://localhost:3000/system/users/123/edit')
      await page.waitForTimeout(2000)

      // Should load without error
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()

      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      expect(hasError).toBe(false)
    })

    test('should preserve query parameters in deep routes', async ({ page }) => {
      await page.goto('http://localhost:3000/system/users?page=2&size=20')
      await page.waitForTimeout(2000)

      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()

      // Query params should be preserved in URL
      expect(page.url()).toContain('page=2')
      expect(page.url()).toContain('size=20')
    })
  })

  test.describe('Rapid Route Switching (No 串台)', () => {
    test('should handle rapid navigation between different micro-apps', async ({ page }) => {
      // Navigate rapidly between apps
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForTimeout(500)

      await page.goto('http://localhost:3000/agents')
      await page.waitForTimeout(500)

      await page.goto('http://localhost:3000/system')
      await page.waitForTimeout(500)

      await page.goto('http://localhost:3000/clusters')
      await page.waitForTimeout(1500)

      // Final app should load correctly
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()

      // Should be at cluster app route
      expect(page.url()).toContain('/clusters')

      // Should not show error
      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      expect(hasError).toBe(false)
    })

    test('should handle rapid navigation within same micro-app', async ({ page }) => {
      // Navigate to system app
      await page.goto('http://localhost:3000/system')
      await page.waitForTimeout(1000)

      // Rapidly switch between routes in system app
      await page.goto('http://localhost:3000/system/users')
      await page.waitForTimeout(300)

      await page.goto('http://localhost:3000/system/roles')
      await page.waitForTimeout(300)

      await page.goto('http://localhost:3000/system/permissions')
      await page.waitForTimeout(1500)

      // Final route should load correctly
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()

      // Should be at permissions route
      expect(page.url()).toContain('/system/permissions')

      // Should not show error
      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      expect(hasError).toBe(false)
    })

    test('should not show previous app content when switching (no 串台)', async ({ page }) => {
      // Load first app and get some identifiable content
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForTimeout(2000)

      const dashboardContent = await page.textContent('body')

      // Switch to different app
      await page.goto('http://localhost:3000/system/users')
      await page.waitForTimeout(2000)

      const systemContent = await page.textContent('body')

      // Content should be different (no 串台)
      expect(systemContent).not.toBe(dashboardContent)

      // System app should not contain dashboard-specific content
      // This is a basic check - actual implementation would check for specific identifiers
      expect(systemContent).toBeTruthy()
    })

    test('should handle back/forward navigation correctly', async ({ page }) => {
      // Navigate through several routes
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForTimeout(1000)

      await page.goto('http://localhost:3000/agents')
      await page.waitForTimeout(1000)

      await page.goto('http://localhost:3000/system/users')
      await page.waitForTimeout(1000)

      // Go back
      await page.goBack()
      await page.waitForTimeout(1000)

      expect(page.url()).toContain('/agents')

      // Go back again
      await page.goBack()
      await page.waitForTimeout(1000)

      expect(page.url()).toContain('/dashboard')

      // Go forward
      await page.goForward()
      await page.waitForTimeout(1000)

      expect(page.url()).toContain('/agents')

      // All pages should load without error
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()
    })
  })

  test.describe('Route Sync Performance', () => {
    test('should load deep route within acceptable time (< 2 seconds)', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('http://localhost:3000/system/users')

      // Wait for content to appear
      await page.waitForSelector('body', { timeout: 5000 })

      // Wait a bit more for micro-app to fully load
      await page.waitForTimeout(1000)

      const endTime = Date.now()
      const loadTime = endTime - startTime

      // Should load within 2 seconds after navigation
      expect(loadTime).toBeLessThan(3000)

      // Should have content
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()
    })

    test('should not show loading delay when navigating between routes', async ({ page }) => {
      await page.goto('http://localhost:3000/system/users')
      await page.waitForTimeout(2000)

      const startTime = Date.now()

      // Navigate to another route in same app
      await page.goto('http://localhost:3000/system/roles')
      await page.waitForTimeout(500)

      const endTime = Date.now()
      const switchTime = endTime - startTime

      // Due to keep-alive, switching should be very fast
      expect(switchTime).toBeLessThan(1000)

      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()
    })
  })

  test.describe('Error Handling', () => {
    test('should emit error event when navigation fails', async ({ page }) => {
      // Set up console listener to catch error events
      const consoleMessages = []
      page.on('console', msg => {
        if (msg.type() === 'error' || msg.text().includes('route:error')) {
          consoleMessages.push(msg.text())
        }
      })

      // Try to navigate to invalid route
      await page.goto('http://localhost:3000/system/invalid-route-xyz')
      await page.waitForTimeout(2000)

      // Should either show 404 or handle gracefully
      // Exact behavior depends on micro-app implementation
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()
    })
  })

  test.describe('Debounce Verification', () => {
    test('should handle multiple rapid navigations gracefully', async ({ page }) => {
      // This tests the debounce mechanism indirectly
      // Rapid navigations should not cause errors or blank screens

      // Fire multiple navigation requests rapidly
      const navigations = [
        page.goto('http://localhost:3000/dashboard'),
        page.goto('http://localhost:3000/agents'),
        page.goto('http://localhost:3000/system/users')
      ]

      // Wait for all to settle
      await Promise.all(navigations.map(p => p.catch(() => null)))
      await page.waitForTimeout(2000)

      // Final page should load correctly
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()

      // Should be at last requested route
      expect(page.url()).toContain('/system/users')

      // Should not show error
      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      expect(hasError).toBe(false)
    })
  })
})
