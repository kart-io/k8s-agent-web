# K8s Agent Web - Documentation Index

## 📚 Documentation Structure

This directory contains organized documentation for the K8s Agent Web project, a micro-frontend application built with Wujie.

### Directory Overview

```
docs/
├── architecture/      # Architecture decisions and migrations
├── components/        # Component guides and API references
├── features/          # Feature implementations and specifications
└── troubleshooting/   # Troubleshooting guides and fixes
```

---

## 🔍 Project Analysis Reports

> **最新更新**: 2025-10-11 - 完成项目结构全面分析

### Quick Reference

- **[STRUCTURE_ANALYSIS_SUMMARY.md](./STRUCTURE_ANALYSIS_SUMMARY.md)** ⭐ - **项目结构分析总结**（推荐阅读）
  - 综合评分 4.2/5.0
  - 核心问题与优化建议
  - 执行路线图与验收指标
  - 关键统计数据

### Detailed Reports

- **[PROJECT_STRUCTURE_ANALYSIS.md](./architecture/PROJECT_STRUCTURE_ANALYSIS.md)** 📊 - **完整结构分析报告**（10,000+ 字）
  - 目录结构合理性评估
  - 架构设计深度分析
  - 样式体系一致性检查
  - 依赖与引用关系分析
  - 可维护性全面评估
  - 优化方案详细设计

- **[OPTIMIZATION_ACTION_PLAN.md](./features/OPTIMIZATION_ACTION_PLAN.md)** 📋 - **优化行动计划**（可执行）
  - P1/P2/P3 优先级任务分解
  - 详细实施步骤（含代码示例）
  - 工时估算与责任分配
  - 验收标准与里程碑

### Key Findings

| 发现 | 影响 | 优先级 |
|------|------|--------|
| **样式重复导入** | 6 个微应用，冗余 1.2MB | 🔴 P1 |
| **全局样式冗余** | 每个应用 30+ 行重复代码 | 🔴 P1 |
| **开发依赖分散** | 配置不一致，版本漂移 | 🟡 P2 |
| **文档覆盖率低** | 缺少 API 文档、CHANGELOG | 🟢 P3 |
| **性能可优化** | 首屏可减少 30-50% | 🟢 P3 |

---

## 🏗️ Architecture

Documentation about system architecture, design decisions, and major migrations.

### Core Architecture

- [WUJIE_MIGRATION_COMPLETE.md](architecture/WUJIE_MIGRATION_COMPLETE.md) - Complete guide to Wujie micro-frontend architecture
- [MIGRATION_TO_WUJIE.md](architecture/MIGRATION_TO_WUJIE.md) - Step-by-step migration from qiankun to Wujie
- [ROOT_CAUSE_ANALYSIS.md](architecture/ROOT_CAUSE_ANALYSIS.md) - Analysis of previous qiankun issues

### Routing & Menu System

- [DYNAMIC_MENU_GUIDE.md](architecture/DYNAMIC_MENU_GUIDE.md) - Dynamic menu and routing system
- [SUBMENU_GUIDE.md](architecture/SUBMENU_GUIDE.md) - Submenu implementation guide
- [SUBMENU_IMPLEMENTATION.md](architecture/SUBMENU_IMPLEMENTATION.md) - Detailed submenu implementation

### Component Architecture

- [SHARED_COMPONENTS_MIGRATION.md](architecture/SHARED_COMPONENTS_MIGRATION.md) - Shared component library migration
- [WUJIE_CONSOLE_ERRORS.md](architecture/WUJIE_CONSOLE_ERRORS.md) - Wujie console error handling

### Legacy Issues

- [BOOTSTRAP_TIMEOUT_ROOT_CAUSE.md](architecture/BOOTSTRAP_TIMEOUT_ROOT_CAUSE.md) - Bootstrap timeout analysis (qiankun legacy)

---

## 🧩 Components

Component usage guides, API references, and best practices.

### UI Components

- [VXE_TABLE.md](components/VXE_TABLE.md) - Complete VXE Table guide (installation, usage, API)
- [COMPONENTS_GUIDE.md](components/COMPONENTS_GUIDE.md) - General component usage guide
- [COMPOSABLES_AND_UTILS_GUIDE.md](components/COMPOSABLES_AND_UTILS_GUIDE.md) - Composables and utilities

### Micro-App Components

- [SUB_APPS_USAGE_GUIDE.md](components/SUB_APPS_USAGE_GUIDE.md) - Micro-app integration guide
- [SUB_APPS_MOCK_GUIDE.md](components/SUB_APPS_MOCK_GUIDE.md) - Mock data setup for micro-apps
- [MOCK_GUIDE.md](components/MOCK_GUIDE.md) - General mock data guide

---

## ✨ Features

Feature specifications, implementation summaries, and enhancement documentation.

### Implemented Features

- [ERROR_BOUNDARY_IMPLEMENTATION.md](features/ERROR_BOUNDARY_IMPLEMENTATION.md) - Error boundary system
- [BUGFIX_TIMEOUT_FALSE_POSITIVE.md](features/BUGFIX_TIMEOUT_FALSE_POSITIVE.md) - Timeout false positive fix
- [IMPLEMENTATION_SUMMARY.md](features/IMPLEMENTATION_SUMMARY.md) - Overall implementation summary

### Feature Specifications

See `specs/` directory for detailed feature specifications:

- `specs/001-/` - Feature 001 specifications
- `specs/002-/` - Feature 002 specifications (Communication & State Management)
- `specs/003-/` - Feature 003 specifications (Project Structure Optimization)

---

