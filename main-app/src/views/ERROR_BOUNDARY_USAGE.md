# ErrorBoundary Component Usage Guide

## Overview

The ErrorBoundary component provides robust error handling for Vue 3 components, specifically designed for the K8s Agent Web micro-frontend system. It catches runtime errors, handles micro-app load failures, and provides a user-friendly error UI.

## Basic Usage

### 1. Wrap Components with ErrorBoundary

```vue
<template>
  <ErrorBoundary>
    <YourComponent />
  </ErrorBoundary>
</template>

<script setup>
import ErrorBoundary from './ErrorBoundary.vue'
</script>
```

### 2. Handle Error Events

```vue
<template>
  <ErrorBoundary @error="handleError" @retry="handleRetry">
    <YourComponent />
  </ErrorBoundary>
</template>

<script setup>
import ErrorBoundary from './ErrorBoundary.vue'

const handleError = (errorData) => {
  console.error('Error caught:', errorData)
  // Perform additional error handling
}

const handleRetry = () => {
  console.log('User clicked retry')
  // Perform cleanup or state reset
}
</script>
```

### 3. Custom Timeout

```vue
<template>
  <ErrorBoundary :timeout="10000">
    <!-- Will timeout after 10 seconds -->
    <SlowLoadingComponent />
  </ErrorBoundary>
</template>
```

### 4. Programmatic Timeout Trigger

```vue
<template>
  <ErrorBoundary ref="errorBoundary">
    <YourComponent />
  </ErrorBoundary>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ErrorBoundary from './ErrorBoundary.vue'

const errorBoundary = ref(null)

onMounted(() => {
  // Manually trigger timeout after some condition
  if (someCondition) {
    errorBoundary.value.triggerTimeout()
  }
})
</script>
```

## Advanced Usage

### 1. Micro-App Container Integration

```vue
<template>
  <div class="micro-app-container">
    <ErrorBoundary
      ref="errorBoundary"
      :timeout="loadTimeout"
      @error="handleError"
      @retry="handleRetry"
    >
      <WujieVue
        :name="microAppName"
        :url="microAppUrl"
        :alive="true"
        :props="appProps"
      />
    </ErrorBoundary>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ErrorBoundary from './ErrorBoundary.vue'
import WujieVue from 'wujie-vue3'
import { reportMicroAppLoadError } from '@/utils/error-reporter'

const errorBoundary = ref(null)
const loadTimeout = ref(5000)
const timeoutTimer = ref(null)

const handleError = (errorData) => {
  clearTimeout(timeoutTimer.value)
  reportMicroAppLoadError(
    microAppName.value,
    errorData.error,
    { url: microAppUrl.value }
  )
}

const handleRetry = () => {
  clearTimeout(timeoutTimer.value)
  startLoadTimeout()
}

const startLoadTimeout = () => {
  timeoutTimer.value = setTimeout(() => {
    errorBoundary.value?.triggerTimeout()
  }, loadTimeout.value)
}

onMounted(() => {
  startLoadTimeout()
})

watch([microAppName, microAppUrl], () => {
  startLoadTimeout()
})
</script>
```

### 2. Nested Error Boundaries

```vue
<template>
  <ErrorBoundary>
    <MainLayout>
      <ErrorBoundary>
        <SidebarComponent />
      </ErrorBoundary>

      <ErrorBoundary>
        <ContentComponent />
      </ErrorBoundary>

      <ErrorBoundary>
        <FooterComponent />
      </ErrorBoundary>
    </MainLayout>
  </ErrorBoundary>
</template>
```

**Note**: Each ErrorBoundary stops error propagation, so nested boundaries allow granular error handling.

### 3. Custom Error Handling Per Error Type

```vue
<template>
  <ErrorBoundary @error="handleErrorByType">
    <YourComponent />
  </ErrorBoundary>
</template>

<script setup>
import { ErrorType } from '@/utils/error-reporter'

const handleErrorByType = (errorData) => {
  const { error } = errorData
  const message = error.message?.toLowerCase() || ''

  if (message.includes('network') || message.includes('fetch')) {
    // Handle network errors
    console.error('Network error detected')
    showNetworkErrorNotification()
  } else if (message.includes('404')) {
    // Handle 404 errors
    console.error('Resource not found')
    redirectToNotFoundPage()
  } else {
    // Handle generic errors
    console.error('Generic error')
    showGenericErrorNotification()
  }
}
</script>
```

