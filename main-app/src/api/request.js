/**
 * Main App API Request Configuration
 * Uses unified API configuration from @k8s-agent/shared
 * Feature 003: Project Structure Optimization
 */

import { message } from 'ant-design-vue'
import {
  createApiInstance,
  defaultResponseErrorHandler
} from '@k8s-agent/shared/config'

/**
 * Create API instance with Ant Design Vue message integration
 */
const request = createApiInstance(
  {
    // Custom configuration for main-app
    baseURL: '/api/v1',
    timeout: 30000
  },
  {
    // Custom response error handler with Ant Design Vue message
    responseErrorHandler: (error) =>
      defaultResponseErrorHandler(error, {
        showMessage: (msg, type) => message[type](msg),
        onUnauthorized: () => {
          // Custom unauthorized handling for main app
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          message.error('Login expired, please login again')
        }
      })
  }
)

export default request
