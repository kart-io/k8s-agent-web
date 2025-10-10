/**
 * Configuration Loader and Validator
 *
 * Loads and validates micro-app configuration against JSON schema.
 * Provides helper functions for accessing configuration safely.
 */

/**
 * Validate a value against a JSON schema property definition
 * This is a simplified validator - for production, consider using ajv or similar
 *
 * @param {any} value - Value to validate
 * @param {Object} schema - JSON schema property definition
 * @param {string} path - Property path for error reporting
 * @returns {Array} Array of validation errors (empty if valid)
 */
function validateProperty(value, schema, path = '') {
  const errors = []

  // Check required type
  if (schema.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value
    const expectedType = schema.type

    if (expectedType === 'integer') {
      if (!Number.isInteger(value)) {
        errors.push({
          path,
          message: `Expected integer, got ${actualType}`,
          value
        })
        return errors
      }
    } else if (actualType !== expectedType) {
      errors.push({
        path,
        message: `Expected ${expectedType}, got ${actualType}`,
        value
      })
      return errors
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern)
      if (!regex.test(value)) {
        errors.push({
          path,
          message: `Value does not match pattern: ${schema.pattern}`,
          value
        })
      }
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({
        path,
        message: `String length ${value.length} is less than minimum ${schema.minLength}`,
        value
      })
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({
        path,
        message: `String length ${value.length} exceeds maximum ${schema.maxLength}`,
        value
      })
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({
        path,
        message: `Value ${value} is less than minimum ${schema.minimum}`,
        value
      })
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({
        path,
        message: `Value ${value} exceeds maximum ${schema.maximum}`,
        value
      })
    }
  }

  // Object validations
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    if (schema.required) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in value)) {
          errors.push({
            path: `${path}.${requiredProp}`,
            message: `Required property missing: ${requiredProp}`,
            value: undefined
          })
        }
      }
    }

    if (schema.properties) {
      for (const [propName, propValue] of Object.entries(value)) {
        const propSchema = schema.properties[propName]
        if (propSchema) {
          const propErrors = validateProperty(
            propValue,
            propSchema,
            path ? `${path}.${propName}` : propName
          )
          errors.push(...propErrors)
        }
      }
    }
  }

  return errors
}

/**
 * Validate micro-app configuration against schema
 *
 * @param {Object} config - Configuration object to validate
 * @param {Object} schema - JSON schema definition
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
export function validateConfig(config, schema) {
  const errors = []

  if (!config || typeof config !== 'object') {
    return {
      valid: false,
      errors: [{
        path: '',
        message: 'Configuration must be an object',
        value: config
      }]
    }
  }

  // Validate using patternProperties (for dynamic app names)
  if (schema.patternProperties) {
    const pattern = Object.keys(schema.patternProperties)[0]
    const appSchema = schema.patternProperties[pattern]
    const regex = new RegExp(pattern)

    // Check minimum properties
    if (schema.minProperties && Object.keys(config).length < schema.minProperties) {
      errors.push({
        path: '',
        message: `Configuration must have at least ${schema.minProperties} app(s)`,
        value: config
      })
    }

    // Validate each app configuration
    for (const [appName, appConfig] of Object.entries(config)) {
      if (!regex.test(appName)) {
        errors.push({
          path: appName,
          message: `App name does not match pattern: ${pattern}`,
          value: appName
        })
        continue
      }

      const appErrors = validateProperty(appConfig, appSchema, appName)
      errors.push(...appErrors)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Load configuration from a config object with validation
 *
 * @param {Object} config - Configuration object
 * @param {Object} schema - JSON schema for validation
 * @param {Object} options - Options
 * @param {boolean} [options.strict=true] - Throw error on validation failure
 * @param {Function} [options.onError] - Error callback function
 * @returns {Object|null} Validated configuration or null if invalid (when strict=false)
 */
export function loadConfig(config, schema, options = {}) {
  const { strict = true, onError } = options

  // Validate configuration
  const validationResult = validateConfig(config, schema)

  if (!validationResult.valid) {
    const errorMessage = `Configuration validation failed:\n${validationResult.errors
      .map(e => `  - ${e.path}: ${e.message}`)
      .join('\n')}`

    // Call error callback if provided
    if (onError) {
      onError(validationResult.errors)
    }

    // Strict mode: throw error
    if (strict) {
      const error = new Error(errorMessage)
      error.validationErrors = validationResult.errors
      throw error
    }

    // Non-strict mode: log warning and return null
    console.warn('[CONFIG LOADER]', errorMessage)
    return null
  }

  // Configuration is valid
  console.log('[CONFIG LOADER] Configuration validated successfully')
  return config
}

