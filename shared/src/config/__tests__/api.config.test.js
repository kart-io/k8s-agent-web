/**
 * Unit tests for api.config.js
 * Feature 003: Project Structure Optimization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  DEFAULT_CONFIG,
  ENV_CONFIGS,
  getEnvConfig,
  defaultRequestInterceptor,
  defaultResponseInterceptor,
  defaultResponseErrorHandler,
  createApiInstance,
  createUrl,
  api
} from '../api.config'

describe('api.config', () => {
  describe('DEFAULT_CONFIG', () => {
    it('should have correct default configuration', () => {
      expect(DEFAULT_CONFIG).toEqual({
        baseURL: '/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: false
      })
    })
  })

  describe('ENV_CONFIGS', () => {
    it('should have configurations for all environments', () => {
      expect(ENV_CONFIGS).toHaveProperty('development')
      expect(ENV_CONFIGS).toHaveProperty('test')
      expect(ENV_CONFIGS).toHaveProperty('production')
    })

    it('should have different timeouts for different environments', () => {
      expect(ENV_CONFIGS.development.timeout).toBe(30000)
      expect(ENV_CONFIGS.test.timeout).toBe(20000)
      expect(ENV_CONFIGS.production.timeout).toBe(15000)
    })
  })

  describe('getEnvConfig', () => {
    it('should return development config by default', () => {
      const config = getEnvConfig('development')
      expect(config.baseURL).toBe('/api')
      expect(config.timeout).toBe(30000)
    })

    it('should merge DEFAULT_CONFIG with ENV_CONFIGS', () => {
      const config = getEnvConfig('production')
      expect(config.headers).toEqual({ 'Content-Type': 'application/json' })
      expect(config.baseURL).toBe('https://api.example.com/api')
    })

    it('should fallback to development config for unknown environment', () => {
      const config = getEnvConfig('unknown')
      expect(config.baseURL).toBe('/api')
    })
  })

  describe('defaultRequestInterceptor', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should add authorization header when token exists', () => {
      localStorage.setItem('token', 'test-token')
      const config = { headers: {}, method: 'post', params: {} }
      const result = defaultRequestInterceptor(config)

      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('should not add authorization header when token does not exist', () => {
      const config = { headers: {}, method: 'post', params: {} }
      const result = defaultRequestInterceptor(config)

      expect(result.headers.Authorization).toBeUndefined()
    })

    it('should add timestamp to GET requests', () => {
      const config = { headers: {}, method: 'get', params: {} }
      const result = defaultRequestInterceptor(config)

      expect(result.params._t).toBeDefined()
      expect(typeof result.params._t).toBe('number')
    })

    it('should not add timestamp to POST requests', () => {
      const config = { headers: {}, method: 'post', params: {} }
      const result = defaultRequestInterceptor(config)

      expect(result.params._t).toBeUndefined()
    })
  })

  describe('defaultResponseInterceptor', () => {
    it('should return data for standard success response with code 0', () => {
      const response = {
        data: {
          code: 0,
          data: { id: 1, name: 'Test' },
          message: 'Success'
        }
      }
      const result = defaultResponseInterceptor(response)

      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('should return data for standard success response with code 200', () => {
      const response = {
        data: {
          code: 200,
          data: { id: 1, name: 'Test' },
          message: 'Success'
        }
      }
      const result = defaultResponseInterceptor(response)

      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('should reject promise for error response with code 500', async () => {
      const response = {
        data: {
          code: 500,
          message: 'Server error'
        }
      }

      try {
        await defaultResponseInterceptor(response)
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error.message).toBe('Server error')
        expect(error.code).toBe(500)
      }
    })

    it('should return entire response for direct data response', () => {
      const response = {
        data: { id: 1, name: 'Test' }
      }
      const result = defaultResponseInterceptor(response)

      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('should return raw data for non-object response', () => {
      const response = {
        data: 'plain text'
      }
      const result = defaultResponseInterceptor(response)

      expect(result).toBe('plain text')
    })
  })

  describe('defaultResponseErrorHandler', () => {
    beforeEach(() => {
      localStorage.clear()
      // Mock window.location
      delete window.location
      window.location = { href: '' }
    })

    it('should handle 401 unauthorized error', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      localStorage.setItem('token', 'test-token')
      localStorage.setItem('userInfo', '{}')

      try {
        await defaultResponseErrorHandler(error)
        expect.fail('Should have thrown error')
      } catch (err) {
        expect(localStorage.getItem('token')).toBeNull()
        expect(localStorage.getItem('userInfo')).toBeNull()
        expect(window.location.href).toBe('/login')
      }
    })

    it('should call custom onUnauthorized handler', async () => {
      const onUnauthorized = vi.fn()
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      try {
        await defaultResponseErrorHandler(error, { onUnauthorized })
      } catch (err) {
        expect(onUnauthorized).toHaveBeenCalled()
      }
    })

    it('should handle network error', async () => {
      const error = {
        message: 'Network Error'
      }

      try {
        await defaultResponseErrorHandler(error)
        expect.fail('Should have thrown error')
      } catch (err) {
        expect(err).toBe(error)
      }
    })

    it('should call showMessage function when provided', async () => {
      const showMessage = vi.fn()
      const error = {
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      }

      try {
        await defaultResponseErrorHandler(error, { showMessage })
      } catch (err) {
        expect(showMessage).toHaveBeenCalledWith('Resource not found', 'error')
      }
    })

    it('should handle 500 server error', async () => {
      const onServerError = vi.fn()
      const error = {
        response: {
          status: 500,
          data: { message: 'Server Error' }
        }
      }

      try {
        await defaultResponseErrorHandler(error, { onServerError })
      } catch (err) {
        expect(onServerError).toHaveBeenCalled()
      }
    })
  })

  describe('createApiInstance', () => {
    it('should create axios instance with default config', () => {
      const instance = createApiInstance()

      expect(instance.defaults.baseURL).toBe('/api')
      expect(instance.defaults.timeout).toBe(30000)
    })

    it('should merge custom config with default config', () => {
      const instance = createApiInstance({
        baseURL: '/custom-api',
        timeout: 5000
      })

      expect(instance.defaults.baseURL).toBe('/custom-api')
      expect(instance.defaults.timeout).toBe(5000)
    })

    it('should register interceptors', () => {
      const instance = createApiInstance()

      expect(instance.interceptors.request.handlers.length).toBeGreaterThan(0)
      expect(instance.interceptors.response.handlers.length).toBeGreaterThan(0)
    })

    it('should use custom interceptors when provided', () => {
      const customRequestInterceptor = vi.fn((config) => config)
      const customResponseInterceptor = vi.fn((response) => response)

      const instance = createApiInstance({}, {
        requestInterceptor: customRequestInterceptor,
        responseInterceptor: customResponseInterceptor
      })

      expect(instance.interceptors.request.handlers.length).toBeGreaterThan(0)
      expect(instance.interceptors.response.handlers.length).toBeGreaterThan(0)
    })
  })

  describe('createUrl', () => {
    it('should create URL without query string when params is empty', () => {
      const url = createUrl('/api/users')
      expect(url).toBe('/api/users')
    })

    it('should create URL with query string', () => {
      const url = createUrl('/api/users', { page: 1, size: 10 })
      expect(url).toBe('/api/users?page=1&size=10')
    })

    it('should skip undefined and null values', () => {
      const url = createUrl('/api/users', {
        page: 1,
        name: undefined,
        age: null,
        status: 'active'
      })
      expect(url).toBe('/api/users?page=1&status=active')
    })

    it('should encode special characters', () => {
      const url = createUrl('/api/users', { name: 'John Doe', email: 'test@example.com' })
      expect(url).toContain('John%20Doe')
      expect(url).toContain('test%40example.com')
    })
  })

  describe('api (default instance)', () => {
    it('should export a pre-configured axios instance', () => {
      expect(api).toBeDefined()
      expect(api.defaults.baseURL).toBe('/api')
      expect(typeof api.get).toBe('function')
      expect(typeof api.post).toBe('function')
    })
  })
})
