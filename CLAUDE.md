# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

K8s Agent Web - A micro-frontend application built with **Wujie** for Kubernetes agent management.

**Architecture**: 1 main app (host) + 6 micro-apps (dashboard, agent, cluster, monitor, system, image-build) + 1 shared component library

**Tech Stack**: Vue 3 + **Wujie** (micro-frontend) + Vite 4/5 + Ant Design Vue 4 + Pinia + Vue Router 4

**Important**: This project was migrated from qiankun to Wujie on 2025-10-08. See `WUJIE_MIGRATION_COMPLETE.md` for details.

## Development Commands

### Quick Start

```bash
# Install dependencies
pnpm run install:all

# Start development (recommended - handles proxy issues automatically)
make dev              # Uses dev.sh (foreground, auto-disables HTTP proxy)

# Alternative: Start in background
make dev-bg           # Background mode with logs in logs/all-apps.log

# Check status
make status           # Show running apps and ports

# Stop services
make stop             # Graceful stop (via PID file)
make kill             # Force kill all ports 3000-3006

# Restart
make restart          # Kill + restart (foreground)
make restart-bg       # Kill + restart (background)

# View logs (background mode only)
make logs             # Tail logs/all-apps.log
```

### Individual App Development

```bash
# Start single app
make dev-main         # Port 3000
make dev-dashboard    # Port 3001
make dev-agent        # Port 3002
make dev-cluster      # Port 3003
make dev-monitor      # Port 3004
make dev-system       # Port 3005
make dev-image-build  # Port 3006

# Or use pnpm directly
pnpm dev:main
pnpm dev:dashboard
# etc.
```

### Build and Quality

```bash
# Build for production
make build            # Build all apps
pnpm build           # Alternative
pnpm build:main      # Build specific app

# Code quality
make lint            # Lint all apps
pnpm lint:main       # Lint specific app

# Cleanup
make clean           # Remove all build artifacts + dependencies
make clean-build     # Remove build artifacts only (keep node_modules)
```

### Testing

**Note**: Currently no test framework is configured. To add testing:

```bash
# Example setup (not yet implemented)
# cd main-app
# pnpm add -D vitest @vue/test-utils
# Add vitest.config.js
# Add test scripts to package.json
```

## Project Structure

```
k8s-agent-web/
├── main-app/                      # Main application (port 3000)
│   ├── src/
│   │   ├── micro/
│   │   │   └── wujie-config.js    # Wujie micro-app registration
│   │   ├── views/
│   │   │   └── MicroAppContainer.vue  # Micro-app container
│   │   ├── router/
│   │   │   ├── index.js           # Static routes
│   │   │   └── dynamic.js         # Dynamic routes from menu API
│   │   ├── store/
│   │   │   └── user.js            # Auth + dynamic menus (Pinia)
│   │   ├── mock/
│   │   │   └── index.js           # Mock auth/menu data
│   │   └── main.js                # App entry, registers Wujie
│   └── package.json               # Dependencies: wujie-vue3
├── dashboard-app/                 # Dashboard (port 3001)
├── agent-app/                     # Agent management (port 3002)
├── cluster-app/                   # Cluster management (port 3003)
├── monitor-app/                   # Monitoring (port 3004)
├── system-app/                    # System management (port 3005)
├── image-build-app/               # Image build (port 3006)
├── shared/                        # Shared library (@k8s-agent/shared)
│   ├── src/
│   │   ├── components/            # Reusable Vue components
│   │   ├── composables/           # Vue composables/hooks
│   │   ├── utils/                 # Utility functions
│   │   └── config/                # Shared configurations
│   └── package.json
├── package.json                   # Root workspace config
├── pnpm-workspace.yaml            # Workspace definition
├── Makefile                       # Development automation
└── dev.sh                         # Startup script (handles proxy)
```

## Architecture Deep Dive

### Wujie Micro-Frontend System

**Main App** (port 3000):

- Uses `wujie-vue3` for micro-frontend management
- Configuration: `main-app/src/micro/wujie-config.js`
- Container: `main-app/src/views/MicroAppContainer.vue`
- Routes: `main-app/src/router/index.js` maps paths to micro-apps via `meta.microApp`
- Automatically handles:
  - Micro-app lifecycle (load, mount, unmount)
  - Route synchronization (`sync: true`)
  - Keep-alive mode (`alive: true`)
  - Style isolation (Shadow DOM)
  - Props passing (userInfo, token, permissions)

**Micro-App Configuration** (`wujie-config.js`):

