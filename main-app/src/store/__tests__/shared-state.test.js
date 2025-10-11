/**
 * Unit tests for SharedStateManager
 *
 * Tests bidirectional state sharing across micro-apps
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Wujie bus
const mockBus = {
  $emit: vi.fn(),
  $on: vi.fn(),
  $off: vi.fn()
}

describe('SharedStateManager', () => {
  let SharedStateManager
  let manager

  beforeEach(async () => {
    vi.clearAllMocks()

    // Dynamic import to avoid hoisting issues
    const module = await import('../shared-state.js')
    SharedStateManager = module.SharedStateManager

    // Create new instance for each test
    manager = new SharedStateManager(mockBus)
  })

  describe('setState()', () => {
    it('should set state value correctly', () => {
      manager.setState('user', 'name', 'John Doe')

      const value = manager.getState('user', 'name')
      expect(value).toBe('John Doe')
    })

    it('should emit state:update event when setting state', () => {
      manager.setState('user', 'avatar', '/avatars/user.png')

      expect(mockBus.$emit).toHaveBeenCalledWith('state:update', {
        namespace: 'user',
        key: 'avatar',
        value: '/avatars/user.png',
        timestamp: expect.any(Number)
      })
    })

    it('should support nested object values', () => {
      const userInfo = {
        id: 123,
        name: 'John',
        roles: ['admin', 'user']
      }

      manager.setState('user', 'info', userInfo)

      const value = manager.getState('user', 'info')
      expect(value).toEqual(userInfo)
    })

    it('should trigger subscribers when state changes', () => {
      const callback = vi.fn()
      manager.subscribe('notification', 'count', callback)

      manager.setState('notification', 'count', 5)

      expect(callback).toHaveBeenCalledWith(5)
    })

    it('should support multiple subscribers for same state', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      manager.subscribe('user', 'status', callback1)
      manager.subscribe('user', 'status', callback2)

      manager.setState('user', 'status', 'online')

      expect(callback1).toHaveBeenCalledWith('online')
      expect(callback2).toHaveBeenCalledWith('online')
    })
  })

  describe('getState()', () => {
    it('should return undefined for non-existent state', () => {
      const value = manager.getState('non', 'existent')
      expect(value).toBeUndefined()
    })

    it('should return correct value after setState', () => {
      manager.setState('system', 'theme', 'dark')

      const value = manager.getState('system', 'theme')
      expect(value).toBe('dark')
    })
  })

  describe('subscribe()', () => {
    it('should add callback to subscriptions', () => {
      const callback = vi.fn()

      manager.subscribe('user', 'profile', callback)
      manager.setState('user', 'profile', { name: 'Alice' })

      expect(callback).toHaveBeenCalled()
    })

    it('should return current value immediately if exists', () => {
      manager.setState('permission', 'role', 'admin')

      const callback = vi.fn()
      const currentValue = manager.subscribe('permission', 'role', callback)

      expect(currentValue).toBe('admin')
    })

    it('should return undefined if no current value', () => {
      const callback = vi.fn()
      const currentValue = manager.subscribe('new', 'key', callback)

      expect(currentValue).toBeUndefined()
    })
  })

  describe('unsubscribe()', () => {
    it('should remove specific callback', () => {
      const callback = vi.fn()

      manager.subscribe('user', 'data', callback)
      manager.unsubscribe('user', 'data', callback)

      manager.setState('user', 'data', 'test')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should not affect other callbacks', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      manager.subscribe('user', 'data', callback1)
      manager.subscribe('user', 'data', callback2)

      manager.unsubscribe('user', 'data', callback1)
      manager.setState('user', 'data', 'test')

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledWith('test')
    })
  })

  describe('setupBusListeners()', () => {
    it('should listen for state:update events from micro-apps', () => {
      // Verify bus listener was registered
      expect(mockBus.$on).toHaveBeenCalledWith(
        'state:update',
        expect.any(Function)
      )
    })

    it('should update local state when receiving state:update event', () => {
      // Get the callback that was registered
      const callback = mockBus.$on.mock.calls.find(
        call => call[0] === 'state:update'
      )?.[1]

      expect(callback).toBeDefined()

      // Simulate event from micro-app
      callback({
        namespace: 'notification',
        key: 'unreadCount',
        value: 10,
        timestamp: Date.now()
      })

      // Verify state was updated
      const value = manager.getState('notification', 'unreadCount')
      expect(value).toBe(10)
    })
  })

  describe('namespace isolation', () => {
    it('should isolate different namespaces', () => {
      manager.setState('user', 'id', 123)
      manager.setState('system', 'id', 456)

      expect(manager.getState('user', 'id')).toBe(123)
      expect(manager.getState('system', 'id')).toBe(456)
    })

    it('should use namespace:key format internally', () => {
      manager.setState('app', 'version', '1.0.0')

      // Access internal state to verify format
      const internalKey = 'app:version'
      expect(manager.state[internalKey]).toBe('1.0.0')
    })
  })

  describe('memory management', () => {
    it('should clear all subscriptions', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      manager.subscribe('user', 'data', callback1)
      manager.subscribe('system', 'config', callback2)

      manager.clearAllSubscriptions()

      manager.setState('user', 'data', 'test1')
      manager.setState('system', 'config', 'test2')

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })
  })
})
