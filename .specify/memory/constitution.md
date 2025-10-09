<!--
Sync Impact Report:
- Version change: none → 1.0.0
- Initial constitution creation
- Principles defined:
  I. Micro-Frontend Isolation
  II. Wujie-First Architecture
  III. Standard Vue 3 Simplicity
  IV. Shared Component Library
  V. Mock-Driven Development
  VI. Component Single Responsibility
- Templates requiring updates:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - Requirements align with architecture principles
  ✅ tasks-template.md - Task categorization supports principle-driven work
- Follow-up TODOs: None
-->

# K8s Agent Web Constitution

## Core Principles

### I. Micro-Frontend Isolation

Each micro-app MUST be independently runnable and deployable. Micro-apps are standard Vue 3
applications with NO special micro-frontend lifecycle code. Each app maintains its own:

- Independent development server (ports 3001-3006)
- Standard Vue Router with `createWebHistory('/')`
- CORS enabled in `vite.config.js` with `Access-Control-Allow-Origin: *`
- No dependencies on qiankun or vite-plugin-qiankun (legacy removed 2025-10-08)

**Rationale**: Independence ensures each app can be developed, tested, and debugged in isolation,
reducing coupling and enabling parallel team workflows.

### II. Wujie-First Architecture

The main app (port 3000) uses **Wujie** (`wujie-vue3`) as the micro-frontend orchestrator.
Wujie provides native Vite/ESM support with 6x faster load times than qiankun.

**MUST requirements**:

- All micro-apps registered in `main-app/src/micro/wujie-config.js`
- Routes use `MicroAppContainer.vue` component (NOT empty div placeholders)
- Configuration includes: `exec: true`, `alive: true`, `sync: true` for keep-alive mode
- Shadow DOM isolation for styles
- Props passing: `userInfo`, `token`, `permissions`

**Rationale**: Wujie eliminates bootstrap timeouts, reduces bundle sizes by 70%, and simplifies
architecture by removing complex lifecycle hooks.

### III. Standard Vue 3 Simplicity (NON-NEGOTIABLE)

Micro-apps MUST remain standard Vue 3 applications. NO custom lifecycle hooks, NO special
exports, NO UMD builds. Use standard Vite build process.

**Forbidden patterns**:

- Custom `render()` functions for micro-frontend integration
- `qiankun` lifecycle exports (`bootstrap`, `mount`, `unmount`)
- `vite-plugin-qiankun` or similar plugins
- Empty div placeholders in dynamic route registration

**Rationale**: Simplicity prevents architectural complexity that led to qiankun bootstrap
failures. Standard Vue 3 code is maintainable, debuggable, and follows framework best practices.

### IV. Shared Component Library

Reusable components MUST be placed in `@k8s-agent/shared` workspace package. Direct copying
between apps is prohibited.

**Required exports from shared library**:

- Components: `VbenLayout`, `VxeBasicTable`, and other UI components
- Composables: `usePagination`, `useTable`, `useSearch`
- Utils: `request` (Axios wrapper), `auth`, date/format utilities

**Import pattern enforcement**:

```javascript
import { VbenLayout } from '@k8s-agent/shared/components'
import { usePagination } from '@k8s-agent/shared/composables'
```

**Rationale**: Centralized shared code prevents duplication, ensures consistency across apps,
and provides single source of truth for common functionality via HMR in development.

### V. Mock-Driven Development

Authentication and backend integration MUST support mock mode via `.env` configuration:
`VITE_USE_MOCK=true`.

**Main app mock requirements**:

- Test accounts: `admin/admin123` (full access), `user/user123` (limited), `guest/guest123` (none)
- Mock functions: `login()`, `getUserMenus()`, `getUserInfo()`
- Configurable delay via `VITE_MOCK_DELAY`

**Micro-apps**: MAY implement app-specific mocks (MSW or custom)

**Rationale**: Mock mode enables frontend development without backend dependencies, supports
automated testing, and provides predictable test scenarios.

### VI. Component Single Responsibility

Each module or function MUST have single, well-defined responsibility. Mixing responsibilities
in one component is prohibited.

**Application**:

- Modifying code: Add new logic independently, preserving original functionality
- Functions: Clear single purpose with descriptive names
- Components: One primary concern per component

**Rationale**: Single responsibility enables easier testing, maintenance, and prevents
unintended side effects during modifications. Aligns with clean architecture principles.

