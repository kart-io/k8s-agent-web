import WujieVue from 'wujie-vue3'
import {
  getMicroAppUrl,
  getMicroAppConfig,
  getMicroAppNames
} from '@/config/micro-apps.config.js'

/**
 * Generate Wujie configuration from centralized micro-apps config
 * This replaces hardcoded URLs with config-driven URL resolution
 */
function generateWujieConfig() {
  const appNames = getMicroAppNames()

  return {
    apps: appNames.map(appName => {
      const config = getMicroAppConfig(appName)

      return {
        name: config.name,
        url: getMicroAppUrl(appName), // Uses centralized config with environment awareness
        exec: config.wujie?.exec !== undefined ? config.wujie.exec : true,
        alive: config.wujie?.alive !== undefined ? config.wujie.alive : true,
        sync: config.wujie?.sync !== undefined ? config.wujie.sync : true,
        ...(config.wujie?.props && { props: config.wujie.props }),
        ...(config.wujie?.attrs && { attrs: config.wujie.attrs })
      }
    })
  }
}

// Export the dynamically generated configuration
export const wujieConfig = generateWujieConfig()

/**
 * Suppress Wujie benign error messages
 * Uses multiple strategies to completely silence Wujie's intentional errors
 */
function suppressWujieBenignErrors() {
  // Strategy 1: Override console.error globally
  const originalConsoleError = console.error
  console.error = function(...args) {
    const errorMessage = String(args[0]?.message || args[0] || '')
    if (
      errorMessage.includes('此报错可以忽略') ||
      errorMessage.includes('iframe主动中断主应用代码') ||
      errorMessage.includes('stopMainAppRun')
    ) {
      return // Silent ignore
    }
    originalConsoleError.apply(console, args)
  }

  // Strategy 2: Override window.onerror
  const originalErrorHandler = window.onerror
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = String(message || '')
    const src = String(source || '')
    if (
      msg.includes('此报错可以忽略') ||
      msg.includes('iframe主动中断主应用代码') ||
      msg.includes('stopMainAppRun') ||
      (src.includes('utils.ts') && msg.includes('Uncaught Error'))
    ) {
      return true // Prevent default error handling
    }
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error)
    }
    return false
  }

  // Strategy 3: Add global error event listener with capture phase
  window.addEventListener('error', (event) => {
    const message = String(event.message || event.error?.message || '')
    const filename = String(event.filename || '')
    if (
      message.includes('此报错可以忽略') ||
      message.includes('iframe主动中断主应用代码') ||
      message.includes('stopMainAppRun') ||
      (filename.includes('utils.ts') && !message)
    ) {
      event.stopImmediatePropagation()
      event.preventDefault()
    }
  }, true) // Use capture phase

  console.log('[Wujie] Multi-strategy benign error suppression enabled')
}

export function setupWujie(app) {
  // Must suppress errors before Wujie initializes
  suppressWujieBenignErrors()

  // Register Wujie plugin
  app.use(WujieVue)
}
