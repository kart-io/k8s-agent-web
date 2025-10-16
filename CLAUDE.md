# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Vue Vben Admin**, a Vue 3-based admin template following a **Monorepo** architecture using pnpm workspace and Turbo. The project is customized for a Kubernetes management application (web-k8s) and includes multiple UI framework variations.

## Technology Stack

- **Core**: Vue 3.5+, TypeScript 5.8+, Vite 7+
- **Build Tools**: Turbo (build orchestration), pnpm workspace
- **UI Frameworks**: Ant Design Vue (primary), Element Plus, Naive UI
- **State Management**: Pinia
- **Routing**: Vue Router
- **Testing**: Vitest (unit), Playwright (e2e)
- **Code Quality**: ESLint, Stylelint, Prettier, Commitlint, Lefthook

## Monorepo Structure

```text
apps/                       # Applications
├── web-k8s/               # Kubernetes management app (primary focus)
├── web-antd/              # Ant Design version
├── web-auth/              # Auth center
├── web-ele/               # Element Plus version
├── web-naive/             # Naive UI version
└── backend-mock/          # Mock API server (Nitro)

packages/                  # Shared packages
├── @core/                 # Core framework modules
│   ├── base/             # Base modules (icons, shared, design, typings)
│   ├── composables/      # Vue composables
│   ├── preferences/      # User preferences
│   └── ui-kit/           # UI component library
├── effects/              # Effect utilities
├── locales/              # i18n resources
├── stores/               # Shared Pinia stores
├── utils/                # Utility functions
└── [others]/             # constants, icons, styles, types

internal/                  # Internal tooling
├── lint-configs/         # ESLint, Prettier, Stylelint configs
├── node-utils/           # Node.js utilities
├── tailwind-config/      # Tailwind CSS config
├── tsconfig/             # TypeScript configs
└── vite-config/          # Vite configuration utilities

scripts/                   # Build and automation scripts
docs/                      # VitePress documentation
```

## Key Commands

### Development

```bash
# Development servers
pnpm dev                   # Interactive app selector
pnpm dev:k8s              # K8s app (http://localhost:5667)
pnpm dev:antd             # Ant Design version
pnpm dev:auth             # Auth center (http://localhost:5665)
pnpm dev:docs             # Documentation site

# Or use Makefile shortcuts
make dev-k8s              # Start K8s app
make dev                  # Interactive selector
```

### Build

```bash
pnpm build                # Build all apps
pnpm build:k8s           # Build K8s app only
pnpm build:analyze       # Build with bundle analysis

# Makefile
make build-k8s           # Build K8s app
make analyze             # Analyze bundle size
```

### Testing

```bash
# Unit tests (Vitest)
pnpm test:unit           # Run all unit tests
pnpm test:unit --ui      # Run with UI mode

# E2E tests (Playwright)
pnpm test:e2e            # Run all e2e tests

# Makefile shortcuts
make test-unit           # Unit tests
make test-e2e            # E2E tests
make test-coverage       # Generate coverage report
```

### Code Quality

```bash
pnpm lint                # ESLint check
pnpm format              # Format with Prettier
pnpm check:type          # TypeScript type checking
pnpm check               # Run all checks (circular deps, deps, type, cspell)

# Makefile shortcuts
make lint                # Run lint
make lint-fix            # Auto-fix issues
make format              # Format code
make type-check          # Type checking
make quality             # All quality checks
```

### Dependency Management

```bash
pnpm install             # Install dependencies
pnpm reinstall           # Clean install (removes lock)
pnpm update:deps         # Update dependencies

# Makefile
make install             # Install deps
make install-clean       # Clean and reinstall
```

## App-Specific Information

### web-k8s (Kubernetes Management)

- **Port**: 5667
- **Entry**: `apps/web-k8s/src/main.ts`
- **Router**: `apps/web-k8s/src/router/`
- **API**: `apps/web-k8s/src/api/`
  - `core/` - Core API services
  - `k8s/` - Kubernetes-specific APIs
- **Views**: `apps/web-k8s/src/views/`
- **API Proxy**: `/api` → `http://localhost:5320/api` (configured in vite.config.mts)
- **Special Dependencies**: `js-yaml` for YAML parsing

### backend-mock

- **Start**: `pnpm -F @vben/backend-mock run start`
- **Build**: `pnpm -F @vben/backend-mock run build`
- **Framework**: Nitropack
- **Purpose**: Provides mock API endpoints for development

## Architecture Patterns

### Package Import Aliases

Applications use workspace packages via `@vben/*` imports:

