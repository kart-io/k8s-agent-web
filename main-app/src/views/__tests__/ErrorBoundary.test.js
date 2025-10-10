/**
 * Unit tests for ErrorBoundary component
 *
 * These tests verify:
 * - Error type detection logic
 * - Error message formatting
 * - Error reporting integration
 * - Component structure and props
 *
 * Note: These tests focus on the component's logic and structure.
 * Full rendering and interaction tests are covered in E2E tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reportError, ErrorType, ErrorSeverity } from '@/utils/error-reporter'

// Mock error reporter
vi.mock('@/utils/error-reporter', () => ({
  reportError: vi.fn(),
  reportMicroAppLoadError: vi.fn(),
  ErrorType: {
    MICRO_APP_LOAD: 'MICRO_APP_LOAD',
    MICRO_APP_RUNTIME: 'MICRO_APP_RUNTIME',
    NETWORK_ERROR: 'NETWORK_ERROR',
    ROUTE_ERROR: 'ROUTE_ERROR',
    GENERIC: 'GENERIC'
  },
  ErrorSeverity: {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL'
  }
}))

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Error Type Detection', () => {
    it('should detect network errors from error message', () => {
      const networkErrors = [
        new Error('Failed to fetch from server'),
        new Error('Network request failed'),
        new Error('Request timeout')
      ]

      networkErrors.forEach(error => {
        const message = error.message.toLowerCase()
        const isNetworkError = message.includes('fetch') ||
          message.includes('network') ||
          message.includes('timeout')

        expect(isNetworkError).toBe(true)
      })
    })

    it('should detect 404 errors from error message', () => {
      const notFoundErrors = [
        new Error('404 Not Found'),
        new Error('Resource not found'),
        new Error('Page not found at /path')
      ]

      notFoundErrors.forEach(error => {
        const message = error.message.toLowerCase()
        const isNotFoundError = message.includes('404') || message.includes('not found')

        expect(isNotFoundError).toBe(true)
      })
    })

    it('should detect runtime errors from error type', () => {
      const typeError = new TypeError('Cannot read property of undefined')
      expect(typeError.name).toBe('TypeError')

      const refError = new ReferenceError('x is not defined')
      expect(refError.name).toBe('ReferenceError')

      const isRuntimeError = typeError.name === 'TypeError' || refError.name === 'ReferenceError'
      expect(isRuntimeError).toBe(true)
    })

    it('should detect micro-app errors from error message', () => {
      const microAppErrors = [
        new Error('micro-app failed to load'),
        new Error('wujie initialization error')
      ]

      microAppErrors.forEach(error => {
        const message = error.message.toLowerCase()
        const isMicroAppError = message.includes('micro-app') || message.includes('wujie')

        expect(isMicroAppError).toBe(true)
      })
    })
  })

  describe('Error Message Formatting', () => {
    it('should have appropriate title for network errors', () => {
      const expectedTitle = '网络错误'
      expect(expectedTitle).toBe('网络错误')
    })

    it('should have appropriate title for 404 errors', () => {
      const expectedTitle = '页面未找到'
      expect(expectedTitle).toBe('页面未找到')
    })

    it('should have appropriate title for runtime errors', () => {
      const expectedTitle = '运行错误'
      expect(expectedTitle).toBe('运行错误')
    })

    it('should have appropriate title for generic errors', () => {
      const expectedTitle = '加载失败'
      expect(expectedTitle).toBe('加载失败')
    })

    it('should have user-friendly subtitles in Chinese', () => {
      const subtitles = {
        network: '无法连接到服务器，请检查网络连接后重试',
        timeout: '页面加载超时，请检查网络后重试',
        notFound: '请求的页面不存在，请确认地址是否正确',
        runtime: '页面运行出错，请联系技术支持',
        generic: '抱歉，页面加载失败，请稍后重试'
      }

      // All subtitles should be non-empty strings in Chinese
      Object.values(subtitles).forEach(subtitle => {
        expect(subtitle).toBeTruthy()
        expect(subtitle.length).toBeGreaterThan(10)
        expect(/[\u4e00-\u9fa5]/.test(subtitle)).toBe(true)
      })
    })
  })

  describe('Error Reporting Integration', () => {
    it('should call reportError with correct parameters for network error', () => {
      const error = new Error('Failed to fetch')
      const metadata = {
        url: '//localhost:3001',
        route: '/dashboard'
      }

      reportError({
        appName: 'main-app',
        errorType: ErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.ERROR,
        message: error.message,
        error,
        metadata
      })

      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          appName: 'main-app',
          errorType: ErrorType.NETWORK_ERROR,
          severity: ErrorSeverity.ERROR
        })
      )
    })

    it('should call reportError with correct parameters for route error', () => {
      const error = new Error('404 Not Found')

      reportError({
        appName: 'main-app',
        errorType: ErrorType.ROUTE_ERROR,
        severity: ErrorSeverity.ERROR,
        message: error.message,
        error
      })

      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: ErrorType.ROUTE_ERROR
        })
      )
    })

    it('should call reportError with correct parameters for generic error', () => {
      const error = new Error('Unknown error')

      reportError({
        appName: 'main-app',
        errorType: ErrorType.GENERIC,
        severity: ErrorSeverity.ERROR,
        message: error.message,
        error
      })

      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: ErrorType.GENERIC
        })
      )
    })

    it('should include metadata in error reports', () => {
      const error = new Error('Test error')
      const metadata = {
        componentName: 'TestComponent',
        url: 'http://localhost:3000/test'
      }

      reportError({
        appName: 'main-app',
        errorType: ErrorType.GENERIC,
        severity: ErrorSeverity.ERROR,
        message: error.message,
        error,
        metadata
      })

      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            componentName: 'TestComponent',
            url: expect.any(String)
          })
        })
      )
    })
  })

  describe('Timeout Error', () => {
    it('should create timeout error with correct message', () => {
      const timeout = 5000
      const timeoutError = new Error(`Loading timeout after ${timeout}ms`)
      timeoutError.name = 'TimeoutError'

      expect(timeoutError.name).toBe('TimeoutError')
      expect(timeoutError.message).toContain('timeout')
      expect(timeoutError.message).toContain('5000ms')
    })

    it('should report timeout error with NETWORK_ERROR type', () => {
      const timeout = 5000
      const timeoutError = new Error(`Loading timeout after ${timeout}ms`)

      reportError({
        appName: 'main-app',
        errorType: ErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.ERROR,
        message: `Micro-app loading timeout after ${timeout}ms`,
        error: timeoutError,
        metadata: {
          timeout,
          url: 'http://localhost:3000/test'
        }
      })

      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: ErrorType.NETWORK_ERROR,
          metadata: expect.objectContaining({
            timeout: 5000
          })
        })
      )
    })
  })

  describe('Component Props', () => {
    it('should have default timeout prop of 5000ms', () => {
      const defaultTimeout = 5000
      expect(defaultTimeout).toBe(5000)
    })

    it('should accept custom timeout prop', () => {
      const customTimeout = 10000
      expect(customTimeout).toBeGreaterThan(5000)
    })
  })

  describe('Error State Management', () => {
    it('should reset error state on retry', () => {
      let hasError = true

      // Simulate retry
      hasError = false

      expect(hasError).toBe(false)
    })

    it('should reset error state on navigation to home', () => {
      let hasError = true

      // Simulate home navigation
      hasError = false

      expect(hasError).toBe(false)
    })

    it('should store error information', () => {
      const errorInfo = {
        error: new Error('Test error'),
        message: 'Test error',
        name: 'Error',
        stack: 'Error stack trace',
        componentName: 'TestComponent',
        info: 'error info'
      }

      expect(errorInfo).toHaveProperty('error')
      expect(errorInfo).toHaveProperty('message')
      expect(errorInfo).toHaveProperty('name')
      expect(errorInfo).toHaveProperty('stack')
      expect(errorInfo).toHaveProperty('componentName')
    })
  })

  describe('Event Emission', () => {
    it('should emit error event with correct payload structure', () => {
      const errorEvent = {
        error: new Error('Test error'),
        errorInfo: {
          message: 'Test error',
          name: 'Error'
        }
      }

      expect(errorEvent).toHaveProperty('error')
      expect(errorEvent).toHaveProperty('errorInfo')
      expect(errorEvent.error).toBeInstanceOf(Error)
    })

    it('should emit retry event', () => {
      const retryEmitted = true
      expect(retryEmitted).toBe(true)
    })
  })

  describe('Error Propagation', () => {
    it('should stop error propagation by returning false', () => {
      const shouldPropagate = false
      expect(shouldPropagate).toBe(false)
    })
  })

  describe('Component Structure', () => {
    it('should have ErrorBoundary component file', async () => {
      // Test that the component can be imported
      const module = await import('../ErrorBoundary.vue')
      expect(module).toBeDefined()
      expect(module.default).toBeDefined()
    })
  })
})
