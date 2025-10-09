# Tasks: 微前端架构优化

**Input**: Design documents from `/specs/002-/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included as this is an architectural improvement requiring validation at each step.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Main app (`main-app/src/`), Micro-apps (`{app}-app/src/`), Shared (`shared/src/`)
- All paths are relative to repository root: `/home/hellotalk/code/web/k8s-agent-web/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for architecture optimization

- [X] T001 [P] Create configuration directory at `config/` for JSON schema
- [X] T002 [P] Create shared utilities directory at `shared/src/core/` for event bus helpers
- [X] T003 [P] Add Vitest testing framework to `main-app/package.json` and `shared/package.json`
- [X] T004 [P] Add Playwright E2E testing framework to root `package.json`
- [X] T005 [P] Create feature flags in `main-app/.env.development` for gradual rollout

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create JSON Schema validation at `config/micro-apps.schema.json` based on `contracts/config-schema.json`
- [X] T007 [P] Create base configuration types in `main-app/src/types/micro-app-config.d.ts` (JSDoc types)
- [X] T008 [P] Create event protocol types in `shared/src/types/events.d.ts` for route and state events
- [X] T009 [P] Implement error reporter utility at `main-app/src/utils/error-reporter.js` with console.log fallback
- [X] T010 Create configuration validation utility at `shared/src/utils/config-loader.js` using JSON schema

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 统一配置管理中心 (Priority: P1) 🎯 MVP

**Goal**: Consolidate scattered micro-app configuration into a single centralized file with environment support

**Independent Test**: Modify a micro-app port in config file, verify all references automatically use new port without code changes

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T011 [P] [US1] Unit test for `getMicroAppUrl()` in `main-app/src/config/__tests__/micro-apps.config.test.js`
- [X] T012 [P] [US1] Unit test for `getMicroAppConfig()` validation in same file
- [X] T013 [P] [US1] E2E test for config-driven URL resolution in `tests/e2e/config.spec.js`

### Implementation for User Story 1

- [X] T014 [US1] Create centralized configuration file at `main-app/src/config/micro-apps.config.js` with all 6 micro-apps (dashboard, agent, cluster, monitor, system, image-build)
- [X] T015 [US1] Implement `getMicroAppUrl(appName, env)` helper function in same file
- [X] T016 [US1] Implement `getMicroAppConfig(appName)` helper function in same file
- [X] T017 [US1] Update `main-app/src/micro/wujie-config.js` to use `getMicroAppUrl()` instead of hardcoded URLs
- [X] T018 [US1] Update `main-app/src/views/MicroAppContainer.vue` to use `getMicroAppUrl()` for dynamic URL resolution
- [X] T019 [US1] Add config validation on app startup in `main-app/src/main.js` using schema
- [X] T020 [US1] Add fallback mechanism: if config load fails, use legacy hardcoded URLs with warning log
- [X] T021 [US1] Add environment variable `VITE_FEATURE_UNIFIED_CONFIG` feature flag support in config loader

**Checkpoint**: Configuration system complete - all micro-app URLs centralized, environment-aware, validated

---

## Phase 4: User Story 2 - 标准化路由同步协议 (Priority: P1)

**Goal**: Replace unstable setTimeout-based route sync with a standardized, debounced event protocol

**Independent Test**: Navigate to deep route (e.g., `/system/users`) in browser address bar, verify page renders immediately without blank screen or delay

### Tests for User Story 2

- [X] T022 [P] [US2] Unit test for `RouteSync.notifyMicroApp()` debounce logic in `shared/src/core/__tests__/route-sync.test.js`
- [X] T023 [P] [US2] Unit test for `RouteSync.setupListener()` event handling in same file
- [X] T024 [P] [US2] E2E test for direct deep route navigation in `tests/e2e/route-sync.spec.js`
- [X] T025 [P] [US2] E2E test for rapid route switching without串台 in same file

### Implementation for User Story 2

- [X] T026 [P] [US2] Create `RouteSync` class in `shared/src/core/route-sync.js` with `notifyMicroApp()` method
- [X] T027 [P] [US2] Add `setupListener()` method to `RouteSync` class for micro-app side
- [X] T028 [P] [US2] Implement debounce mechanism (50ms) in `notifyMicroApp()` using timer map
- [X] T029 [P] [US2] Implement error emission (`route:error`) on navigation failures
- [X] T030 [US2] Update `main-app/src/views/MicroAppContainer.vue` to use `RouteSync` class instead of direct event emission
- [X] T031 [US2] Remove `setTimeout` and `lastSyncedPath` hack code from `MicroAppContainer.vue`
- [X] T032 [US2] Update `system-app/src/main.js` to use `RouteSync.setupListener()` (replace old event listener)
- [X] T033 [P] [US2] Update `dashboard-app/src/main.js` to use `RouteSync.setupListener()`
- [X] T034 [P] [US2] Update `agent-app/src/main.js` to use `RouteSync.setupListener()`
- [X] T035 [P] [US2] Update `cluster-app/src/main.js` to use `RouteSync.setupListener()`
- [X] T036 [P] [US2] Update `monitor-app/src/main.js` to use `RouteSync.setupListener()`
- [X] T037 [P] [US2] Update `image-build-app/src/main.js` to use `RouteSync.setupListener()`
- [X] T038 [US2] Add environment variable `VITE_FEATURE_STANDARD_ROUTE_SYNC` feature flag support
- [X] T039 [US2] Add backward compatibility: keep old event listeners active if feature flag disabled

