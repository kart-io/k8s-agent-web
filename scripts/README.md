# 架构优化脚本使用指南

## 概述

本目录包含用于项目架构优化的自动化脚本。这些脚本遵循**单一职责原则**，每个脚本只负责一个特定功能。

## 脚本列表

### 1. audit-apps.mjs
**职责**: 审计应用目录状态
- 检查每个 *-app 目录的内容
- 判断是否需要迁移、删除或跳过
- 生成审计报告

**使用方法**:
```bash
node scripts/audit-apps.mjs
```

**输出**:
- 控制台显示审计结果
- 生成 `audit-report.json` 文件

### 2. migrate-apps.mjs
**职责**: 物理迁移应用目录
- 将指定目录迁移到 apps/ 下
- 使用 git mv 保留历史记录
- 不修改任何文件内容

**使用方法**:
```bash
node scripts/migrate-apps.mjs
```

**注意**: 会提示确认，输入 y 执行迁移

### 3. update-workspace.mjs
**职责**: 更新配置文件
- 更新 pnpm-workspace.yaml
- 更新应用的 package.json（如果需要）
- 移除旧路径引用

**使用方法**:
```bash
node scripts/update-workspace.mjs
```

### 4. cleanup-dirs.mjs
**职责**: 清理空目录
- 删除只包含 node_modules 的目录
- 删除完全空的目录
- 支持 git rm 和普通删除

**使用方法**:
```bash
node scripts/cleanup-dirs.mjs
```

**注意**: 会提示确认，输入 y 执行删除

### 5. orchestrate-migration.mjs
**职责**: 编排完整流程
- 自动按顺序执行所有步骤
- 提供进度反馈
- 生成执行总结

**使用方法**:
```bash
node scripts/orchestrate-migration.mjs
```

## 执行流程

### 方案 A: 自动化执行（推荐）

运行编排脚本，自动完成所有步骤：

```bash
node scripts/orchestrate-migration.mjs
```

这将自动执行：
1. 审计目录
2. 迁移应用
3. 更新配置
4. 清理目录

### 方案 B: 手动分步执行

如果需要更细粒度的控制，可以分步执行：

```bash
# 1. 先审计，了解现状
node scripts/audit-apps.mjs

# 2. 执行迁移（当前只有 image-build-app 需要迁移）
node scripts/migrate-apps.mjs

# 3. 更新配置文件
node scripts/update-workspace.mjs

# 4. 清理空目录
node scripts/cleanup-dirs.mjs
```

## 当前状态

基于最新审计结果：

| 目录 | 状态 | 处理方案 |
|------|------|----------|
| image-build-app | 包含 src/ | **需要迁移**到 apps/image-build |
| agent-app | 仅 node_modules | 需要删除 |
| dashboard-app | 仅 node_modules | 需要删除 |
| cluster-app | 仅 node_modules | 需要删除 |
| monitor-app | 仅 node_modules | 需要删除 |
| main-app | dist + node_modules | 暂时跳过 |
| system-app | dist + node_modules | 暂时跳过 |
| shared | 仅 node_modules | 需要删除 |

## 验证步骤

执行完成后，运行以下命令验证：

```bash
# 1. 刷新依赖
pnpm install

# 2. 验证构建
pnpm build

# 3. 运行测试
pnpm test:unit

# 4. 检查目录结构
ls -la apps/
ls -la *.app 2>/dev/null  # 应该没有输出
```

## 注意事项

1. **备份**: 执行前已创建备份分支 `backup/pre-architecture-optimization-*`
2. **Git 历史**: 使用 git mv 确保历史记录保留
3. **可逆性**: 如需回滚，可以从备份分支恢复
4. **测试**: 每次更改后都应验证构建

## 故障排除

### 问题：脚本执行权限错误
```bash
chmod +x scripts/*.mjs
```

### 问题：迁移失败
检查目标目录是否已存在：
```bash
ls -la apps/
```

### 问题：配置更新失败
手动检查 pnpm-workspace.yaml：
```bash
cat pnpm-workspace.yaml | grep -E "app"
```

## 后续工作

迁移完成后，可能需要：

1. **代码重构**: 将迁移的应用重构为 Vben Admin 标准结构
2. **更新文档**: 更新项目文档反映新结构
3. **CI/CD 更新**: 如有必要，更新 CI/CD 配置