# 动态菜单使用指南

菜单现已改为**后端统一下发**，根据用户权限动态渲染。

## 功能说明

### 前端改动

1. **User Store** (`main-app/src/store/user.js`)
   - 添加 `menus` 状态存储菜单数据
   - 登录成功后自动调用 `fetchMenus()` 获取菜单
   - 菜单数据持久化到 localStorage
   - 提供默认菜单作为 fallback

2. **图标工具** (`main-app/src/utils/icons.js`)
   - 图标名称到组件的映射
   - 支持动态加载图标组件
   - 可扩展支持更多图标

3. **MainLayout** (`main-app/src/layouts/MainLayout.vue`)
   - 从 store 读取菜单数据
   - 动态渲染菜单项
   - ✅ **支持子菜单**（无限层级，建议最多2级）
   - ✅ **自动展开当前路由的父菜单**
   - 自动匹配路由高亮菜单

## 后端菜单数据格式

### API 接口

```
GET /auth/menus
Authorization: Bearer <token>
```

### 返回格式

```json
[
  {
    "key": "/dashboard",
    "label": "仪表盘",
    "icon": "DashboardOutlined"
  },
  {
    "key": "/agents",
    "label": "Agent 管理",
    "icon": "ClusterOutlined"
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

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | 是 | 菜单路由路径 |
| label | string | 是 | 菜单显示文本 |
| icon | string | 否 | 图标名称（见支持的图标） |
| children | array | 否 | 子菜单列表 |
| permission | string | 否 | 所需权限（前端可选校验） |

## 支持的图标

当前支持的图标名称：

- `DashboardOutlined` - 仪表盘
- `ClusterOutlined` - 集群
- `DeploymentUnitOutlined` - 部署
- `MonitorOutlined` - 监控
- `SettingOutlined` - 设置
- `UserOutlined` - 用户
- `TeamOutlined` - 团队
- `SafetyOutlined` - 安全
- `AppstoreOutlined` - 应用
- `BarsOutlined` - 列表
- `DatabaseOutlined` - 数据库
- `CloudOutlined` - 云
- `ApiOutlined` - API
- `CodeOutlined` - 代码
- `FileTextOutlined` - 文件
- `BellOutlined` - 通知
- `WarningOutlined` - 警告
- `CheckCircleOutlined` - 成功
- `CloseCircleOutlined` - 失败
- `InfoCircleOutlined` - 信息

需要更多图标，可在 `main-app/src/utils/icons.js` 中添加。

## 子菜单支持

系统已完全支持子菜单功能，使用方式：

### 子菜单数据结构

```json
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
```

### 子菜单特性

- ✅ 支持无限层级（建议最多2级）
- ✅ 自动展开包含当前路由的父菜单
- ✅ 子菜单支持图标
- ✅ 子菜单路由自动匹配和高亮
- ✅ 展开/收起动画效果

### 注意事项

1. **子菜单路径规范**：子菜单的 `key` 应该以父菜单 `key` 开头
   ```json
   {
     "key": "/system",
     "children": [
       { "key": "/system/users" },    // ✅ 正确：以 /system 开头
       { "key": "/system/roles" }     // ✅ 正确
     ]
   }
   ```

2. **父菜单不可点击**：带有 `children` 的菜单项只能展开/收起，不能跳转

3. **路由配置**：主应用路由已配置通配符，无需额外配置
   ```javascript
   { path: 'system/:pathMatch(.*)*' }  // 匹配所有 /system/* 路径
   ```

详细文档请查看：[子菜单功能指南](SUBMENU_GUIDE.md)

## 后端实现建议

### 1. 基于角色返回菜单

```go
func GetUserMenus(c *gin.Context) {
    userID := c.GetString("user_id")
    user := getUserByID(userID)

    var menus []Menu

    // 根据用户角色返回不同菜单
    switch user.Role {
    case "admin":
        menus = getAdminMenus()
    case "operator":
        menus = getOperatorMenus()
    case "viewer":
        menus = getViewerMenus()
    }

    c.JSON(200, menus)
}
```

### 2. 基于权限过滤菜单

```go
func GetUserMenus(c *gin.Context) {
    userID := c.GetString("user_id")
    permissions := getUserPermissions(userID)

    // 所有可能的菜单
    allMenus := getAllMenus()

    // 过滤用户有权限的菜单
    filteredMenus := filterMenusByPermissions(allMenus, permissions)

    c.JSON(200, filteredMenus)
}
```

### 3. 菜单配置示例

```go
type Menu struct {
    Key        string   `json:"key"`
    Label      string   `json:"label"`
    Icon       string   `json:"icon,omitempty"`
    Permission string   `json:"permission,omitempty"`
    Children   []Menu   `json:"children,omitempty"`
}

