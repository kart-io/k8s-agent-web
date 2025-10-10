# Migration Guide: 002-微前端架构优化

**Feature**: Micro-Frontend Architecture Optimization
**Version**: 1.0.0
**Last Updated**: 2025-10-10
**Target Audience**: Development teams upgrading existing K8s Agent Web codebases

## Overview

This guide helps teams migrate from the legacy architecture to the new optimized micro-frontend system introduced in Feature 002-. The migration is designed to be **non-breaking** and can be done incrementally.

## What's Changed

### Summary of Improvements

| Component | Before | After | Impact |
|-----------|--------|-------|--------|
| **Configuration** | Hardcoded URLs in 3-5 files | Single `micro-apps.config.js` | Modify 1 file instead of 5 |
| **Route Sync** | `setTimeout` + manual flags | `RouteSync` class with debounce | No delays, reliable navigation |
| **State Sharing** | Props only (main → micro) | `SharedStateManager` (bidirectional) | Cross-app reactive updates |
| **Error Handling** | No boundaries (white screens) | `ErrorBoundary` + retry UI | Graceful degradation |
| **Shared Library** | Source code (slow builds) | Pre-built ESM (~519ms) | 30%+ faster builds |

---

## Migration Phases

### Phase 1: Centralized Configuration (User Story 1)

**Status**: ✅ Already implemented
**Breaking Changes**: None
**Estimated Time**: 30 minutes

#### Step 1.1: Review existing configuration

Check if your code already uses the new centralized config:

```bash
grep -r "getMicroAppUrl" main-app/src/
```

If found, configuration migration is **already complete**. Skip to Phase 2.

#### Step 1.2: Update Wujie config (if needed)

**Before** (`main-app/src/micro/wujie-config.js`):
```javascript
export const wujieConfig = {
  apps: [
    { name: 'dashboard-app', url: '//localhost:3001', exec: true, alive: true, sync: true },
    { name: 'agent-app', url: '//localhost:3002', exec: true, alive: true, sync: true },
    // ... hardcoded for each app
  ]
}
```

**After**:
```javascript
import { MICRO_APPS, getMicroAppUrl } from '@/config/micro-apps.config'

export const wujieConfig = {
  apps: Object.values(MICRO_APPS).map(app => ({
    name: app.name,
    url: getMicroAppUrl(app.name),  // Auto-detects environment
    exec: app.wujie.exec,
    alive: app.wujie.alive,
    sync: app.wujie.sync
  }))
}
```

#### Step 1.3: Update MicroAppContainer (if needed)

**Before** (`main-app/src/views/MicroAppContainer.vue`):
```vue
<script setup>
const microAppUrl = computed(() => {
  const urls = {
    'dashboard-app': '//localhost:3001',
    'agent-app': '//localhost:3002',
    // ... hardcoded
  }
  return urls[route.meta.microApp]
})
</script>
```

**After**:
```vue
<script setup>
import { getMicroAppUrl } from '@/config/micro-apps.config'

const microAppUrl = computed(() => getMicroAppUrl(route.meta.microApp))
</script>
```

#### Step 1.4: Test configuration

```bash
# Start all services
make dev

# Verify all 6 micro-apps load correctly
# Check browser console for: [Config] Loaded 6 micro-apps
```

**Rollback**: If issues occur, revert to hardcoded URLs. No data loss risk.

---

### Phase 2: Standardized Route Sync (User Story 2)

**Status**: ✅ Already implemented
**Breaking Changes**: None (backward compatible)
**Estimated Time**: 1 hour

#### Step 2.1: Check current route sync implementation

```bash
grep -r "RouteSync" main-app/src/
grep -r "RouteSync" system-app/src/
```

If `RouteSync` is already imported and used, migration is **complete**. Skip to Phase 3.

#### Step 2.2: Update Main App

**Before** (`main-app/src/views/MicroAppContainer.vue`):
```vue
<script setup>
const lastSyncedPath = ref('')

watch(() => route.path, (newPath) => {
  if (lastSyncedPath.value === newPath) return
  lastSyncedPath.value = newPath

  setTimeout(() => {
    const basePath = newPath.split('/')[1]
    const subPath = newPath.replace(`/${basePath}`, '') || '/'
    WujieVue.bus.$emit(`${appName}-route-change`, subPath)
  }, 100)  // ❌ Arbitrary delay
})
</script>
```

