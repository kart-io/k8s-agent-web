# Mock 数据开发指南

## 📖 概述

为了方便前端开发，系统提供了 Mock 数据功能，可以在不依赖后端服务的情况下进行前端开发和调试。

**✅ 所有应用已支持 Mock 数据**：
- ✅ main-app（主应用） - 用户、菜单
- ✅ dashboard-app - 统计、事件、集群状态
- ✅ agent-app - Agent、事件、命令
- ✅ cluster-app - 集群、节点、命名空间
- ✅ monitor-app - 指标、告警、日志
- ✅ system-app - 用户、角色、权限

> 💡 **子应用 Mock 详细说明**: 查看 [子应用 Mock 配置指南](SUB_APPS_MOCK_GUIDE.md)

## 🔧 配置说明

### 环境变量配置

在 `main-app/.env.development` 中配置：

```bash
# 是否使用 Mock 数据
VITE_USE_MOCK=true

# Mock 延迟时间（毫秒，模拟网络延迟）
VITE_MOCK_DELAY=500
```

### 切换 Mock 模式

#### 方式 1: 修改环境变量（推荐）

**启用 Mock 模式**：
```bash
# 编辑 .env.development
VITE_USE_MOCK=true
```

**关闭 Mock 模式**（使用真实接口）：
```bash
# 编辑 .env.development
VITE_USE_MOCK=false
```

#### 方式 2: 修改环境文件

复制 `.env.example` 创建自己的环境配置：
```bash
cd main-app/
cp .env.example .env.development.local
# 编辑 .env.development.local
```

### 配置优先级

```
.env.development.local  (最高优先级，不会提交到 git)
     ↓
.env.development        (开发环境默认配置)
     ↓
.env                    (所有环境的默认配置)
```

## 🎭 Mock 数据说明

### 测试账号

系统提供了 3 个测试账号，用于测试不同权限场景：

| 用户名 | 密码 | 角色 | 权限说明 |
|--------|------|------|----------|
| admin | admin123 | 管理员 | 拥有所有菜单权限 |
| user | user123 | 普通用户 | 只有仪表盘和 Agent 管理权限 |
| guest | guest123 | 访客 | 无任何菜单权限（用于测试无权限场景） |

### admin 账号菜单

```javascript
[
  { key: '/dashboard', label: '仪表盘', icon: 'DashboardOutlined' },
  { key: '/agents', label: 'Agent 管理', icon: 'ClusterOutlined' },
  { key: '/clusters', label: '集群管理', icon: 'DeploymentUnitOutlined' },
  { key: '/monitor', label: '监控管理', icon: 'MonitorOutlined' },
  {
    key: '/system',
    label: '系统管理',
    icon: 'SettingOutlined',
    children: [
      { key: '/system/users', label: '用户管理', icon: 'UserOutlined' },
      { key: '/system/roles', label: '角色管理', icon: 'TeamOutlined' },
      { key: '/system/permissions', label: '权限管理', icon: 'SafetyOutlined' }
    ]
  }
]
```

### user 账号菜单

```javascript
[
  { key: '/dashboard', label: '仪表盘', icon: 'DashboardOutlined' },
  { key: '/agents', label: 'Agent 管理', icon: 'ClusterOutlined' }
]
```

### guest 账号菜单

```javascript
[]  // 空数组，用于测试无权限场景
```

## 🚀 使用示例

### 1. 开发时使用 Mock 数据

```bash
# 1. 确保 Mock 已启用
cd main-app/
cat .env.development
# 确认 VITE_USE_MOCK=true

# 2. 启动开发服务器
cd ../
pnpm dev

# 3. 打开浏览器
# http://localhost:3000

# 4. 使用测试账号登录
# 用户名: admin
# 密码: admin123
```

### 2. 测试不同权限场景

```bash
# 测试完整权限
用户名: admin
密码: admin123
预期: 显示所有菜单

# 测试部分权限
用户名: user
密码: user123
预期: 只显示仪表盘和 Agent 管理

# 测试无权限
用户名: guest
密码: guest123
预期: 显示空菜单或无权限提示
```

### 3. 切换到真实接口

```bash
# 1. 修改环境变量
vim main-app/.env.development
# 将 VITE_USE_MOCK=true 改为 VITE_USE_MOCK=false

# 2. 重启开发服务器（必须）
Ctrl+C  # 停止当前服务
pnpm dev  # 重新启动

# 3. 确保后端服务已启动
# - Gateway Service (端口 8080)
# - Auth Service (端口 8090)

# 4. 使用真实账号登录
```

## 📝 Mock 数据结构

### 登录接口返回格式

```javascript
{
  token: 'mock-token-admin-1234567890',
  user: {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    email: 'admin@example.com',
    roles: ['admin']
  },
  permissions: ['*']
}
```

### 菜单接口返回格式

```javascript
[
  {
    key: '/dashboard',        // 路由路径（必填）
    label: '仪表盘',           // 菜单显示名称（必填）
    icon: 'DashboardOutlined', // 图标名称（可选）
    children: [                // 子菜单（可选）
      {
        key: '/dashboard/detail',
        label: '详情',
        icon: 'FileOutlined'
      }
    ]
  }
]
```

