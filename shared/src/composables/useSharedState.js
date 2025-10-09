/**
 * useSharedState Composable
 *
 * Vue 3 composable for using shared state across micro-apps.
 * Provides reactive state that automatically syncs across all micro-apps.
 *
 * @example
 * // In any micro-app component
 * import { useSharedState } from '@k8s-agent/shared/composables/useSharedState'
 *
 * const { state: userInfo, setState: setUserInfo } = useSharedState('user', 'info', {})
 *
 * // Update state (will sync to all other micro-apps)
 * setUserInfo({ id: 123, name: 'Alice', avatar: '/avatars/alice.png' })
 *
 * // Use in template
 * <img :src="userInfo.avatar" />
 */

import { ref, onUnmounted } from 'vue'

/**
 * Use shared state across micro-apps
 *
 * @param {string} namespace - State namespace (e.g., 'user', 'notification', 'permission', 'system')
 * @param {string} key - State key within namespace
 * @param {*} defaultValue - Default value if state doesn't exist
 * @returns {Object} { state: Ref, setState: Function }
 *
 * @example
 * // User info state
 * const { state: userInfo, setState: setUserInfo } = useSharedState('user', 'info', {})
 *
 * @example
 * // Notification count
 * const { state: unreadCount, setState: setUnreadCount } = useSharedState('notification', 'unreadCount', 0)
 *
 * @example
 * // System theme
 * const { state: theme, setState: setTheme } = useSharedState('system', 'theme', 'light')
 */
export function useSharedState(namespace, key, defaultValue) {
  // Initialize reactive state
  const state = ref(defaultValue)

  // Get Wujie bus (may not be available in standalone mode)
  const bus = window.$wujie?.bus

  if (!bus) {
    console.warn(
      `[useSharedState] Wujie bus not available for ${namespace}:${key}, using local state only`
    )

    // Return local-only state if bus is not available
    const setState = (value) => {
      state.value = value
    }

    return { state, setState }
  }

  /**
   * Update shared state and broadcast to all micro-apps
   *
   * @param {*} value - New value
   */
  const setState = (value) => {
    // Update local state immediately
    state.value = value

    // Emit event to broadcast to all micro-apps
    try {
      bus.$emit('state:update', {
        namespace,
        key,
        value,
        timestamp: Date.now()
      })

      console.log(`[useSharedState] State updated: ${namespace}:${key}`, value)
    } catch (error) {
      console.error(`[useSharedState] Failed to emit state update for ${namespace}:${key}:`, error)
    }
  }

  /**
   * Listen for state updates from other micro-apps
   */
  const stateUpdateListener = (payload) => {
    // Only update if this is the state we're watching
    if (payload.namespace === namespace && payload.key === key) {
      state.value = payload.value
      console.log(`[useSharedState] Received state update: ${namespace}:${key}`, payload.value)
    }
  }

  // Register listener
  bus.$on('state:update', stateUpdateListener)

  // Cleanup listener on component unmount
  onUnmounted(() => {
    if (bus) {
      bus.$off('state:update', stateUpdateListener)
      console.log(`[useSharedState] Unsubscribed from ${namespace}:${key}`)
    }
  })

  // Return reactive state and setter
  return {
    state,
    setState
  }
}

/**
 * Use multiple shared states at once
 *
 * @param {Array<{namespace: string, key: string, defaultValue: *}>} states - Array of state configurations
 * @returns {Object} Object with keys as 'namespace_key' and values as {state, setState}
 *
 * @example
 * const {
 *   user_info: { state: userInfo, setState: setUserInfo },
 *   notification_count: { state: notifCount, setState: setNotifCount }
 * } = useMultipleSharedStates([
 *   { namespace: 'user', key: 'info', defaultValue: {} },
 *   { namespace: 'notification', key: 'count', defaultValue: 0 }
 * ])
 */
export function useMultipleSharedStates(states) {
  const result = {}

  for (const { namespace, key, defaultValue } of states) {
    const stateKey = `${namespace}_${key}`
    result[stateKey] = useSharedState(namespace, key, defaultValue)
  }

  return result
}

export default useSharedState