- `@vben/access` - Permission/access control
- `@vben/common-ui` - Common UI components
- `@vben/hooks` - Vue composition hooks
- `@vben/layouts` - Layout components
- `@vben/request` - HTTP request utilities
- `@vben/stores` - Pinia stores
- `@vben/utils` - Utility functions

Core packages use `@vben-core/*`:

- `@vben-core/shared` - Shared utilities (cache, constants, store, utils)
- `@vben-core/composables` - Core composables
- `@vben-core/icons` - Icon components

### Path Imports in web-k8s

The web-k8s app uses `#/*` imports mapping to `src/*`:

```typescript
import { foo } from '#/utils/bar'  // → apps/web-k8s/src/utils/bar
```

### Shared Configuration

- **Vite Config**: Uses `@vben/vite-config` from internal/vite-config
- **TypeScript**: Extends from `@vben/tsconfig`
- **Tailwind**: Uses `@vben/tailwind-config`
- **Catalog Dependencies**: Centralized version management in `pnpm-workspace.yaml`

## Git Workflow

### Commit Convention

Follow Angular/Vue commit convention:

- `feat`: New features
- `fix`: Bug fixes
- `perf`: Performance improvements
- `refactor`: Code refactoring
- `style`: Code style changes (formatting, no logic change)
- `test`: Test additions or updates
- `docs`: Documentation changes
- `chore`: Build process, dependency updates
- `ci`: CI/CD changes
- `types`: Type definition changes
- `revert`: Revert previous commits

**Format**: `<type>(<scope>): <description>`

Examples:

- `feat(web-k8s): add pod list view`
- `fix(api): correct authentication token handling`
- `refactor(stores): simplify user state management`

### Pre-commit Hooks

Lefthook is configured to run on pre-commit:

- **Markdown files**: Prettier formatting
- **Vue files**: Prettier → ESLint → Stylelint
- **JS/TS files**: Prettier → ESLint
- **CSS/SCSS files**: Prettier → Stylelint
- **JSON files**: Prettier formatting

Hooks auto-fix and stage changes. Commit messages are validated via commitlint.

## Build System

### Turbo Configuration

The project uses Turbo for build orchestration with dependency-based task execution:

- **build**: Depends on upstream packages being built first
- **dev**: No cache, persistent process
- **typecheck**: Type validation across workspace
- **test:e2e**: E2E test execution

### Global Dependencies

Turbo watches these for cache invalidation:

- `pnpm-lock.yaml`
- All `tsconfig*.json` files
- Internal config packages (`node-utils`, `tailwind-config`, `vite-config`)
- `.env.*local` files

## Testing Guidelines

### Unit Tests (Vitest)

- **Location**: Co-located with source files or in `__tests__/` directories
- **Pattern**: `*.{test,spec}.{js,ts,jsx,tsx}`
- **Environment**: jsdom
- **Coverage Threshold**: 60% (statements, branches, functions, lines)
- **Setup**: `test/setup.ts` for global test configuration

Run specific test file:

```bash
pnpm vitest run path/to/file.test.ts
```

### E2E Tests (Playwright)

- **Configuration**: Individual apps have `playwright.config.ts`
- **Run**: `pnpm test:e2e` (runs all apps)
- **UI Mode**: `make test-e2e-ui`

## Development Requirements

- **Node.js**: >= 20.10.0
- **pnpm**: >= 9.12.0 (packageManager: pnpm@10.14.0)
- **Browser**: Chrome 80+ recommended for development

## Common Workflows

### Adding a New Feature to web-k8s

1. Create feature branch: `git checkout -b feat/feature-name`
2. Develop with hot reload: `pnpm dev:k8s`
3. Add/update tests as needed
4. Check quality: `make quality`
5. Commit with proper convention
6. Create PR to `main` branch

### Working with Shared Packages

When modifying packages in `packages/@core/` or `packages/`:

1. Changes are automatically rebuilt via `pnpm -r run stub --if-present` (postinstall)
2. Dependent apps will hot-reload
3. Run `pnpm build` to ensure production builds work

### Debugging Build Issues

1. Check Turbo cache: `rm -rf .turbo`
2. Clean build artifacts: `make clean`
3. Reinstall deps: `make install-clean`
4. Check type errors: `make type-check`
5. Verify circular dependencies: `pnpm check:circular`

## Additional Resources

- **Documentation**: <https://doc.vben.pro/>
- **Repository**: <https://github.com/vbenjs/vue-vben-admin>
- **Main Branch**: `main` (use for PRs)
- **Makefile Help**: `make help` (comprehensive command reference)