**After**:
```vue
<script setup>
import { RouteSync } from '@k8s-agent/shared/core/route-sync.js'

const routeSync = new RouteSync(router)

watch(() => route.path, (newPath) => {
  const appName = route.meta.microApp
  const basePath = newPath.split('/')[1]
  const subPath = newPath.replace(`/${basePath}`, '') || '/'

  routeSync.notifyMicroApp(appName, subPath, { title: route.meta.title })
})

// Also sync on mount for direct navigation
onMounted(() => {
  // ... same logic
})
</script>
```

#### Step 2.3: Update Each Micro-App

**Before** (`system-app/src/main.js`):
```javascript
if (window.$wujie?.bus) {
  window.$wujie.bus.$on('system-app-route-change', (subPath) => {
    router.push(subPath).catch(err => console.error(err))
  })
}
```

**After**:
```javascript
if (window.$wujie?.bus) {
  import('@k8s-agent/shared/core/route-sync.js').then(({ RouteSync }) => {
    const routeSync = new RouteSync('system-app', router, window.$wujie.bus)
    routeSync.setupListener()
  })
}
```

**Repeat for all 6 micro-apps**: dashboard, agent, cluster, monitor, system, image-build

#### Step 2.4: Test route synchronization

```bash
# Direct navigation test
# Navigate to: http://localhost:3000/system/users
# Expected: Page renders immediately without blank screen

# Rapid navigation test
# Click through menu items quickly
# Expected: No route sync errors, no "串台" (cross-talk)
```

**Rollback**: Old event listeners (`${appName}-route-change`) still work alongside new RouteSync.

---

### Phase 3: Shared State Management (User Story 3)

**Status**: ✅ Already implemented
**Breaking Changes**: None (opt-in feature)
**Estimated Time**: 2 hours

#### Step 3.1: Initialize Shared State Manager

**File**: `main-app/src/main.js`

```javascript
import { SharedStateManager } from '@/store/shared-state'

// Create singleton instance
const sharedStateManager = new SharedStateManager()

// Make available globally
app.provide('sharedState', sharedStateManager)
```

#### Step 3.2: Use in Micro-Apps

**Example**: Sync user avatar across apps

**File**: `system-app/src/views/Profile.vue`

```vue
<script setup>
import { useSharedState } from '@k8s-agent/shared/composables'

// Subscribe to user info
const { state: userInfo, setState: setUserInfo } = useSharedState('user', 'info', {})

// Update avatar (syncs to all apps)
async function updateAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)

  const { data } = await api.uploadAvatar(formData)

  setUserInfo({
    ...userInfo.value,
    avatar: data.avatarUrl
  })  // ✅ All apps update automatically!
}
</script>

<template>
  <img :src="userInfo.avatar" />
</template>
```

**File**: `dashboard-app/src/components/UserDropdown.vue`

```vue
<script setup>
import { useSharedState } from '@k8s-agent/shared/composables'

// Automatically receives updates from system-app
const { state: userInfo } = useSharedState('user', 'info', {})
</script>

<template>
  <img :src="userInfo.avatar" />  <!-- Updates when Profile.vue changes it -->
</template>
```

#### Step 3.3: Standard Namespaces

Use these conventions for consistency:

```javascript
// User-related state
useSharedState('user', 'info', {})
useSharedState('user', 'preferences', {})

// Notifications
useSharedState('notification', 'unreadCount', 0)
useSharedState('notification', 'messages', [])

// Permissions (when roles change)
useSharedState('permission', 'roles', [])

// System settings
useSharedState('system', 'theme', 'light')
useSharedState('system', 'language', 'zh-CN')
```

#### Step 3.4: Test state synchronization

```bash
# Browser console test
window.$wujie.bus.$emit('state:update', {
  namespace: 'user',
  key: 'info',
  value: { avatar: '/test.png' },
  timestamp: Date.now()
})

# All subscribed components should update within 500ms
```

**Rollback**: Simply don't use `useSharedState`. Feature is opt-in.

---

### Phase 4: Error Boundaries (User Story 4)

