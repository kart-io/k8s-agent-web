/**
 * Unit tests for useSharedState composable
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'

// Mock Wujie
global.window = {
  $wujie: {
    bus: {
      $emit: vi.fn(),
      $on: vi.fn(),
      $off: vi.fn()
    }
  }
}

describe('useSharedState', () => {
  let useSharedState

  beforeEach(async () => {
    vi.clearAllMocks()

    // Dynamic import
    const module = await import('../useSharedState.js')
    useSharedState = module.useSharedState
  })

  it('should return reactive state and setState function', () => {
    const { state, setState } = useSharedState('user', 'name', 'Default')

    expect(state.value).toBe('Default')
    expect(typeof setState).toBe('function')
  })

  it('should update state when setState is called', async () => {
    const { state, setState } = useSharedState('user', 'status', 'offline')

    setState('online')

    await nextTick()

    expect(state.value).toBe('online')
  })

  it('should emit state:update event when setState is called', () => {
    const { setState } = useSharedState('notification', 'count', 0)

    setState(5)

    expect(window.$wujie.bus.$emit).toHaveBeenCalledWith('state:update', {
      namespace: 'notification',
      key: 'count',
      value: 5,
      timestamp: expect.any(Number)
    })
  })

  it('should listen for state:update events from bus', async () => {
    const { state } = useSharedState('user', 'avatar', '/default.png')

    // Get the listener callback
    const listener = window.$wujie.bus.$on.mock.calls.find(
      call => call[0] === 'state:update'
    )?.[1]

    expect(listener).toBeDefined()

    // Simulate event from another micro-app
    listener({
      namespace: 'user',
      key: 'avatar',
      value: '/new-avatar.png',
      timestamp: Date.now()
    })

    await nextTick()

    expect(state.value).toBe('/new-avatar.png')
  })

  it('should handle missing Wujie bus gracefully', async () => {
    // Temporarily remove bus
    const originalWujie = window.$wujie
    window.$wujie = null

    const { state, setState } = useSharedState('user', 'data', 'test')

    // Should still work locally
    expect(state.value).toBe('test')

    setState('new-value')
    expect(state.value).toBe('new-value')

    // Restore
    window.$wujie = originalWujie
  })

  it('should support complex object values', async () => {
    const defaultUser = { id: 1, name: 'Alice' }
    const { state, setState } = useSharedState('user', 'profile', defaultUser)

    expect(state.value).toEqual(defaultUser)

    const newUser = { id: 2, name: 'Bob' }
    setState(newUser)

    await nextTick()

    expect(state.value).toEqual(newUser)
  })
})
