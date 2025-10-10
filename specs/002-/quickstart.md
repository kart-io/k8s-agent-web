# Quick Start Guide: Micro-Frontend Architecture Optimization

**Feature**: 002- 微前端架构优化
**Audience**: Frontend developers working with K8s Agent Web
**Estimated Time**: 30 minutes

## Overview

This guide helps you quickly adopt the new centralized configuration, standardized route synchronization, and shared state management features in the K8s Agent Web micro-frontend system.

## Prerequisites

- Node.js 16+ and pnpm installed
- Familiarity with Vue 3 Composition API
- Basic understanding of Wujie micro-frontend framework
- Access to the K8s Agent Web repository

## What's New

| Feature | Before | After | Benefit |
|---------|--------|-------|---------|
| **Configuration** | Hardcoded URLs in 3-5 files | Single `micro-apps.config.js` | One-place updates, environment support |
| **Route Sync** | `setTimeout` + flags | `RouteSync` class with debounce | No delays, reliable navigation |
| **State Sharing** | Props only (main → micro) | `SharedStateManager` (bidirectional) | Cross-app reactive updates |
| **Error Handling** | White screen on failure | Error boundary + retry UI | Graceful degradation |
| **Shared Lib Build** | Source code (slow builds) | Pre-built ESM (fast builds) | 30%+ build time reduction |

---

## 1. Using Centralized Configuration

### For New Micro-Apps

**Step 1**: Add your app to the configuration file.

```javascript
// main-app/src/config/micro-apps.config.js

export const MICRO_APPS = {
  // ... existing apps

  'my-new-app': {
    name: 'my-new-app',
    port: 3007,                                    // Choose unique port
    basePath: '/my-app',
    entry: {
      development: '//localhost:3007',
      production: '/micro-apps/my-app/'
    },
    metadata: {
      version: '1.0.0',
      owner: 'team-platform',
      description: '我的新应用'
    },
    wujie: {
      exec: true,
      alive: true,
      sync: true
    }
  }
}

// Helper function to get environment-aware URL
export function getMicroAppUrl(appName, env = import.meta.env.MODE) {
  const app = MICRO_APPS[appName]
  if (!app) {
    console.error(`[Config] App not found: ${appName}`)
    return null
  }
  return app.entry[env] || app.entry.development
}

export function getMicroAppConfig(appName) {
  return MICRO_APPS[appName]
}
```

**Step 2**: Update Wujie registration to use config.

```javascript
// main-app/src/micro/wujie-config.js

import { MICRO_APPS, getMicroAppUrl } from '@/config/micro-apps.config'

export const wujieConfig = {
  apps: Object.values(MICRO_APPS).map(app => ({
    name: app.name,
    url: getMicroAppUrl(app.name),
    exec: app.wujie.exec,
    alive: app.wujie.alive,
    sync: app.wujie.sync,
    props: app.wujie.props
  }))
}
```

**Step 3**: Update `MicroAppContainer` to use config.

```vue
<!-- main-app/src/views/MicroAppContainer.vue -->

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getMicroAppUrl } from '@/config/micro-apps.config'

const route = useRoute()
const microAppName = computed(() => route.meta.microApp)
const microAppUrl = computed(() => getMicroAppUrl(microAppName.value))
</script>
```

### For Existing Apps (Migration)

**Before** (hardcoded):

```javascript
const urls = {
  'dashboard-app': '//localhost:3001',
  'agent-app': '//localhost:3002'
}
```

**After** (centralized):

```javascript
import { getMicroAppUrl } from '@/config/micro-apps.config'

const url = getMicroAppUrl('dashboard-app') // Automatically uses correct env
```

---

## 2. Using Standardized Route Sync

### In Main App

**Step 1**: Create `RouteSync` instance.