```javascript
export const wujieConfig = {
  apps: [
    {
      name: 'dashboard-app',
      url: '//localhost:3001',
      exec: true,      // Execute scripts
      alive: true,     // Keep alive
      sync: true       // Route sync
    },
    // ... other apps
  ]
}
```

**Micro-Apps** (ports 3001-3006):

- **Standard Vue 3 applications** - no special micro-frontend code needed!
- No lifecycle hooks required (unlike qiankun)
- No special Vite plugins required (unlike vite-plugin-qiankun)
- Each app is independently runnable
- Use standard `createWebHistory('/')` for routing
- **Must enable CORS** in `vite.config.js`:

```javascript
server: {
  port: 300X,
  cors: true,
  headers: { 'Access-Control-Allow-Origin': '*' }
}
```

### Dynamic Route System (Critical)

The application uses a **dual routing system**:

**1. Static Routes** (`main-app/src/router/index.js`):

- Base routes: Login, MainLayout
- Catch-all micro-app routes with `:pathMatch(.*)* ` wildcards
- Always registered at app initialization

**2. Dynamic Routes** (`main-app/src/router/dynamic.js`):

- Generated from backend menu API after login
- Registered as children of MainLayout using `router.addRoute()`
- **Must use `MicroAppContainer` component** (not placeholder!)

**Critical Bug Fixed (2025-10-08)**:

`dynamic.js` was using an empty div placeholder instead of the real `MicroAppContainer`, causing blank pages on direct navigation to child routes like `/system/users`.

```javascript
// ❌ WRONG - causes blank pages
const MicroAppPlaceholder = { render: () => h('div') }

// ✅ CORRECT - uses real component
import MicroAppContainer from '@/views/MicroAppContainer.vue'
const MicroAppPlaceholder = MicroAppContainer
```

**Flow**:

1. User logs in
2. `userStore.fetchMenus()` fetches menu from backend
3. `registerRoutes()` in `dynamic.js` converts menus to routes
4. Routes registered dynamically with `MicroAppPlaceholder` component
5. Component must be real `MicroAppContainer` to load Wujie micro-apps

**Menu Structure**:

- Micro-app pages: `component: 'MicroAppPlaceholder'`
- Parent routes with children: `component: 'SubMenu'` (layout only)

See `main-app/DYNAMIC_ROUTES.md` for detailed documentation.

### Authentication & State Management

**File**: `main-app/src/store/user.js` (Pinia store)

Manages:

- User authentication (token, userInfo, permissions)
- Dynamic menu fetching from backend
- Dynamic route registration based on permissions
- localStorage persistence

**Router Guard**:

- `main-app/src/router/index.js` checks authentication before each route
- Redirects to `/login` if not authenticated
- Skips guard for public routes (login page)

**Dynamic Menu System**:

- Backend API: `GET /api/system/menus`
- Returns user-specific menu structure with permissions
- `router/dynamic.js` converts menu items to Vue Router routes
- Supports nested submenus and permission-based access control

### Mock Data System

**Main App Mock** (`main-app/src/mock/index.js`):

- Simple mock implementation (no MSW dependency)
- Controlled by `.env`: `VITE_USE_MOCK=true`
- Mock functions: `login()`, `getUserMenus()`, `getUserInfo()`
- Test accounts:
  - `admin/admin123` - Full access (all menus)
  - `user/user123` - Limited access (dashboard + agents)
  - `guest/guest123` - No menu access
- Simulates API delays (configurable via `VITE_MOCK_DELAY`)

**Micro-Apps**:

- Can implement their own mock systems as needed
- Examples use MSW (Mock Service Worker) for API mocking
- Check individual app's `src/mock/` or `src/mocks/` directories

### Shared Component Library

**Package**: `@k8s-agent/shared`

**Location**: `shared/` (pnpm workspace package)

**Key Components**:

1. **VbenLayout** - Complete layout system:
   - Sidebar with collapsible menu
   - Header with user info
   - Multi-tab navigation
   - Breadcrumb support

2. **VxeBasicTable** - Enhanced table wrapper (based on VXE Table):
   - Built-in pagination
   - Loading states
   - Error handling
   - Automatic data loading via `api` prop
   - `immediate` prop controls initial load (default: true)
   - Exposed methods: `reload()`, `query()`, `refresh()`
   - Use `@register` event to get table API reference
   - Supports custom column slots for rendering

**Usage Example**:

