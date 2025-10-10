/**
 * SharedStateManager - Cross-App State Management
 *
 * Enables bidirectional reactive state sharing across micro-apps.
 * Uses Wujie event bus for communication and Vue reactivity for automatic UI updates.
 *
 * Standard Namespaces:
 * - 'user': User profile, preferences, authentication status
 * - 'notification': Unread counts, alerts, messages
 * - 'permission': Role changes, access control updates
 * - 'system': Global app settings, feature flags, theme
 *
 * @example
 * // Main app setup
 * import { sharedStateManager } from '@/store/shared-state'
 * app.provide('sharedState', sharedStateManager)
 *
 * @example
 * // Micro-app usage
 * import { useSharedState } from '@k8s-agent/shared/composables/useSharedState'
 * const { state: userInfo, setState: setUserInfo } = useSharedState('user', 'info', {})
 */

import { reactive } from 'vue'

/**
 * SharedStateManager class for cross-app state synchronization
 */
export class SharedStateManager {
  /**
   * Create a SharedStateManager instance
   *
   * @param {Object} bus - Wujie event bus instance
   */
  constructor(bus) {
    if (!bus) {
      console.warn('[SharedStateManager] No bus provided, state sync will not work')
    }

    this.bus = bus
    this.state = reactive({}) // Reactive state storage
    this.subscriptions = new Map() // Key: 'namespace:key', Value: Array of callbacks

    // Set up bus listeners for micro-app state updates
    this.setupBusListeners()

    // Load persisted state from localStorage
    this._loadPersistedState()

    console.log('[SharedStateManager] Initialized')
  }

  /**
   * Set state value and broadcast to all micro-apps
   *
   * @param {string} namespace - State namespace (e.g., 'user', 'notification')
   * @param {string} key - State key within namespace
   * @param {*} value - New value (must be JSON-serializable)
   *
   * @example
   * sharedStateManager.setState('user', 'avatar', '/avatars/user.png')
   */
  setState(namespace, key, value) {
    if (!namespace || !key) {
      console.warn('[SharedStateManager] setState requires namespace and key')
      return
    }

    const fullKey = `${namespace}:${key}`

    // Update reactive state
    this.state[fullKey] = value

    // Emit event to notify all micro-apps
    if (this.bus) {
      const payload = {
        namespace,
        key,
        value,
        timestamp: Date.now()
      }

      try {
        this.bus.$emit('state:update', payload)
        console.log(`[SharedStateManager] State updated:`, fullKey, value)
      } catch (error) {
        console.error('[SharedStateManager] Failed to emit state:update:', error)
      }
    }

    // Trigger local subscriptions
    this._notifySubscribers(fullKey, value)

    // Persist if namespace is persistable
    this._persistState(namespace, key, value)
  }

  /**
   * Get current state value
   *
   * @param {string} namespace - State namespace
   * @param {string} key - State key
   * @returns {*} Current value or undefined if not set
   *
   * @example
   * const avatar = sharedStateManager.getState('user', 'avatar')
   */
  getState(namespace, key) {
    if (!namespace || !key) {
      return undefined
    }

    const fullKey = `${namespace}:${key}`
    return this.state[fullKey]
  }

  /**
   * Subscribe to state changes
   *
   * @param {string} namespace - State namespace
   * @param {string} key - State key
   * @param {Function} callback - Callback function (value) => void
   * @returns {*} Current value if exists, undefined otherwise
   *
   * @example
   * const currentValue = sharedStateManager.subscribe('user', 'status', (newStatus) => {
   *   console.log('User status changed:', newStatus)
   * })
   */
  subscribe(namespace, key, callback) {
    if (!namespace || !key || typeof callback !== 'function') {
      console.warn('[SharedStateManager] Invalid subscribe parameters')
      return undefined
    }

    const fullKey = `${namespace}:${key}`

    // Add callback to subscriptions
    if (!this.subscriptions.has(fullKey)) {
      this.subscriptions.set(fullKey, [])
    }
    this.subscriptions.get(fullKey).push(callback)

    console.log(`[SharedStateManager] Subscribed to ${fullKey}`)

    // Return current value
    return this.getState(namespace, key)
  }

  /**
   * Unsubscribe from state changes
   *
   * @param {string} namespace - State namespace
   * @param {string} key - State key
   * @param {Function} callback - Callback function to remove
   */
  unsubscribe(namespace, key, callback) {
    if (!namespace || !key) {
      return
    }

    const fullKey = `${namespace}:${key}`
    const callbacks = this.subscriptions.get(fullKey)

    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
        console.log(`[SharedStateManager] Unsubscribed from ${fullKey}`)
      }