**Status**: ✅ Already implemented
**Breaking Changes**: None
**Estimated Time**: 30 minutes

#### Step 4.1: Verify ErrorBoundary exists

```bash
ls -la main-app/src/views/ErrorBoundary.vue
```

If file exists, error boundaries are **already implemented**. Verify usage in `MicroAppContainer.vue`.

#### Step 4.2: Wrap Micro-App Container

**File**: `main-app/src/views/MicroAppContainer.vue`

```vue
<template>
  <ErrorBoundary>
    <div class="micro-app-container">
      <WujieVue
        :name="microAppName"
        :url="microAppUrl"
        :alive="true"
        :props="appProps"
        @activated="handleActivated"
        @deactivated="handleDeactivated"
      />
    </div>
  </ErrorBoundary>
</template>

<script setup>
import ErrorBoundary from './ErrorBoundary.vue'
// ... rest of component
</script>
```

#### Step 4.3: Test error handling

```bash
# Simulate micro-app failure
# Kill a micro-app process:
kill $(lsof -ti:3005)  # system-app

# Navigate to: http://localhost:3000/system
# Expected: Friendly error page with retry button (not white screen)

# Click "重试" button
# Expected: Attempt to reload micro-app
```

**No rollback needed**: Error boundaries are additive and don't break existing functionality.

---

### Phase 5: Shared Library Build Optimization (User Story 5)

**Status**: ✅ Already implemented
**Breaking Changes**: None (transparent to micro-apps)
**Estimated Time**: 15 minutes

#### Step 5.1: Verify shared library build config

```bash
ls -la shared/vite.config.js
ls -la shared/dist/
```

If `dist/` directory exists with `.js` files, build optimization is **complete**.

#### Step 5.2: Build shared library

```bash
cd shared
pnpm build
```

**Expected output**:
```
✓ built in 519ms
dist/index.js (4.59 KB)
dist/components.js (3.34 KB)
... (94 modules total)
```

#### Step 5.3: Verify micro-apps use pre-built dist

Micro-apps automatically import from `dist/` via `package.json` exports field. No code changes needed!

```javascript
// This automatically imports from dist/ (not src/)
import { VbenLayout } from '@k8s-agent/shared/components'
import { useTable } from '@k8s-agent/shared/composables'
```

#### Step 5.4: Measure build time improvement

```bash
# Baseline (optional - already documented in BUILD_METRICS.md)
cd dashboard-app
time pnpm build

# Expected: ~5.7 seconds (30% faster than before)
```

**Rollback**: Delete `shared/dist/` to revert to source imports (not recommended).

---

## Verification Checklist

After completing all phases, verify the following:

### Functionality Tests

- [ ] All 6 micro-apps load successfully (`make status`)
- [ ] Direct navigation to deep routes works (e.g., `/system/users`)
- [ ] Rapid route switching doesn't cause errors
- [ ] Cross-app state updates propagate (test with `useSharedState`)
- [ ] Error boundaries display when micro-app fails
- [ ] Retry button recovers from errors
- [ ] Builds complete in ~5.7s per app

### Configuration Tests

- [ ] `getMicroAppUrl()` returns correct URL for current environment
- [ ] Environment variable `VITE_APP_ENV` changes URL resolution
- [ ] New micro-app can be added by updating config file only

### Performance Tests

- [ ] Route navigation < 500ms
- [ ] Cross-app state sync < 1s
- [ ] Shared library builds in < 1s
- [ ] No `setTimeout` delays in route sync

---

## Troubleshooting

### Issue: "Cannot find module '@k8s-agent/shared/core/route-sync.js'"

**Cause**: Shared library not built or exports field missing

**Solution**:
```bash
cd shared
pnpm build
# Verify dist/core/route-sync.js exists
```

### Issue: State not syncing between apps

**Cause**: SharedStateManager not initialized or namespace mismatch

**Solution**:
1. Verify `SharedStateManager` initialized in `main-app/src/main.js`
2. Check namespace/key match exactly: `useSharedState('user', 'info')`
3. Check browser console for `state:update` events

### Issue: Error boundary not catching errors

**Cause**: Component not wrapped properly

