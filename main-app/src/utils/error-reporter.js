/**
 * Error Reporter Utility
 *
 * Centralized error reporting for micro-app failures, configuration errors,
 * and runtime issues. Currently logs to console with structured format.
 * Future: integrate with Sentry, DataDog, or other monitoring services.
 */

/**
 * Error types for categorization
 */
export const ErrorType = {
  /** Micro-app failed to load or mount */
  MICRO_APP_LOAD: 'MICRO_APP_LOAD',
  /** Micro-app runtime error */
  MICRO_APP_RUNTIME: 'MICRO_APP_RUNTIME',
  /** Configuration validation or loading error */
  CONFIG_ERROR: 'CONFIG_ERROR',
  /** Route navigation error */
  ROUTE_ERROR: 'ROUTE_ERROR',
  /** Network or API error */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** State synchronization error */
  STATE_SYNC_ERROR: 'STATE_SYNC_ERROR',
  /** Generic application error */
  GENERIC: 'GENERIC'
}

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  /** Low severity - informational */
  INFO: 'INFO',
  /** Medium severity - warning */
  WARNING: 'WARNING',
  /** High severity - error */
  ERROR: 'ERROR',
  /** Critical severity - requires immediate attention */
  CRITICAL: 'CRITICAL'
}

/**
 * Error context information
 */
export class ErrorContext {
  /**
   * @param {Object} options - Error context options
   * @param {string} [options.appName] - Micro-app name (if applicable)
   * @param {string} [options.errorType] - Error type from ErrorType enum
   * @param {string} [options.severity] - Error severity from ErrorSeverity enum
   * @param {string} [options.message] - Error message
   * @param {Error} [options.error] - Original error object
   * @param {string} [options.stack] - Stack trace
   * @param {Object} [options.metadata] - Additional metadata
   * @param {string} [options.userId] - User ID (if available)
   * @param {string} [options.sessionId] - Session ID (if available)
   */
  constructor(options = {}) {
    this.appName = options.appName || 'main-app'
    this.errorType = options.errorType || ErrorType.GENERIC
    this.severity = options.severity || ErrorSeverity.ERROR
    this.message = options.message || 'Unknown error'
    this.error = options.error
    this.stack = options.stack || options.error?.stack
    this.metadata = options.metadata || {}
    this.userId = options.userId
    this.sessionId = options.sessionId
    this.timestamp = new Date().toISOString()
    this.userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    this.url = typeof window !== 'undefined' ? window.location.href : 'unknown'
  }

  /**
   * Convert to plain object for logging/transmission
   */
  toJSON() {
    return {
      appName: this.appName,
      errorType: this.errorType,
      severity: this.severity,
      message: this.message,
      stack: this.stack,
      metadata: this.metadata,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: this.timestamp,
      userAgent: this.userAgent,
      url: this.url
    }
  }
}

/**
 * Report an error with structured logging
 *
 * @param {ErrorContext|Object} context - Error context or options to create ErrorContext
 */
export function reportError(context) {
  // Ensure we have an ErrorContext instance
  const errorContext = context instanceof ErrorContext
    ? context
    : new ErrorContext(context)

  // Structured console logging (development fallback)
  const logData = errorContext.toJSON()

  // Color-coded console output based on severity
  const consoleMethod = {
    [ErrorSeverity.INFO]: 'info',
    [ErrorSeverity.WARNING]: 'warn',
    [ErrorSeverity.ERROR]: 'error',
    [ErrorSeverity.CRITICAL]: 'error'
  }[errorContext.severity] || 'error'

  console[consoleMethod]('[ERROR REPORTER]', {
    ...logData,
    // Add visual separator for critical errors
    ...(errorContext.severity === ErrorSeverity.CRITICAL && {
      '⚠️  CRITICAL ERROR': '⚠️'
    })
  })

  // Stack trace for debugging (only in development)
  if (import.meta.env.DEV && errorContext.stack) {
    console.error('Stack trace:', errorContext.stack)
  }

  // TODO: Integrate with external monitoring service
  // Example integrations to add later:
  //
  // Sentry:
  // if (window.Sentry) {
  //   window.Sentry.captureException(errorContext.error || new Error(errorContext.message), {
  //     level: errorContext.severity.toLowerCase(),
  //     tags: {
  //       appName: errorContext.appName,
  //       errorType: errorContext.errorType
  //     },
  //     extra: errorContext.metadata,
  //     user: errorContext.userId ? { id: errorContext.userId } : undefined
  //   })
  // }
  //
  // DataDog:
  // if (window.DD_LOGS) {
  //   window.DD_LOGS.logger.error(errorContext.message, logData)
  // }
  //
  // Custom Backend:
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(logData)
  // }).catch(err => console.error('Failed to report error:', err))

  return logData
}

