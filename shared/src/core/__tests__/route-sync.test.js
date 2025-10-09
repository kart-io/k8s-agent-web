/**
 * Unit tests for RouteSync class
 *
 * These tests verify the standardized route synchronization protocol:
 * - Debounce mechanism prevents rapid-fire route events
 * - Event listeners are properly set up and torn down
 * - Error events are emitted on navigation failures
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('RouteSync', () => {
  let RouteSync
  let mockBus
  let mockRouter

  beforeEach(async () => {
    // Mock Wujie bus
    mockBus = {
      $emit: vi.fn(),
      $on: vi.fn(),
      $off: vi.fn()
    }

    // Mock Vue Router
    mockRouter = {
      push: vi.fn().mockResolvedValue(true),
      currentRoute: {
        value: {
          path: '/',
          query: {},
          params: {}
        }
      }
    }

    // Import RouteSync class
    const module = await import('../route-sync.js')
    RouteSync = module.RouteSync
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  describe('notifyMicroApp()', () => {
    it('should emit route change event with correct payload', () => {
      const routeSync = new RouteSync('test-app', mockBus)

      routeSync.notifyMicroApp('/users', { page: '1' }, { id: '123' })

      // Should debounce, so wait for timer
      vi.runAllTimers()

      expect(mockBus.$emit).toHaveBeenCalledWith('test-app-route-change', {
        path: '/users',
        query: { page: '1' },
        params: { id: '123' },
        timestamp: expect.any(Number)
      })
    })

    it('should debounce rapid route changes (50ms)', () => {
      vi.useFakeTimers()

      const routeSync = new RouteSync('test-app', mockBus)

      // Fire multiple route changes rapidly
      routeSync.notifyMicroApp('/users')
      routeSync.notifyMicroApp('/roles')
      routeSync.notifyMicroApp('/permissions')

      // Should only emit once after debounce period
      expect(mockBus.$emit).not.toHaveBeenCalled()

      // Fast-forward 30ms (not enough)
      vi.advanceTimersByTime(30)
      expect(mockBus.$emit).not.toHaveBeenCalled()

      // Fast-forward another 30ms (total 60ms, past debounce)
      vi.advanceTimersByTime(30)

      // Should have emitted only the last route change
      expect(mockBus.$emit).toHaveBeenCalledTimes(1)
      expect(mockBus.$emit).toHaveBeenCalledWith('test-app-route-change', {
        path: '/permissions',
        query: undefined,
        params: undefined,
        timestamp: expect.any(Number)
      })

      vi.useRealTimers()
    })

    it('should use separate debounce timers for different apps', () => {
      vi.useFakeTimers()

      const routeSync1 = new RouteSync('app-1', mockBus)
      const routeSync2 = new RouteSync('app-2', mockBus)

      // Fire route changes for both apps
      routeSync1.notifyMicroApp('/page1')
      routeSync2.notifyMicroApp('/page2')

      vi.runAllTimers()

      // Both should emit independently
      expect(mockBus.$emit).toHaveBeenCalledTimes(2)
      expect(mockBus.$emit).toHaveBeenCalledWith('app-1-route-change', expect.any(Object))
      expect(mockBus.$emit).toHaveBeenCalledWith('app-2-route-change', expect.any(Object))

      vi.useRealTimers()
    })

    it('should handle missing bus gracefully', () => {
      const routeSync = new RouteSync('test-app', null)

      // Should not throw
      expect(() => {
        routeSync.notifyMicroApp('/users')
      }).not.toThrow()
    })

    it('should include timestamp in payload', () => {
      vi.useFakeTimers()
      const now = Date.now()

      const routeSync = new RouteSync('test-app', mockBus)
      routeSync.notifyMicroApp('/users')

      vi.runAllTimers()

      const call = mockBus.$emit.mock.calls[0]
      expect(call[1].timestamp).toBeGreaterThanOrEqual(now)

      vi.useRealTimers()
    })

    it('should normalize path format', () => {
      vi.useFakeTimers()

      const routeSync = new RouteSync('test-app', mockBus)

      // Test with and without leading slash
      routeSync.notifyMicroApp('users')
      vi.runAllTimers()

      expect(mockBus.$emit).toHaveBeenCalledWith('test-app-route-change', {
        path: '/users',
        query: undefined,
        params: undefined,
        timestamp: expect.any(Number)
      })

      vi.useRealTimers()
    })
  })

  describe('setupListener()', () => {
    it('should set up event listener for route changes', () => {
      const routeSync = new RouteSync('test-app', mockBus, mockRouter)

      routeSync.setupListener()

      expect(mockBus.$on).toHaveBeenCalledWith(
        'test-app-route-change',
        expect.any(Function)
      )
    })

    it('should navigate to new route when event is received', async () => {
      const routeSync = new RouteSync('test-app', mockBus, mockRouter)

      routeSync.setupListener()

      // Get the callback function that was registered
      const callback = mockBus.$on.mock.calls[0][1]

      // Simulate receiving route change event
      await callback({
        path: '/users',
        query: { page: '1' },
        params: {}
      })

      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/users',
        query: { page: '1' }
      })
    })

    it('should emit error event when navigation fails', async () => {
      // Make router.push fail
      mockRouter.push = vi.fn().mockRejectedValue(new Error('Navigation failed'))

      const routeSync = new RouteSync('test-app', mockBus, mockRouter)
      routeSync.setupListener()

      const callback = mockBus.$on.mock.calls[0][1]

      // Simulate receiving route change event
      await callback({
        path: '/invalid',
        query: {},
        params: {}
      })

      // Should emit error event
      expect(mockBus.$emit).toHaveBeenCalledWith('route:error', {
        appName: 'test-app',
        path: '/invalid',
        error: 'Navigation failed',
        stack: expect.any(String),
        timestamp: expect.any(Number)
      })
    })

    it('should handle missing router gracefully', () => {
      const routeSync = new RouteSync('test-app', mockBus, null)

      // Should not throw
      expect(() => {
        routeSync.setupListener()
      }).not.toThrow()
    })

    it('should handle missing bus gracefully', () => {
      const routeSync = new RouteSync('test-app', null, mockRouter)

      // Should not throw
      expect(() => {
        routeSync.setupListener()
      }).not.toThrow()
    })
  })

  describe('teardown()', () => {
    it('should remove event listener on teardown', () => {
      const routeSync = new RouteSync('test-app', mockBus, mockRouter)

      routeSync.setupListener()
      routeSync.teardown()

      expect(mockBus.$off).toHaveBeenCalledWith(
        'test-app-route-change',
        expect.any(Function)
      )
    })

    it('should clear pending debounce timer on teardown', () => {
      vi.useFakeTimers()

      const routeSync = new RouteSync('test-app', mockBus)

      // Start a debounced notification
      routeSync.notifyMicroApp('/users')

      // Teardown before timer fires
      routeSync.teardown()

      // Fast-forward time
      vi.runAllTimers()

      // Event should not have been emitted
      expect(mockBus.$emit).not.toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty path', () => {
      vi.useFakeTimers()

      const routeSync = new RouteSync('test-app', mockBus)
      routeSync.notifyMicroApp('')

      vi.runAllTimers()

      expect(mockBus.$emit).toHaveBeenCalledWith('test-app-route-change', {
        path: '/',
        query: undefined,
        params: undefined,
        timestamp: expect.any(Number)
      })

      vi.useRealTimers()
    })

    it('should handle null/undefined query and params', () => {
      vi.useFakeTimers()

      const routeSync = new RouteSync('test-app', mockBus)
      routeSync.notifyMicroApp('/users', null, undefined)

      vi.runAllTimers()

      expect(mockBus.$emit).toHaveBeenCalledWith('test-app-route-change', {
        path: '/users',
        query: null,
        params: undefined,
        timestamp: expect.any(Number)
      })

      vi.useRealTimers()
    })

    it('should handle route change event with minimal payload', async () => {
      const routeSync = new RouteSync('test-app', mockBus, mockRouter)
      routeSync.setupListener()

      const callback = mockBus.$on.mock.calls[0][1]

      // Simulate receiving minimal event
      await callback({ path: '/users' })

      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/users',
        query: undefined
      })
    })
  })
})