```javascript
// main-app/src/micro/route-sync.js

import WujieVue from 'wujie-vue3'

export class RouteSync {
  constructor(router) {
    this.router = router
    this.bus = WujieVue.bus
    this.debounceTimers = new Map()
  }

  notifyMicroApp(targetApp, path, meta = {}) {
    // Clear existing debounce timer
    if (this.debounceTimers.has(targetApp)) {
      clearTimeout(this.debounceTimers.get(targetApp))
    }

    // Debounce to 50ms
    this.debounceTimers.set(targetApp, setTimeout(() => {
      this.bus.$emit('route:sync', {
        type: 'sync',
        sourceApp: 'main-app',
        targetApp,
        path,
        fullPath: this.router.currentRoute.value.fullPath,
        meta,
        timestamp: Date.now()
      })
      this.debounceTimers.delete(targetApp)
    }, 50))
  }
}
```

**Step 2**: Use in `MicroAppContainer`.

```vue
<!-- main-app/src/views/MicroAppContainer.vue -->

<script setup>
import { watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouteSync } from '@/micro/route-sync'

const route = useRoute()
const router = useRouter()
const routeSync = new RouteSync(router)

// Watch route changes and notify micro-app
watch(() => route.path, (newPath) => {
  const appName = route.meta.microApp
  if (appName) {
    const basePath = newPath.split('/')[1]
    const subPath = newPath.replace(`/${basePath}`, '') || '/'
    routeSync.notifyMicroApp(appName, subPath, { title: route.meta.title })
  }
})

// Sync on mount (for direct navigation)
onMounted(() => {
  const appName = route.meta.microApp
  if (appName) {
    const basePath = route.path.split('/')[1]
    const subPath = route.path.replace(`/${basePath}`, '') || '/'
    routeSync.notifyMicroApp(appName, subPath)
  }
})
</script>
```

### In Micro-Apps

**Step 1**: Create `RouteSync` listener.

```javascript
// shared/src/core/route-sync.js (or copy to each micro-app)

export class RouteSync {
  constructor(appName, router, bus) {
    this.appName = appName
    this.router = router
    this.bus = bus
    this.lastPath = null
  }

  setupListener() {
    this.bus.$on('route:sync', (payload) => {
      // Only process events for this app
      if (payload.targetApp !== this.appName) return

      // Prevent duplicate navigation
      if (payload.path === this.lastPath) return

      this.lastPath = payload.path
      this.router.push(payload.path).catch((err) => {
        // Emit error for monitoring
        this.bus.$emit('route:error', {
          type: 'error',
          sourceApp: this.appName,
          path: payload.path,
          fullPath: payload.fullPath,
          error: {
            code: 'NAVIGATION_CANCELLED',
            message: err.message
          },
          timestamp: Date.now()
        })
      })
    })
  }
}
```

**Step 2**: Initialize in micro-app `main.js`.

```javascript
// system-app/src/main.js

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { RouteSync } from '@/utils/route-sync' // Or from shared
import App from './App.vue'
import routes from './router'

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

const app = createApp(App)
app.use(router)

// Setup Wujie route sync
if (window.$wujie?.bus) {
  const routeSync = new RouteSync('system-app', router, window.$wujie.bus)
  routeSync.setupListener()
}

app.mount('#system-app')
```

**Migration Note**: Remove old event listeners like `window.$wujie.bus.$on('system-app-route-change', ...)`.

---

## 3. Using Shared State Manager

### In Main App (Setup)

**Step 1**: Create `SharedStateManager` instance.

