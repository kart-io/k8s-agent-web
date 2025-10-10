/**
 * Unified API Configuration for K8s Agent Web
 * Feature 003: Project Structure Optimization
 *
 * This module provides centralized API configuration for all micro-apps,
 * ensuring consistent request/response handling, error management, and
 * authentication across the entire application.
 *
 * @module @k8s-agent/shared/config/api
 */

import axios from 'axios'

/**
 * Default API configuration
 * Can be overridden by individual applications
 */
export const DEFAULT_CONFIG = {
  // Base URL for API requests
  baseURL: '/api',

  // Request timeout in milliseconds
  timeout: 30000,

  // Request headers
  headers: {
    'Content-Type': 'application/json'
  },

  // Enable credentials for cross-origin requests
  withCredentials: false
}

/**
 * Environment-specific configurations
 */
export const ENV_CONFIGS = {
  development: {
    baseURL: '/api',
    timeout: 30000
  },
  test: {
    baseURL: 'https://test-api.example.com/api',
    timeout: 20000
  },
  production: {
    baseURL: 'https://api.example.com/api',
    timeout: 15000
  }
}

/**
 * Get environment-aware configuration
 * @param {string} env - Environment name (development|test|production)
 * @returns {Object} Merged configuration
 */
export function getEnvConfig(env = import.meta.env.MODE) {
  const envConfig = ENV_CONFIGS[env] || ENV_CONFIGS.development
  return { ...DEFAULT_CONFIG, ...envConfig }
}

/**
 * Default request interceptor
 * Adds authorization token to all requests
 *
 * @param {Object} config - Axios request config
 * @returns {Object} Modified config
 */
export function defaultRequestInterceptor(config) {
  // Get token from localStorage (can be customized)
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Add timestamp for cache busting
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    }
  }

  return config
}

/**
 * Default request error handler
 * @param {Error} error - Request error
 * @returns {Promise} Rejected promise
 */
export function defaultRequestErrorHandler(error) {
  console.error('[API Request Error]', error)
  return Promise.reject(error)
}

/**
 * Default response interceptor
 * Extracts data from response and handles common response formats
 *
 * @param {Object} response - Axios response
 * @returns {Object} Response data
 */
export function defaultResponseInterceptor(response) {
  const res = response.data

  // Standard response format: { code, data, message }
  if (res && typeof res === 'object') {
    // Success response codes: 0, 200, '0', '200'
    const successCodes = [0, 200, '0', '200']
    if ('code' in res) {
      if (successCodes.includes(res.code)) {
        return res.data !== undefined ? res.data : res
      } else {
        // Business logic error
        const error = new Error(res.message || 'Business logic error')
        error.code = res.code
        error.response = response
        return Promise.reject(error)
      }
    }

    // Direct data response
    return res
  }

  // Return raw response for non-object data
  return response.data
}

/**
 * Default response error handler
 * Handles HTTP errors and authentication issues
 *
 * @param {Error} error - Response error
 * @param {Object} options - Error handling options
 * @param {Function} options.onUnauthorized - 401 handler
 * @param {Function} options.onForbidden - 403 handler
 * @param {Function} options.onNotFound - 404 handler
 * @param {Function} options.onServerError - 5xx handler
 * @param {Function} options.showMessage - Message display function
 * @returns {Promise} Rejected promise
 */
export function defaultResponseErrorHandler(error, options = {}) {
  const {
    onUnauthorized,
    onForbidden,
    onNotFound,
    onServerError,
    showMessage
  } = options

  if (!error.response) {
    // Network error
    const message = 'Network error, please check your connection'
    if (showMessage) showMessage(message, 'error')
    console.error('[Network Error]', error)
    return Promise.reject(error)
  }

  const { status, data } = error.response
  let message = data?.message || data?.error || error.message || 'Request failed'

  switch (status) {
    case 401:
      // Unauthorized - clear auth and redirect to login
      message = 'Authentication failed, please login again'
      if (onUnauthorized) {
        onUnauthorized()
      } else {
        // Default behavior
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      break

    case 403:
      // Forbidden
      message = 'Access denied'
      if (onForbidden) onForbidden()
      break

    case 404:
      // Not Found
      message = 'Resource not found'
      if (onNotFound) onNotFound()
      break

    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors
      message = 'Server error, please try again later'
      if (onServerError) onServerError()
      break

    default:
      // Other errors
      break
  }

  if (showMessage) showMessage(message, 'error')
  console.error(`[API Error ${status}]`, message, data)

  return Promise.reject(error)
}

/**
 * Create configured axios instance
 *
 * @param {Object} customConfig - Custom configuration to override defaults
 * @param {Object} interceptorOptions - Custom interceptor options
 * @param {Function} interceptorOptions.requestInterceptor - Custom request interceptor
 * @param {Function} interceptorOptions.requestErrorHandler - Custom request error handler
 * @param {Function} interceptorOptions.responseInterceptor - Custom response interceptor
 * @param {Function} interceptorOptions.responseErrorHandler - Custom response error handler
 * @returns {import('axios').AxiosInstance} Configured axios instance
 *
 * @example
 * // Basic usage
 * import { createApiInstance } from '@k8s-agent/shared/config/api'
 * const api = createApiInstance()
 *
 * @example
 * // Custom configuration
 * const api = createApiInstance({
 *   baseURL: '/custom-api',
 *   timeout: 5000
 * })
 *
 * @example
 * // With Ant Design Vue message
 * import { message } from 'ant-design-vue'
 * const api = createApiInstance({}, {
 *   responseErrorHandler: (error) => defaultResponseErrorHandler(error, {
 *     showMessage: (msg, type) => message[type](msg)
 *   })
 * })
 */
export function createApiInstance(customConfig = {}, interceptorOptions = {}) {
  const {
    requestInterceptor = defaultRequestInterceptor,
    requestErrorHandler = defaultRequestErrorHandler,
    responseInterceptor = defaultResponseInterceptor,
    responseErrorHandler = defaultResponseErrorHandler
  } = interceptorOptions

  // Merge configurations
  const config = {
    ...getEnvConfig(),
    ...customConfig
  }

  // Create axios instance
  const instance = axios.create(config)

  // Register request interceptors
  instance.interceptors.request.use(
    requestInterceptor,
    requestErrorHandler
  )

  // Register response interceptors
  instance.interceptors.response.use(
    responseInterceptor,
    responseErrorHandler
  )

  return instance
}

/**
 * Pre-configured API instance with default settings
 * Can be used directly in applications
 */
export const api = createApiInstance()

/**
 * Export axios for direct access if needed
 */
export { axios }

/**
 * Utility function to create URL with query parameters
 * @param {string} url - Base URL
 * @param {Object} params - Query parameters
 * @returns {string} URL with query string
 */
export function createUrl(url, params = {}) {
  const queryString = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')

  return queryString ? `${url}?${queryString}` : url
}

/**
 * Utility function to handle file downloads
 * @param {Object} response - Axios response with blob data
 * @param {string} filename - Suggested filename
 */
export function downloadFile(response, filename) {
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export default {
  DEFAULT_CONFIG,
  ENV_CONFIGS,
  getEnvConfig,
  createApiInstance,
  createUrl,
  downloadFile,
  api,
  axios,
  // Interceptors
  defaultRequestInterceptor,
  defaultRequestErrorHandler,
  defaultResponseInterceptor,
  defaultResponseErrorHandler
}