## Architecture Standards

### Dynamic Route System

The application uses **dual routing**:

1. **Static Routes** (`main-app/src/router/index.js`): Base routes with wildcard catch-all
   patterns (`:pathMatch(.*)*`) for micro-apps
2. **Dynamic Routes** (`main-app/src/router/dynamic.js`): Generated from backend menu API after
   login via `router.addRoute()`

**CRITICAL REQUIREMENT**: Dynamic routes MUST use the real `MicroAppContainer` component:

```javascript
import MicroAppContainer from '@/views/MicroAppContainer.vue'
const MicroAppPlaceholder = MicroAppContainer  // CORRECT
```

**Never use**:

```javascript
const MicroAppPlaceholder = { render: () => h('div') }  // WRONG - causes blank pages
```

**Enforcement**: All route registrations must be validated to use actual component, not empty
placeholders (bug fixed 2025-10-08).

### Communication Patterns

**Route Synchronization**: Main app uses Wujie event bus pattern `${appName}-route-change`
to notify micro-apps. Micro-apps listen via `window.$wujie.bus.$on()` in `main.js`.

**State Passing**: Main app passes props to micro-apps via `MicroAppContainer`. Micro-apps
receive via `window.$wujie.props`.

**Lifecycle Events**: `@activated` and `@deactivated` for keep-alive mode visibility changes.

### Proxy Handling

Development environment MUST disable HTTP proxy for localhost requests to prevent 404/502 errors.

**Solutions enforced**:

- `dev.sh` script: Automatically unsets `http_proxy` and `https_proxy`
- `Makefile` targets: Use `dev.sh` internally
- Documentation: Instruct browser `no_proxy` configuration for localhost

**Rationale**: System proxies intercept localhost traffic causing micro-app load failures.

## Development Workflow

### Environment Setup

**Required tools**: pnpm (workspace manager), Node.js, make

**Start commands** (priority order):

1. `make dev` - Recommended (uses `dev.sh`, handles proxy)
2. `./dev.sh` - Direct script (handles proxy)
3. `pnpm dev` - Direct pnpm (no proxy handling)

**Port allocation**:

- 3000: main-app (host)
- 3001-3006: micro-apps (dashboard, agent, cluster, monitor, system, image-build)

### Adding New Micro-App

**Required steps** (all MUST be completed):

1. Create app directory as standard Vue 3 + Vite project
2. Configure CORS in `vite.config.js`
3. Register in `main-app/src/micro/wujie-config.js`
4. Add route in `main-app/src/router/index.js` with `MicroAppContainer`
5. Add scripts to root `package.json`
6. Update `Makefile` port list

**Validation**: App must be independently runnable and accessible through main app.

### Code Quality Gates

**Markdown documentation**:

- MUST follow MarkdownLint (MD) rules
- MUST use language-tagged code blocks (e.g., ` ```bash`, ` ```javascript`)
- MUST maintain clear structure: headings (`#` to `######`), lists (`-` or `*`)
- Prohibited: HTML tags, non-Markdown tables, missing code language tags

**Code standards**:

- Clear function/method comments explaining purpose
- Follow language best practices (Vue 3 Composition API, ES6+)
- No linting errors: `make lint` or `pnpm lint`

## Governance

This constitution supersedes all previous architectural decisions predating Wujie migration
(2025-10-08). All new code and architectural changes MUST comply with these principles.

**Amendment procedure**:

1. Propose change with justification and backward compatibility analysis
2. Document migration plan if breaking changes involved
3. Update affected templates and documentation
4. Increment version following semantic versioning

**Versioning policy**:

- MAJOR: Backward incompatible governance/principle removals or redefinitions
- MINOR: New principle/section added or materially expanded guidance
- PATCH: Clarifications, wording, typo fixes, non-semantic refinements

**Compliance verification**:

- All PRs MUST verify Constitution Check section in `plan-template.md`
- Dynamic route changes MUST verify `MicroAppContainer` usage
- New micro-apps MUST pass all setup validation steps
- Complexity introductions MUST be justified in Complexity Tracking table

**Runtime development guidance**: See `CLAUDE.md` for detailed development workflows,
troubleshooting, and common tasks.

**Version**: 1.0.0 | **Ratified**: 2025-10-09 | **Last Amended**: 2025-10-09