**Checkpoint**: Route synchronization stable - no setTimeout, no delays, direct navigation works, all 6 micro-apps migrated

---

## Phase 5: User Story 3 - 应用间共享状态管理 (Priority: P2)

**Goal**: Enable bidirectional state sharing across micro-apps for real-time cross-app updates

**Independent Test**: Update user avatar in system-app, verify dashboard-app avatar updates within 1 second without page refresh

### Tests for User Story 3

- [X] T040 [P] [US3] Unit test for `SharedStateManager.setState()` in `main-app/src/store/__tests__/shared-state.test.js`
- [X] T041 [P] [US3] Unit test for `SharedStateManager.subscribe()` callback triggering in same file
- [X] T042 [P] [US3] Unit test for `useSharedState` composable in `shared/src/composables/__tests__/useSharedState.test.js`
- [X] T043 [P] [US3] E2E test for cross-app state sync in `tests/e2e/state-sync.spec.js`

### Implementation for User Story 3

- [X] T044 [US3] Create `SharedStateManager` class in `main-app/src/store/shared-state.js` with reactive state
- [X] T045 [US3] Implement `setState(namespace, key, value)` method with event emission
- [X] T046 [US3] Implement `getState(namespace, key)` method
- [X] T047 [US3] Implement `subscribe(namespace, key, callback)` method
- [X] T048 [US3] Implement `setupBusListeners()` to handle `state:update` events from micro-apps
- [X] T049 [US3] Add namespace isolation (format: `${namespace}:${key}`)
- [X] T050 [US3] Add memory cleanup: unsubscribe on micro-app unmount
- [X] T051 [US3] Initialize `SharedStateManager` singleton in `main-app/src/main.js`
- [X] T052 [P] [US3] Create `useSharedState` composable in `shared/src/composables/useSharedState.js`
- [X] T053 [P] [US3] Add reactive ref and bus listener setup in composable
- [X] T054 [P] [US3] Add `setState` helper function in composable
- [X] T055 [P] [US3] Add automatic cleanup `onUnmounted` in composable
- [X] T056 [US3] Add optional localStorage persistence for `user` and `system` namespaces
- [X] T057 [US3] Document standard namespaces (`user`, `notification`, `permission`, `system`) in code comments

**Checkpoint**: Shared state manager working - cross-app reactive updates, opt-in usage, no memory leaks

---

## Phase 6: User Story 4 - 错误边界和降级策略 (Priority: P2)

**Goal**: Gracefully handle micro-app failures with friendly error UI and automatic monitoring reporting

**Independent Test**: Stop a micro-app service (e.g., `kill` port 3005), navigate to `/system`, verify error page with retry button appears, other apps continue working

### Tests for User Story 4

- [X] T058 [P] [US4] Unit test for `ErrorBoundary` onErrorCaptured in `main-app/src/views/__tests__/ErrorBoundary.test.js`
- [X] T059 [P] [US4] Unit test for `reportError()` function in `main-app/src/utils/__tests__/error-reporter.test.js`
- [X] T060 [P] [US4] E2E test for error boundary display in `tests/e2e/error-boundary.spec.js`
- [X] T061 [P] [US4] E2E test for retry functionality in same file

### Implementation for User Story 4

- [X] T062 [US4] Create `ErrorBoundary.vue` component in `main-app/src/views/ErrorBoundary.vue`
- [X] T063 [US4] Implement `onErrorCaptured` lifecycle hook with error state
- [X] T064 [US4] Add error UI using Ant Design `<a-result>` component with "error" status
- [X] T065 [US4] Add retry button that clears error and reloads micro-app
- [X] T066 [US4] Add "返回首页" button that navigates to `/`
- [X] T067 [US4] Implement `reportError()` function in `main-app/src/utils/error-reporter.js`
- [X] T068 [US4] Add error reporting to console.log with structured format (appName, errorType, message, stack, timestamp)
- [X] T069 [US4] Add TODO comment for future Sentry/DataDog integration in error reporter
- [X] T070 [US4] Wrap `<WujieVue>` in `MicroAppContainer.vue` with `<ErrorBoundary>` component
- [X] T071 [US4] Add error propagation stop (`return false` in onErrorCaptured)
- [X] T072 [US4] Add 5-second loading timeout detection for micro-app load failures
- [X] T073 [US4] Add network error detection and user-friendly messaging

