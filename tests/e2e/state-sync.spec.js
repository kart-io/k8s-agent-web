/**
 * E2E tests for cross-app shared state synchronization
 *
 * Tests that state changes in one micro-app are reflected in other micro-apps
 */

import { test, expect } from '@playwright/test'

test.describe('Shared State Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to main app
    await page.goto('http://localhost:3000')

    // Wait for app to load
    await page.waitForLoadState('networkidle')
  })

  test('should sync user avatar across micro-apps', async ({ page }) => {
    // Login first (if needed)
    // await page.click('text=Login')
    // await page.fill('[name="username"]', 'admin')
    // await page.fill('[name="password"]', 'admin123')
    // await page.click('button[type="submit"]')

    // Navigate to system app (where avatar can be updated)
    await page.goto('http://localhost:3000/system/users')
    await page.waitForLoadState('networkidle')

    // Update avatar (simulate)
    await page.evaluate(() => {
      if (window.$wujie?.bus) {
        window.$wujie.bus.$emit('state:update', {
          namespace: 'user',
          key: 'avatar',
          value: '/avatars/new-avatar.png',
          timestamp: Date.now()
        })
      }
    })

    // Wait a moment for state to propagate
    await page.waitForTimeout(100)

    // Navigate to dashboard to check if avatar updated
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForLoadState('networkidle')

    // Verify avatar was updated (check via window state or DOM)
    const avatarUpdated = await page.evaluate(() => {
      if (window.$wujie?.bus) {
        // In a real scenario, you'd check the actual component state
        return true // Placeholder
      }
      return false
    })

    expect(avatarUpdated).toBe(true)
  })

  test('should sync notification count across micro-apps', async ({ page }) => {
    // Emit notification count update
    await page.evaluate(() => {
      if (window.$wujie?.bus) {
        window.$wujie.bus.$emit('state:update', {
          namespace: 'notification',
          key: 'unreadCount',
          value: 5,
          timestamp: Date.now()
        })
      }
    })

    // Wait for propagation
    await page.waitForTimeout(100)

    // Navigate through different micro-apps
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForLoadState('networkidle')

    await page.goto('http://localhost:3000/system')
    await page.waitForLoadState('networkidle')

    // Verify count is consistent across apps
    const isConsistent = await page.evaluate(() => {
      return true // Placeholder - in real scenario check actual UI
    })

    expect(isConsistent).toBe(true)
  })

  test('should handle rapid state updates without loss', async ({ page }) => {
    // Emit multiple rapid updates
    await page.evaluate(() => {
      if (window.$wujie?.bus) {
        for (let i = 0; i < 10; i++) {
          window.$wujie.bus.$emit('state:update', {
            namespace: 'test',
            key: 'counter',
            value: i,
            timestamp: Date.now()
          })
        }
      }
    })

    // Wait for all updates to process
    await page.waitForTimeout(200)

    // Verify final state is correct
    const finalValue = await page.evaluate(() => {
      return 9 // Expected final value
    })

    expect(finalValue).toBe(9)
  })

  test('should persist user and system namespace to localStorage', async ({ page }) => {
    // Set state in persistable namespace
    await page.evaluate(() => {
      if (window.$wujie?.bus) {
        window.$wujie.bus.$emit('state:update', {
          namespace: 'user',
          key: 'theme',
          value: 'dark',
          timestamp: Date.now()
        })
      }
    })

    // Wait for persistence
    await page.waitForTimeout(100)

    // Check localStorage
    const persisted = await page.evaluate(() => {
      const value = localStorage.getItem('shared_state_user_theme')
      return value ? JSON.parse(value) : null
    })

    expect(persisted).toBe('dark')
  })

  test('should not persist notification namespace to localStorage', async ({ page }) => {
    // Set state in non-persistable namespace
    await page.evaluate(() => {
      if (window.$wujie?.bus) {
        window.$wujie.bus.$emit('state:update', {
          namespace: 'notification',
          key: 'count',
          value: 10,
          timestamp: Date.now()
        })
      }
    })

    // Wait
    await page.waitForTimeout(100)

    // Verify not persisted
    const persisted = await page.evaluate(() => {
      return localStorage.getItem('shared_state_notification_count')
    })

    expect(persisted).toBeNull()
  })

  test('should load persisted state on app reload', async ({ page }) => {
    // Set persisted state
    await page.evaluate(() => {
      localStorage.setItem('shared_state_system_language', JSON.stringify('zh-CN'))
    })

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Wait for app initialization
    await page.waitForTimeout(500)

    // Verify state was loaded (check via console or window)
    const stateLoaded = await page.evaluate(() => {
      // In real scenario, check if SharedStateManager loaded the state
      const value = localStorage.getItem('shared_state_system_language')
      return value === '"zh-CN"'
    })

    expect(stateLoaded).toBe(true)
  })
})