## 🔧 Troubleshooting

Troubleshooting guides, common issues, and fixes.

### General Troubleshooting

- [TROUBLESHOOTING.md](troubleshooting/TROUBLESHOOTING.md) - General troubleshooting guide
- [QUICK_FIX_GUIDE.md](troubleshooting/QUICK_FIX_GUIDE.md) - Quick fixes for common issues

### Network & Proxy Issues

- [PROXY_ISSUE_FIX.md](troubleshooting/PROXY_ISSUE_FIX.md) - HTTP proxy configuration issues
- [IPv6_FIX.md](troubleshooting/IPv6_FIX.md) - IPv6 network issues
- [BROWSER_CACHE_ISSUE.md](troubleshooting/BROWSER_CACHE_ISSUE.md) - Browser caching problems
- [BROWSER_PROXY_FIX.md](troubleshooting/BROWSER_PROXY_FIX.md) - Browser proxy configuration

### Build & Runtime Issues

- [BOOTSTRAP_TIMEOUT_FIX.md](troubleshooting/BOOTSTRAP_TIMEOUT_FIX.md) - Bootstrap timeout fixes
- [WUJIE_ROUTER_FIX.md](troubleshooting/WUJIE_ROUTER_FIX.md) - Wujie routing issues
- [VIEW_COMPATIBILITY_FIX.md](troubleshooting/VIEW_COMPATIBILITY_FIX.md) - View compatibility issues
- [TABLE_DATA_FIX_COMPLETE.md](troubleshooting/TABLE_DATA_FIX_COMPLETE.md) - Table data loading fixes
- [MOCK_DATA_FIX_SUMMARY.md](troubleshooting/MOCK_DATA_FIX_SUMMARY.md) - Mock data issues
- [IMPORTANT_RESTART_REQUIRED.md](troubleshooting/IMPORTANT_RESTART_REQUIRED.md) - Restart requirements

---

## 📖 Root-Level Documentation

Quick reference guides available in the project root:

### Getting Started

- [QUICK_START.md](../QUICK_START.md) - Quick start guide for new developers
- [START_GUIDE.md](../START_GUIDE.md) - Detailed startup guide
- [MAKEFILE_GUIDE.md](../MAKEFILE_GUIDE.md) - Makefile command reference
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - Quick reference for common tasks
- [QUICKSTART.md](../QUICKSTART.md) - Alternative quickstart guide

### Testing

- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - Testing guide and best practices
- [TEST_CHECKLIST.md](../TEST_CHECKLIST.md) - Testing checklist
- [TEST_RESULTS.md](../TEST_RESULTS.md) - Latest test results
- [TEST_RESULTS_TEMPLATE.md](../TEST_RESULTS_TEMPLATE.md) - Test results template

### Project Configuration

- [CLAUDE.md](../CLAUDE.md) - Claude Code AI assistant instructions
- `specs/` - Feature specifications and implementation plans

---

## 🔍 Finding Documentation

### By Topic

| Topic | Location |
|-------|----------|
| Architecture & Design | `docs/architecture/` |
| Component Usage | `docs/components/` |
| Feature Specifications | `specs/` |
| Troubleshooting | `docs/troubleshooting/` |
| Quick Start | Root directory |
| Testing | Root directory |

### By Role

**For New Developers:**

1. Start with [QUICK_START.md](../QUICK_START.md)
2. Read [WUJIE_MIGRATION_COMPLETE.md](architecture/WUJIE_MIGRATION_COMPLETE.md)
3. Review [COMPONENTS_GUIDE.md](components/COMPONENTS_GUIDE.md)

**For Feature Development:**

1. Check `specs/` for existing feature specifications
2. Review [DYNAMIC_MENU_GUIDE.md](architecture/DYNAMIC_MENU_GUIDE.md)
3. Consult [VXE_TABLE.md](components/VXE_TABLE.md) for table components

**For Troubleshooting:**

1. Start with [TROUBLESHOOTING.md](troubleshooting/TROUBLESHOOTING.md)
2. Check [QUICK_FIX_GUIDE.md](troubleshooting/QUICK_FIX_GUIDE.md)
3. Search for specific error messages in `docs/troubleshooting/`

---

## 📝 Documentation Standards

All documentation in this project follows these standards:

- ✅ Written in Markdown format
- ✅ Complies with MarkdownLint rules
- ✅ Includes code examples with syntax highlighting
- ✅ Uses clear headings and structure
- ✅ Contains practical examples and use cases
- ✅ Links to related documentation

---

## 🤝 Contributing to Documentation

When adding new documentation:

1. **Choose the correct directory:**
   - Architecture decisions → `docs/architecture/`
   - Component guides → `docs/components/`
   - Feature specs → `specs/XXX-/`
   - Troubleshooting → `docs/troubleshooting/`

2. **Follow naming conventions:**
   - Use UPPERCASE_WITH_UNDERSCORES.md for guides
   - Use lowercase-with-dashes.md for specs

3. **Update this index:**
   - Add your new document to the appropriate section above
   - Include a brief description

4. **Link related docs:**
   - Add cross-references to related documentation
   - Update `CLAUDE.md` if adding project-wide instructions

---

## 📞 Getting Help

- **General questions:** Check [TROUBLESHOOTING.md](troubleshooting/TROUBLESHOOTING.md)
- **Setup issues:** See [QUICK_START.md](../QUICK_START.md)
- **Component usage:** Refer to `docs/components/`
- **Architecture questions:** Read `docs/architecture/`

For additional help, consult the [CLAUDE.md](../CLAUDE.md) file for AI assistant instructions.