## Props

### timeout
- **Type**: `Number`
- **Default**: `5000`
- **Description**: Timeout in milliseconds for detecting load failures

```vue
<ErrorBoundary :timeout="10000">
  <!-- Component -->
</ErrorBoundary>
```

## Events

### @error
- **Payload**: `{ error, errorInfo }`
- **Description**: Emitted when an error is caught
- **Usage**: Perform additional error handling, logging, or notifications

```vue
<ErrorBoundary @error="handleError">
  <!-- Component -->
</ErrorBoundary>
```

**Payload Structure**:
```javascript
{
  error: Error,              // Original error object
  errorInfo: {
    error: Error,
    message: string,
    name: string,
    stack: string,
    componentName: string,
    info: string
  }
}
```

### @retry
- **Payload**: None
- **Description**: Emitted when retry button is clicked
- **Usage**: Perform cleanup, state reset, or restart timers

```vue
<ErrorBoundary @retry="handleRetry">
  <!-- Component -->
</ErrorBoundary>
```

## Exposed Methods

### triggerTimeout()
- **Description**: Manually trigger a timeout error
- **Usage**: Call when you want to programmatically show timeout error

```vue
<template>
  <ErrorBoundary ref="errorBoundary">
    <!-- Component -->
  </ErrorBoundary>
</template>

<script setup>
const errorBoundary = ref(null)

// Later in code
errorBoundary.value.triggerTimeout()
</script>
```

### hasError (Ref)
- **Type**: `Ref<boolean>`
- **Description**: Reactive reference to error state
- **Usage**: Check if error boundary is in error state

```vue
<script setup>
const errorBoundary = ref(null)

watchEffect(() => {
  if (errorBoundary.value?.hasError) {
    console.log('Error boundary is showing error')
  }
})
</script>
```

## Error Types and Messages

### Network Errors
**Triggers**:
- Error message contains "fetch", "network", or "timeout"

**Display**:
- Title: "网络错误"
- Subtitle: "无法连接到服务器，请检查网络连接后重试"

### 404 Not Found
**Triggers**:
- Error message contains "404" or "not found"

**Display**:
- Title: "页面未找到"
- Subtitle: "请求的页面不存在，请确认地址是否正确"

### Runtime Errors
**Triggers**:
- Error type is TypeError or ReferenceError

**Display**:
- Title: "运行错误"
- Subtitle: "页面运行出错，请联系技术支持"

### Timeout Errors
**Triggers**:
- Timeout timer expires or `triggerTimeout()` is called

**Display**:
- Title: "网络错误"
- Subtitle: "页面加载超时，请检查网络后重试"

### Generic Errors
**Triggers**:
- Any other error

**Display**:
- Title: "加载失败"
- Subtitle: "抱歉，页面加载失败，请稍后重试"

## Error Reporting

All errors are automatically reported to the centralized error reporting system:

```javascript
reportError({
  appName: 'main-app',
  errorType: ErrorType.NETWORK_ERROR,
  severity: ErrorSeverity.ERROR,
  message: error.message,
  error,
  metadata: {
    componentName: 'ErrorBoundary',
    url: window.location.href
  }
})
```

## User Actions

### Retry Button
- **Text**: "重试"
- **Type**: Primary button
- **Action**:
  1. Resets error state
  2. Emits `@retry` event
  3. Reloads page via `router.go(0)`

### Home Button
- **Text**: "返回首页"
- **Type**: Default button
- **Action**:
  1. Resets error state
  2. Navigates to home page via `router.push('/')`

## Best Practices

### 1. Wrap High-Level Components
Place ErrorBoundary at strategic points in your component tree:

