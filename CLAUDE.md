# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

K8s Agent Web - A micro-frontend application built with **Wujie** for Kubernetes agent management.

**Architecture**: 1 main app (host) + 6 micro-apps (dashboard, agent, cluster, monitor, system, image-build) + 1 shared component library

**Tech Stack**: Vue 3 + **Wujie** (micro-frontend) + Vite 4/5 + Ant Design Vue 4 + Pinia + Vue Router 4

**Important**: This project was migrated from qiankun to Wujie on 2025-10-08. See `WUJIE_MIGRATION_COMPLETE.md` for details.

## Development Commands

### Quick Start with Makefile (Recommended)

```bash
# View all available commands
make help

# Start all apps (foreground, recommended for development)
make dev              # Uses dev.sh (auto-disables HTTP proxy)

# Or start in background
make dev-bg           # Background mode with logs

# Manage services
make stop             # Stop all apps gracefully
make kill             # Force kill all processes on ports 3000-3006
make status           # Check which apps are running
make restart          # Kill + restart all apps (foreground)
make restart-bg       # Kill + restart all apps (background)

# View logs (only for background mode)
make logs             # Tail logs/all-apps.log

# Development tasks
make build            # Build all apps for production
make lint             # Lint all apps
make clean            # Clean all build artifacts and dependencies
make clean-build      # Clean build artifacts only (keep node_modules)

# Individual apps
make dev-main         # Start only main app (port 3000)
make dev-dashboard    # Start only dashboard (port 3001)
make dev-agent        # Start only agent app (port 3002)
make dev-cluster      # Start only cluster app (port 3003)
make dev-monitor      # Start only monitor app (port 3004)
make dev-system       # Start only system app (port 3005)
make dev-image-build  # Start only image build app (port 3006)
```

### Using pnpm Directly

```bash
# Install dependencies (uses pnpm workspaces)
pnpm run install:all

# Start all apps concurrently (foreground)
pnpm dev

# Or start individual apps
pnpm dev:main        # Main app - http://localhost:3000
pnpm dev:dashboard   # Dashboard - http://localhost:3001
pnpm dev:agent       # Agent management - http://localhost:3002
pnpm dev:cluster     # Cluster management - http://localhost:3003
pnpm dev:monitor     # Monitoring - http://localhost:3004
pnpm dev:system      # System management - http://localhost:3005
pnpm dev:image-build # Image build - http://localhost:3006

# Build for production
pnpm build           # Build all apps
pnpm build:main      # Build specific app
pnpm build:dashboard
# etc.

# Linting
pnpm lint            # Lint all apps
pnpm lint:main       # Lint specific app
# etc.

# Clean
pnpm clean           # Removes node_modules, dist, and .vite from all apps
```

### Using dev.sh Script (Handles Proxy Issues)

```bash
# Recommended for development - automatically disables HTTP proxy
./dev.sh
```

**Why use dev.sh?** If you have system `http_proxy` environment variables (e.g., `http_proxy=http://127.0.0.1:7890`), they can intercept localhost requests and cause 404/502 errors. The `dev.sh` script automatically unsets these for the current session.

## Project Structure & Architecture

### Micro-Frontend Setup (Wujie)

```
k8s-agent-web/
├── main-app/                 # Main application (port 3000)
│   ├── src/
│   │   ├── micro/
│   │   │   └── wujie-config.js    # Wujie configuration
│   │   ├── views/
│   │   │   └── MicroAppContainer.vue  # Micro-app container component
│   │   ├── router/
│   │   │   └── index.js           # Routes with micro-app mappings
│   │   ├── store/
│   │   │   └── user.js            # User store with auth & dynamic menus
│   │   └── main.js                # App entry, registers Wujie
│   └── package.json               # Dependencies: wujie-vue3
├── dashboard-app/            # Dashboard micro-app (port 3001)
├── agent-app/                # Agent management (port 3002)
├── cluster-app/              # Cluster management (port 3003)
├── monitor-app/              # Monitoring (port 3004)
├── system-app/               # System management (port 3005)
├── image-build-app/          # Image build (port 3006)
├── shared/                   # Shared library (@k8s-agent/shared)
│   ├── components/           # Reusable Vue components
│   ├── composables/          # Vue composables/hooks
│   ├── hooks/                # React-style hooks
│   ├── utils/                # Utility functions
│   └── config/               # Shared configurations
├── package.json              # Root workspace configuration
├── pnpm-workspace.yaml       # pnpm workspace definition
├── Makefile                  # Development commands
└── dev.sh                    # Development startup script
```

