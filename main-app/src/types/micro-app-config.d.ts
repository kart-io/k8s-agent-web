/**
 * Micro-App Configuration Type Definitions
 *
 * These types define the structure of centralized micro-app configuration
 * and provide type safety for configuration access throughout the application.
 */

/**
 * Environment-specific entry URLs for a micro-app
 */
export interface MicroAppEntry {
  /** Development environment URL (e.g., //localhost:3001) */
  development: string
  /** Test environment URL (optional) */
  test?: string
  /** Production environment URL (e.g., /micro-apps/dashboard/) */
  production: string
  /** Additional environment URLs */
  [env: string]: string | undefined
}

/**
 * Metadata information for a micro-app
 */
export interface MicroAppMetadata {
  /** Semantic version (e.g., 1.2.3, 1.0.0-beta.1) */
  version?: string
  /** Team or individual responsible for the app */
  owner?: string
  /** Brief description of the micro-app functionality */
  description?: string
  /** Icon URL or path (optional) */
  icon?: string
}

/**
 * Wujie-specific configuration for a micro-app
 */
export interface MicroAppWujieConfig {
  /** Execute scripts in micro-app (default: true) */
  exec?: boolean
  /** Keep-alive mode to preserve state (default: true) */
  alive?: boolean
  /** Enable route synchronization (default: true) */
  sync?: boolean
  /** Custom props passed to micro-app */
  props?: Record<string, any>
  /** Custom attributes for Wujie configuration */
  attrs?: Record<string, any>
}

/**
 * Complete configuration for a single micro-app
 */
export interface MicroAppConfig {
  /** Unique micro-app identifier (lowercase alphanumeric with hyphens) */
  name: string
  /** Development server port (must be unique across all apps) */
  port: number
  /** URL base path for routing (must start with /) */
  basePath: string
  /** Environment-specific entry URLs */
  entry: MicroAppEntry
  /** Metadata information (optional) */
  metadata?: MicroAppMetadata
  /** Wujie-specific configuration (optional) */
  wujie?: MicroAppWujieConfig
}

/**
 * Complete micro-apps configuration object
 * Key is the app name (e.g., 'dashboard-app', 'agent-app')
 */
export interface MicroAppsConfig {
  [appName: string]: MicroAppConfig
}

/**
 * Environment type for URL resolution
 */
export type Environment = 'development' | 'test' | 'production' | string

/**
 * Helper function type for getting micro-app URL
 */
export type GetMicroAppUrl = (appName: string, env?: Environment) => string

/**
 * Helper function type for getting micro-app configuration
 */
export type GetMicroAppConfig = (appName: string) => MicroAppConfig | null

/**
 * Validation error structure
 */
export interface ConfigValidationError {
  /** Field path that failed validation */
  path: string
  /** Error message */
  message: string
  /** Original value that caused the error */
  value?: any
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  /** Whether the configuration is valid */
  valid: boolean
  /** List of validation errors (empty if valid) */
  errors: ConfigValidationError[]
}
