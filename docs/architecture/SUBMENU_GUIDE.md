# 子菜单功能指南

## 📖 概述

系统已支持多级菜单结构，可以配置带有子菜单的菜单项。

## ✨ 功能特性

### 已实现功能

- ✅ 无限层级子菜单支持（理论上，实际建议最多2级）
- ✅ 子菜单展开/收起动画
- ✅ 自动展开包含当前路由的父菜单
- ✅ 子菜单图标支持
- ✅ 路由匹配（支持子菜单路由跳转）
- ✅ 菜单高亮（当前激活子菜单高亮显示）

### 核心组件

- **v-model:openKeys**: 控制展开的父菜单
- **v-model:selectedKeys**: 控制选中的菜单项
- **a-sub-menu**: Ant Design Vue 的子菜单组件

## 📝 菜单数据结构

### 标准格式

```javascript
[
  {
    key: '/dashboard',           // 路由路径（必填）
    label: '仪表盘',              // 菜单显示名称（必填）
    icon: 'DashboardOutlined'    // 图标名称（可选）
  },
  {
    key: '/system',              // 父菜单路由（必填）
    label: '系统管理',            // 父菜单名称（必填）
    icon: 'SettingOutlined',     // 父菜单图标（可选）
    children: [                   // 子菜单数组（必填，有子菜单时）
      {
        key: '/system/users',    // 子菜单路由（必填）
        label: '用户管理',        // 子菜单名称（必填）
        icon: 'UserOutlined'     // 子菜单图标（可选）
      },
      {
        key: '/system/roles',
        label: '角色管理',
        icon: 'TeamOutlined'
      }
    ]
  }
]
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | String | ✅ | 路由路径，用于跳转和匹配 |
| label | String | ✅ | 菜单显示的文本 |
| icon | String | ❌ | 图标组件名称（来自 Ant Design Vue） |
| children | Array | ❌ | 子菜单数组，有子菜单时必填 |

## 🎯 使用示例

### 示例 1: 单级菜单

```javascript
{
  key: '/dashboard',
  label: '仪表盘',
  icon: 'DashboardOutlined'
}
```

**渲染效果**：
```
📊 仪表盘
```

### 示例 2: 带子菜单的菜单

```javascript
{
  key: '/system',
  label: '系统管理',
  icon: 'SettingOutlined',
  children: [
    {
      key: '/system/users',
      label: '用户管理',
      icon: 'UserOutlined'
    },
    {
      key: '/system/roles',
      label: '角色管理',
      icon: 'TeamOutlined'
    },
    {
      key: '/system/permissions',
      label: '权限管理',
      icon: 'SafetyOutlined'
    }
  ]
}
```

**渲染效果**（展开状态）：
```
⚙️ 系统管理 ▼
  👤 用户管理
  👥 角色管理
  🛡️ 权限管理