**Solution**:
```vue
<!-- Correct nesting -->
<ErrorBoundary>
  <WujieVue ... />
</ErrorBoundary>

<!-- Wrong: ErrorBoundary inside WujieVue -->
<WujieVue>
  <ErrorBoundary />  <!-- Won't work -->
</WujieVue>
```

### Issue: Builds still slow after shared library optimization

**Cause**: `shared/dist/` not committed to git or cache issue

**Solution**:
```bash
# Ensure dist is not gitignored (it's intentionally committed)
git status shared/dist/

# Force rebuild
cd shared
rm -rf dist
pnpm build
```

---

## Rollback Plan

If critical issues occur, rollback in reverse order:

### 1. Rollback Shared Library Build (Phase 5)

```bash
cd shared
rm -rf dist/
git checkout shared/package.json  # Restore old exports field
```

Micro-apps will revert to importing from `src/`.

### 2. Rollback Error Boundaries (Phase 4)

```vue
<!-- Remove ErrorBoundary wrapper -->
<template>
  <div class="micro-app-container">
    <WujieVue ... />  <!-- No ErrorBoundary -->
  </div>
</template>
```

### 3. Rollback Shared State (Phase 3)

Simply stop using `useSharedState`. No code removal needed (opt-in feature).

### 4. Rollback Route Sync (Phase 2)

```javascript
// Revert to old event listener
window.$wujie.bus.$on('system-app-route-change', (subPath) => {
  router.push(subPath)
})
```

### 5. Rollback Configuration (Phase 1)

```javascript
// Restore hardcoded URLs
export const wujieConfig = {
  apps: [
    { name: 'dashboard-app', url: '//localhost:3001', ... }
  ]
}
```

---

## Migration Timeline (Recommended)

### Week 1: Configuration + Route Sync (MVP)

- Day 1-2: Phase 1 (Configuration)
- Day 3-4: Phase 2 (Route Sync)
- Day 5: Testing and validation

**Deliverable**: Stable configuration and route navigation

### Week 2: State + Error Handling

- Day 1-2: Phase 3 (Shared State)
- Day 3-4: Phase 4 (Error Boundaries)
- Day 5: Integration testing

**Deliverable**: Cross-app state sync and graceful error handling

### Week 3: Build Optimization + Polish

- Day 1: Phase 5 (Shared Library Build)
- Day 2-3: Performance testing and metrics
- Day 4-5: Documentation and knowledge transfer

**Deliverable**: Optimized builds and complete documentation

---

## Team Communication

### Before Migration

- [ ] Schedule migration planning meeting
- [ ] Review this guide with全team
- [ ] Assign phase owners
- [ ] Set up test environment

### During Migration

- [ ] Daily standup to track progress
- [ ] Document any issues in migration log
- [ ] Test after each phase completion

### After Migration

- [ ] Demo new features to stakeholders
- [ ] Update team documentation
- [ ] Conduct retrospective
- [ ] Archive old architecture docs

---

## Success Metrics

Track these metrics to validate migration success:

| Metric | Target | Baseline | After Migration |
|--------|--------|----------|-----------------|
| Configuration modification points | 1 | 3-5 | ___ |
| Route navigation time | < 500ms | ~1-2s | ___ms |
| Cross-app state sync latency | < 1s | N/A | ___ms |
| Error recovery time | < 3s | ∞ (white screen) | ___s |
| Micro-app build time | 30% faster | ~45s | ___s |
| Developer onboarding time | < 30min | ~2h | ___min |

---

## References

- **Quick Start Guide**: `specs/002-/quickstart.md`
- **Architecture Documentation**: `CLAUDE.md` (updated with new patterns)
- **Build Metrics**: `specs/002-/BUILD_METRICS.md`
- **Test Results**: `specs/002-/TEST_RESULTS.md`
- **Event Protocols**: `specs/002-/contracts/`
- **Original Specification**: `specs/002-/spec.md`

---

## Support

For migration assistance:

- **GitHub Issues**: Use tag `[Migration]`
- **Team Chat**: #frontend-architecture
- **Documentation**: This guide + referenced specs
- **Emergency Rollback**: Follow "Rollback Plan" section above

---

**Last Updated**: 2025-10-10
**Version**: 1.0.0
**Status**: ✅ Complete - All 5 phases documented
