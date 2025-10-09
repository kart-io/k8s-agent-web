# Research: Architecture Analysis and Optimization

**Feature**: Architecture Analysis and Optimization
**Branch**: `001-`
**Date**: 2025-10-09

## Overview

This document consolidates research findings for implementing an architecture analysis and optimization system for the K8s Agent Web micro-frontend application. Research focuses on AST parsing for Vue/JavaScript, static code analysis patterns, automated code remediation strategies, and trend visualization approaches.

## Key Research Areas

### 1. AST Parsing for Vue 3 Components

**Decision**: Use `@vue/compiler-sfc` + `babel-parser`

**Rationale**:
- `@vue/compiler-sfc` is the official Vue 3 Single File Component compiler
- Already used internally by Vite for Vue file processing
- Provides parsed output with template, script, and style blocks separated
- `babel-parser` handles JavaScript/TypeScript in `<script>` blocks with full ES6+ support
- Zero additional learning curve for team already working with Vue 3

**Alternatives Considered**:
- **vue-template-compiler** (Vue 2): Rejected - incompatible with Vue 3 syntax
- **esprima**: Rejected - doesn't support JSX/Vue templates, less actively maintained
- **acorn**: Rejected - requires additional plugins for modern JavaScript features

**Implementation Pattern**:

```javascript
import { parse } from '@vue/compiler-sfc'
import { parse as babelParse } from '@babel/parser'

// Parse Vue SFC
const { descriptor } = parse(vueFileContent, { filename: 'Component.vue' })

// Parse script block
const scriptAST = babelParse(descriptor.script.content, {
  sourceType: 'module',
  plugins: ['typescript', 'jsx']
})
```

**References**:
- https://github.com/vuejs/core/tree/main/packages/compiler-sfc
- https://babeljs.io/docs/en/babel-parser

---

### 2. Routing Analysis Strategy

**Decision**: Static file analysis + pattern matching for common routing issues

**Rationale**:
- K8s Agent Web uses Vue Router 4 with standard patterns
- Static analysis detects: missing guards, wildcard conflicts, duplicate paths, improper `MicroAppContainer` usage
- No need for runtime instrumentation - files analyzed at rest
- Pattern library based on known issues from WUJIE_MIGRATION_COMPLETE.md and troubleshooting docs

**Key Patterns to Detect**:

1. **Empty div placeholder in dynamic routes** (Critical):
   ```javascript
   // BAD: const MicroAppPlaceholder = { render: () => h('div') }
   // GOOD: const MicroAppPlaceholder = MicroAppContainer
   ```

2. **Missing route guards** (High):
   - Routes with `meta.requiresAuth` but no corresponding `beforeEach` guard

3. **Wildcard conflicts** (Medium):
   - Multiple `pathMatch(.*)*` routes at same level causing ambiguity

4. **Incorrect micro-app metadata** (High):
   - Routes using `MicroAppContainer` without `meta.microApp` field

**Alternatives Considered**:
- **Runtime monitoring**: Rejected - requires instrumentation, overhead, doesn't catch issues before deployment
- **Manual rule definitions**: Rejected - too brittle, requires maintenance for every new pattern

**Implementation Approach**:
- Parse `main-app/src/router/index.js` and `dynamic.js`
- Build route tree data structure
- Apply pattern-matching rules
- Cross-reference with `wujie-config.js` for micro-app name validation

---

### 3. State Management Analysis

**Decision**: Parse Pinia stores + detect anti-patterns

**Rationale**:
- K8s Agent Web uses Pinia for state management
- Common issues: improper state persistence, missing reactivity, direct mutation outside actions
- AST analysis detects structural issues without runtime execution

**Patterns to Detect**:

1. **Direct state mutation outside actions** (Medium):
   ```javascript
   // BAD: store.count++
   // GOOD: store.increment()
   ```

2. **Missing persistence configuration** (Low):
   - Stores managing auth/user data without `persist` plugin

3. **Overuse of global state** (Low):
   - Component-specific state in global store (code smell)

**Implementation**:
- Parse all `store/*.js` files
- Check for Pinia `defineStore` usage
- Analyze action/getter patterns
- Detect localStorage/sessionStorage direct usage (should use persist plugin)

**Alternatives Considered**:
- **Runtime state tracking**: Rejected - requires injecting code into running app
- **Manual audits**: Rejected - doesn't scale, subjective

---

### 4. Micro-App Configuration Validation

**Decision**: Parse `wujie-config.js` + cross-reference with `vite.config.js` files

**Rationale**:
- Wujie requires specific configuration (CORS, ports, URL mapping)
- Common issues: CORS not enabled, port conflicts, incorrect URL patterns
- Constitution principles mandate specific patterns (exec/alive/sync flags)

**Validation Rules**:

1. **CORS Enabled** (Critical):
   - Each micro-app's `vite.config.js` must have `cors: true` and `Access-Control-Allow-Origin: *`

2. **Port Allocation** (High):
   - Ports 3001-3007 reserved, no conflicts

