# Main App (主应用)

K8s Agent 管理平台的主应用，基于 qiankun 微前端架构。

## 功能

- 提供基座应用框架
- 管理子应用的注册和加载
- 提供统一的登录和权限管理
- 提供全局状态管理
- 提供统一的布局和导航

## 技术栈

- Vue 3 + Composition API
- Vite 4
- qiankun 2.x
- Ant Design Vue 4
- Pinia
- Vue Router 4
- Axios

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 子应用配置

子应用配置在 `src/micro/apps.js` 中，包括：

- dashboard-app (端口 3001) - 仪表盘
- agent-app (端口 3002) - Agent 管理
- cluster-app (端口 3003) - 集群管理
- monitor-app (端口 3004) - 监控管理
- system-app (端口 3005) - 系统管理

## 目录结构

```
main-app/
├── public/          # 静态资源
├── src/
│   ├── api/        # API 接口
│   ├── assets/     # 资源文件
│   ├── directives/ # 自定义指令
│   ├── layouts/    # 布局组件
│   ├── micro/      # 微前端配置
│   ├── router/     # 路由配置
│   ├── store/      # 状态管理
│   ├── views/      # 页面组件
│   ├── App.vue     # 根组件
│   └── main.js     # 入口文件
├── index.html
├── vite.config.js
└── package.json
```

## 默认账号

- 用户名: admin
- 密码: admin123