```

### 示例 3: 完整菜单配置

```javascript
export const menus = [
  // 一级菜单
  {
    key: '/dashboard',
    label: '仪表盘',
    icon: 'DashboardOutlined'
  },

  // 带子菜单的菜单
  {
    key: '/system',
    label: '系统管理',
    icon: 'SettingOutlined',
    children: [
      {
        key: '/system/users',
        label: '用户管理',
        icon: 'UserOutlined'
      },
      {
        key: '/system/roles',
        label: '角色管理',
        icon: 'TeamOutlined'
      },
      {
        key: '/system/menus',
        label: '菜单管理',
        icon: 'AppstoreOutlined'
      }
    ]
  },

  // 另一个带子菜单的菜单
  {
    key: '/monitor',
    label: '监控中心',
    icon: 'MonitorOutlined',
    children: [
      {
        key: '/monitor/overview',
        label: '监控总览',
        icon: 'DashboardOutlined'
      },
      {
        key: '/monitor/logs',
        label: '日志查看',
        icon: 'FileTextOutlined'
      },
      {
        key: '/monitor/alerts',
        label: '告警管理',
        icon: 'BellOutlined'
      }
    ]
  }
]
```

## 🚀 后端接口格式

### 菜单接口

**请求**：
```
GET /auth/menus
Authorization: Bearer <token>
```

**响应**：
```json
[
  {
    "key": "/dashboard",
    "label": "仪表盘",
    "icon": "DashboardOutlined"
  },
  {
    "key": "/system",
    "label": "系统管理",
    "icon": "SettingOutlined",
    "children": [
      {
        "key": "/system/users",
        "label": "用户管理",
        "icon": "UserOutlined"
      },
      {
        "key": "/system/roles",
        "label": "角色管理",
        "icon": "TeamOutlined"
      }
    ]
  }
]
```

## 🎨 可用图标

系统已预置以下图标，可直接使用：

### 常用图标
- `DashboardOutlined` - 仪表盘
- `UserOutlined` - 用户
- `TeamOutlined` - 团队/角色
- `SafetyOutlined` - 安全/权限
- `SettingOutlined` - 设置
- `ClusterOutlined` - 集群
- `DeploymentUnitOutlined` - 部署
- `MonitorOutlined` - 监控

### 其他图标
- `AppstoreOutlined` - 应用
- `BarsOutlined` - 列表
- `DatabaseOutlined` - 数据库
- `CloudOutlined` - 云
- `ApiOutlined` - API
- `CodeOutlined` - 代码
- `FileTextOutlined` - 文件/日志
- `BellOutlined` - 通知
- `WarningOutlined` - 警告
- `CheckCircleOutlined` - 成功
- `CloseCircleOutlined` - 失败
- `InfoCircleOutlined` - 信息

更多图标请查看 [Ant Design Vue Icons](https://antdv.com/components/icon)

## 🔧 路由配置

### 子菜单路由

主应用路由已配置通配符支持，无需额外配置：

```javascript
// router/index.js
{
  path: 'system/:pathMatch(.*)*',  // 匹配 /system 及所有子路径
  name: 'system',
  meta: { requiresAuth: true }
}
```

这意味着：
- `/system` ✅ 匹配
- `/system/users` ✅ 匹配
- `/system/roles` ✅ 匹配
- `/system/users/detail/123` ✅ 匹配

### 子应用路由

如果使用微前端架构，子应用需要配置 base 路径：

```javascript
// system-app/src/router/index.js
const router = createRouter({
  history: createWebHistory('/system'),  // 设置 base 路径
  routes: [
    {
      path: '/users',      // 实际访问路径: /system/users
      component: Users
    },
    {
      path: '/roles',      // 实际访问路径: /system/roles
      component: Roles
    }
  ]
})
```

## 🎭 Mock 数据示例

### admin 账号（完整权限）

```javascript
menus: [
  {
    key: '/dashboard',
    label: '仪表盘',
    icon: 'DashboardOutlined'
  },
  {
    key: '/agents',
    label: 'Agent 管理',
    icon: 'ClusterOutlined'
  },
  {
    key: '/system',
    label: '系统管理',
    icon: 'SettingOutlined',
    children: [
      {
        key: '/system/users',
        label: '用户管理',
        icon: 'UserOutlined'
      },
      {
        key: '/system/roles',
        label: '角色管理',
        icon: 'TeamOutlined'
      },
      {
        key: '/system/permissions',
        label: '权限管理',
        icon: 'SafetyOutlined'
      }
    ]
  }
]
```

### user 账号（部分权限）

```javascript
menus: [
  {
    key: '/dashboard',
    label: '仪表盘',
    icon: 'DashboardOutlined'
  },
  {
    key: '/system',
    label: '系统管理',
    icon: 'SettingOutlined',
    children: [
      {
        key: '/system/users',
        label: '用户管理',
        icon: 'UserOutlined'
      }
      // 注意：只有用户管理权限，没有角色和权限管理
    ]
  }
]
```

## 🧪 功能测试

### 测试场景 1: 子菜单展开/收起

```bash
# 1. 启动应用
cd web/
pnpm dev