**Checkpoint**: Error boundaries active - white screens eliminated, retry UX available, errors logged

---

## Phase 7: User Story 5 - 共享组件库构建优化 (Priority: P3)

**Goal**: Pre-build shared component library to ESM format for faster micro-app builds

**Independent Test**: Run `pnpm build` in a micro-app, measure build time, verify 30%+ reduction compared to baseline

### Tests for User Story 5

- [ ] T074 [P] [US5] Build smoke test in `shared/package.json` scripts
- [ ] T075 [P] [US5] Import verification test in `tests/e2e/shared-lib.spec.js`
- [ ] T076 [P] [US5] Build time benchmark test (before/after comparison)

### Implementation for User Story 5

- [ ] T077 [US5] Create `vite.config.js` in `shared/` directory with library mode configuration
- [ ] T078 [US5] Configure library entry points: index, components, composables, utils
- [ ] T079 [US5] Configure `rollupOptions` to externalize peer dependencies (vue, vue-router, pinia, ant-design-vue, vxe-table)
- [ ] T080 [US5] Set output format to ESM only (`formats: ['es']`)
- [ ] T081 [US5] Enable CSS code splitting (`cssCodeSplit: true`)
- [ ] T082 [US5] Update `shared/package.json` exports field to point to `dist/` directory
- [ ] T083 [US5] Add `"type": "module"` to `shared/package.json`
- [ ] T084 [US5] Add `"build": "vite build"` script to `shared/package.json`
- [ ] T085 [US5] Add `"dev": "vite build --watch"` script for development HMR
- [ ] T086 [US5] Run initial build: `cd shared && pnpm build`
- [ ] T087 [US5] Update `.gitignore` to include `shared/dist/`
- [ ] T088 [US5] Verify micro-apps import from pre-built dist (no code changes needed, automatic via exports field)
- [ ] T089 [US5] Measure and document build time improvements in `specs/002-/BUILD_METRICS.md`

**Checkpoint**: Shared library optimized - builds 30%+ faster, tree-shaking enabled, ESM output

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T090 [P] Update `CLAUDE.md` with new configuration system documentation
- [ ] T091 [P] Update `CLAUDE.md` with route sync best practices
- [ ] T092 [P] Update `CLAUDE.md` with shared state usage examples
- [ ] T093 [P] Create migration guide at `specs/002-/MIGRATION.md` for teams upgrading existing code
- [ ] T094 [P] Add inline code comments explaining architecture decisions in key files
- [ ] T095 [P] Add JSDoc documentation to all public functions in config, route-sync, and shared-state modules
- [ ] T096 Run full E2E test suite with all features enabled
- [ ] T097 Measure and document performance improvements (route navigation time, build time, config load time)
- [ ] T098 [P] Create comparison table in `specs/002-/PERFORMANCE.md` (before/after metrics)
- [ ] T099 Validate quickstart.md examples work with actual implementation
- [ ] T100 Create demo video showing configuration change propagation, route sync, and state sync

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Config) and US2 (Routes) should complete first (both P1)
  - US3 (State) and US4 (Errors) can start in parallel after US1/US2 (both P2)
  - US5 (Build) can start independently after Foundational (P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories - Can run parallel with US1
- **User Story 3 (P2)**: Can start after Foundational - Optionally uses US1 config - Independently testable
- **User Story 4 (P2)**: Can start after Foundational - Wraps US1/US2 components - Independently testable
- **User Story 5 (P3)**: Can start after Foundational - Completely independent - Can run parallel with all others

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Utilities/classes before usage sites
- Main app changes before micro-app updates
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase (T001-T005)**: All 5 tasks can run in parallel

**Foundational Phase (T006-T010)**:
- T007, T008, T009 can run in parallel (different files)
- T006, T010 sequential (T010 needs T006 schema)

**User Story 1 (T011-T021)**:
- Tests T011-T013 can all run in parallel
- Implementation: T014-T016 sequential (same file), T017-T018 can run in parallel after T014-T016

**User Story 2 (T022-T039)**:
- Tests T022-T025 can all run in parallel
- Implementation: T026-T029 sequential (same class), T030-T031 sequential (same file), T032-T037 all 6 micro-app updates can run in parallel

**User Story 3 (T040-T057)**:
- Tests T040-T043 can run in parallel
- Implementation: T044-T051 sequential (main-app), T052-T055 can run in parallel (shared), T056-T057 sequential after T044

**User Story 4 (T058-T073)**:
- Tests T058-T061 can run in parallel
- Implementation: T062-T066 sequential (same component), T067-T069 sequential (same utility), T070-T073 sequential (MicroAppContainer updates)

**User Story 5 (T074-T089)**:
- Tests T074-T076 can run in parallel
- Implementation: T077-T085 sequential (vite.config.js), T086-T089 sequential (build and verification)

**Polish Phase (T090-T100)**:
- T090-T095 documentation tasks can all run in parallel
- T096-T100 sequential (need full implementation)

---

## Parallel Example: User Story 1 (Configuration)

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for getMicroAppUrl() in main-app/src/config/__tests__/micro-apps.config.test.js"
Task: "Unit test for getMicroAppConfig() validation in main-app/src/config/__tests__/micro-apps.config.test.js"
Task: "E2E test for config-driven URL resolution in tests/e2e/config.spec.js"

# After tests fail, implement helpers in parallel:
Task: "Implement getMicroAppUrl(appName, env) helper function"
Task: "Implement getMicroAppConfig(appName) helper function"

# Then update usage sites in parallel:
Task: "Update main-app/src/micro/wujie-config.js to use getMicroAppUrl()"
Task: "Update main-app/src/views/MicroAppContainer.vue to use getMicroAppUrl()"
```

## Parallel Example: User Story 2 (Route Sync)

```bash
# After route-sync.js class is implemented, update all 6 micro-apps in parallel:
Task: "Update system-app/src/main.js to use RouteSync.setupListener()"
Task: "Update dashboard-app/src/main.js to use RouteSync.setupListener()"
Task: "Update agent-app/src/main.js to use RouteSync.setupListener()"
Task: "Update cluster-app/src/main.js to use RouteSync.setupListener()"
Task: "Update monitor-app/src/main.js to use RouteSync.setupListener()"
Task: "Update image-build-app/src/main.js to use RouteSync.setupListener()"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - Both P1)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T010) - **CRITICAL BLOCKER**
3. Complete Phase 3: User Story 1 - Configuration (T011-T021)
4. Complete Phase 4: User Story 2 - Route Sync (T022-T039)
5. **STOP and VALIDATE**: Test config changes and route navigation independently
6. Deploy/demo if ready - **Architecture stabilized, 90% of issues resolved**