3. **Wujie Configuration** (Critical):
   - All apps have `exec: true`, `alive: true`, `sync: true`
   - URLs match configured ports

4. **Route Registration** (Critical):
   - Every app in `wujie-config.js` has corresponding route in `router/index.js`

**Implementation**:
- Parse `main-app/src/micro/wujie-config.js`
- Parse each micro-app's `vite.config.js`
- Cross-reference registrations with routes
- Validate URL patterns match port assignments

---

### 5. Shared Component Library Analysis

**Decision**: Parse imports + detect duplication across micro-apps

**Rationale**:
- Constitution Principle IV requires shared components in `@k8s-agent/shared`
- Anti-pattern: copying components between micro-apps
- Detection: look for identical/similar component files across apps

**Detection Strategies**:

1. **Import Pattern Analysis**:
   - Flag direct imports from other micro-apps: `import { Foo } from '../../agent-app/components'`
   - Ensure shared imports use: `import { Foo } from '@k8s-agent/shared/components'`

2. **File Similarity Detection**:
   - Hash component files, detect duplicates across apps
   - Use Levenshtein distance for near-duplicates (>80% similarity)

3. **Missing Shared Exports**:
   - Components used in 2+ micro-apps but not in shared library

**Implementation**:
- Parse all `import` statements in micro-apps
- Build dependency graph
- Hash component files for duplicate detection
- Generate recommendations for components to extract to shared library

**Alternatives Considered**:
- **eslint-plugin-import rules**: Rejected - doesn't detect duplication, only enforces import paths
- **Manual code review**: Rejected - doesn't scale

---

### 6. Performance Analysis (Bundle Size & Loading)

**Decision**: Analyze Vite build output + parse `vite.config.js` optimization settings

**Rationale**:
- Vite generates manifest.json and stats during build
- No runtime overhead - analyze build artifacts
- Identify large dependencies, missing code splitting, unoptimized assets

**Metrics to Extract**:

1. **Bundle Sizes**:
   - Main bundle size per micro-app
   - Chunk sizes for code-split routes
   - Total asset size (JS + CSS + images)

2. **Dependencies**:
   - Identify large dependencies (> 100KB)
   - Detect duplicate dependencies across micro-apps

3. **Optimization Opportunities**:
   - Missing tree-shaking
   - Unused dependencies in package.json
   - Missing lazy-loading for routes

**Implementation**:
- Parse `package.json` for dependencies
- Run `vite build --mode analysis` to generate stats
- Parse build output manifest
- Use `webpack-bundle-analyzer` style visualization data

**Alternatives Considered**:
- **Runtime performance monitoring**: Rejected - requires production instrumentation
- **Lighthouse CI**: Rejected - requires deployed environment, not local analysis

---

### 7. Security Vulnerability Detection

**Decision**: Use `npm audit` + custom pattern matching for K8s-specific issues

**Rationale**:
- `npm audit` covers known CVEs in dependencies
- Custom patterns detect project-specific issues: exposed credentials, insecure localStorage usage

**Custom Patterns**:

1. **Exposed Credentials** (Critical):
   - Search for patterns: `password`, `api_key`, `secret`, `token` in non-.env files
   - Detect hardcoded API URLs with credentials

2. **Insecure LocalStorage** (Medium):
   - Storing sensitive data (tokens, passwords) in localStorage without encryption

3. **Missing CSP Headers** (Low):
   - Check Vite config for Content Security Policy configuration

**Implementation**:
- Run `npm audit --json` programmatically
- Parse output for critical/high severity issues
- Grep codebase for credential patterns
- Parse localStorage usage in code

**Alternatives Considered**:
- **Snyk**: Rejected - requires external service, not local-first
- **Manual security review**: Rejected - doesn't scale

---

### 8. Historical Data Storage

**Decision**: SQLite for backend service + IndexedDB for dashboard caching

**Rationale**:
- SQLite: serverless, zero-config, perfect for local/single-server deployments
- IndexedDB: browser-native, offline support, fast queries for dashboard

**Schema Design**:

```sql
CREATE TABLE analysis_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  duration_ms INTEGER,
  total_issues INTEGER,
  critical_count INTEGER,
  high_count INTEGER,
  medium_count INTEGER,
  low_count INTEGER
);

CREATE TABLE issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER REFERENCES analysis_runs(id),
  severity TEXT CHECK(severity IN ('critical', 'high', 'medium', 'low')),
  category TEXT, -- routing, state, micro-app, shared, performance, security
  component TEXT, -- affected file/component
  description TEXT,
  remediation TEXT,
  auto_fixable BOOLEAN DEFAULT 0
);

CREATE TABLE recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER REFERENCES analysis_runs(id),
  priority TEXT CHECK(priority IN ('p1', 'p2', 'p3')),
  title TEXT,
  description TEXT,
  expected_benefit TEXT,
  complexity TEXT CHECK(complexity IN ('low', 'medium', 'high')),
  effort_hours INTEGER
);
```

