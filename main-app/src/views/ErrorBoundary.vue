<template>
  <div class="error-boundary">
    <div
      v-if="hasError"
      class="error-boundary__content"
    >
      <a-result
        status="error"
        :title="errorTitle"
        :sub-title="errorSubTitle"
      >
        <template #extra>
          <a-space>
            <a-button
              type="primary"
              @click="handleRetry"
            >
              重试
            </a-button>
            <a-button @click="handleGoHome">
              返回首页
            </a-button>
          </a-space>
        </template>
      </a-result>
    </div>
    <slot v-else />
  </div>
</template>

<script setup>
import { ref, onErrorCaptured, computed } from 'vue'
import { useRouter } from 'vue-router'
import { reportError, ErrorType, ErrorSeverity } from '@/utils/error-reporter'

const props = defineProps({
  /**
   * Timeout in milliseconds for detecting load failures
   * @default 5000
   */
  timeout: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['error', 'retry'])

const router = useRouter()
const hasError = ref(false)
const errorInfo = ref(null)
const loadTimeout = ref(null)

/**
 * Error title based on error type
 */
const errorTitle = computed(() => {
  if (!errorInfo.value) return '加载失败'

  const error = errorInfo.value

  // Network errors
  if (error.message?.includes('Failed to fetch') ||
      error.message?.includes('Network') ||
      error.message?.includes('timeout')) {
    return '网络错误'
  }

  // 404 errors
  if (error.message?.includes('404') || error.message?.includes('Not Found')) {
    return '页面未找到'
  }

  // JavaScript runtime errors
  if (error.name === 'TypeError' || error.name === 'ReferenceError') {
    return '运行错误'
  }

  return '加载失败'
})

/**
 * Error subtitle with user-friendly message
 */
const errorSubTitle = computed(() => {
  if (!errorInfo.value) return '抱歉，页面加载失败，请稍后重试'

  const error = errorInfo.value

  // Network errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
    return '无法连接到服务器，请检查网络连接后重试'
  }

  // Timeout errors
  if (error.message?.includes('timeout')) {
    return '页面加载超时，请检查网络后重试'
  }

  // 404 errors
  if (error.message?.includes('404') || error.message?.includes('Not Found')) {
    return '请求的页面不存在，请确认地址是否正确'
  }

  // JavaScript runtime errors
  if (error.name === 'TypeError' || error.name === 'ReferenceError') {
    return '页面运行出错，请联系技术支持'
  }

  // Generic error
  return '抱歉，页面加载失败，请稍后重试'
})

/**
 * Capture errors from child components
 */
onErrorCaptured((error, instance, info) => {
  console.error('[ErrorBoundary] Caught error:', {
    error,
    instance,
    info
  })

  // Store error information
  errorInfo.value = {
    error,
    message: error.message,
    name: error.name,
    stack: error.stack,
    componentName: instance?.$options?.name || 'Unknown',
    info
  }

  // Set error state
  hasError.value = true

  // Report error to monitoring
  const errorType = determineErrorType(error)
  reportError({
    appName: 'main-app',
    errorType,
    severity: ErrorSeverity.ERROR,
    message: error.message || 'Component error',
    error,
    metadata: {
      componentName: instance?.$options?.name,
      errorInfo: info,
      url: window.location.href
    }
  })

  // Emit error event
  emit('error', {
    error,
    errorInfo: errorInfo.value
  })

  // Clear any pending load timeout
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value)
    loadTimeout.value = null
  }

  // Stop error propagation
  return false
})

/**
 * Determine error type based on error characteristics
 */
function determineErrorType(error) {
  const message = error.message?.toLowerCase() || ''

  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return ErrorType.NETWORK_ERROR
  }

  if (message.includes('404') || message.includes('not found')) {
    return ErrorType.ROUTE_ERROR
  }

  if (message.includes('micro-app') || message.includes('wujie')) {
    return ErrorType.MICRO_APP_RUNTIME
  }

  return ErrorType.GENERIC
}

/**
 * Handle retry button click
 */
function handleRetry() {
  console.log('[ErrorBoundary] Retrying...')

  // Reset error state
  hasError.value = false
  errorInfo.value = null

  // Emit retry event
  emit('retry')

  // Reload current route
  router.go(0)
}

/**
 * Handle go home button click
 */
function handleGoHome() {
  console.log('[ErrorBoundary] Going to home...')

  // Reset error state
  hasError.value = false
  errorInfo.value = null

  // Navigate to home
  router.push('/')
}

/**
 * Detect loading timeout
 * This can be called by parent component to manually trigger timeout error
 */
function triggerTimeout() {
  console.error('[ErrorBoundary] Loading timeout detected')

  // Create timeout error
  const timeoutError = new Error(`Loading timeout after ${props.timeout}ms`)
  timeoutError.name = 'TimeoutError'

  // Store error information
  errorInfo.value = {
    error: timeoutError,
    message: timeoutError.message,
    name: timeoutError.name,
    stack: timeoutError.stack,
    componentName: 'ErrorBoundary',
    info: 'Loading timeout'
  }

  // Set error state
  hasError.value = true

  // Report error
  reportError({
    appName: 'main-app',
    errorType: ErrorType.NETWORK_ERROR,
    severity: ErrorSeverity.ERROR,
    message: `Micro-app loading timeout after ${props.timeout}ms`,
    error: timeoutError,
    metadata: {
      timeout: props.timeout,
      url: window.location.href
    }
  })

  // Emit error event
  emit('error', {
    error: timeoutError,
    errorInfo: errorInfo.value
  })
}

// Expose methods for parent component
defineExpose({
  triggerTimeout,
  hasError
})
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-boundary__content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

.error-boundary :deep(.ant-result) {
  padding: 48px 32px;
}

.error-boundary :deep(.ant-result-title) {
  color: #ff4d4f;
}

.error-boundary :deep(.ant-result-subtitle) {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  line-height: 1.6;
  margin-top: 8px;
}
</style>
