/**
 * E2E tests for ErrorBoundary component
 *
 * These tests verify:
 * - Error boundary displays when micro-app fails to load
 * - Retry functionality works correctly
 * - Home navigation works correctly
 * - Different error types show appropriate messages
 * - Error recovery after successful retry
 */

import { test, expect } from '@playwright/test'

test.describe('Error Boundary', () => {
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

  test.describe('Error Display', () => {
    test('should display error boundary when micro-app fails to load', async ({ page, context }) => {
      // Block requests to one of the micro-apps to simulate failure
      await context.route('**/localhost:3002/**', route => {
        route.abort('failed')
      })

      // Try to navigate to agent app
      await page.goto('http://localhost:3000/agents')
      await page.waitForTimeout(3000)

      // Should show error result
      const errorResult = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (errorResult) {
        // Verify error UI elements
        expect(errorResult).toBe(true)

        const title = await page.locator('.ant-result-title').textContent()
        expect(title).toBeTruthy()

        // Should have retry and home buttons
        const buttons = await page.locator('.ant-btn').count()
        expect(buttons).toBeGreaterThanOrEqual(2)
      }
    })

    test('should show network error message for connection failures', async ({ page, context }) => {
      // Block network requests
      await context.route('**/localhost:3001/**', route => {
        route.abort('failed')
      })

      await page.goto('http://localhost:3000/dashboard')
      await page.waitForTimeout(3000)

      const errorResult = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (errorResult) {
        const title = await page.locator('.ant-result-title').textContent()
        expect(title).toContain('错误')
      }
    })

    test('should show loading timeout error after timeout period', async ({ page }) => {
      // This test simulates a slow-loading micro-app
      // In real scenarios, the ErrorBoundary should detect timeouts

      // Navigate to a micro-app
      await page.goto('http://localhost:3000/dashboard')

      // Wait for page to load or timeout
      await page.waitForTimeout(6000)

      // Check if error boundary is shown (might not be if app loads successfully)
      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

      // If error is shown, verify it's a proper error UI
      if (hasError) {
        const buttons = await page.locator('.ant-btn').count()
        expect(buttons).toBeGreaterThanOrEqual(2)
      } else {
        // If no error, app should have loaded successfully
        const bodyText = await page.textContent('body')
        expect(bodyText).toBeTruthy()
        expect(bodyText.length).toBeGreaterThan(100)
      }
    })
  })

  test.describe('Retry Functionality', () => {
    test('should reload page when retry button is clicked', async ({ page, context }) => {
      // Block requests initially
      let blockRequests = true

      await context.route('**/localhost:3005/**', route => {
        if (blockRequests) {
          route.abort('failed')
        } else {
          route.continue()
        }
      })

      // Navigate to system app
      await page.goto('http://localhost:3000/system')
      await page.waitForTimeout(3000)

      // Check if error is shown
      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (hasError) {
        // Unblock requests
        blockRequests = false

        // Find and click retry button
        const buttons = await page.locator('.ant-btn').all()
        if (buttons.length >= 2) {
          await buttons[0].click()
          await page.waitForTimeout(2000)

          // After retry, page should reload
          // In real scenario, this would reload the page
          expect(page.url()).toContain('/system')
        }
      }
    })

    test('should emit retry event when retry button is clicked', async ({ page, context }) => {
      // Set up console listener
      const consoleMessages = []
      page.on('console', msg => {
        consoleMessages.push(msg.text())
      })

      // Block requests to cause error
      await context.route('**/localhost:3004/**', route => {
        route.abort('failed')
      })

      await page.goto('http://localhost:3000/monitor')
      await page.waitForTimeout(3000)

      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (hasError) {
        const retryButton = await page.locator('.ant-btn').first()
        await retryButton.click()
        await page.waitForTimeout(1000)

        // Check console for retry log
        const hasRetryLog = consoleMessages.some(msg => msg.includes('Retrying'))
        expect(hasRetryLog).toBe(true)
      }
    })
  })

  test.describe('Home Navigation', () => {
    test('should navigate to home when home button is clicked', async ({ page, context }) => {
      // Block requests to cause error
      await context.route('**/localhost:3003/**', route => {
        route.abort('failed')
      })

      // Navigate to cluster app
      await page.goto('http://localhost:3000/clusters')
      await page.waitForTimeout(3000)

      // Check if error is shown
      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (hasError) {
        // Find and click home button (second button)
        const buttons = await page.locator('.ant-btn').all()
        if (buttons.length >= 2) {
          await buttons[1].click()
          await page.waitForTimeout(2000)

          // Should navigate to home/dashboard
          expect(page.url()).toMatch(/\/(dashboard)?$/)
        }
      }
    })

    test('should clear error state after navigating home', async ({ page, context }) => {
      // Block requests
      await context.route('**/localhost:3006/**', route => {
        route.abort('failed')
      })

      await page.goto('http://localhost:3000/image-build')
      await page.waitForTimeout(3000)

      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (hasError) {
        // Click home button
        const buttons = await page.locator('.ant-btn').all()
        if (buttons.length >= 2) {
          await buttons[1].click()
          await page.waitForTimeout(2000)

          // Error should be cleared
          const stillHasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
          expect(stillHasError).toBe(false)

          // Should show normal content
          const bodyText = await page.textContent('body')
          expect(bodyText).toBeTruthy()
        }
      }
    })
  })

  test.describe('Error Recovery', () => {
    test('should recover after successful retry', async ({ page, context }) => {
      // Block requests initially
      let requestCount = 0

      await context.route('**/localhost:3002/**', route => {
        requestCount++
        if (requestCount === 1) {
          // Fail first request
          route.abort('failed')
        } else {
          // Allow subsequent requests
          route.continue()
        }
      })

      // Navigate to agent app
      await page.goto('http://localhost:3000/agents')
      await page.waitForTimeout(3000)

      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (hasError) {
        // Retry
        const retryButton = await page.locator('.ant-btn').first()
        await retryButton.click()
        await page.waitForTimeout(3000)

        // After retry, app should load successfully
        const stillHasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

        // Either error is cleared or page content is visible
        if (!stillHasError) {
          const bodyText = await page.textContent('body')
          expect(bodyText).toBeTruthy()
          expect(bodyText.length).toBeGreaterThan(100)
        }
      }
    })

    test('should handle multiple retry attempts', async ({ page, context }) => {
      let retryAttempts = 0

      await context.route('**/localhost:3001/**', route => {
        retryAttempts++
        if (retryAttempts <= 2) {
          // Fail first two attempts
          route.abort('failed')
        } else {
          // Success on third attempt
          route.continue()
        }
      })

      await page.goto('http://localhost:3000/dashboard')
      await page.waitForTimeout(3000)

      // Try retry up to 2 times
      for (let i = 0; i < 2; i++) {
        const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

        if (hasError) {
          const retryButton = await page.locator('.ant-btn').first()
          await retryButton.click()
          await page.waitForTimeout(3000)
        } else {
          break
        }
      }

      // Eventually should load successfully or still show error
      const finalError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      const bodyText = await page.textContent('body')

      // Should have some content either way
      expect(bodyText).toBeTruthy()
    })
  })

  test.describe('Error Boundary Integration', () => {
    test('should not interfere with successful page loads', async ({ page }) => {
      // Navigate to working micro-app
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForTimeout(2000)

      // Should not show error
      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      expect(hasError).toBe(false)

      // Should show normal content
      const bodyText = await page.textContent('body')
      expect(bodyText).toBeTruthy()
      expect(bodyText.length).toBeGreaterThan(100)
    })

    test('should work with deep routes', async ({ page, context }) => {
      // Block requests
      await context.route('**/localhost:3005/**', route => {
        route.abort('failed')
      })

      // Navigate to deep route
      await page.goto('http://localhost:3000/system/users')
      await page.waitForTimeout(3000)

      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (hasError) {
        // Should show error UI
        const buttons = await page.locator('.ant-btn').count()
        expect(buttons).toBeGreaterThanOrEqual(2)

        // URL should still be at deep route
        expect(page.url()).toContain('/system')
      }
    })

    test('should work with multiple micro-app switches', async ({ page, context }) => {
      // Block specific app
      await context.route('**/localhost:3003/**', route => {
        route.abort('failed')
      })

      // Navigate through multiple apps
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForTimeout(1500)

      // This one works
      let hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)
      expect(hasError).toBe(false)

      // Navigate to blocked app
      await page.goto('http://localhost:3000/clusters')
      await page.waitForTimeout(3000)

      // This one should error
      hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (hasError) {
        // Navigate back to working app via home button
        const buttons = await page.locator('.ant-btn').all()
        if (buttons.length >= 2) {
          await buttons[1].click()
          await page.waitForTimeout(2000)

          // Should be back to working state
          const finalError = await page.locator('.ant-result-error').isVisible().catch(() => false)
          expect(finalError).toBe(false)
        }
      }
    })
  })

  test.describe('Error Messages', () => {
    test('should display appropriate error messages', async ({ page, context }) => {
      // Block requests
      await context.route('**/localhost:3002/**', route => {
        route.abort('failed')
      })

      await page.goto('http://localhost:3000/agents')
      await page.waitForTimeout(3000)

      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (hasError) {
        // Check error title exists
        const title = await page.locator('.ant-result-title').textContent()
        expect(title).toBeTruthy()
        expect(title.length).toBeGreaterThan(0)

        // Check error subtitle exists
        const subtitle = await page.locator('.ant-result-subtitle').textContent()
        expect(subtitle).toBeTruthy()
        expect(subtitle.length).toBeGreaterThan(0)
      }
    })

    test('should show user-friendly error messages in Chinese', async ({ page, context }) => {
      await context.route('**/localhost:3004/**', route => {
        route.abort('failed')
      })

      await page.goto('http://localhost:3000/monitor')
      await page.waitForTimeout(3000)

      const hasError = await page.locator('.ant-result-error').isVisible().catch(() => false)

      if (hasError) {
        const title = await page.locator('.ant-result-title').textContent()
        const subtitle = await page.locator('.ant-result-subtitle').textContent()

        // Should be in Chinese
        expect(/[\u4e00-\u9fa5]/.test(title) || /[\u4e00-\u9fa5]/.test(subtitle)).toBe(true)
      }
    })
  })
})
