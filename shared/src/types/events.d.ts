/**
 * Event Protocol Type Definitions
 *
 * These types define the standardized event protocol for cross-app communication
 * in the K8s Agent Web micro-frontend architecture using Wujie event bus.
 */

/**
 * Route synchronization event payload
 * Sent from main app to micro-apps to notify of route changes
 */
export interface RouteChangeEvent {
  /** Target path within the micro-app (e.g., /users, /roles) */
  path: string
  /** Optional query parameters */
  query?: Record<string, string | string[]>
  /** Optional route parameters */
  params?: Record<string, string>
  /** Timestamp of the route change */
  timestamp: number
}

/**
 * Route error event payload
 * Sent from micro-apps back to main app when navigation fails
 */
export interface RouteErrorEvent {
  /** Micro-app name that encountered the error */
  appName: string
  /** Target path that failed */
  path: string
  /** Error message */
  error: string
  /** Error stack trace (optional) */
  stack?: string
  /** Timestamp of the error */
  timestamp: number
}

/**
 * Shared state update event payload
 * Bidirectional event for state synchronization across apps
 */
export interface StateUpdateEvent {
  /** Namespace for the state (e.g., 'user', 'notification', 'system') */
  namespace: string
  /** State key within the namespace */
  key: string
  /** New value (can be any serializable data) */
  value: any
  /** Source app that triggered the update (optional) */
  source?: string
  /** Timestamp of the update */
  timestamp: number
}

/**
 * State subscription event payload
 * Sent when a micro-app wants to subscribe to state changes
 */
export interface StateSubscribeEvent {
  /** Namespace to subscribe to */
  namespace: string
  /** Specific key to subscribe to (optional, subscribes to all keys if omitted) */
  key?: string
  /** App name requesting subscription */
  appName: string
}

/**
 * State unsubscribe event payload
 * Sent when a micro-app wants to unsubscribe from state changes
 */
export interface StateUnsubscribeEvent {
  /** Namespace to unsubscribe from */
  namespace: string
  /** Specific key to unsubscribe from (optional) */
  key?: string
  /** App name requesting unsubscription */
  appName: string
}

/**
 * Lifecycle event payload
 * Sent when micro-app lifecycle state changes
 */
export interface LifecycleEvent {
  /** Micro-app name */
  appName: string
  /** Lifecycle state (e.g., 'loading', 'mounted', 'activated', 'deactivated', 'unmounted') */
  state: 'loading' | 'mounted' | 'activated' | 'deactivated' | 'unmounted' | 'error'
  /** Optional error information if state is 'error' */
  error?: {
    message: string
    stack?: string
  }
  /** Timestamp of the lifecycle change */
  timestamp: number
}

/**
 * Standard event names used in the event bus
 * Format: {appName}-{event-type} or {event-type} for global events
 */
export type EventName =
  // Route synchronization events
  | `${string}-route-change`    // e.g., 'system-app-route-change'
  | 'route:error'                // Global route error event
  // Shared state events
  | 'state:update'               // Global state update event
  | 'state:subscribe'            // State subscription request
  | 'state:unsubscribe'          // State unsubscription request
  // Lifecycle events
  | `${string}-lifecycle`        // e.g., 'dashboard-app-lifecycle'
  // Generic event type
  | string

/**
 * Event bus callback function type
 */
export type EventCallback<T = any> = (payload: T) => void

/**
 * Event bus interface
 * Abstraction over Wujie event bus for type safety
 */
export interface EventBus {
  /** Emit an event with payload */
  $emit(event: EventName, payload?: any): void
  /** Listen to an event */
  $on(event: EventName, callback: EventCallback): void
  /** Listen to an event once */
  $once(event: EventName, callback: EventCallback): void
  /** Remove event listener */
  $off(event: EventName, callback?: EventCallback): void
  /** Remove all listeners */
  $clear(): void
}

/**
 * Event metadata for debugging and monitoring
 */
export interface EventMetadata {
  /** Event name */
  event: EventName
  /** Event payload */
  payload: any
  /** Source app (if applicable) */
  source?: string
  /** Target app (if applicable) */
  target?: string
  /** Timestamp */
  timestamp: number
  /** Event ID (for tracing) */
  id: string
}

/**
 * Event logger interface
 * For debugging and monitoring event flow
 */
export interface EventLogger {
  /** Log an emitted event */
  logEmit(metadata: EventMetadata): void
  /** Log a received event */
  logReceive(metadata: EventMetadata): void
  /** Get event history */
  getHistory(): EventMetadata[]
  /** Clear event history */
  clearHistory(): void
}