```vue
<template>
  <VxeBasicTable
    :api="loadDataApi"
    :grid-options="gridOptions"
    @register="handleRegister"
  >
    <template #action="{ row }">
      <a-button @click="edit(row)">Edit</a-button>
      <a-button danger @click="remove(row)">Delete</a-button>
    </template>
  </VxeBasicTable>
</template>

<script setup>
import { VxeBasicTable } from '@k8s-agent/shared/components'

const gridOptions = {
  columns: [
    { field: 'name', title: 'Name' },
    { field: 'status', title: 'Status' },
    { field: 'action', title: 'Action', slots: { default: 'action' } }
  ]
}

const loadDataApi = async (params) => {
  // params: { page, pageSize, ...filters }
  const response = await fetch('/api/data', {
    method: 'POST',
    body: JSON.stringify(params)
  })
  return response.json()
}

let tableApi = null
const handleRegister = (api) => {
  tableApi = api
}

const refresh = () => {
  tableApi?.reload()
}
</script>
```

**Other Shared Resources**:

- **Composables**: `usePagination`, `useTable`, `useSearch`
- **Utils**: `request` (Axios wrapper), `auth`, date/format utilities
- **Config**: API base URLs, constants

**Import Pattern**:

```javascript
// Components
import { VbenLayout, VxeBasicTable } from '@k8s-agent/shared/components'

// Composables
import { usePagination } from '@k8s-agent/shared/composables'

// Utils
import { request } from '@k8s-agent/shared/utils'
```

### Wujie Communication

**Route Synchronization**:

Main app uses Wujie event bus to notify micro-apps of route changes:

```javascript
// Main app (MicroAppContainer.vue)
WujieVue.bus.$emit(`${appName}-route-change`, subPath)

// Micro-app (main.js)
if (window.$wujie?.bus) {
  window.$wujie.bus.$on('system-app-route-change', (subPath) => {
    router.push(subPath)
  })
}
```

**State Passing**:

Main app passes props to micro-apps via `MicroAppContainer`:

```javascript
// Main app
const appProps = computed(() => ({
  userInfo: userStore.userInfo,
  token: userStore.token,
  permissions: userStore.permissions
}))

// Micro-app access
const userInfo = window.$wujie.props.userInfo
```

**Lifecycle Events**:

- `@activated` - Fired when micro-app becomes visible (keep-alive)
- `@deactivated` - Fired when micro-app is hidden
- Main app syncs route to micro-app on activation

## Common Development Tasks

### Adding a New Micro-App

1. **Create app directory** (e.g., `new-app/`)

2. **Initialize Vue 3 + Vite project**:

```bash
cd new-app
pnpm init
pnpm add vue vue-router pinia
pnpm add -D vite @vitejs/plugin-vue
```

3. **Configure CORS** in `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3007,  // Choose next available port
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
```

4. **Register in Wujie config** (`main-app/src/micro/wujie-config.js`):

```javascript
{
  name: 'new-app',
  url: '//localhost:3007',
  exec: true,
  alive: true,
  sync: true
}
```

5. **Add route** (`main-app/src/router/index.js`):

```javascript
{
  path: '/new-app/:pathMatch(.*)*',
  name: 'NewApp',
  component: () => import('@/views/MicroAppContainer.vue'),
  meta: {
    microApp: 'new-app',
    title: 'New App'
  }
}
```

6. **Update root package.json**:

```json
{
  "scripts": {
    "dev:new-app": "cd new-app && pnpm dev",
    "build:new-app": "cd new-app && pnpm build",
    "lint:new-app": "cd new-app && pnpm lint"
  }
}
```

7. **Update pnpm-workspace.yaml**:

```yaml
packages:
  - 'new-app'
```

8. **Update Makefile** - add port 3007 to relevant targets

### Adding a Page to a Micro-App

Micro-apps are standard Vue 3 apps - just add routes normally:

1. **Create view component** in `src/views/NewPage.vue`
2. **Add route** to `src/router/index.js`:

```javascript
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('@/views/NewPage.vue')
}
```

3. No special micro-frontend configuration needed!

### Modifying Shared Components

1. **Edit components** in `shared/src/components/`
2. **Changes reflect immediately** via HMR in all apps
3. Run `pnpm build` in `shared/` if you need explicit builds

### Working with Mock Data

**Main App**:

1. Edit mock functions in `main-app/src/mock/index.js`
2. Toggle with `VITE_USE_MOCK=true` in `.env.development`

**Micro-Apps** (using MSW):

1. Edit mock data in `{app}/src/mocks/data/`
2. Update handlers in `{app}/src/mocks/handlers.js`
3. MSW automatically intercepts API calls in development

### Debugging Micro-App Loading

**Check Wujie instance**:

