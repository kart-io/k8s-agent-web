# Implementation Plan: 微前端架构优化

**Branch**: `002-` | **Date**: 2025-10-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-/spec.md`

## Summary

This feature implements critical architectural improvements to the K8s Agent Web micro-frontend system, focusing on eliminating configuration redundancy, stabilizing route synchronization, and enhancing cross-app communication. The optimization consolidates scattered configuration into a centralized management system, replaces unstable setTimeout-based route syncing with a standardized event protocol, introduces shared state management for cross-app data consistency, implements error boundaries for graceful degradation, and optimizes the shared component library build process. These changes address the root causes of blank page issues, configuration inconsistencies, and maintenance difficulties identified in the current Wujie-based architecture.

## Technical Context

**Language/Version**: JavaScript (ES6+), Vue 3.3+ with Composition API
**Primary Dependencies**:
- wujie-vue3 (micro-frontend orchestration)
- Vue Router 4 (routing)
- Pinia (state management)
- Vite 4/5 (build tool)
- Ant Design Vue 4 (UI framework)
- VXE Table 4.6+ (table components)

**Storage**: localStorage for configuration caching and state persistence (client-side only)
**Testing**: Vitest for unit tests, Playwright for E2E micro-app integration tests
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web application - micro-frontend architecture with 1 main app + 6 micro-apps
**Performance Goals**:
- Route navigation < 500ms
- Cross-app state sync < 1s
- Configuration load < 100ms
- Build time reduction of 30%+

**Constraints**:
- Must maintain backward compatibility with existing 6 micro-apps
- Cannot introduce breaking changes to Wujie event bus protocol
- Must preserve current authentication and permission system
- Zero downtime deployment required (feature flags for gradual rollout)

**Scale/Scope**:
- 6 active micro-apps (dashboard, agent, cluster, monitor, system, image-build)
- ~15,000 LOC in main app, ~8,000 LOC average per micro-app
- Shared library ~3,000 LOC
- Development team: 3-5 frontend engineers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Compliance Analysis

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Micro-Frontend Isolation** | ✅ COMPLIANT | Feature preserves independent micro-app runnability; configuration changes do not introduce cross-dependencies |
| **II. Wujie-First Architecture** | ✅ COMPLIANT | Enhances existing Wujie architecture; route sync improvements use Wujie event bus; no framework changes |
| **III. Standard Vue 3 Simplicity** | ✅ COMPLIANT | No custom lifecycle hooks introduced; route sync class is standard Vue composable; maintains NO special exports |
| **IV. Shared Component Library** | ✅ COMPLIANT | Shared library optimization aligns with centralization principle; build improvements enhance reusability |
| **V. Mock-Driven Development** | ✅ COMPLIANT | Feature does not alter mock infrastructure; configuration system supports mock mode via env variables |
| **VI. Component Single Responsibility** | ✅ COMPLIANT | Each new module has single focus: ConfigManager (config), RouteSync (routes), SharedStateManager (state), ErrorBoundary (errors) |

### 🎯 Architecture Standards Compliance

**Dynamic Route System**:
- ✅ Maintains dual routing (static + dynamic)
- ✅ Route sync improvements preserve `MicroAppContainer` usage requirement
- ✅ No changes to dynamic route registration mechanism

**Communication Patterns**:
- ✅ Route synchronization uses existing Wujie event bus pattern (enhanced, not replaced)
- ✅ State passing continues via props (`window.$wujie.props`)
- ✅ Lifecycle events (`@activated`, `@deactivated`) unchanged

**Proxy Handling**:
- ✅ Feature does not affect proxy configuration
- ✅ Configuration system respects environment-based URL selection (supports proxy bypass)

### 📋 Development Workflow Compliance

**Adding New Micro-App**:
- ✅ IMPROVED: Centralized configuration reduces steps from 6 to 4 (steps 3-4 automated by config file)
- ✅ Validation: New apps auto-registered when added to config file

**Code Quality Gates**:
- ✅ All new documentation follows MarkdownLint rules
- ✅ Code blocks include language tags
- ✅ Clear function comments required for new utilities

### ⚠️ Special Considerations

**Non-Breaking Changes Assurance**:
- Configuration system provides backward-compatible fallback to hardcoded URLs if config load fails
- Route sync class wraps existing event bus calls; old micro-apps continue to work without updates
- Shared state manager is opt-in; micro-apps not using it are unaffected
- Error boundary is additive; existing error handling preserved

**Gradual Rollout Strategy**:
- Phase 1: Configuration system (feature flag: `ENABLE_UNIFIED_CONFIG`)
- Phase 2: Route sync improvements (feature flag: `ENABLE_STANDARD_ROUTE_SYNC`)
- Phase 3: Shared state manager (opt-in via import)
- Phase 4: Error boundaries (opt-in per micro-app)
- Phase 5: Shared library build optimization (version bump)

## Project Structure

### Documentation (this feature)

```
specs/002-/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0: Architecture patterns and best practices
├── data-model.md        # Phase 1: Configuration and event data models
├── quickstart.md        # Phase 1: Developer onboarding for new architecture
├── contracts/           # Phase 1: Event bus protocol specifications
│   ├── config-schema.json        # Configuration file JSON schema
│   ├── route-events.md           # Route sync event protocol
│   └── state-events.md           # Shared state event protocol
└── tasks.md             # Phase 2: Implementation tasks (/speckit.tasks - NOT created yet)
```

### Source Code (repository root)

```
k8s-agent-web/
├── main-app/
│   ├── src/
│   │   ├── config/
│   │   │   └── micro-apps.config.js       # NEW: Centralized micro-app configuration
│   │   ├── micro/
│   │   │   ├── wujie-config.js            # UPDATED: Use centralized config
│   │   │   └── route-sync.js              # NEW: Standardized route synchronization class
│   │   ├── store/
│   │   │   └── shared-state.js            # NEW: Cross-app state manager
│   │   ├── views/
│   │   │   ├── MicroAppContainer.vue      # UPDATED: Add error boundary
│   │   │   └── ErrorBoundary.vue          # NEW: Error boundary component
│   │   └── utils/
│   │       └── error-reporter.js          # NEW: Error monitoring integration
│   └── vite.config.js                     # UPDATED: Build optimizations
│
├── shared/
│   ├── src/
│   │   ├── core/
│   │   │   └── event-bus.js               # NEW: Shared event bus utilities
│   │   └── utils/
│   │       └── config-loader.js           # NEW: Configuration loader utility
│   ├── vite.config.js                     # NEW: Build configuration for library
│   └── package.json                       # UPDATED: Add build scripts and exports
│
├── [micro-apps]/                          # dashboard-app, agent-app, etc.
│   └── src/
│       └── main.js                        # UPDATED: Use new route sync class
│
└── config/
    └── micro-apps.schema.json             # NEW: Validation schema for configuration
```

**Structure Decision**: Web application with micro-frontend architecture. Main app serves as orchestrator (port 3000), six micro-apps run independently (ports 3001-3006), and shared library provides common utilities. New files focus on `main-app/src/config/` for centralized configuration, `main-app/src/micro/` for routing improvements, `main-app/src/store/` for shared state, and `shared/src/core/` for reusable event utilities. Build optimization touches `shared/vite.config.js` and `shared/package.json`.

## Complexity Tracking

*No Constitution violations requiring justification.*

All changes align with existing architectural principles and enhance compliance:

- **Configuration centralization** reduces complexity (eliminates duplication)
- **Route sync standardization** removes hack code (setTimeout, flags)
- **Shared state manager** follows existing Pinia patterns
- **Error boundaries** use standard Vue error handling APIs
- **Build optimization** simplifies dependency management

No new abstractions violate the "Standard Vue 3 Simplicity" principle. All utilities are standard JavaScript/Vue patterns without custom framework extensions.
