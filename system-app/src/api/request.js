/**
 * System App API Request Configuration
 * Uses unified API configuration from @k8s-agent/shared
 * Feature 003: Project Structure Optimization
 */

import { message } from 'ant-design-vue'
import {
  createApiInstance,
  defaultResponseErrorHandler
} from '@k8s-agent/shared/config'

const request = createApiInstance(
  {
    baseURL: '/api',
    timeout: 10000
  },
  {
    responseErrorHandler: (error) =>
      defaultResponseErrorHandler(error, {
        showMessage: (msg, type) => message[type](msg)
      })
  }
)

export default request