/**
 * Report micro-app load failure
 *
 * @param {string} appName - Micro-app name
 * @param {Error|string} error - Error object or message
 * @param {Object} [metadata] - Additional metadata
 */
export function reportMicroAppLoadError(appName, error, metadata = {}) {
  return reportError({
    appName,
    errorType: ErrorType.MICRO_APP_LOAD,
    severity: ErrorSeverity.CRITICAL,
    message: `Failed to load micro-app: ${appName}`,
    error: typeof error === 'string' ? new Error(error) : error,
    metadata: {
      ...metadata,
      loadTimestamp: Date.now()
    }
  })
}

/**
 * Report micro-app runtime error
 *
 * @param {string} appName - Micro-app name
 * @param {Error|string} error - Error object or message
 * @param {Object} [metadata] - Additional metadata
 */
export function reportMicroAppRuntimeError(appName, error, metadata = {}) {
  return reportError({
    appName,
    errorType: ErrorType.MICRO_APP_RUNTIME,
    severity: ErrorSeverity.ERROR,
    message: `Runtime error in micro-app: ${appName}`,
    error: typeof error === 'string' ? new Error(error) : error,
    metadata
  })
}

/**
 * Report configuration error
 *
 * @param {string} message - Error message
 * @param {Object} [metadata] - Additional metadata (e.g., invalid config)
 */
export function reportConfigError(message, metadata = {}) {
  return reportError({
    errorType: ErrorType.CONFIG_ERROR,
    severity: ErrorSeverity.CRITICAL,
    message: `Configuration error: ${message}`,
    metadata
  })
}

/**
 * Report route navigation error
 *
 * @param {string} path - Target path that failed
 * @param {Error|string} error - Error object or message
 * @param {string} [appName] - Micro-app name (if applicable)
 */
export function reportRouteError(path, error, appName) {
  return reportError({
    appName,
    errorType: ErrorType.ROUTE_ERROR,
    severity: ErrorSeverity.WARNING,
    message: `Route navigation failed: ${path}`,
    error: typeof error === 'string' ? new Error(error) : error,
    metadata: { targetPath: path }
  })
}

/**
 * Report network error
 *
 * @param {string} url - Request URL
 * @param {Error|string} error - Error object or message
 * @param {Object} [metadata] - Additional metadata (e.g., status code, method)
 */
export function reportNetworkError(url, error, metadata = {}) {
  return reportError({
    errorType: ErrorType.NETWORK_ERROR,
    severity: ErrorSeverity.ERROR,
    message: `Network request failed: ${url}`,
    error: typeof error === 'string' ? new Error(error) : error,
    metadata: {
      ...metadata,
      requestUrl: url
    }
  })
}

/**
 * Global error handler for uncaught errors
 * Call this in main.js to set up global error capturing
 */
export function setupGlobalErrorHandler() {
  // Capture uncaught errors
  window.addEventListener('error', (event) => {
    reportError({
      errorType: ErrorType.GENERIC,
      severity: ErrorSeverity.ERROR,
      message: event.message || 'Uncaught error',
      error: event.error,
      stack: event.error?.stack,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    })
  })

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError({
      errorType: ErrorType.GENERIC,
      severity: ErrorSeverity.ERROR,
      message: 'Unhandled promise rejection',
      error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      metadata: {
        reason: event.reason
      }
    })
  })

  console.log('[ERROR REPORTER] Global error handlers registered')
}

export default {
  ErrorType,
  ErrorSeverity,
  ErrorContext,
  reportError,
  reportMicroAppLoadError,
  reportMicroAppRuntimeError,
  reportConfigError,
  reportRouteError,
  reportNetworkError,
  setupGlobalErrorHandler
}