### Wujie Architecture

**Main App** (port 3000):
- Uses `wujie-vue3` for micro-frontend management
- Configuration: `main-app/src/micro/wujie-config.js`
- Container component: `main-app/src/views/MicroAppContainer.vue`
- Routes: `main-app/src/router/index.js` maps paths to micro-apps via `meta.microApp`
- Automatically handles:
  - Micro-app lifecycle (load, mount, unmount)
  - Route synchronization (`sync: true`)
  - Keep-alive mode (`alive: true`)
  - Style isolation (via Shadow DOM)
  - Props passing (userInfo, token, permissions)

**Micro-Apps** (ports 3001-3006):
- **Standard Vue 3 applications** - no special micro-frontend code needed!
- No lifecycle hooks required (unlike qiankun)
- No special Vite plugins required (unlike vite-plugin-qiankun)
- Each app is independently runnable for development
- Use standard `createWebHistory('/')` for routing
- Must enable CORS in `vite.config.js`:
  ```javascript
  server: {
    port: 300X,
    cors: true,
    headers: { 'Access-Control-Allow-Origin': '*' }
  }
  ```

**Shared Library** (`@k8s-agent/shared`):
- pnpm workspace package at `shared/`
- Imported via `@k8s-agent/shared` in other apps
- Contains reusable components, composables, utils, and configs
- Key components:
  - `VbenLayout` - Main layout with sidebar, header, tabs
  - `VxeBasicTable` - Enhanced table component based on VXE Table
  - Other shared UI components

### Dynamic Route System (CRITICAL)

The application uses a **dual routing system**:

1. **Static Routes** (`main-app/src/router/index.js`):
   - Base routes: Login, MainLayout
   - Catch-all micro-app routes with `:pathMatch(.*)* ` wildcards
   - These are always registered

2. **Dynamic Routes** (`main-app/src/router/dynamic.js`):
   - Generated from backend menu API after login
   - Registered as children of MainLayout using `router.addRoute()`
   - Must use `MicroAppContainer` component (imported from `@/views/MicroAppContainer.vue`)

**CRITICAL BUG FIXED (2025-10-08)**: `dynamic.js` was using an empty div placeholder instead of the real `MicroAppContainer` component, causing blank pages when directly navigating to child routes like `/system/users`. The fix:

```javascript
// ❌ WRONG - causes blank pages
const MicroAppPlaceholder = { render: () => h('div') }

// ✅ CORRECT - uses real component
import MicroAppContainer from '@/views/MicroAppContainer.vue'
const MicroAppPlaceholder = MicroAppContainer
```

**How it works**:
- User logs in → `userStore.fetchMenus()` → `registerRoutes()`
- Routes are registered dynamically with `MicroAppPlaceholder` component
- Component must be the real `MicroAppContainer` to load Wujie micro-apps
- Menu structure includes `component: 'MicroAppPlaceholder'` for micro-app pages
- Parent routes with children use `component: 'SubMenu'` (no component needed)

See `main-app/DYNAMIC_ROUTES.md` for detailed documentation.

### Key Architecture Patterns

#### 1. Micro-App Registration

**File**: `main-app/src/micro/wujie-config.js`

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

#### 2. Micro-App Routing

**File**: `main-app/src/router/index.js`

```javascript
{
  path: '/dashboard/:pathMatch(.*)*',
  name: 'Dashboard',
  component: () => import('@/views/MicroAppContainer.vue'),
  meta: { microApp: 'dashboard-app' }  // Links to Wujie app name
}
```

The `MicroAppContainer.vue` component:
- Reads `route.meta.microApp` to determine which app to load
- Passes props (userInfo, token, permissions) to micro-apps
- Uses `<WujieVue>` component from wujie-vue3

#### 3. Authentication & State Management

**File**: `main-app/src/store/user.js` (Pinia store)

