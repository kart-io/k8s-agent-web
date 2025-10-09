<template>
  <div class="micro-app-container">
    <WujieVue
      :name="microAppName"
      :url="microAppUrl"
      :sync="false"
      :alive="true"
      :props="appProps"
      @activated="handleActivated"
      @deactivated="handleDeactivated"
    />
  </div>
</template>

<script setup>
import { computed, watch, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import WujieVue from 'wujie-vue3'
import { getMicroAppUrl } from '@/config/micro-apps.config.js'
import { RouteSync } from '@k8s-agent/shared/core/route-sync.js'

const route = useRoute()
const router = useRouter()
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
watch(() => route.path, (newPath) => {
  console.log('[MicroAppContainer] Route changed to:', newPath)
  syncRouteToSubApp(newPath)
}, { immediate: false })

// Handle micro-app activation
const handleActivated = () => {
  console.log('[MicroAppContainer] App activated:', microAppName.value)
  // Sync route when micro-app is activated (keep-alive mode)
  syncRouteToSubApp(route.path)
}

// Handle micro-app deactivation
const handleDeactivated = () => {
  console.log('[MicroAppContainer] App deactivated:', microAppName.value)
}

// Cleanup RouteSync instance on component unmount
onUnmounted(() => {
  if (routeSync.value) {
    routeSync.value.teardown()
    routeSync.value = null
  }
})
</script>

<style scoped>
.micro-app-container {
  width: 100%;
  height: 100%;
}
</style>
