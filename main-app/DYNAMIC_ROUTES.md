# 动态路由实现说明

## 概述

实现了基于接口下发的动态路由系统，路由与菜单配置统一管理，支持后端控制前端路由和菜单显示。

## 核心改进

### 1. 统一数据结构

菜单接口返回的数据同时包含菜单和路由信息：

```javascript
{
  key: '/agents',           // 菜单唯一标识
  path: '/agents',          // 路由路径
  name: 'agents',           // 路由名称
  label: 'Agent 管理',      // 菜单显示名称
  icon: 'ClusterOutlined',  // 菜单图标
  component: 'MicroAppPlaceholder', // 组件类型
  meta: {                   // 路由元信息
    requiresAuth: true,
    title: 'Agent 管理'
  },
  children: []              // 子菜单/子路由
}
```

### 2. 动态路由注册

- **基础路由**：仅保留登录页和主布局的静态路由
- **业务路由**：登录后根据接口数据动态注册
- **路由清理**：登出时自动清理已注册的动态路由

### 3. 文件结构

```
src/
├── router/
│   ├── index.js      # 基础路由配置
│   └── dynamic.js    # 动态路由工具（新增）
├── store/
│   └── user.js       # 用户状态，处理路由注册
└── mock/
    └── index.js      # Mock 数据，返回包含路由信息的菜单
```

## 核心功能

### router/dynamic.js

提供动态路由注册相关工具函数：

1. **menusToRoutes(menus)**
   - 将菜单配置转换为路由配置
   - 自动处理微前端路由的通配符匹配
   - 支持嵌套子路由

2. **registerDynamicRoutes(router, menus, parentName)**
   - 动态注册路由到 Vue Router
   - 支持添加到指定父路由

3. **removeDynamicRoutes(router, routeNames)**
   - 清除已注册的动态路由

4. **extractRouteNames(menus)**
   - 提取所有路由名称，用于清理

### user store 改进

1. **fetchMenus()**
   - 获取菜单数据后自动调用 `registerRoutes()`

2. **registerRoutes()**
   - 注册动态路由到 MainLayout 的子路由
   - 保存路由名称用于后续清理

3. **logout()**
   - 登出时自动清除动态路由

## 使用说明

### 后端接口格式

`GET /auth/menus` 应返回：

```json
[
  {
    "key": "/dashboard",
    "path": "/dashboard",
    "name": "dashboard",
    "label": "仪表盘",
    "icon": "DashboardOutlined",
    "component": "MicroAppPlaceholder",
    "meta": {
      "requiresAuth": true,
      "title": "仪表盘"
    }
  },
  {
    "key": "/system",
    "path": "/system",
    "name": "system",
    "label": "系统管理",
    "icon": "SettingOutlined",
    "component": "SubMenu",
    "meta": {
      "requiresAuth": true,
      "title": "系统管理"
    },
    "children": [
      {
        "key": "/system/users",
        "path": "/system/users",
        "name": "system-users",
        "label": "用户管理",
        "icon": "UserOutlined",
        "component": "MicroAppPlaceholder",
        "meta": {
          "requiresAuth": true,
          "title": "用户管理"
        }
      }
    ]
  }
]
```

### 组件类型说明

- **MicroAppPlaceholder**：微前端占位组件，用于 qiankun 子应用
- **SubMenu**：有子菜单的父级菜单，不需要组件

## 优势

1. ✅ **后端完全控制**：路由和菜单由后端接口统一下发
2. ✅ **动态权限**：不同用户看到不同的菜单和路由
3. ✅ **无需修改代码**：新增/删除功能模块无需修改前端代码
4. ✅ **安全可靠**：登出时自动清理路由，防止权限泄露
5. ✅ **开发友好**：支持 Mock 数据，本地开发无需后端

## 测试账号

Mock 模式下提供三个测试账号：

| 账号 | 密码 | 权限说明 |
|------|------|----------|
| admin | admin123 | 管理员（所有菜单） |
| user | user123 | 普通用户（dashboard + agents） |
| guest | guest123 | 访客（无菜单权限） |

## 注意事项

1. **刷新页面**：路由守卫会自动重新获取菜单并注册路由
2. **路由命名**：确保路由名称唯一，建议使用 `key.replace(/\//g, '-').slice(1)`
3. **路径匹配**：微前端路由会自动添加 `/:pathMatch(.*)*` 通配符
4. **默认菜单**：接口失败时会使用 `getDefaultMenus()` 作为降级方案