- Manages user authentication state (token, userInfo, permissions)
- Fetches dynamic menus from backend API
- Registers dynamic routes based on menu permissions
- Persists auth state to localStorage
- Router guard in `main-app/src/router/index.js` checks authentication

**Dynamic Menu System**:
- Backend API (`/api/system/menus`) returns user-specific menu structure
- `router/dynamic.js` converts menu items to Vue Router routes
- Menus are registered dynamically after login
- Supports nested submenus and permissions

#### 4. Mock Data System

**Main App Mock System** (`main-app/src/mock/index.js`):
- Simple mock implementation without MSW
- Controlled by `.env` variable: `VITE_USE_MOCK=true`
- Mock API functions: `login()`, `getUserMenus()`, `getUserInfo()`
- Test accounts:
  - **admin/admin123** - Full access (all menus)
  - **user/user123** - Limited access (dashboard + agents)
  - **guest/guest123** - No menu access
- Simulates API delays (configurable via `VITE_MOCK_DELAY`)

**Micro-Apps**: Can implement their own mock systems as needed (MSW or similar)

#### 5. Shared Component Library

**Package**: `@k8s-agent/shared`

**Key Components**:

1. **VbenLayout** - Complete layout system with sidebar, header, multi-tab navigation
2. **VxeBasicTable** - Enhanced table wrapper around VXE Table:
   - Built-in pagination, loading states, error handling
   - Automatic data loading via `api` prop
   - `immediate` prop controls initial load (default: true)
   - Expose methods: `reload()`, `query()`, `refresh()`
   - Use `@register` event to get table API reference
   - Supports custom column slots for rendering

**Usage Example**:
```vue
<VxeBasicTable
  :api="loadDataApi"
  :grid-options="{ columns: [...] }"
  @register="api => tableApi = api"
>
  <template #action="{ row }">
    <a-button @click="edit(row)">Edit</a-button>
  </template>
</VxeBasicTable>
```

**Other Shared Resources**:
- Composables: `usePagination`, `useTable`, `useSearch`
- Utils: `request` (Axios wrapper), `auth`, date/format utilities

**Import pattern**:
```javascript
import { VbenLayout, VxeBasicTable } from '@k8s-agent/shared/components'
import { usePagination } from '@k8s-agent/shared/composables'
```

## Common Development Tasks

### Adding a New Micro-App

1. Create new app directory (e.g., `new-app/`)
2. Initialize as standard Vue 3 + Vite project
3. Configure CORS in `vite.config.js`:
   ```javascript
   server: {
     port: 300X,
     cors: true,
     headers: { 'Access-Control-Allow-Origin': '*' }
   }
   ```
4. Register in `main-app/src/micro/wujie-config.js`:
   ```javascript
   {
     name: 'new-app',
     url: '//localhost:300X',
     exec: true,
     alive: true,
     sync: true
   }
   ```
5. Add route in `main-app/src/router/index.js`:
   ```javascript
   {
     path: '/new-app/:pathMatch(.*)*',
     name: 'NewApp',
     component: () => import('@/views/MicroAppContainer.vue'),
     meta: { microApp: 'new-app' }
   }
   ```
6. Add scripts to root `package.json`:
   ```json
   {
     "dev:new-app": "cd new-app && pnpm dev",
     "build:new-app": "cd new-app && pnpm build"
   }
   ```
7. Add to Makefile `dev` target ports list

### Adding a New Page to a Micro-App

Micro-apps are standard Vue 3 apps - just add routes normally:

1. Create view component in `src/views/`
2. Add route to `src/router/index.js`
3. No special micro-frontend configuration needed!

### Modifying Shared Components

1. Edit components in `shared/components/`
2. Changes are immediately reflected in all apps using HMR
3. Run `pnpm build` in `shared/` if you need explicit builds

### Working with Mock Data

1. Edit mock data in `{app}/src/mocks/data/`
2. Update handlers in `{app}/src/mocks/handlers.js`
3. MSW automatically intercepts API calls in development mode

## Wujie Communication Between Main App and Micro-Apps