```javascript
// main-app/src/store/shared-state.js

import { reactive } from 'vue'
import WujieVue from 'wujie-vue3'

export class SharedStateManager {
  constructor() {
    this.state = reactive({})
    this.subscriptions = new Map()
    this.bus = WujieVue.bus
    this.setupBusListeners()
  }

  setState(namespace, key, value) {
    const fullKey = `${namespace}:${key}`
    this.state[fullKey] = value

    this.bus.$emit('state:update', {
      namespace,
      key,
      value,
      timestamp: Date.now()
    })

    // Trigger local subscriptions
    const callbacks = this.subscriptions.get(fullKey) || []
    callbacks.forEach(cb => cb(value))
  }

  getState(namespace, key) {
    return this.state[`${namespace}:${key}`]
  }

  subscribe(namespace, key, callback) {
    const fullKey = `${namespace}:${key}`
    if (!this.subscriptions.has(fullKey)) {
      this.subscriptions.set(fullKey, [])
    }
    this.subscriptions.get(fullKey).push(callback)
    return this.getState(namespace, key) // Return initial value
  }

  setupBusListeners() {
    this.bus.$on('state:update', ({ namespace, key, value }) => {
      const fullKey = `${namespace}:${key}`
      this.state[fullKey] = value

      const callbacks = this.subscriptions.get(fullKey) || []
      callbacks.forEach(cb => cb(value))
    })
  }
}

// Create singleton instance
export const sharedStateManager = new SharedStateManager()
```

**Step 2**: Initialize in main app.

```javascript
// main-app/src/main.js

import { sharedStateManager } from '@/store/shared-state'

// Make available globally
app.provide('sharedState', sharedStateManager)
```

### In Micro-Apps (Usage)

**Option 1: Composable (Recommended)**

```javascript
// shared/src/composables/useSharedState.js

import { ref, onUnmounted } from 'vue'

export function useSharedState(namespace, key, defaultValue) {
  const state = ref(defaultValue)
  const bus = window.$wujie?.bus

  if (!bus) {
    console.warn('[useSharedState] Wujie bus not available, using local state')
    return { state, setState: (val) => { state.value = val } }
  }

  // Listen for updates
  const listener = (payload) => {
    if (payload.namespace === namespace && payload.key === key) {
      state.value = payload.value
    }
  }
  bus.$on('state:update', listener)

  // Cleanup on unmount
  onUnmounted(() => {
    bus.$off('state:update', listener)
  })

  // Method to update state
  const setState = (value) => {
    state.value = value
    bus.$emit('state:update', { namespace, key, value, timestamp: Date.now() })
  }

  return { state, setState }
}
```

**Option 2: Direct API**

```javascript
// In any micro-app component
import { ref, watch } from 'vue'

const bus = window.$wujie?.bus

// Subscribe to user info
const userInfo = ref({})
bus.$on('state:update', (payload) => {
  if (payload.namespace === 'user' && payload.key === 'info') {
    userInfo.value = payload.value
  }
})

// Update user info
function updateAvatar(newAvatar) {
  const updated = { ...userInfo.value, avatar: newAvatar }
  bus.$emit('state:update', {
    namespace: 'user',
    key: 'info',
    value: updated,
    timestamp: Date.now()
  })
}
```

### Common Use Cases

**User Info Sync**:

```vue
<script setup>
import { useSharedState } from '@k8s-agent/shared/composables'

const { state: userInfo, setState: setUserInfo } = useSharedState('user', 'info', {})

async function saveProfile(profile) {
  await api.updateProfile(profile)
  setUserInfo(profile) // All apps update automatically
}
</script>

<template>
  <img :src="userInfo.avatar" />
</template>
```

**Notification Count**:

```vue
<script setup>
import { useSharedState } from '@k8s-agent/shared/composables'

const { state: unreadCount } = useSharedState('notification', 'unreadCount', 0)
</script>

<template>
  <a-badge :count="unreadCount">
    <BellOutlined />
  </a-badge>
</template>
```

---

## 4. Adding Error Boundaries

### Create Error Boundary Component

```vue
<!-- main-app/src/views/ErrorBoundary.vue -->

<template>
  <div v-if="error" class="error-boundary">
    <a-result status="error" :title="error.title" :sub-title="error.message">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="retry">重试</a-button>
          <a-button @click="goHome">返回首页</a-button>
        </a-space>
      </template>
    </a-result>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { reportError } from '@/utils/error-reporter'

const router = useRouter()
const error = ref(null)

onErrorCaptured((err, instance, info) => {
  error.value = {
    title: '应用加载失败',
    message: err.message
  }

  reportError({
    appName: instance?.$options.name || 'unknown',
    errorType: 'runtime',
    message: err.message,
    stack: err.stack,
    timestamp: Date.now()
  })

  return false // Stop propagation
})

const retry = () => {
  error.value = null
  location.reload()
}

const goHome = () => {
  error.value = null
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  padding: 100px 20px;
  text-align: center;
}
</style>
```

