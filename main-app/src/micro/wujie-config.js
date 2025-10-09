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

export function setupWujie(app) {
  app.use(WujieVue)
}