**Route Synchronization**:
- Main app uses Wujie event bus (`WujieVue.bus`) to notify micro-apps of route changes
- Event pattern: `${appName}-route-change`, e.g., `system-app-route-change`
- Micro-apps listen for these events in their `main.js`:
  ```javascript
  if (window.$wujie?.bus) {
    window.$wujie.bus.$on('system-app-route-change', (subPath) => {
      router.push(subPath)
    })
  }
  ```

**State Passing**:
- Main app passes props to micro-apps via `MicroAppContainer`:
  ```javascript
  const appProps = computed(() => ({
    userInfo: userStore.userInfo,
    token: userStore.token,
    permissions: userStore.permissions
  }))
  ```
- Micro-apps receive these via `window.$wujie.props`

**Lifecycle**:
- `@activated` - Fired when micro-app becomes visible (keep-alive mode)
- `@deactivated` - Fired when micro-app is hidden
- Main app syncs route to micro-app on activation

## Common Issues & Solutions

### Blank Pages When Navigating to Micro-App Routes

**Symptom**: Navigating to `/system/users`, `/system/roles`, etc. shows blank page, data appears only after refresh

**Cause**: Dynamic routes in `router/dynamic.js` using wrong component (empty div instead of `MicroAppContainer`)

**Solution**: Ensure `router/dynamic.js` imports and uses real `MicroAppContainer`:
```javascript
import MicroAppContainer from '@/views/MicroAppContainer.vue'
const MicroAppPlaceholder = MicroAppContainer
```

**Fixed**: 2025-10-08

### HTTP Proxy Blocking Localhost

**Symptom**: `GET http://localhost:3001/ 404 (Not Found)` or `502 Bad Gateway`

**Cause**: System `http_proxy` environment variable (e.g., `http_proxy=http://127.0.0.1:7890`) intercepts localhost requests

**Solution**: Use `./dev.sh` or `make dev` which automatically disables proxy

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

**Symptom**: Blank page or micro-app fails to load

**Checklist**:
1. Check all services are running: `make status`
2. Verify CORS is enabled in micro-app's `vite.config.js`:
   ```javascript
   server: {
     cors: true,
     headers: { 'Access-Control-Allow-Origin': '*' }
   }
   ```
3. Check browser console for errors
4. Verify route configuration in `main-app/src/router/index.js`
5. Verify app is registered in `main-app/src/micro/wujie-config.js`
6. **If using dynamic routes**: Verify `router/dynamic.js` uses real `MicroAppContainer` component

### TypeScript or Linting Errors

**Solution**:
```bash
# Run linter
make lint

# Or for specific app
cd main-app && pnpm lint
```

## Testing Access

After starting services (`make dev`):

1. **Main App**: http://localhost:3000
2. **Individual Micro-Apps** (for development):
   - Dashboard: http://localhost:3001
   - Agent: http://localhost:3002
   - Cluster: http://localhost:3003
   - Monitor: http://localhost:3004
   - System: http://localhost:3005
   - Image Build: http://localhost:3006

**Note**: Individual micro-app URLs are for development only. In production, access everything through the main app at port 3000.

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

- `WUJIE_MIGRATION_COMPLETE.md` - Wujie migration details and architecture
- `MIGRATION_TO_WUJIE.md` - Step-by-step migration guide
- `ROOT_CAUSE_ANALYSIS.md` - Analysis of previous qiankun issues
- `MAKEFILE_GUIDE.md` - Makefile command reference
- `Makefile` - Development task automation
- `dev.sh` - Development startup script with proxy handling
- `package.json` - Root workspace configuration
- `pnpm-workspace.yaml` - pnpm workspace definition

## Additional Documentation

The repository contains extensive documentation in markdown files:

- **Setup & Usage**: `QUICK_START.md`, `START_GUIDE.md`, `MAKEFILE_GUIDE.md`
- **Components**: `COMPONENTS_GUIDE.md`, `SHARED_COMPONENTS_MIGRATION.md`
- **Architecture**: `DYNAMIC_MENU_GUIDE.md`, `SUBMENU_GUIDE.md`
- **Mock Data**: `MOCK_GUIDE.md`, `SUB_APPS_MOCK_GUIDE.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`, `PROXY_ISSUE_FIX.md`
- **Migration**: `WUJIE_MIGRATION_COMPLETE.md`, `MIGRATION_TO_WUJIE.md`

Use these documents for detailed information about specific aspects of the project.
