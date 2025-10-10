# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Feature 003: Project Structure Optimization

#### Documentation Reorganization
- Created `docs/` directory with organized structure:
  - `docs/architecture/` - 9 architecture documents
  - `docs/components/` - 6 component guides
  - `docs/features/` - 3 feature implementations
  - `docs/troubleshooting/` - 12 troubleshooting guides
- Created comprehensive `docs/README.md` documentation index
- Consolidated 5 VXE Table documentation files into single guide
- Updated `CLAUDE.md` with new documentation references

#### API Configuration Unification
- Created unified API configuration in `shared/src/config/api.config.js`
- Implemented environment-aware configuration (dev/test/prod)
- Added comprehensive error handling (401/403/404/5xx)
- Migrated all 7 applications to use unified configuration
- Added 30+ unit tests for API configuration
- Reduced ~200 lines of duplicate code

#### Dependency Standardization
- Upgraded all apps to Vite 5.0.4 (from mixed 4.4.9/4.5.0/5.0.4)
- Standardized Ant Design Vue to 4.0.7 across all apps
- Added pnpm.overrides to lock critical dependency versions:
  - vite: 5.0.4
  - vue: 3.3.4
  - ant-design-vue: 4.0.7
  - vue-router: 4.2.5
  - pinia: 2.1.7
  - axios: 1.6.2
- Configured pnpm dependency hoisting via `.npmrc`

#### Style Variable System
- Created shared SCSS variable system with 15+ categories:
  - Color system, Layout & spacing, Typography, Shadows, etc.
- Created 30+ reusable SCSS mixins:
  - Layout, Typography, Visual effects, Responsive, Components
- Created global styles with 50+ utility classes
- Exported styles from shared library for application use

### Changed

- Updated all 7 application package.json files with consistent versions
- Updated CLAUDE.md documentation structure section
- Updated shared library package.json with new exports

### Performance

- Vite 5.0.4 provides faster build times across all apps
- Unified API configuration reduces bundle size
- Shared styles eliminate duplicate CSS

## [1.0.0] - 2025-10-10

### Added - Feature 002: Communication & State Optimization

- Centralized micro-app configuration system
- Standardized route synchronization via RouteSync class
- Cross-app shared state management
- Error boundaries for all micro-apps
- Optimized shared library build (ESM format)

### Added - Feature 001: Initial Setup

- Wujie micro-frontend architecture
- 1 main app + 6 micro-apps setup
- Shared component library
- Dynamic routing system
- Mock data system
- VXE Table integration

[Unreleased]: https://github.com/your-org/k8s-agent-web/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/k8s-agent-web/releases/tag/v1.0.0
