/**
 * RouteSync - Standardized Route Synchronization Protocol
 *
 * Replaces setTimeout-based route sync with a robust, debounced event protocol.
 * Provides bidirectional route synchronization between main app and micro-apps.
 *
 * Benefits:
 * - No setTimeout hacks - pure event-driven
 * - Debounced to prevent rapid-fire events
 * - Error handling with route:error events
 * - Clean teardown to prevent memory leaks
 */

/**
 * Debounce timer map for multiple micro-apps
 * Key: appName, Value: timer ID
 */
const debounceTimers = new Map()

/**
 * Default debounce delay in milliseconds
 */
const DEFAULT_DEBOUNCE_DELAY = 50

/**
 * RouteSync class for standardized route synchronization
 *
 * @example
 * // Main app usage (notify micro-apps of route changes)
 * const routeSync = new RouteSync('system-app', wujieBus)
 * routeSync.notifyMicroApp('/users', { page: 1 })
 *
 * @example
 * // Micro-app usage (listen for route changes from main app)
 * const routeSync = new RouteSync('system-app', window.$wujie?.bus, router)
 * routeSync.setupListener()
 * // Don't forget to teardown on unmount:
 * onUnmounted(() => routeSync.teardown())
 */
export class RouteSync {
  /**
   * Create a RouteSync instance
   *
   * @param {string} appName - Micro-app name (e.g., 'system-app', 'dashboard-app')
   * @param {Object} bus - Wujie event bus instance
   * @param {Object} [router] - Vue Router instance (required for setupListener)
   * @param {number} [debounceDelay=50] - Debounce delay in milliseconds
   */
  constructor(appName, bus, router = null, debounceDelay = DEFAULT_DEBOUNCE_DELAY) {
    if (!appName) {
      throw new Error('RouteSync: appName is required')
    }

    this.appName = appName
    this.bus = bus
    this.router = router
    this.debounceDelay = debounceDelay
    this.eventName = `${appName}-route-change`
    this.listenerCallback = null

    // Validate bus if provided
    if (bus && typeof bus.$emit !== 'function') {
      console.warn(`[RouteSync] Invalid bus provided for ${appName}`)
    }
  }

  /**
   * Notify micro-app of route change (main app → micro-app)
   * Uses debouncing to prevent rapid-fire events
   *
   * @param {string} path - Target path (e.g., '/users', '/roles')
   * @param {Object} [query] - Query parameters
   * @param {Object} [params] - Route parameters
   *
   * @example
   * routeSync.notifyMicroApp('/users/123', { tab: 'profile' }, { id: '123' })
   */
  notifyMicroApp(path, query, params) {
    if (!this.bus) {
      console.warn(`[RouteSync] Bus not available for ${this.appName}, cannot notify`)
      return
    }

    // Normalize path (ensure leading slash)
    const normalizedPath = path?.startsWith('/') ? path : `/${path || ''}`
    const finalPath = normalizedPath === '//' ? '/' : normalizedPath

    // Clear existing debounce timer for this app
    if (debounceTimers.has(this.appName)) {
      clearTimeout(debounceTimers.get(this.appName))
    }

    // Set new debounce timer
    const timerId = setTimeout(() => {
      const payload = {
        path: finalPath,
        query,
        params,
        timestamp: Date.now()
      }

      try {
        this.bus.$emit(this.eventName, payload)
        console.log(`[RouteSync] Notified ${this.appName}:`, payload)
      } catch (error) {
        console.error(`[RouteSync] Error emitting route change for ${this.appName}:`, error)
      }

      // Clean up timer reference
      debounceTimers.delete(this.appName)
    }, this.debounceDelay)

    debounceTimers.set(this.appName, timerId)
  }

  /**
   * Set up event listener for route changes (micro-app side)
   * Listens for route change events from main app and navigates accordingly
   *
   * @example
   * // In micro-app's main.js or App.vue
   * const routeSync = new RouteSync('system-app', window.$wujie?.bus, router)
   * routeSync.setupListener()
   *
   * // Clean up on unmount
   * onUnmounted(() => routeSync.teardown())
   */
  setupListener() {
    if (!this.bus) {
      console.warn(`[RouteSync] Bus not available for ${this.appName}, cannot setup listener`)
      return
    }

    if (!this.router) {
      console.warn(`[RouteSync] Router not provided for ${this.appName}, cannot setup listener`)
      return
    }

    // Define callback function
    this.listenerCallback = async (payload) => {
      console.log(`[RouteSync] ${this.appName} received route change:`, payload)

      try {
        const { path, query } = payload

        if (!path) {
          console.warn(`[RouteSync] ${this.appName} received empty path, ignoring`)
          return
        }

        // Navigate to new route
        await this.router.push({
          path,
          query
        })

        console.log(`[RouteSync] ${this.appName} navigated to:`, path)
      } catch (error) {
        console.error(`[RouteSync] ${this.appName} navigation failed:`, error)

        // Emit error event back to main app
        this._emitError(payload.path, error)
      }
    }

    // Register event listener
    this.bus.$on(this.eventName, this.listenerCallback)

    console.log(`[RouteSync] ${this.appName} listener set up for event: ${this.eventName}`)
  }

  /**
   * Emit route error event (micro-app → main app)
   * Called when navigation fails
   *
   * @private
   * @param {string} path - Path that failed to navigate
   * @param {Error} error - Error object
   */
  _emitError(path, error) {
    if (!this.bus) {
      return
    }

    const errorPayload = {
      appName: this.appName,
      path,
      error: error.message || String(error),
      stack: error.stack,
      timestamp: Date.now()
    }

    try {
      this.bus.$emit('route:error', errorPayload)
      console.log(`[RouteSync] Emitted route error for ${this.appName}:`, errorPayload)
    } catch (emitError) {
      console.error(`[RouteSync] Failed to emit error event:`, emitError)
    }
  }

  /**
   * Tear down event listener and clear debounce timers
   * Call this on component unmount to prevent memory leaks
   *
   * @example
   * onUnmounted(() => {
   *   routeSync.teardown()
   * })
   */
  teardown() {
    // Clear debounce timer if exists
    if (debounceTimers.has(this.appName)) {
      clearTimeout(debounceTimers.get(this.appName))
      debounceTimers.delete(this.appName)
    }

    // Remove event listener if exists
    if (this.bus && this.listenerCallback) {
      this.bus.$off(this.eventName, this.listenerCallback)
      console.log(`[RouteSync] ${this.appName} listener removed`)
    }

    this.listenerCallback = null
  }

  /**
   * Check if listener is currently set up
   *
   * @returns {boolean} True if listener is active
   */
  isListening() {
    return this.listenerCallback !== null
  }

  /**
   * Get current event name
   *
   * @returns {string} Event name (e.g., 'system-app-route-change')
   */
  getEventName() {
    return this.eventName
  }
}

/**
 * Create a RouteSync instance with default configuration
 * Convenience factory function
 *
 * @param {string} appName - Micro-app name
 * @param {Object} bus - Wujie event bus
 * @param {Object} [router] - Vue Router instance
 * @returns {RouteSync} RouteSync instance
 */
export function createRouteSync(appName, bus, router) {
  return new RouteSync(appName, bus, router)
}

/**
 * Clear all debounce timers (useful for testing)
 */
export function clearAllDebounceTimers() {
  debounceTimers.forEach((timerId) => {
    clearTimeout(timerId)
  })
  debounceTimers.clear()
}

export default RouteSync
