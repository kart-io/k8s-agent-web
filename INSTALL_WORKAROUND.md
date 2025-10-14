# 依赖安装问题解决方案

## 问题描述

在 macOS 上使用 pnpm 10.14.0 + Node.js v24.4.1 安装依赖时遇到 `FATAL ERROR: invalid array length Allocation failed - JavaScript heap out of memory` 错误。

这是 pnpm 10.x 版本的已知 bug，特别是在大型 monorepo 项目中处理 lockfile 时会触发内存泄漏。

## 已修复的样式加载问题 ✅

在 `apps/web-auth/src/bootstrap.ts:6` 中添加了 Ant Design Vue 的样式导入：

```typescript
import 'ant-design-vue/dist/reset.css';
```

这修复了登录界面 Ant Design 组件样式缺失的问题。

## 依赖安装解决方案（按推荐顺序）

### 🔥 方案 1: 降级 pnpm 版本（最推荐）

pnpm 10.14.0 存在内存泄漏问题，降级到稳定版本：

```bash
# 1. 全局安装 pnpm 9.x（稳定版本）
npm install -g pnpm@9

# 2. 验证版本
pnpm --version  # 应显示 9.x.x

# 3. 清理并重新安装
rm -rf node_modules
pnpm install
```

### 方案 2: 使用 Node.js LTS 版本

当前使用 Node.js v24.4.1（非 LTS），切换到 LTS：

```bash
# 使用 nvm 切换到 LTS (v20.x)
nvm install 20
nvm use 20

# 验证版本
node --version  # 应显示 v20.x.x

# 重新安装
pnpm install
```

### 方案 3: 临时使用 npm（快速测试）

如果只是想快速测试样式修复：

```bash
# 1. 备份 pnpm-lock.yaml
mv pnpm-lock.yaml pnpm-lock.yaml.bak

# 2. 使用 npm 安装
npm install --legacy-peer-deps

# 3. 启动开发服务器
npm run dev:auth
```

**注意**: 使用 npm 后需要在提交代码前恢复 pnpm-lock.yaml

### 方案 4: 分批安装依赖

```bash
# 先安装根依赖
pnpm install --ignore-workspace

# 再逐个安装工作区
pnpm install --filter @vben/web-auth --filter @vben/styles --filter @vben/common-ui
```

### 方案 5: 在服务器/CI 环境安装

如果本地安装持续失败，可以：

1. 在内存更大的服务器上安装依赖
2. 将整个 `node_modules` 目录打包
3. 在本地解压使用

## 启动开发服务器

依赖安装成功后：

```bash
# 启动 web-auth 应用
make dev-auth
# 或
pnpm dev:auth
```

## 验证修复

启动后访问登录页面，检查：

1. Ant Design 组件是否有正确的样式
2. 浏览器控制台是否有 CSS 加载错误
3. 表单、按钮等组件是否正常显示
