# System App 文档中心

## 概述

System App 是 K8s Agent Web 微前端架构中的系统管理模块，负责用户、角色、权限、菜单等系统核心功能的管理。

## 文档索引

### 功能文档

#### 菜单管理

- **[菜单管理功能文档](MENU_MANAGEMENT.md)** - 完整的功能说明、API文档、数据模型
- **[快速开始指南](MENU_MANAGEMENT_QUICKSTART.md)** - 5分钟上手菜单管理
- **[截图指南](MENU_MANAGEMENT_SCREENSHOT_GUIDE.md)** - 详细的界面布局和交互说明

#### 用户管理

- 参考文件: `src/views/UserList.vue`
- 功能: 用户增删改查、角色分配、状态管理

#### 角色管理

- 参考文件: `src/views/RoleList.vue`
- 功能: 角色增删改查、权限配置

#### 权限管理

- 参考文件: `src/views/PermissionList.vue`
- 功能: 权限增删改查、分组管理

## 快速链接

### 开发指南

- [项目根目录 CLAUDE.md](../../CLAUDE.md) - 项目整体架构说明
- [Wujie 微前端架构](../../docs/architecture/WUJIE_MIGRATION_COMPLETE.md)
- [VXE Table 使用指南](../../docs/components/VXE_TABLE.md)
- [共享组件库](../../shared/README.md)

### API 文档

- [API 接口层](../src/api/system.js)
- [Mock 数据层](../src/mock/index.js)

### 组件示例

- [用户管理组件](../src/views/UserList.vue)
- [菜单管理组件](../src/views/MenuList.vue)
- [角色管理组件](../src/views/RoleList.vue)

## 启动指南

### 方式1: 通过主应用启动（推荐）

```bash
# 在项目根目录
make dev

# 或者
./dev.sh

# 访问菜单管理
http://localhost:3000/system/menus
```

### 方式2: 独立启动 system-app

```bash
# 在项目根目录
make dev-system

# 或者
cd system-app && pnpm dev

# 访问菜单管理
http://localhost:3005/menus
```

## 技术栈

### 核心框架

- **Vue 3.3.4** - 渐进式 JavaScript 框架
- **Vue Router 4.2.5** - 官方路由管理器
- **Pinia 2.1.7** - 状态管理库

### UI 组件

- **Ant Design Vue 4.0.7** - 企业级UI组件库
- **@ant-design/icons-vue 7.0.1** - 图标库
- **VXE Table 4.6.0** - 高性能表格组件

### 工具库

- **Axios 1.6.2** - HTTP 客户端
- **dayjs 1.11.9** - 日期时间处理
- **xe-utils 3.5.0** - 工具函数库

### 开发工具

- **Vite 5.0.4** - 构建工具
- **ESLint 9.37.0** - 代码检查
- **Sass 1.66.1** - CSS 预处理器

## 目录结构

```text
system-app/
├── src/
│   ├── api/              # API 接口层
│   │   ├── request.js    # Axios 封装
│   │   └── system.js     # 系统管理 API
│   ├── assets/           # 静态资源
│   ├── layouts/          # 布局组件
│   ├── mock/             # Mock 数据
│   │   └── index.js      # Mock API 实现
│   ├── router/           # 路由配置
│   │   └── index.js      # 路由定义
│   ├── views/            # 页面组件
│   │   ├── UserList.vue      # 用户管理
│   │   ├── RoleList.vue      # 角色管理
│   │   ├── PermissionList.vue # 权限管理
│   │   └── MenuList.vue      # 菜单管理 ⭐
│   ├── App.vue           # 根组件
│   └── main.js           # 应用入口
├── docs/                 # 文档目录 📚
│   ├── README.md         # 文档索引（本文件）
│   ├── MENU_MANAGEMENT.md          # 菜单管理完整文档
│   ├── MENU_MANAGEMENT_QUICKSTART.md # 快速开始
│   └── MENU_MANAGEMENT_SCREENSHOT_GUIDE.md # 截图指南
├── .env.development      # 开发环境配置
├── package.json          # 项目依赖
├── vite.config.js        # Vite 配置
└── eslint.config.js      # ESLint 配置
```

## 环境配置

### 开发环境 (`.env.development`)

```bash
# API 基础地址
VITE_API_BASE_URL=http://localhost:8080/api

# Mock 数据开关
VITE_USE_MOCK=true

# Mock 延迟（毫秒）
VITE_MOCK_DELAY=300

# 路由同步优化
VITE_FEATURE_STANDARD_ROUTE_SYNC=true
```

## 功能模块

### 1. 用户管理

**路径**: `/users`

**功能**:
- 用户列表展示（分页）
- 添加/编辑/删除用户
- 角色分配
- 用户状态管理
- 密码重置

**Mock 数据**: 4个测试用户（admin, user001, user002, user003）

### 2. 角色管理

**路径**: `/roles`

**功能**:
- 角色列表展示
- 添加/编辑/删除角色
- 权限配置
- 用户数统计

**Mock 数据**: 4个预设角色（管理员、运维、普通用户、访客）

### 3. 权限管理

**路径**: `/permissions`

**功能**:
- 权限列表展示
- 按分组展示
- 权限编码管理

**Mock 数据**: 13个系统权限

### 4. 菜单管理 ⭐

**路径**: `/menus`

**功能**:
- 树形结构展示
- 添加/编辑/删除菜单
- 菜单类型管理（菜单/目录/按钮）
- 微应用关联
- 图标配置
- 排序管理
- 状态和可见性控制

