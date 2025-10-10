import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import App from './App.vue'
import router from './router'
import permissionDirective from './directives/permission'
import { setupWujie } from './micro/wujie-config'
import { setupGlobalErrorHandler } from './utils/error-reporter'
import { initSharedStateManager } from './store/shared-state'
import WujieVue from 'wujie-vue3'

import './assets/styles/main.scss'

/**
 * CRITICAL: Suppress Wujie benign errors BEFORE any other code runs
 * This must be at the very top to catch errors during Wujie initialization
 */
;(() => {
  // Store originals
  const originalConsoleError = console.error
  const originalErrorHandler = window.onerror

  // Override console.error
  console.error = function(...args) {
    const msg = String(args[0]?.message || args[0] || '')
    if (msg.includes('此报错可以忽略') || msg.includes('iframe主动中断') || msg.includes('stopMainAppRun')) {
      return
    }
    originalConsoleError.apply(console, args)
  }

  // Override window.onerror
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = String(message || '')
    if (msg.includes('此报错可以忽略') || msg.includes('iframe主动中断') || msg.includes('stopMainAppRun')) {
      return true
    }
    return originalErrorHandler ? originalErrorHandler(message, source, lineno, colno, error) : false
  }

  // Capture phase error listener
  window.addEventListener('error', (e) => {
    const msg = String(e.message || e.error?.message || '')
    if (msg.includes('此报错可以忽略') || msg.includes('iframe主动中断') || msg.includes('stopMainAppRun')) {
      e.stopImmediatePropagation()
      e.preventDefault()
    }
  }, true)
})()

/**
 * Validate micro-apps configuration on startup
 * This ensures configuration errors are caught early before runtime
 */
async function validateMicroAppsConfig() {
  try {
    // Only validate if unified config feature is enabled
    if (import.meta.env.VITE_FEATURE_UNIFIED_CONFIG !== 'true') {
      console.log('[CONFIG] Unified config feature disabled, skipping validation')
      return { valid: true }
    }

    console.log('[CONFIG] Validating micro-apps configuration...')

    // Dynamic import to avoid circular dependencies
    const { default: microAppsConfig } = await import('./config/micro-apps.config.js')
    const { validateConfig, validatePortUniqueness, validateBasePathUniqueness } =
      await import('@k8s-agent/shared/utils/config-loader.js')

    // Load JSON schema (relative to project root)
    const schema = await import('../../config/micro-apps.schema.json')

    // Validate against schema
    const validationResult = validateConfig(microAppsConfig, schema)

    if (!validationResult.valid) {
      console.error('[CONFIG] ❌ Configuration validation failed:')
      validationResult.errors.forEach(error => {
        console.error(`  - ${error.path}: ${error.message}`)
      })
      return validationResult
    }

    // Validate port uniqueness
    const portConflicts = validatePortUniqueness(microAppsConfig)
    if (portConflicts.length > 0) {
      console.error('[CONFIG] ❌ Port conflicts detected:')
      portConflicts.forEach(conflict => {
        console.error(`  - ${conflict.message}`)
      })
      return {
        valid: false,
        errors: portConflicts.map(c => ({ path: 'port', message: c.message }))
      }
    }

    // Validate basePath uniqueness
    const pathConflicts = validateBasePathUniqueness(microAppsConfig)
    if (pathConflicts.length > 0) {
      console.error('[CONFIG] ❌ BasePath conflicts detected:')
      pathConflicts.forEach(conflict => {
        console.error(`  - ${conflict.message}`)
      })
      return {
        valid: false,
        errors: pathConflicts.map(c => ({ path: 'basePath', message: c.message }))
      }
    }

    console.log('[CONFIG] ✅ Configuration validated successfully')
    return { valid: true }
  } catch (error) {
    console.error('[CONFIG] ❌ Error during configuration validation:', error)
    return {
      valid: false,
      errors: [{ path: '', message: error.message }]
    }
  }
}

// Validate configuration before app initialization
const configValidation = await validateMicroAppsConfig()

// Setup global error handlers
setupGlobalErrorHandler()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)
app.use(permissionDirective)
setupWujie(app) // 注册 Wujie

// Initialize shared state manager with Wujie bus
const sharedStateManager = initSharedStateManager(WujieVue.bus)
app.provide('sharedState', sharedStateManager)

// Log configuration status
if (configValidation.valid) {
  console.log('[APP] 🚀 Application starting with validated configuration')
} else {
  console.warn('[APP] ⚠️  Application starting with configuration errors (using fallback)')
}

app.mount('#app')