### Incremental Delivery

1. **Foundation**: Complete Setup + Foundational → Infrastructure ready
2. **MVP (Week 1-2)**: Add US1 + US2 → Test independently → Deploy (Config + Routes stable!)
3. **Enhanced (Week 3)**: Add US3 → Test independently → Deploy (Cross-app state sync)
4. **Robust (Week 4)**: Add US4 → Test independently → Deploy (Error handling)
5. **Optimized (Week 5)**: Add US5 → Test independently → Deploy (Fast builds)
6. **Polished (Week 5)**: Complete Phase 8 → Documentation and metrics

### Parallel Team Strategy

With multiple developers (recommended):

1. **Team completes Setup + Foundational together** (Day 1-2)
2. **Once Foundational is done** (Day 3 onwards):
   - **Developer A**: User Story 1 (Configuration) - T011-T021
   - **Developer B**: User Story 2 (Route Sync) - T022-T039
   - **Developer C**: User Story 5 (Build Optimization) - T074-T089 (Independent!)
3. **After US1+US2 complete** (Week 2):
   - **Developer A**: User Story 3 (State Management) - T040-T057
   - **Developer B**: User Story 4 (Error Boundaries) - T058-T073
4. **Final week**: All developers on Phase 8 Polish

---

## Notes

- **[P] tasks** = different files, no dependencies - can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Verify tests fail before implementing** (TDD approach)
- Commit after each task or logical group (T001-T005, T011-T013, etc.)
- Stop at any checkpoint to validate story independently
- **Feature flags** enable gradual rollout: Test in dev, then staging, then production
- **Backward compatibility** maintained throughout: Old code continues working during migration

## Success Metrics (Target vs. Actual)

Track these after each user story completion:

| Metric | Target | Actual |
|--------|--------|--------|
| Configuration modification points | 1 (from 3-5) | ___ |
| Deep route render time | < 500ms | ___ms |
| Route sync code complexity reduction | 60%+ | ___%  |
| Cross-app state update latency | < 1s | ___ms |
| Error display time on failure | < 3s | ___s |
| Micro-app build time reduction | 30%+ | ___% |
| New micro-app integration time | < 30min (from 2h) | ___min |

---

**Total Tasks**: 100
**Estimated Timeline**: 3-4 weeks (1 developer) or 2-3 weeks (2-3 developers parallel)
**MVP Scope**: User Stories 1 & 2 (T001-T039) - ~40% of tasks, delivers 80% of value