      // Clean up empty subscription arrays
      if (callbacks.length === 0) {
        this.subscriptions.delete(fullKey)
      }
    }
  }

  /**
   * Set up event bus listeners to receive state updates from micro-apps
   *
   * @private
   */
  setupBusListeners() {
    if (!this.bus) {
      return
    }

    this.bus.$on('state:update', (payload) => {
      const { namespace, key, value, timestamp } = payload

      if (!namespace || !key) {
        console.warn('[SharedStateManager] Received invalid state:update payload:', payload)
        return
      }

      const fullKey = `${namespace}:${key}`

      // Update local state
      this.state[fullKey] = value

      console.log(`[SharedStateManager] Received state update from micro-app:`, fullKey, value)

      // Trigger local subscriptions
      this._notifySubscribers(fullKey, value)

      // Persist if namespace is persistable
      this._persistState(namespace, key, value)
    })

    console.log('[SharedStateManager] Bus listeners set up')
  }

  /**
   * Notify all subscribers of a state change
   *
   * @private
   * @param {string} fullKey - Full key (namespace:key)
   * @param {*} value - New value
   */
  _notifySubscribers(fullKey, value) {
    const callbacks = this.subscriptions.get(fullKey)

    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(callback => {
        try {
          callback(value)
        } catch (error) {
          console.error(`[SharedStateManager] Subscriber callback error for ${fullKey}:`, error)
        }
      })
    }
  }

  /**
   * Persist state to localStorage for specific namespaces
   *
   * @private
   * @param {string} namespace - State namespace
   * @param {string} key - State key
   * @param {*} value - Value to persist
   */
  _persistState(namespace, key, value) {
    // Only persist specific namespaces
    const persistableNamespaces = ['user', 'system']

    if (!persistableNamespaces.includes(namespace)) {
      return
    }

    try {
      const storageKey = `shared_state_${namespace}_${key}`
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch (error) {
      console.warn('[SharedStateManager] Failed to persist state:', error)
    }
  }

  /**
   * Load persisted state from localStorage on initialization
   *
   * @private
   */
  _loadPersistedState() {
    const persistableNamespaces = ['user', 'system']

    try {
      // Scan localStorage for persisted state
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i)

        if (storageKey && storageKey.startsWith('shared_state_')) {
          const value = localStorage.getItem(storageKey)

          if (value) {
            // Parse key: shared_state_namespace_key
            const parts = storageKey.replace('shared_state_', '').split('_')
            const namespace = parts[0]
            const key = parts.slice(1).join('_')

            if (persistableNamespaces.includes(namespace)) {
              try {
                const parsedValue = JSON.parse(value)
                const fullKey = `${namespace}:${key}`
                this.state[fullKey] = parsedValue
                console.log(`[SharedStateManager] Loaded persisted state: ${fullKey}`)
              } catch (parseError) {
                console.warn(`[SharedStateManager] Failed to parse persisted state for ${storageKey}`)
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('[SharedStateManager] Failed to load persisted state:', error)
    }
  }

  /**
   * Clear all subscriptions (for cleanup/testing)
   */
  clearAllSubscriptions() {
    this.subscriptions.clear()
    console.log('[SharedStateManager] All subscriptions cleared')
  }

  /**
   * Get all current state (for debugging)
   *
   * @returns {Object} Current state object
   */
  getAllState() {
    return { ...this.state }
  }
}

/**
 * Singleton instance for main app
 * Pass the Wujie bus when creating
 */
let sharedStateManagerInstance = null

/**
 * Initialize shared state manager singleton
 *
 * @param {Object} bus - Wujie event bus
 * @returns {SharedStateManager} Singleton instance
 */
export function initSharedStateManager(bus) {
  if (!sharedStateManagerInstance) {
    sharedStateManagerInstance = new SharedStateManager(bus)
  }
  return sharedStateManagerInstance
}

/**
 * Get shared state manager singleton
 *
 * @returns {SharedStateManager|null} Singleton instance or null if not initialized
 */
export function getSharedStateManager() {
  return sharedStateManagerInstance
}

// Export singleton instance (will be null until initialized)
export const sharedStateManager = sharedStateManagerInstance

export default SharedStateManager