**Mock 数据**: 12个系统菜单（包含2级树形结构）

**详细文档**: [MENU_MANAGEMENT.md](MENU_MANAGEMENT.md)

## API 设计

### RESTful 接口规范

```javascript
// 用户管理
GET    /users         # 获取用户列表
POST   /users         # 创建用户
PUT    /users/:id     # 更新用户
DELETE /users/:id     # 删除用户

// 角色管理
GET    /roles         # 获取角色列表
POST   /roles         # 创建角色
PUT    /roles/:id     # 更新角色
DELETE /roles/:id     # 删除角色

// 权限管理
GET    /permissions   # 获取权限列表
POST   /permissions   # 创建权限
PUT    /permissions/:id   # 更新权限
DELETE /permissions/:id   # 删除权限

// 菜单管理
GET    /menus         # 获取菜单列表
POST   /menus         # 创建菜单
PUT    /menus/:id     # 更新菜单
DELETE /menus/:id     # 删除菜单
```

### 响应格式

```javascript
// 成功响应
{
  "data": [...],        // 数据列表
  "total": 100,         // 总数
  "page": 1,            // 当前页
  "pageSize": 10        // 每页数量
}

// 错误响应
{
  "message": "Error message"
}
```

## Mock 数据系统

### 特点

- ✅ 自动延迟模拟（可配置）
- ✅ 支持分页、搜索、过滤
- ✅ 增删改查完整实现
- ✅ 数据持久化（内存）
- ✅ 与真实接口相同的响应格式

### 使用方式

```javascript
// 1. 检查是否启用 Mock
import { isMockEnabled } from '@/mock'

if (isMockEnabled()) {
  // Mock 模式
}

// 2. API 自动判断
import { getUsers } from '@/api/system'

// 会自动根据环境变量使用 Mock 或真实接口
const users = await getUsers({ page: 1, pageSize: 10 })
```

### Mock 数据清单

| 模块 | 数量 | 说明 |
|------|------|------|
| 用户 | 4 | admin, user001, user002, user003 |
| 角色 | 4 | 管理员、运维、普通用户、访客 |
| 权限 | 13 | 系统各模块权限 |
| 菜单 | 12 | 包含树形结构 |
| 日志 | 3 | 操作审计日志 |

## 开发指南

### 添加新页面

1. 在 `src/views/` 创建组件
2. 在 `src/router/index.js` 添加路由
3. 在 `src/api/system.js` 添加 API 接口
4. 在 `src/mock/index.js` 添加 Mock 数据

### 使用 VxeBasicTable

```vue
<template>
  <VxeBasicTable
    ref="tableRef"
    title="数据列表"
    :grid-options="gridOptions"
    :api="loadDataApi"
    @register="onTableRegister"
  >
    <!-- 插槽定义 -->
  </VxeBasicTable>
</template>

<script setup>
import { VxeBasicTable } from '@k8s-agent/shared/components'

const gridOptions = {
  columns: [...]
}

const loadDataApi = async (params) => {
  // 调用 API 加载数据
}
</script>
```

详细用法: [VXE Table 指南](../../docs/components/VXE_TABLE.md)

### 状态管理

使用 Pinia 进行状态管理：

```javascript
import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', {
  state: () => ({
    // 状态定义
  }),
  actions: {
    // 动作定义
  }
})
```

## 测试指南

### 功能测试

```bash
# 启动开发服务器
pnpm dev

# 访问各个模块
http://localhost:3005/users       # 用户管理
http://localhost:3005/roles       # 角色管理
http://localhost:3005/permissions # 权限管理
http://localhost:3005/menus       # 菜单管理
```

### 代码检查

```bash
# 运行 ESLint
pnpm lint

# 自动修复
pnpm lint -- --fix
```

## 常见问题

### Q1: Mock 数据不生效？

**A**: 检查 `.env.development` 文件中 `VITE_USE_MOCK=true`

### Q2: 表格数据不显示？

**A**:
1. 检查 API 返回格式是否正确
2. 查看控制台是否有错误
3. 确认 `gridOptions.columns` 配置正确

### Q3: 路由跳转失败？

**A**:
1. 确认路由路径正确
2. 检查是否在主应用中访问（通过微前端）
3. 查看 `src/router/index.js` 配置

### Q4: 样式丢失？

**A**:
1. 确认 Ant Design Vue 正确引入
2. 检查全局样式是否加载
3. 查看 `@k8s-agent/shared` 是否正确构建

## 贡献指南

### 提交规范

```bash
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建工具或依赖更新
```

### Pull Request 流程

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 版本历史

### v1.0.0 (2025-10-11)

**新功能**:
- ✅ 菜单管理模块
  - 树形结构展示
  - 增删改查操作
  - Mock 数据支持
  - 微应用集成
  - 完整文档

**改进**:
- ✅ 统一 Mock 数据系统
- ✅ 优化表格组件使用
- ✅ 完善错误处理

## 相关资源

### 官方文档

- [Vue 3](https://vuejs.org/)
- [Ant Design Vue](https://antdv.com/)
- [VXE Table](https://vxetable.cn/)
- [Vite](https://vitejs.dev/)

### 内部文档

- [项目架构](../../CLAUDE.md)
- [微前端架构](../../docs/architecture/)
- [组件库](../../shared/README.md)
- [故障排查](../../docs/troubleshooting/)

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [项目地址]
- 文档反馈: 提交 PR 到 `docs/` 目录

---

**最后更新**: 2025-10-11
**文档维护**: Claude Code Assistant