func getAdminMenus() []Menu {
    return []Menu{
        {
            Key:   "/dashboard",
            Label: "仪表盘",
            Icon:  "DashboardOutlined",
        },
        {
            Key:   "/agents",
            Label: "Agent 管理",
            Icon:  "ClusterOutlined",
        },
        {
            Key:   "/clusters",
            Label: "集群管理",
            Icon:  "DeploymentUnitOutlined",
        },
        {
            Key:   "/monitor",
            Label: "监控管理",
            Icon:  "MonitorOutlined",
        },
        {
            Key:   "/system",
            Label: "系统管理",
            Icon:  "SettingOutlined",
            Children: []Menu{
                {
                    Key:   "/system/users",
                    Label: "用户管理",
                    Icon:  "UserOutlined",
                },
                {
                    Key:   "/system/roles",
                    Label: "角色管理",
                    Icon:  "TeamOutlined",
                },
                {
                    Key:   "/system/permissions",
                    Label: "权限管理",
                    Icon:  "SafetyOutlined",
                },
            },
        },
    }
}

func getOperatorMenus() []Menu {
    return []Menu{
        {
            Key:   "/dashboard",
            Label: "仪表盘",
            Icon:  "DashboardOutlined",
        },
        {
            Key:   "/agents",
            Label: "Agent 管理",
            Icon:  "ClusterOutlined",
        },
        {
            Key:   "/clusters",
            Label: "集群管理",
            Icon:  "DeploymentUnitOutlined",
        },
        {
            Key:   "/monitor",
            Label: "监控管理",
            Icon:  "MonitorOutlined",
        },
    }
}

func getViewerMenus() []Menu {
    return []Menu{
        {
            Key:   "/dashboard",
            Label: "仪表盘",
            Icon:  "DashboardOutlined",
        },
        {
            Key:   "/monitor",
            Label: "监控管理",
            Icon:  "MonitorOutlined",
        },
    }
}
```

## 工作流程

```
1. 用户登录
   ↓
2. 前端调用 /auth/login
   ↓
3. 返回 token
   ↓
4. 前端自动调用 /auth/menus
   ↓
5. 后端根据用户角色/权限返回菜单
   ↓
6. 前端存储到 store 和 localStorage
   ↓
7. MainLayout 动态渲染菜单
   ↓
8. 用户看到对应权限的菜单
```

## 默认菜单

如果后端未返回菜单或返回失败，前端会使用默认菜单：

```javascript
[
  { key: '/dashboard', label: '仪表盘', icon: 'DashboardOutlined' },
  { key: '/agents', label: 'Agent 管理', icon: 'ClusterOutlined' },
  { key: '/clusters', label: '集群管理', icon: 'DeploymentUnitOutlined' },
  { key: '/monitor', label: '监控管理', icon: 'MonitorOutlined' },
  { key: '/system', label: '系统管理', icon: 'SettingOutlined' }
]
```

## 测试

### 1. 启动应用

```bash
cd web/
pnpm dev
```

### 2. 登录测试

访问 http://localhost:3000，使用账号登录：
- admin / admin123

### 3. 检查菜单

- 打开浏览器控制台
- 查看 Network 标签，应该有对 `/auth/menus` 的请求
- 查看 Application → LocalStorage，应该有 `menus` 数据

### 4. 后端返回示例

如果后端还没实现 `/auth/menus`，可以在 `mock` 或直接返回：

```json
[
  {
    "key": "/dashboard",
    "label": "仪表盘",
    "icon": "DashboardOutlined"
  },
  {
    "key": "/agents",
    "label": "Agent 管理",
    "icon": "ClusterOutlined"
  }
]
```

## 优势

✅ **权限控制**: 后端根据用户权限返回菜单，前端自动渲染
✅ **灵活配置**: 菜单由后端管理，无需修改前端代码
✅ **支持多级**: 支持一级和多级菜单结构
✅ **图标丰富**: 支持 20+ 常用图标，可扩展
✅ **持久化**: 菜单数据存储到 localStorage，刷新不丢失
✅ **降级策略**: 接口失败时使用默认菜单，保证可用性

## 扩展

### 添加新图标

编辑 `main-app/src/utils/icons.js`：

```javascript
import { NewIcon } from '@ant-design/icons-vue'

const iconMap = {
  // ... 现有图标
  NewIcon
}
```

### 添加菜单元数据

可以在菜单项中添加自定义字段：

```json
{
  "key": "/agents",
  "label": "Agent 管理",
  "icon": "ClusterOutlined",
  "badge": 5,           // 徽标数字
  "hidden": false,      // 是否隐藏
  "disabled": false     // 是否禁用
}
```

然后在 MainLayout.vue 中使用这些字段。
