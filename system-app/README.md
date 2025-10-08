# System App (系统管理子应用)

K8s Agent 管理平台的系统管理子应用，负责用户、角色和权限的管理。

## 功能

- 用户管理（CRUD）
- 角色管理（CRUD）
- 权限管理（CRUD）
- 用户角色分配
- 角色权限分配
- 用户状态管理

## 技术栈

- Vue 3 + Composition API
- Vite 4
- vite-plugin-qiankun
- Ant Design Vue 4
- Axios
- Day.js

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (端口 3005)
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 路由

- `/system/users` - 用户管理
- `/system/roles` - 角色管理
- `/system/permissions` - 权限管理

## 独立运行

本应用支持独立运行（非微前端模式），可以直接访问 http://localhost:3005 进行开发调试。

## 作为子应用

在主应用中，本应用会被注册为 `system-app`，通过路由 `/system` 激活。