**Alternatives Considered**:
- **PostgreSQL**: Rejected - overkill for local analysis tool, requires separate server
- **MongoDB**: Rejected - schemaless not beneficial here, more complex setup
- **JSON files**: Rejected - poor query performance for trend analysis

---

### 9. Trend Visualization

**Decision**: Use Chart.js for time-series trend charts

**Rationale**:
- Lightweight (< 200KB), widely adopted
- Excellent time-series support with `chartjs-adapter-date-fns`
- Responsive, accessible, works well with Vue 3

**Chart Types**:

1. **Line Chart**: Issue count over time (by severity)
2. **Stacked Bar Chart**: Issues by category over time
3. **Sparklines**: Quick trend indicators in dashboard cards

**Implementation**:
```vue
<script setup>
import { Line } from 'vue-chartjs'
import { computed } from 'vue'

const chartData = computed(() => ({
  labels: historyData.value.map(r => r.timestamp),
  datasets: [
    {
      label: 'Critical Issues',
      data: historyData.value.map(r => r.critical_count),
      borderColor: 'rgb(220, 38, 38)',
      backgroundColor: 'rgba(220, 38, 38, 0.1)'
    },
    // ... other severity levels
  ]
}))
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>
```

**Alternatives Considered**:
- **D3.js**: Rejected - too complex for simple time-series, larger bundle
- **ECharts**: Rejected - larger bundle size, less Vue 3 integration
- **ApexCharts**: Considered, but Chart.js has better Vue 3 ecosystem

---

### 10. Automated Remediation Strategy

**Decision**: Generate code patches using `recast` (AST-based code modification)

**Rationale**:
- `recast` preserves formatting and comments when modifying AST
- Generates minimal, reviewable diffs
- Safe for automated fixes that don't change logic

**Auto-Fixable Issues**:

1. **Formatting Issues** (Low risk):
   - Missing semicolons, trailing commas

2. **Configuration Fixes** (Low-Medium risk):
   - Add missing CORS settings to `vite.config.js`
   - Add missing route guards

3. **Import Path Corrections** (Medium risk):
   - Convert relative imports to shared library imports

**Implementation**:
```javascript
import { parse, print } from 'recast'
import * as babelParser from '@babel/parser'

// Parse code
const ast = parse(code, { parser: babelParser })

// Modify AST
ast.program.body.push(newImportStatement)

// Generate code (preserves original formatting)
const modifiedCode = print(ast).code
```

**Alternatives Considered**:
- **String replacement**: Rejected - fragile, breaks on formatting changes
- **jscodeshift**: Rejected - more complex API, overkill for simple fixes
- **eslint --fix**: Rejected - limited to style issues, can't handle structural changes

---

## Technology Stack Summary

| Category | Technology | Rationale |
|----------|-----------|-----------|
| Vue SFC Parsing | @vue/compiler-sfc | Official Vue 3 compiler |
| JavaScript Parsing | babel-parser | Full ES6+ support, widely adopted |
| Code Modification | recast | Preserves formatting, AST-based |
| Backend Framework | Express.js | Lightweight, familiar to team |
| Storage | SQLite + IndexedDB | Local-first, zero-config |
| Visualization | Chart.js | Lightweight, Vue 3 compatible |
| Testing | Vitest + Playwright | Matches existing stack |
| Security Scanning | npm audit + custom patterns | Native + tailored detection |

---

## Implementation Risks & Mitigation

### Risk 1: False Positives in Static Analysis

**Likelihood**: Medium
**Impact**: High (undermines trust in tool)

**Mitigation**:
- Manual validation of rules against real codebase
- Severity-based filtering (critical issues require 100% accuracy)
- User feedback mechanism to report false positives
- Iterative refinement based on usage

### Risk 2: Performance with Large Codebases

**Likelihood**: Medium
**Impact**: Medium (violates < 5 min constraint)

**Mitigation**:
- Parallel analysis of independent micro-apps
- Caching of parsed ASTs
- Incremental analysis (only changed files)
- Progress indicators in dashboard

### Risk 3: Breaking Changes in Auto-Fix

**Likelihood**: Low
**Impact**: Critical (data loss, broken code)

**Mitigation**:
- Mandatory user approval before applying fixes
- Git diff preview before applying
- Automated tests run after auto-fix
- Rollback mechanism (git reset)
- Only fix low-risk issues automatically

### Risk 4: Dependency Version Drift

**Likelihood**: Low
**Impact**: Low (analysis breaks on new Vue/Vite versions)

**Mitigation**:
- Pin parser versions in package.json
- Integration tests with multiple Vue/Vite versions
- Compatibility matrix documentation
- Graceful degradation when unsupported syntax encountered

---

## Next Steps (Phase 1)

Based on research findings, proceed to Phase 1 design:

1. **Data Model**: Define entity schemas for Architecture Issue, Recommendation, History Record
2. **API Contracts**: Define REST endpoints for analysis execution, history retrieval, auto-fix
3. **Quickstart Guide**: Document setup for development team

All research decisions are validated and ready for implementation planning.
