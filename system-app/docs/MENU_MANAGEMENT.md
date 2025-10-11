# 菜单管理功能文档

## 功能概述

菜单管理模块用于管理系统的导航菜单，支持树形结构、菜单/目录/按钮三种类型，并与微前端架构集成。

## 功能特性

### 1. 菜单类型

- **菜单 (menu)**: 可点击跳转的页面菜单项
- **目录 (directory)**: 只作为分组，不可点击
- **按钮 (button)**: 页面内的操作按钮权限

### 2. 树形结构

- 支持无限层级的树形菜单结构
- 通过 `parentId` 字段关联父菜单
- 使用 VXE Table 的 `treeConfig` 配置实现

### 3. 菜单属性

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Number | 菜单ID |
| parentId | Number | 父菜单ID（null为顶级菜单） |
| name | String | 菜单名称 |
| path | String | 路由路径 |
| component | String | 组件类型（MicroAppPlaceholder/SubMenu） |
| icon | String | 图标名称（Ant Design Icons） |
| type | String | 菜单类型（menu/directory/button） |
| orderNum | Number | 排序号 |
| status | String | 状态（enabled/disabled） |
| visible | Boolean | 是否可见 |
| microApp | String | 关联的微应用名称 |

### 4. 微应用集成

菜单可以关联微应用，支持的微应用包括：

- `dashboard-app` - 仪表盘
- `agent-app` - Agent管理
- `cluster-app` - 集群管理
- `monitor-app` - 监控中心
- `system-app` - 系统管理
- `image-build-app` - 镜像构建

## 页面功能

### 1. 菜单列表

- **搜索**: 支持按菜单名称、路由路径搜索
- **刷新**: 重新加载菜单数据
- **添加菜单**: 添加顶级菜单或子菜单

### 2. 表格列

| 列名 | 说明 |
|------|------|
| 序号 | 自动编号 |
| 菜单名称 | 显示树形结构 |
| 路由路径 | 菜单的访问路径 |
| 类型 | 菜单/目录/按钮标签 |
| 图标 | 图标预览 |
| 组件 | 组件类型 |
| 微应用 | 关联的微应用 |
| 排序 | 排序号 |
| 状态 | 启用/禁用状态 |
| 可见 | 是否显示 |
| 操作 | 编辑/添加子菜单/删除 |

### 3. 操作功能

#### 添加菜单

1. 点击"添加菜单"按钮
2. 填写菜单信息
3. 提交保存

#### 编辑菜单

1. 点击某一行的"编辑"按钮
2. 修改菜单信息
3. 提交保存

#### 添加子菜单

1. 点击目录类型菜单的"添加子菜单"按钮
2. 自动设置父菜单
3. 填写子菜单信息
4. 提交保存

#### 删除菜单

1. 点击某一行的"删除"按钮
2. 确认删除
3. **注意**: 有子菜单的菜单不能删除

## API 接口

### 获取菜单列表

```javascript
GET /menus
Query: { search, status, type }
Response: { data: [...], total: number }
```

### 创建菜单

```javascript
POST /menus
Body: { name, path, component, ... }
Response: { id, name, ... }
```

### 更新菜单

```javascript
PUT /menus/:id
Body: { name, path, component, ... }
Response: { id, name, ... }
```

### 删除菜单

```javascript
DELETE /menus/:id
Response: { message: 'Menu deleted successfully' }
```

## Mock 数据

系统提供了完整的 Mock 数据，包含12个预设菜单项：

1. 仪表盘
2. Agent管理（目录）
   - Agent列表
   - Agent配置
3. 集群管理
4. 监控中心
5. 系统管理（目录）
   - 用户管理
   - 角色管理
   - 权限管理
   - 菜单管理
6. 镜像构建

## 使用示例

### 添加一个新菜单

```javascript
{
  "parentId": 7,              // 系统管理目录
  "name": "操作日志",
  "path": "/system/audit-logs",
  "component": "MicroAppPlaceholder",
  "icon": "FileTextOutlined",
  "type": "menu",
  "orderNum": 5,
  "status": "enabled",
  "visible": true,
  "microApp": "system-app"
}
```

### 添加一个顶级目录

```javascript
{
  "parentId": null,
  "name": "报表中心",
  "path": "/reports",
  "component": "SubMenu",
  "icon": "BarChartOutlined",
  "type": "directory",
  "orderNum": 7,
  "status": "enabled",
  "visible": true,
  "microApp": null
}
```

## 访问路径

开发环境访问：`http://localhost:3000/system/menus`

（通过主应用的微前端容器加载）

直接访问 system-app：`http://localhost:3005/menus`

## 技术实现

### 组件

- **文件**: `system-app/src/views/MenuList.vue`
- **基础组件**: `VxeBasicTable` (来自 @k8s-agent/shared)
- **UI 库**: Ant Design Vue 4

### 树形表格配置

```javascript
gridOptions: {
  treeConfig: {
    transform: true,
    rowField: 'id',
    parentField: 'parentId'
  }
}
```

### 图标系统

使用 Ant Design Icons，支持的图标包括：

- `DashboardOutlined`
- `CloudServerOutlined`
- `ClusterOutlined`
- `MonitorOutlined`
- `SettingOutlined`
- `ContainerOutlined`
- `MenuOutlined`
- `UserOutlined`
- `SafetyOutlined`
- `LockOutlined`
- `FileTextOutlined`

## 注意事项

1. **删除限制**: 有子菜单的菜单项不能直接删除，需要先删除所有子菜单
2. **路由路径**: 菜单路径必须以 `/` 开头
3. **排序号**: 数字越小越靠前
4. **组件类型**:
   - 目录类型必须使用 `SubMenu`
   - 菜单类型通常使用 `MicroAppPlaceholder`
5. **微应用关联**: 只有菜单类型且组件为 `MicroAppPlaceholder` 时才需要设置微应用

## 扩展建议

1. **权限控制**: 可以添加 `permissions` 字段关联权限
2. **外链支持**: 添加 `isExternal` 字段支持外部链接
3. **缓存配置**: 添加 `keepAlive` 字段控制页面缓存
4. **面包屑**: 添加 `breadcrumb` 字段控制面包屑显示
5. **隐藏子菜单**: 添加 `hideChildren` 字段控制子菜单显示

## 更新日志

- **2025-10-11**: 初始版本，实现基础菜单管理功能
  - 树形结构展示
  - 增删改查操作
  - Mock 数据支持
  - 微应用集成