```javascript
// In browser console
console.log(window.$wujie)
console.log(window.$wujie.props)  // Props from main app
console.log(window.$wujie.bus)    // Event bus
```

**Monitor route changes**:

```javascript
// In micro-app main.js
if (window.$wujie?.bus) {
  window.$wujie.bus.$on('*', (event, ...args) => {
    console.log('Wujie event:', event, args)
  })
}
```

## Common Issues & Solutions

### Blank Pages on Direct Navigation

**Symptom**: Navigating to `/system/users`, `/system/roles` shows blank page, data appears only after refresh

**Cause**: Dynamic routes using wrong component (empty div instead of `MicroAppContainer`)

**Solution**: Verify `router/dynamic.js` imports real component:

```javascript
import MicroAppContainer from '@/views/MicroAppContainer.vue'
const MicroAppPlaceholder = MicroAppContainer
```

**Status**: Fixed 2025-10-08

### HTTP Proxy Blocking Localhost

**Symptom**: `GET http://localhost:3001/ 404 (Not Found)` or `502 Bad Gateway`

**Cause**: System `http_proxy` environment variable (e.g., `http_proxy=http://127.0.0.1:7890`) intercepts localhost requests

**Solution**:

1. **Use `make dev`** or `./dev.sh` (automatically disables proxy)
2. **Manual fix**: Set `no_proxy` in shell:

```bash
export no_proxy=localhost,127.0.0.1
export NO_PROXY=localhost,127.0.0.1
```

See `BROWSER_PROXY_FIX.md` for details.

### Port Already in Use

**Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:

```bash
make kill          # Kill all processes on ports 3000-3006
make dev           # Restart
```

Or manually:

```bash
lsof -ti:3000 | xargs kill -9
```

### Micro-App Not Loading

**Checklist**:

1. ✅ All services running: `make status`
2. ✅ CORS enabled in micro-app's `vite.config.js`:

```javascript
server: {
  cors: true,
  headers: { 'Access-Control-Allow-Origin': '*' }
}
```

3. ✅ Check browser console for errors
4. ✅ Verify route in `main-app/src/router/index.js`
5. ✅ Verify app registered in `main-app/src/micro/wujie-config.js`
6. ✅ If using dynamic routes: Check `router/dynamic.js` uses real `MicroAppContainer`

### TypeScript or Linting Errors

```bash
# Run linter
make lint

# Or for specific app
cd main-app && pnpm lint

# Fix auto-fixable issues
cd main-app && pnpm lint --fix
```

### Dependencies Out of Sync

**Symptom**: Module not found errors, version mismatches

**Solution**:

```bash
# Clean and reinstall
make clean
pnpm run install:all

# Or reset specific app
cd main-app
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Testing Access

After starting services (`make dev`):

1. **Main App**: <http://localhost:3000>
2. **Individual Micro-Apps** (for development only):
   - Dashboard: <http://localhost:3001>
   - Agent: <http://localhost:3002>
   - Cluster: <http://localhost:3003>
   - Monitor: <http://localhost:3004>
   - System: <http://localhost:3005>
   - Image Build: <http://localhost:3006>

**Note**: Individual micro-app URLs are for development only. In production, access everything through the main app at port 3000.

**Test Credentials**:

- `admin/admin123` - Full access
- `user/user123` - Limited access
- `guest/guest123` - No access

## Code Style and Best Practices

### Module Structure

**Single Responsibility**: Each module/function should have one clear purpose. When adding features:

- Create new modules rather than expanding existing ones
- Keep functions small and focused
- Use composition over inheritance

**Example**:

```javascript
// ❌ Bad: Function doing too many things
function handleUser(user, action) {
  if (action === 'create') {
    // create logic
  } else if (action === 'update') {
    // update logic
  } else if (action === 'delete') {
    // delete logic
  }
}

// ✅ Good: Separate functions
function createUser(user) { /* ... */ }
function updateUser(user) { /* ... */ }
function deleteUser(userId) { /* ... */ }
```

### Documentation

**All documentation must follow Markdown best practices**:

- Use `#` to `######` for headings (hierarchical)
- Use `-` or `*` for lists
- Code blocks must specify language: ` ```javascript `, ` ```bash `, etc.
- Follow MarkdownLint rules (MD001-MD045)
- Structure: Introduction → Installation → Configuration → Usage → FAQ → References

**Code Comments**:

- Document function/method purpose and parameters
- Use JSDoc format for exported functions:

```javascript
/**
 * Fetch user menu items from backend API
 * @param {string} userId - User ID to fetch menus for
 * @returns {Promise<Array>} Array of menu items
 */
export async function getUserMenus(userId) {
  // implementation
}
```