### Wrap Micro-App Container

```vue
<!-- main-app/src/views/MicroAppContainer.vue -->

<template>
  <ErrorBoundary>
    <div class="micro-app-container">
      <WujieVue
        :name="microAppName"
        :url="microAppUrl"
        :alive="true"
        :props="appProps"
      />
    </div>
  </ErrorBoundary>
</template>

<script setup>
import ErrorBoundary from './ErrorBoundary.vue'
// ... rest of component
</script>
```

---

## 5. Using Optimized Shared Library

### For Library Maintainers

**Step 1**: Add build configuration.

```javascript
// shared/vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.js'),
        components: resolve(__dirname, 'src/components/index.js'),
        composables: resolve(__dirname, 'src/composables/index.js'),
        utils: resolve(__dirname, 'src/utils/index.js')
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia', 'ant-design-vue', 'vxe-table'],
      output: {
        dir: 'dist',
        format: 'es'
      }
    }
  }
})
```

**Step 2**: Update `package.json`.

```json
{
  "name": "@k8s-agent/shared",
  "version": "1.1.0",
  "type": "module",
  "exports": {
    ".": { "import": "./dist/index.js" },
    "./components": { "import": "./dist/components.js" },
    "./composables": { "import": "./dist/composables.js" },
    "./utils": { "import": "./dist/utils.js" }
  },
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  }
}
```

**Step 3**: Build library.

```bash
cd shared
pnpm build
```

### For Micro-App Developers

**No changes required!** Import paths remain the same:

```javascript
import { VxeBasicTable } from '@k8s-agent/shared/components'
import { usePagination } from '@k8s-agent/shared/composables'
```

Builds will automatically be 30%+ faster.

---

## Testing Your Integration

### 1. Configuration Test

```bash
# Start all services
make dev

# In browser, check console for config loading
# Should see: [Config] Loaded 6 micro-apps
```

### 2. Route Sync Test

```bash
# Navigate to deep route in browser
http://localhost:3000/system/users

# Should render immediately without blank page
# Check console for route:sync events
```

### 3. State Sync Test

```javascript
// In browser console
window.$wujie.bus.$emit('state:update', {
  namespace: 'test',
  key: 'value',
  value: 'Hello World',
  timestamp: Date.now()
})

// All micro-apps with subscriptions should receive update
```

---

## Troubleshooting

### Issue: Configuration not loading

**Solution**: Check file path and import syntax.

```javascript
// Correct
import { getMicroAppUrl } from '@/config/micro-apps.config'

// Incorrect (missing extension in non-TS project)
import { getMicroAppUrl } from '@/config/micro-apps.config.js'
```

### Issue: Route sync not working

**Checklist**:

1. Wujie bus available? Check `window.$wujie?.bus`
2. Event listener registered? Check `RouteSync.setupListener()` called
3. App name matches? Verify `targetApp === this.appName`
4. Browser console errors? Look for navigation errors

### Issue: State not syncing

**Checklist**:

1. Event emitted? Check browser console for `state:update` events
2. Subscription active? Verify `useSharedState` or `bus.$on` called
3. Value serializable? Ensure no functions/circular refs in state value

---

## Next Steps

- **Migrate existing apps**: Update one micro-app at a time using this guide
- **Add tests**: Write unit tests for RouteSync and SharedStateManager
- **Monitor performance**: Track build times and route navigation speed
- **Read full documentation**: See `contracts/` directory for detailed protocols

## Support

- **Documentation**: `/specs/002-/` directory
- **Issues**: GitHub Issues with `[Architecture Optimization]` tag
- **Team Channel**: #frontend-architecture

---

**Last Updated**: 2025-10-09
**Version**: 1.0.0
