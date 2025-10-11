<template>
  <div class="micro-app-container">
    <ErrorBoundary
      ref="errorBoundary"
      :timeout="loadTimeout"
      @error="handleError"
      @retry="handleRetry"
    >
      <WujieVue
        :name="microAppName"
        :url="microAppUrl"
        :sync="false"
        :alive="true"
        :props="appProps"
        @before-load="handleBeforeLoad"
        @after-mount="handleAfterMount"
        @load-error="handleLoadError"
        @activated="handleActivated"
        @deactivated="handleDeactivated"
      />
    </ErrorBoundary>
  </div>
</template>

<script setup>
import { computed, watch, ref, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import WujieVue from 'wujie-vue3'
import { getMicroAppUrl } from '@/config/micro-apps.config.js'
import { RouteSync } from '@k8s-agent/shared/core/route-sync.js'
import ErrorBoundary from './ErrorBoundary.vue'
import { reportMicroAppLoadError } from '@/utils/error-reporter'

const route = useRoute()
const userStore = useUserStore()
const { bus } = WujieVue

const microAppName = computed(() => {
  console.log('[MicroAppContainer] microAppName:', route.meta.microApp)
  return route.meta.microApp
})

/**
 * Dynamically resolve micro-app URL using centralized configuration
 * This replaces hardcoded URL mapping with config-driven resolution
 */
const microAppUrl = computed(() => {
  const appName = microAppName.value

  if (!appName) {
    console.warn('[MicroAppContainer] No micro-app name specified in route meta')
    return ''
  }

  try {
    const url = getMicroAppUrl(appName)
    console.log('[MicroAppContainer] Loading micro app:', appName, 'from URL:', url)
    return url
  } catch (error) {
    console.error('[MicroAppContainer] Failed to get micro-app URL:', error)
    // Fallback: return empty string to prevent loading errors
    return ''
  }
})

const appProps = computed(() => ({
  userInfo: userStore.userInfo,
  token: userStore.token,
  permissions: userStore.permissions
}))

/**
 * RouteSync instance for current micro-app
 * Replaces setTimeout-based sync with standardized debounced protocol
 */
const routeSync = ref(null)

/**
 * ErrorBoundary reference
 */
const errorBoundary = ref(null)

/**
 * Loading timeout in milliseconds
 * Default: 5000ms (5 seconds)
 */
const loadTimeout = ref(5000)

/**
 * Timeout timer reference
 */
const timeoutTimer = ref(null)

/**
 * Loading state
 */
const isLoading = ref(false)

/**
 * Sync route to micro-app using RouteSync class
 * Replaces old syncRouteToSubApp function
 */
const syncRouteToSubApp = (path) => {
  const appName = microAppName.value
  if (!appName) {
    console.log('[MicroAppContainer] No appName, skipping sync')
    return
  }

  // Check if feature flag is enabled
  const featureEnabled = import.meta.env.VITE_FEATURE_STANDARD_ROUTE_SYNC === 'true'

  if (!featureEnabled) {
    console.log('[MicroAppContainer] Standard route sync feature disabled, using legacy sync')
    // Fallback to legacy sync if feature is disabled
    legacySyncRouteToSubApp(path)
    return
  }

  // Extract sub-app route path
  const basePath = path.split('/')[1]
  const subPath = path.replace(`/${basePath}`, '') || '/'

  // Parse query and params from current route
  const { query, params } = route

  // Create or update RouteSync instance
  if (!routeSync.value || routeSync.value.appName !== appName) {
    // Teardown old instance if exists
    if (routeSync.value) {
      routeSync.value.teardown()
    }
    // Create new instance for current app
    routeSync.value = new RouteSync(appName, bus)
  }

  // Use RouteSync to notify micro-app (with debouncing)
  routeSync.value.notifyMicroApp(subPath, query, params)
}

/**
 * Legacy route sync function (fallback when feature flag is disabled)
 * This is the old setTimeout-based approach
 */
const legacySyncRouteToSubApp = (path) => {
  const appName = microAppName.value
  const basePath = path.split('/')[1]
  const subPath = path.replace(`/${basePath}`, '') || '/'

  if (bus) {
    const eventName = `${appName}-route-change`
    console.log('[MicroAppContainer] Using legacy sync:', eventName, 'subPath:', subPath)

    setTimeout(() => {
      bus.$emit(eventName, subPath)
    }, 100)
  }
}

// Watch for route changes and sync to micro-app
watch(() => route.path, (newPath, oldPath) => {
  console.log('[MicroAppContainer] Route watcher triggered')
  console.log('[MicroAppContainer] Old path:', oldPath)
  console.log('[MicroAppContainer] New path:', newPath)
  console.log('[MicroAppContainer] microAppName:', microAppName.value)

  // Only sync if the route changed and we have an app name
  if (newPath !== oldPath && microAppName.value) {
    syncRouteToSubApp(newPath)
  } else {
    console.log('[MicroAppContainer] Skipping sync - same route or no app name')
  }
}, { immediate: false, flush: 'post' })

/**
 * Handle micro-app before load
 * Reset loading state and start timeout
 */
const handleBeforeLoad = () => {
  console.log('[MicroAppContainer] App before load:', microAppName.value)
  isLoading.value = true
  startLoadTimeout()
}

/**
 * Handle micro-app after mount (successfully loaded)
 * This is the critical event to clear the timeout
 */
const handleAfterMount = () => {
  console.log('[MicroAppContainer] App mounted successfully:', microAppName.value)

  // Clear timeout - app loaded successfully
  clearLoadTimeout()
  isLoading.value = false

  // Sync route after successful mount
  syncRouteToSubApp(route.path)
}

/**
 * Handle micro-app load error
 * Wujie emits this when the micro-app fails to load
 */
const handleLoadError = (error) => {
  console.error('[MicroAppContainer] App load error:', microAppName.value, error)

  // Clear timeout
  clearLoadTimeout()
  isLoading.value = false

  // Report error to monitoring
  if (microAppName.value && error) {
    reportMicroAppLoadError(
      microAppName.value,
      error,
      {
        url: microAppUrl.value,
        route: route.path,
        errorType: 'wujie-load-error'
      }
    )
  }
}

// Handle micro-app activation
const handleActivated = () => {
  console.log('[MicroAppContainer] App activated:', microAppName.value)
  console.log('[MicroAppContainer] Current route path:', route.path)

  // Sync route when micro-app is activated (keep-alive mode)
  // Use nextTick to ensure DOM is ready
  setTimeout(() => {
    console.log('[MicroAppContainer] Syncing route after activation')
    syncRouteToSubApp(route.path)
  }, 100)
}

// Handle micro-app deactivation
const handleDeactivated = () => {
  console.log('[MicroAppContainer] App deactivated:', microAppName.value)
  // Clear timeout when micro-app is deactivated
  clearLoadTimeout()
}

/**
 * Handle error from ErrorBoundary
 */
const handleError = (errorData) => {
  console.error('[MicroAppContainer] Error caught by ErrorBoundary:', errorData)

  // Clear timeout timer
  clearLoadTimeout()

  // Report micro-app load error
  if (microAppName.value) {
    reportMicroAppLoadError(
      microAppName.value,
      errorData.error,
      {
        url: microAppUrl.value,
        route: route.path
      }
    )
  }
}

/**
 * Handle retry from ErrorBoundary
 */
const handleRetry = () => {
  console.log('[MicroAppContainer] Retry requested')

  // Reset loading state
  isLoading.value = false

  // Clear any existing timeout
  clearLoadTimeout()

  // Start new timeout
  startLoadTimeout()
}

/**
 * Start loading timeout timer
 */
const startLoadTimeout = () => {
  // Clear any existing timer
  clearLoadTimeout()

  // Set new timer
  timeoutTimer.value = setTimeout(() => {
    console.error('[MicroAppContainer] Micro-app loading timeout:', microAppName.value)

    // Trigger timeout error in ErrorBoundary
    if (errorBoundary.value) {
      errorBoundary.value.triggerTimeout()
    }

    // Report timeout error
    if (microAppName.value) {
      reportMicroAppLoadError(
        microAppName.value,
        new Error(`Micro-app loading timeout after ${loadTimeout.value}ms`),
        {
          url: microAppUrl.value,
          timeout: loadTimeout.value,
          route: route.path
        }
      )
    }
  }, loadTimeout.value)
}

/**
 * Clear loading timeout timer
 */
const clearLoadTimeout = () => {
  if (timeoutTimer.value) {
    clearTimeout(timeoutTimer.value)
    timeoutTimer.value = null
  }
}

// Cleanup RouteSync instance and timeout on component unmount
onUnmounted(() => {
  console.log('[MicroAppContainer] Component unmounting, cleaning up')

  // Teardown RouteSync
  if (routeSync.value) {
    routeSync.value.teardown()
    routeSync.value = null
  }

  // Clear timeout
  clearLoadTimeout()
})
</script>

<style scoped>
.micro-app-container {
  width: 100%;
  height: 100%;
}
</style>
