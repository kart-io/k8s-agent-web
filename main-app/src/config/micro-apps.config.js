/**
 * Centralized Micro-Apps Configuration
 *
 * Single source of truth for all micro-app configurations.
 * Consolidates previously scattered URL definitions across the codebase.
 *
 * Benefits:
 * - Environment-aware URL resolution
 * - Schema validation support
 * - Single modification point for all app URLs
 * - Type-safe configuration access
 */

import { getEntryUrl } from '@k8s-agent/shared/utils/config-loader.js'

/**
 * Centralized micro-apps configuration
 * Each app must have: name, port, basePath, entry (with development and production URLs)
 */
const microAppsConfig = {
  'dashboard-app': {
    name: 'dashboard-app',
    port: 3001,
    basePath: '/dashboard',
    entry: {
      development: '//localhost:3001',
      production: '/micro-apps/dashboard/'
    },
    metadata: {
      version: '1.0.0',
      owner: 'team-platform',
      description: '仪表盘应用 - 提供系统概览和统计数据'
    },
    wujie: {
      exec: true,
      alive: true,
      sync: true
    }
  },

  'agent-app': {
    name: 'agent-app',
    port: 3002,
    basePath: '/agents',
    entry: {
      development: '//localhost:3002',
      production: '/micro-apps/agent/'
    },
    metadata: {
      version: '1.0.0',
      owner: 'team-agent',
      description: 'Agent 管理应用 - 管理和监控 K8s Agent'
    },
    wujie: {
      exec: true,
      alive: true,
      sync: true
    }
  },

  'cluster-app': {
    name: 'cluster-app',
    port: 3003,
    basePath: '/clusters',
    entry: {
      development: '//localhost:3003',
      production: '/micro-apps/cluster/'
    },
    metadata: {
      version: '1.0.0',
      owner: 'team-cluster',
      description: '集群管理应用 - 管理 Kubernetes 集群'
    },
    wujie: {
      exec: true,
      alive: true,
      sync: true
    }
  },

  'monitor-app': {
    name: 'monitor-app',
    port: 3004,
    basePath: '/monitor',
    entry: {
      development: '//localhost:3004',
      production: '/micro-apps/monitor/'
    },
    metadata: {
      version: '1.0.0',
      owner: 'team-monitor',
      description: '监控应用 - 实时监控系统状态和性能指标'
    },
    wujie: {
      exec: true,
      alive: true,
      sync: true
    }
  },

  'system-app': {
    name: 'system-app',
    port: 3005,
    basePath: '/system',
    entry: {
      development: '//localhost:3005',
      production: '/micro-apps/system/'
    },
    metadata: {
      version: '1.0.0',
      owner: 'team-system',
      description: '系统管理应用 - 用户、角色、权限等系统配置'
    },
    wujie: {
      exec: true,
      alive: true,
      sync: true
    }
  },

  'image-build-app': {
    name: 'image-build-app',
    port: 3006,
    basePath: '/image-build',
    entry: {
      development: '//localhost:3006',
      production: '/micro-apps/image-build/'
    },
    metadata: {
      version: '1.0.0',
      owner: 'team-build',
      description: '镜像构建应用 - 管理容器镜像构建流程'
    },
    wujie: {
      exec: true,
      alive: true,
      sync: true
    }
  }
}

/**
 * Get environment-specific URL for a micro-app
 *
 * @param {string} appName - Micro-app name (e.g., 'dashboard-app', 'agent-app')
 * @param {string} [env] - Target environment (development, test, production)
 *                         Defaults to import.meta.env.MODE or 'development'
 * @returns {string} Environment-specific URL
 * @throws {Error} If app name is not found in configuration
 *
 * @example
 * // Get development URL
 * const url = getMicroAppUrl('dashboard-app', 'development')
 * // Returns: '//localhost:3001'
 *
 * @example
 * // Get production URL
 * const url = getMicroAppUrl('dashboard-app', 'production')
 * // Returns: '/micro-apps/dashboard/'
 *
 * @example
 * // Use current environment (defaults to development)
 * const url = getMicroAppUrl('dashboard-app')
 */
export function getMicroAppUrl(appName, env) {
  const config = microAppsConfig[appName]

  if (!config) {
    throw new Error(`Micro-app configuration not found: ${appName}`)
  }

  // Check if feature flag is enabled
  const featureEnabled = import.meta.env.VITE_FEATURE_UNIFIED_CONFIG === 'true'

  if (!featureEnabled) {
    console.warn(
      `[CONFIG] Unified config feature is disabled. Using legacy URL resolution for ${appName}`
    )
    // Fallback to development URL when feature is disabled
    return config.entry.development
  }

  try {
    // Explicitly determine environment from consuming app's runtime environment
    // This is crucial because config-loader is pre-built and can't access runtime env
    let targetEnv = env

    if (!targetEnv) {
      // Use consuming app's runtime environment
      if (import.meta.env.DEV) {
        targetEnv = 'development'
      } else if (import.meta.env.PROD) {
        targetEnv = 'production'
      } else if (import.meta.env.MODE) {
        targetEnv = import.meta.env.MODE
      } else {
        targetEnv = 'development'
      }
    }

    console.log(`[CONFIG] Resolving URL for ${appName} in environment: ${targetEnv}`)

    // Pass explicit environment to config-loader
    return getEntryUrl(config.entry, targetEnv)
  } catch (error) {
    console.error(`[CONFIG] Error getting URL for ${appName}:`, error)
    // Fallback to development URL on error
    return config.entry.development
  }
}

/**
 * Get complete configuration object for a micro-app
 *
 * @param {string} appName - Micro-app name (e.g., 'dashboard-app', 'agent-app')
 * @returns {Object|null} Complete configuration object or null if not found
 *
 * @example
 * const config = getMicroAppConfig('dashboard-app')
 * // Returns: { name: 'dashboard-app', port: 3001, basePath: '/dashboard', ... }
 */
export function getMicroAppConfig(appName) {
  return microAppsConfig[appName] || null
}

/**
 * Get all micro-app configurations
 *
 * @returns {Object} All micro-app configurations
 */
export function getAllMicroAppsConfig() {
  return microAppsConfig
}

/**
 * Get list of all registered micro-app names
 *
 * @returns {string[]} Array of app names
 */
export function getMicroAppNames() {
  return Object.keys(microAppsConfig)
}

/**
 * Check if a micro-app is registered in the configuration
 *
 * @param {string} appName - Micro-app name to check
 * @returns {boolean} True if app is registered
 */
export function hasMicroApp(appName) {
  return appName in microAppsConfig
}

/**
 * Get micro-app configuration by base path
 * Useful for route matching
 *
 * @param {string} basePath - Base path to search for (e.g., '/dashboard', '/agents')
 * @returns {Object|null} Configuration object or null if not found
 */
export function getMicroAppByBasePath(basePath) {
  const normalizedPath = basePath.startsWith('/') ? basePath : `/${basePath}`

  for (const config of Object.values(microAppsConfig)) {
    if (config.basePath === normalizedPath) {
      return config
    }
  }

  return null
}

/**
 * Get micro-app configuration by port
 * Useful for debugging port conflicts
 *
 * @param {number} port - Port number to search for
 * @returns {Object|null} Configuration object or null if not found
 */
export function getMicroAppByPort(port) {
  for (const config of Object.values(microAppsConfig)) {
    if (config.port === port) {
      return config
    }
  }

  return null
}

// Export the raw configuration for advanced use cases
export default microAppsConfig