# 2. 登录系统（使用 admin/admin123）

# 3. 点击"系统管理"
预期: 子菜单展开，显示"用户管理"、"角色管理"、"权限管理"

# 4. 再次点击"系统管理"
预期: 子菜单收起
```

### 测试场景 2: 子菜单路由跳转

```bash
# 1. 展开"系统管理"
# 2. 点击"用户管理"
预期:
  - 路由跳转到 /system/users
  - "用户管理"菜单高亮
  - "系统管理"保持展开状态
```

### 测试场景 3: 直接访问子菜单路由

```bash
# 1. 在浏览器地址栏输入
http://localhost:3000/system/roles

预期:
  - "系统管理"自动展开
  - "角色管理"菜单高亮
```

### 测试场景 4: 刷新页面

```bash
# 1. 访问 /system/users
# 2. 刷新页面（F5）

预期:
  - "系统管理"自动展开
  - "用户管理"菜单高亮
  - 路由保持在 /system/users
```

### 测试场景 5: 不同权限账号

```bash
# 1. 使用 user/user123 登录
预期: "系统管理"下只显示"用户管理"子菜单

# 2. 使用 guest/guest123 登录
预期: 不显示"系统管理"菜单
```

## ⚠️ 注意事项

### 1. 父菜单不可点击

带有子菜单的父菜单只能展开/收起，不能作为路由跳转：

```javascript
// ❌ 错误：父菜单 key 会被用作路由
{
  key: '/system',  // 点击时不会跳转
  children: [...]
}

// ✅ 正确：如果需要父菜单也可跳转，需要添加独立的菜单项
{
  key: '/system',
  label: '系统管理',
  children: [
    {
      key: '/system/overview',  // 添加一个"总览"子菜单
      label: '系统总览'
    },
    ...
  ]
}
```

### 2. 路由路径规范

子菜单路由必须以父菜单路径开头：

```javascript
// ✅ 正确
{
  key: '/system',
  children: [
    { key: '/system/users' },    // 以 /system 开头
    { key: '/system/roles' }     // 以 /system 开头
  ]
}

// ❌ 错误（不推荐，会导致展开逻辑混乱）
{
  key: '/system',
  children: [
    { key: '/users' },           // 不以 /system 开头
    { key: '/settings/roles' }   // 路径不一致
  ]
}
```

### 3. 图标可选

所有菜单项的图标都是可选的：

```javascript
// ✅ 有图标
{ key: '/dashboard', label: '仪表盘', icon: 'DashboardOutlined' }

// ✅ 无图标（仍然正常显示）
{ key: '/dashboard', label: '仪表盘' }
```

### 4. 子菜单深度

虽然理论上支持无限层级，但建议最多2级：

```javascript
// ✅ 推荐：2级菜单
{
  key: '/system',
  children: [
    { key: '/system/users' }
  ]
}

// ⚠️ 不推荐：3级菜单（影响用户体验）
{
  key: '/system',
  children: [
    {
      key: '/system/config',
      children: [
        { key: '/system/config/basic' }
      ]
    }
  ]
}
```

## 📚 相关文档

- [Mock 数据指南](MOCK_GUIDE.md) - 如何修改 Mock 数据中的菜单
- [动态菜单指南](DYNAMIC_MENU_GUIDE.md) - 后端接口格式说明
- [启动指南](START_GUIDE.md) - 应用启动说明

## ✅ 检查清单

配置子菜单前的检查：

- [ ] 确认父菜单和子菜单的 `key` 路径正确
- [ ] 确认所有菜单都有 `label` 字段
- [ ] 确认使用的图标已在 `utils/icons.js` 中导入
- [ ] 确认子菜单路径以父菜单路径开头
- [ ] 测试直接访问子菜单路由
- [ ] 测试刷新页面后菜单状态
- [ ] 测试不同权限账号的菜单显示

---

**提示**: 子菜单功能已完全集成到系统中，开箱即用，无需额外配置。只需在菜单数据中添加 `children` 字段即可。
