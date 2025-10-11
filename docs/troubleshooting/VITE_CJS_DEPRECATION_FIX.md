# Vite CJS Node API 废弃警告修复

## 问题描述

启动应用时出现以下警告：

```text
The CJS build of Vite's Node API is deprecated.
See https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.
```

## 原因分析

从 Vite 5.x 开始，CommonJS (CJS) 格式的 Node API 被废弃，推荐使用 ESM (ES Modules) 格式。

当 package.json 中缺少 `"type": "module"` 声明时，Node.js 默认将 `.js` 文件视为 CommonJS 模块，导致 Vite 使用 CJS 构建版本。

## 解决方案

### 1. 在所有应用的 package.json 中添加 `"type": "module"`

已为以下应用添加 `"type": "module"` 配置：

- `main-app/package.json` ✅
- `dashboard-app/package.json` ✅
- `agent-app/package.json` ✅
- `cluster-app/package.json` ✅
- `monitor-app/package.json` ✅
- `system-app/package.json` ✅
- `image-build-app/package.json` ✅
- `shared/package.json` ✅ (已存在)

### 2. 配置示例

```json
{
  "name": "dashboard-app",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite --port 3001 --strictPort",
    "build": "vite build"
  }
}
```

### 3. 确保代码使用 ESM 语法

所有代码已验证使用 ESM 导入语法：

```javascript
// ✅ 正确 - ESM
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// ❌ 错误 - CJS (项目中未发现)
const vite = require('vite')
const vue = require('@vitejs/plugin-vue')
```

## 修复效果

**修复前**：

```text
[dashboard] The CJS build of Vite's Node API is deprecated.
[agent] The CJS build of Vite's Node API is deprecated.
[cluster] The CJS build of Vite's Node API is deprecated.
...
```

**修复后**：

```text
VITE v5.0.4  ready in 236 ms

➜  Local:   http://localhost:3000/
```

警告已完全消失。

## 注意事项

### ESM vs CommonJS

设置 `"type": "module"` 后：

- ✅ `.js` 文件被视为 ES 模块
- ✅ 必须使用 `import/export` 语法
- ✅ 需要使用 `import.meta.url` 而非 `__dirname`
- ❌ 不能使用 `require()` / `module.exports`

### 获取 __dirname (ESM 方式)

```javascript
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

## 相关资源

- [Vite Troubleshooting - CJS Node API Deprecated](https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [package.json "type" field](https://nodejs.org/api/packages.html#type)

## 修复日期

2025-10-11

## 修复人员

Claude Code Assistant
