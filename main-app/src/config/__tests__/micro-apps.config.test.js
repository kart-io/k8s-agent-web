/**
 * Unit tests for micro-apps configuration module
 *
 * These tests verify the centralized configuration system:
 * - getMicroAppUrl() returns correct environment-specific URLs
 * - getMicroAppConfig() returns valid configuration objects
 * - Configuration validation works properly
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Micro-Apps Configuration', () => {
  describe('getMicroAppUrl()', () => {
    it('should return development URL when env is development', () => {
      // This test will fail until we implement the function
      const { getMicroAppUrl } = await import('../micro-apps.config.js')

      const url = getMicroAppUrl('dashboard-app', 'development')

      expect(url).toBe('//localhost:3001')
    })

    it('should return production URL when env is production', () => {
      const { getMicroAppUrl } = await import('../micro-apps.config.js')

      const url = getMicroAppUrl('dashboard-app', 'production')

      expect(url).toMatch(/\/micro-apps\/dashboard\/|\/dashboard\//)
    })

    it('should default to development environment when env is not specified', () => {
      const { getMicroAppUrl } = await import('../micro-apps.config.js')

      // Mock import.meta.env
      vi.stubGlobal('import.meta', {
        env: {
          MODE: 'development'
        }
      })

      const url = getMicroAppUrl('dashboard-app')

      expect(url).toBe('//localhost:3001')
    })

    it('should return correct URLs for all 6 micro-apps', () => {
      const { getMicroAppUrl } = await import('../micro-apps.config.js')

      const apps = [
        { name: 'dashboard-app', port: 3001 },
        { name: 'agent-app', port: 3002 },
        { name: 'cluster-app', port: 3003 },
        { name: 'monitor-app', port: 3004 },
        { name: 'system-app', port: 3005 },
        { name: 'image-build-app', port: 3006 }
      ]

      for (const app of apps) {
        const url = getMicroAppUrl(app.name, 'development')
        expect(url).toBe(`//localhost:${app.port}`)
      }
    })

    it('should throw error for non-existent app', () => {
      const { getMicroAppUrl } = await import('../micro-apps.config.js')

      expect(() => {
        getMicroAppUrl('non-existent-app', 'development')
      }).toThrow()
    })

    it('should fallback to production URL when env not found', () => {
      const { getMicroAppUrl } = await import('../micro-apps.config.js')

      // Request a non-existent environment
      const url = getMicroAppUrl('dashboard-app', 'staging')

      // Should fallback to production or development
      expect(url).toBeTruthy()
      expect(typeof url).toBe('string')
    })

    it('should support test environment URLs when configured', () => {
      const { getMicroAppUrl } = await import('../micro-apps.config.js')

      // Some apps might have test environment configured
      const url = getMicroAppUrl('dashboard-app', 'test')

      // Should return a valid URL (either test or fallback)
      expect(url).toBeTruthy()
      expect(typeof url).toBe('string')
    })
  })

  describe('getMicroAppConfig()', () => {
    it('should return complete config object for valid app', () => {
      const { getMicroAppConfig } = await import('../micro-apps.config.js')

      const config = getMicroAppConfig('dashboard-app')

      expect(config).toBeDefined()
      expect(config).toHaveProperty('name', 'dashboard-app')
      expect(config).toHaveProperty('port')
      expect(config).toHaveProperty('basePath')
      expect(config).toHaveProperty('entry')
      expect(config.entry).toHaveProperty('development')
      expect(config.entry).toHaveProperty('production')
    })

    it('should return null for non-existent app', () => {
      const { getMicroAppConfig } = await import('../micro-apps.config.js')

      const config = getMicroAppConfig('non-existent-app')

      expect(config).toBeNull()
    })

    it('should return valid config for all 6 micro-apps', () => {
      const { getMicroAppConfig } = await import('../micro-apps.config.js')

      const appNames = [
        'dashboard-app',
        'agent-app',
        'cluster-app',
        'monitor-app',
        'system-app',
        'image-build-app'
      ]

      for (const appName of appNames) {
        const config = getMicroAppConfig(appName)

        expect(config).toBeDefined()
        expect(config.name).toBe(appName)
        expect(config.port).toBeGreaterThanOrEqual(3000)
        expect(config.port).toBeLessThanOrEqual(3999)
        expect(config.basePath).toMatch(/^\/[a-z0-9-]+/)
      }
    })

    it('should include Wujie configuration when present', () => {
      const { getMicroAppConfig } = await import('../micro-apps.config.js')

      const config = getMicroAppConfig('dashboard-app')

      // Wujie config is optional but likely present
      if (config.wujie) {
        expect(config.wujie).toHaveProperty('exec')
        expect(config.wujie).toHaveProperty('alive')
        expect(config.wujie).toHaveProperty('sync')
      }
    })

    it('should include metadata when present', () => {
      const { getMicroAppConfig } = await import('../micro-apps.config.js')

      const config = getMicroAppConfig('dashboard-app')

      // Metadata is optional but useful
      if (config.metadata) {
        expect(config.metadata).toBeTypeOf('object')
      }
    })

    it('should have unique ports for all apps', () => {
      const { getMicroAppConfig } = await import('../micro-apps.config.js')

      const appNames = [
        'dashboard-app',
        'agent-app',
        'cluster-app',
        'monitor-app',
        'system-app',
        'image-build-app'
      ]

      const ports = new Set()

      for (const appName of appNames) {
        const config = getMicroAppConfig(appName)
        expect(ports.has(config.port)).toBe(false)
        ports.add(config.port)
      }

      expect(ports.size).toBe(6)
    })

    it('should have unique basePaths for all apps', () => {
      const { getMicroAppConfig } = await import('../micro-apps.config.js')

      const appNames = [
        'dashboard-app',
        'agent-app',
        'cluster-app',
        'monitor-app',
        'system-app',
        'image-build-app'
      ]

      const basePaths = new Set()

      for (const appName of appNames) {
        const config = getMicroAppConfig(appName)
        expect(basePaths.has(config.basePath)).toBe(false)
        basePaths.add(config.basePath)
      }

      expect(basePaths.size).toBe(6)
    })
  })

  describe('Configuration validation', () => {
    it('should validate against JSON schema successfully', async () => {
      const { default: microAppsConfig } = await import('../micro-apps.config.js')
      const { validateConfig } = await import('@k8s-agent/shared/utils/config-loader.js')

      // Load schema
      const schema = await import('../../../../config/micro-apps.schema.json')

      const result = validateConfig(microAppsConfig, schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid app name format', async () => {
      const { validateConfig } = await import('@k8s-agent/shared/utils/config-loader.js')
      const schema = await import('../../../../config/micro-apps.schema.json')

      const invalidConfig = {
        'InvalidAppName': {  // Should be lowercase with hyphens
          name: 'InvalidAppName',
          port: 3001,
          basePath: '/invalid',
          entry: {
            development: '//localhost:3001',
            production: '/micro-apps/invalid/'
          }
        }
      }

      const result = validateConfig(invalidConfig, schema)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should detect missing required fields', async () => {
      const { validateConfig } = await import('@k8s-agent/shared/utils/config-loader.js')
      const schema = await import('../../../../config/micro-apps.schema.json')

      const invalidConfig = {
        'test-app': {
          name: 'test-app',
          // Missing required fields: port, basePath, entry
        }
      }

      const result = validateConfig(invalidConfig, schema)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.message.includes('port'))).toBe(true)
      expect(result.errors.some(e => e.message.includes('basePath'))).toBe(true)
      expect(result.errors.some(e => e.message.includes('entry'))).toBe(true)
    })

    it('should detect invalid port range', async () => {
      const { validateConfig } = await import('@k8s-agent/shared/utils/config-loader.js')
      const schema = await import('../../../../config/micro-apps.schema.json')

      const invalidConfig = {
        'test-app': {
          name: 'test-app',
          port: 9999,  // Outside valid range 3000-3999
          basePath: '/test',
          entry: {
            development: '//localhost:9999',
            production: '/micro-apps/test/'
          }
        }
      }

      const result = validateConfig(invalidConfig, schema)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path.includes('port'))).toBe(true)
    })
  })
})