### Vue Component Guidelines

**Component Structure**:

```vue
<template>
  <!-- Template -->
</template>

<script setup>
// 1. Imports
import { ref, computed, onMounted } from 'vue'

// 2. Props & Emits
const props = defineProps({
  data: Array
})

const emit = defineEmits(['update', 'delete'])

// 3. Reactive state
const loading = ref(false)

// 4. Computed properties
const filteredData = computed(() => {
  // ...
})

// 5. Methods
function handleUpdate() {
  // ...
}

// 6. Lifecycle hooks
onMounted(() => {
  // ...
})
</script>

<style scoped>
/* Component-specific styles */
</style>
```

**Naming Conventions**:

- Components: PascalCase (e.g., `UserList.vue`)
- Composables: camelCase with `use` prefix (e.g., `useTable.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Variables/functions: camelCase (e.g., `userData`, `fetchUsers`)

## Migration History

**2025-10-08**: Successfully migrated from qiankun + vite-plugin-qiankun to Wujie

**Reasons for Migration**:

- qiankun + vite-plugin-qiankun had architectural incompatibility with Vite's ESM
- Frequent bootstrap timeout errors (4000ms)
- Complex lifecycle code and configuration
- Large bundle sizes due to UMD builds

**Benefits of Wujie**:

- ✅ Native Vite/ESM support - no special plugins needed
- ✅ 6x faster load times (< 500ms vs ~3000ms)
- ✅ 70% less code - standard Vue 3 apps
- ✅ Better isolation via Shadow DOM
- ✅ No bootstrap timeouts
- ✅ Simpler architecture

See `WUJIE_MIGRATION_COMPLETE.md` for detailed migration documentation.

## Important Files

**Core Configuration**:

- `package.json` - Root workspace configuration
- `pnpm-workspace.yaml` - pnpm workspace definition
- `Makefile` - Development task automation
- `dev.sh` - Development startup script with proxy handling

**Main App**:

- `main-app/src/micro/wujie-config.js` - Wujie configuration
- `main-app/src/views/MicroAppContainer.vue` - Micro-app container
- `main-app/src/router/index.js` - Static routes
- `main-app/src/router/dynamic.js` - Dynamic routes
- `main-app/src/store/user.js` - Auth & menu store
- `main-app/src/mock/index.js` - Mock data

**Documentation**:

- `WUJIE_MIGRATION_COMPLETE.md` - Migration details
- `MIGRATION_TO_WUJIE.md` - Step-by-step migration guide
- `ROOT_CAUSE_ANALYSIS.md` - qiankun issues analysis
- `MAKEFILE_GUIDE.md` - Makefile reference
- `TROUBLESHOOTING.md` - Common issues
- `QUICK_START.md` - Quick start guide
- `COMPONENTS_GUIDE.md` - Component usage
- `DYNAMIC_MENU_GUIDE.md` - Dynamic menu system
- `MOCK_GUIDE.md` - Mock data system

## Additional Resources

The repository contains extensive documentation:

**Setup & Usage**:

- `QUICK_START.md` - Get started in 5 minutes
- `START_GUIDE.md` - Detailed setup guide
- `MAKEFILE_GUIDE.md` - Makefile command reference

**Components & Architecture**:

- `COMPONENTS_GUIDE.md` - Shared components usage
- `COMPOSABLES_AND_UTILS_GUIDE.md` - Composables reference
- `SHARED_COMPONENTS_MIGRATION.md` - Component migration guide
- `DYNAMIC_MENU_GUIDE.md` - Dynamic menu system
- `SUBMENU_GUIDE.md` - Submenu implementation

**Mock Data**:

- `MOCK_GUIDE.md` - Main app mock system
- `SUB_APPS_MOCK_GUIDE.md` - Micro-app mocking
- `SUB_APPS_USAGE_GUIDE.md` - Micro-app development

**Troubleshooting**:

- `TROUBLESHOOTING.md` - Common problems
- `BROWSER_PROXY_FIX.md` - Proxy configuration
- `PROXY_ISSUE_FIX.md` - Proxy issues
- `QUICK_FIX_GUIDE.md` - Quick fixes

**Migration & History**:

- `WUJIE_MIGRATION_COMPLETE.md` - Migration summary
- `MIGRATION_TO_WUJIE.md` - Migration steps
- `ROOT_CAUSE_ANALYSIS.md` - Previous issues
- `SESSION_SUMMARY.md` - Development sessions

Use these documents for detailed information about specific aspects of the project.