/**
 * Get environment-specific URL from micro-app entry configuration
 *
 * @param {Object} entry - Entry configuration object with environment URLs
 * @param {string} [env] - Target environment (defaults to 'development')
 * @returns {string} Environment-specific URL
 *
 * IMPORTANT: In pre-built libraries, import.meta.env reflects the library's build-time environment,
 * NOT the consuming app's runtime environment. Therefore:
 * - Always pass explicit env parameter from the consuming app
 * - Default to 'development' to avoid unexpected production URLs in dev mode
 */
export function getEntryUrl(entry, env) {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid entry configuration')
  }

  // Determine environment
  // Priority: explicit env param > 'development' default
  // NOTE: DO NOT use import.meta.env here - it reflects library build-time, not runtime!
  let targetEnv = env

  if (!targetEnv) {
    // Default to development to avoid serving production URLs in dev mode
    targetEnv = 'development'
    console.warn(
      `[CONFIG LOADER] No explicit env provided, defaulting to 'development'. ` +
      `Pass env parameter explicitly from consuming app to ensure correct environment.`
    )
  }

  console.log(`[CONFIG LOADER] Environment detection: ${targetEnv}`)

  // Get URL for target environment
  const url = entry[targetEnv]

  if (!url) {
    // Fallback order: development -> production
    const fallbackUrl = entry.development || entry.production

    if (!fallbackUrl) {
      throw new Error(`No URL found for environment: ${targetEnv}`)
    }

    console.warn(
      `[CONFIG LOADER] No URL for environment '${targetEnv}', using fallback: ${fallbackUrl}`
    )
    return fallbackUrl
  }

  return url
}

/**
 * Deep merge two configuration objects
 * Used for merging default config with user config
 *
 * @param {Object} target - Target object (defaults)
 * @param {Object} source - Source object (overrides)
 * @returns {Object} Merged configuration
 */
export function mergeConfig(target, source) {
  const result = { ...target }

  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = mergeConfig(result[key] || {}, value)
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Create default Wujie configuration from app config
 *
 * @param {Object} appConfig - Micro-app configuration
 * @param {string} [env] - Target environment
 * @returns {Object} Wujie-compatible configuration
 */
export function createWujieConfig(appConfig, env) {
  if (!appConfig) {
    throw new Error('App configuration is required')
  }

  const { name, entry, wujie = {} } = appConfig

  return {
    name,
    url: getEntryUrl(entry, env),
    exec: wujie.exec !== undefined ? wujie.exec : true,
    alive: wujie.alive !== undefined ? wujie.alive : true,
    sync: wujie.sync !== undefined ? wujie.sync : true,
    props: wujie.props || {},
    attrs: wujie.attrs || {}
  }
}

/**
 * Validate port uniqueness across apps
 *
 * @param {Object} config - Full micro-apps configuration
 * @returns {Array} Array of port conflict errors
 */
export function validatePortUniqueness(config) {
  const portMap = new Map()
  const conflicts = []

  for (const [appName, appConfig] of Object.entries(config)) {
    const port = appConfig.port

    if (portMap.has(port)) {
      conflicts.push({
        port,
        apps: [portMap.get(port), appName],
        message: `Port ${port} is used by multiple apps: ${portMap.get(port)}, ${appName}`
      })
    } else {
      portMap.set(port, appName)
    }
  }

  return conflicts
}

/**
 * Validate basePath uniqueness across apps
 *
 * @param {Object} config - Full micro-apps configuration
 * @returns {Array} Array of basePath conflict errors
 */
export function validateBasePathUniqueness(config) {
  const pathMap = new Map()
  const conflicts = []

  for (const [appName, appConfig] of Object.entries(config)) {
    const basePath = appConfig.basePath

    if (pathMap.has(basePath)) {
      conflicts.push({
        basePath,
        apps: [pathMap.get(basePath), appName],
        message: `BasePath ${basePath} is used by multiple apps: ${pathMap.get(basePath)}, ${appName}`
      })
    } else {
      pathMap.set(basePath, appName)
    }
  }

  return conflicts
}

export default {
  validateConfig,
  loadConfig,
  getEntryUrl,
  mergeConfig,
  createWujieConfig,
  validatePortUniqueness,
  validateBasePathUniqueness
}