```vue
<!-- Good: Wrap entire pages -->
<ErrorBoundary>
  <DashboardPage />
</ErrorBoundary>

<!-- Good: Wrap micro-apps -->
<ErrorBoundary>
  <WujieVue name="dashboard-app" />
</ErrorBoundary>

<!-- Not ideal: Wrapping every small component -->
<div>
  <ErrorBoundary><Button /></ErrorBoundary>
  <ErrorBoundary><Input /></ErrorBoundary>
  <ErrorBoundary><Select /></ErrorBoundary>
</div>
```

### 2. Handle Async Errors Separately
ErrorBoundary catches errors during render and lifecycle. For async errors:

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  try {
    await fetchData()
  } catch (error) {
    // Handle async error manually
    console.error('Async error:', error)
  }
})
</script>
```

### 3. Use Appropriate Timeouts
Choose timeout based on expected load time:

```vue
<!-- Fast micro-apps: 3 seconds -->
<ErrorBoundary :timeout="3000">
  <LightweightApp />
</ErrorBoundary>

<!-- Heavy micro-apps: 10 seconds -->
<ErrorBoundary :timeout="10000">
  <HeavyApp />
</ErrorBoundary>

<!-- API calls: 30 seconds -->
<ErrorBoundary :timeout="30000">
  <DataIntensiveComponent />
</ErrorBoundary>
```

### 4. Clean Up on Retry
Clear state and timers when retry is triggered:

```vue
<script setup>
const handleRetry = () => {
  // Clear any pending timers
  clearAllTimers()

  // Reset component state
  resetState()

  // Restart load monitoring
  startLoadTimeout()
}
</script>
```

### 5. Provide Context in Error Events
When handling errors, provide context for debugging:

```vue
<script setup>
const handleError = (errorData) => {
  console.error('Error in Dashboard:', {
    error: errorData.error,
    route: router.currentRoute.value.path,
    user: userStore.userInfo,
    timestamp: Date.now()
  })
}
</script>
```

## Testing

### Unit Testing
```javascript
import { describe, it, expect } from 'vitest'

describe('MyComponent with ErrorBoundary', () => {
  it('should catch errors from child components', async () => {
    // Test error catching logic
  })
})
```

### E2E Testing
```javascript
import { test, expect } from '@playwright/test'

test('should show error boundary on load failure', async ({ page }) => {
  // Block network requests to simulate failure
  await page.route('**/api/**', route => route.abort())

  await page.goto('http://localhost:3000/dashboard')

  // Verify error UI is shown
  await expect(page.locator('.ant-result-error')).toBeVisible()
})
```

## Troubleshooting

### Error Not Caught
**Problem**: Error occurs but ErrorBoundary doesn't catch it

**Solution**:
- Ensure error occurs in child component during render/lifecycle
- Async errors need try-catch, not ErrorBoundary
- Check ErrorBoundary is properly wrapping the component

### Infinite Error Loop
**Problem**: Error keeps occurring after retry

**Solution**:
- Add retry limit counter
- Check if error is recoverable
- Disable retry button after certain attempts

### Timeout Too Short
**Problem**: Timeout triggers before app finishes loading

**Solution**:
- Increase timeout prop
- Check network speed
- Optimize app loading performance

## Migration Guide

### From Try-Catch
**Before**:
```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  try {
    initializeApp()
  } catch (error) {
    console.error(error)
    showError()
  }
})
</script>
```

**After**:
```vue
<template>
  <ErrorBoundary @error="handleError">
    <YourComponent />
  </ErrorBoundary>
</template>

<script setup>
const handleError = (errorData) => {
  console.error(errorData.error)
}
</script>
```

### From Window Error Handler
**Before**:
```javascript
window.addEventListener('error', (event) => {
  console.error(event.error)
  showError()
})
```

**After**:
```vue
<template>
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
</template>
```

## Related Documentation

- `ERROR_BOUNDARY_IMPLEMENTATION.md` - Implementation details
- `@/utils/error-reporter.js` - Error reporting utility
- `TROUBLESHOOTING.md` - General troubleshooting

---

**Last Updated**: October 9, 2025
**Version**: 1.0.0