## 🛠️ 扩展 Mock 数据

### 添加新的测试账号

编辑 `main-app/src/mock/index.js`：

```javascript
const mockData = {
  users: {
    // 现有账号...

    // 添加新账号
    developer: {
      username: 'developer',
      password: 'dev123',
      token: 'mock-token-developer-' + Date.now(),
      avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
      user: {
        id: 4,
        username: 'developer',
        nickname: '开发者',
        email: 'dev@example.com',
        roles: ['developer']
      },
      permissions: ['dashboard:view', 'agents:*', 'clusters:view'],
      menus: [
        { key: '/dashboard', label: '仪表盘', icon: 'DashboardOutlined' },
        { key: '/agents', label: 'Agent 管理', icon: 'ClusterOutlined' },
        { key: '/clusters', label: '集群管理', icon: 'DeploymentUnitOutlined' }
      ]
    }
  }
}
```

### 添加新的 Mock 接口

编辑 `main-app/src/mock/index.js`，在 `mockApi` 中添加：

```javascript
export const mockApi = {
  // 现有接口...

  // 添加新接口
  async getAgentList() {
    await delay(import.meta.env.VITE_MOCK_DELAY || 500)

    return [
      { id: 1, name: 'agent-1', status: 'online' },
      { id: 2, name: 'agent-2', status: 'offline' }
    ]
  }
}
```

在对应的 API 文件中使用：

```javascript
// src/api/agent.js
import request from './request'
import { mockApi, isMockEnabled } from '@/mock'

export function getAgentList() {
  if (isMockEnabled()) {
    return mockApi.getAgentList()
  }

  return request({
    url: '/agents',
    method: 'get'
  })
}
```

## ⚠️ 注意事项

### 1. 环境变量修改后需要重启

```bash
# 修改 .env.development 后
Ctrl+C  # 停止服务
pnpm dev  # 重新启动
```

**原因**: Vite 在启动时读取环境变量，运行时不会重新读取。

### 2. Mock 数据仅在前端

- Mock 数据完全在前端模拟
- 不会发送任何网络请求
- 适合前端独立开发

### 3. 生产环境强制关闭 Mock

在 `.env.production` 中：
```bash
VITE_USE_MOCK=false  # 生产环境强制关闭
```

### 4. localStorage 存储

- Mock 模式下，token 和菜单同样存储在 localStorage
- 刷新页面不会丢失登录状态
- 可以在浏览器控制台查看：
  ```javascript
  localStorage.getItem('token')
  localStorage.getItem('menus')
  ```

### 5. 开发调试

打开浏览器控制台，可以看到 Mock 状态提示：

**Mock 启用时**：
```
🎭 Mock 数据已启用
可用的测试账号:
┌─────────┬──────────┬──────────┬────────────────────────┐
│ 用户名  │ 密码     │ 说明                        │
├─────────┼──────────┼────────────────────────────┤
│ admin   │ admin123 │ 管理员（所有权限）          │
│ user    │ user123  │ 普通用户（部分权限）        │
│ guest   │ guest123 │ 访客（无菜单权限）          │
└─────────┴──────────┴────────────────────────────┘
在 .env.development 中设置 VITE_USE_MOCK=false 可关闭 Mock
```

**Mock 关闭时**：
```
🌐 使用真实接口
```

## 🧪 测试场景

### 场景 1: 前端独立开发

```bash
# 不需要后端服务
VITE_USE_MOCK=true
```

**优点**：
- 无需启动后端
- 响应速度快
- 可以模拟各种场景

### 场景 2: 前后端联调

```bash
# 使用真实后端接口
VITE_USE_MOCK=false
```

**前提**：
- Gateway Service 已启动（端口 8080）
- Auth Service 已启动（端口 8090）

### 场景 3: 权限测试

```bash
# 使用 Mock 模式快速测试不同权限
VITE_USE_MOCK=true

# 分别使用 admin、user、guest 账号登录
# 验证菜单显示是否正确
```

## 📚 相关文档

- [动态菜单指南](DYNAMIC_MENU_GUIDE.md) - 菜单配置说明
- [快速启动指南](START_GUIDE.md) - 应用启动说明
- [严重问题修复](main-app/CRITICAL_FIXES.md) - 菜单逻辑修复

## 🔗 API 对照表

| 功能 | Mock 函数 | 真实接口 |
|------|-----------|----------|
| 登录 | mockApi.login() | POST /auth/login |
| 登出 | Promise.resolve() | POST /auth/logout |
| 获取用户信息 | mockApi.getUserInfo() | GET /auth/me |
| 获取菜单 | mockApi.getUserMenus() | GET /auth/menus |

## ✅ 快速检查清单

开始开发前的检查：

- [ ] 确认 `.env.development` 文件存在
- [ ] 确认 `VITE_USE_MOCK` 配置正确
- [ ] 启动应用后查看控制台 Mock 状态
- [ ] 使用测试账号验证登录功能
- [ ] 验证菜单显示是否符合预期

---

**提示**: 开发时推荐使用 Mock 模式（`VITE_USE_MOCK=true`），提测前切换到真实接口（`VITE_USE_MOCK=false`）进行联调验证。
