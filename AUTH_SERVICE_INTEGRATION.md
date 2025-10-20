# k8s-agent-web 与 auth-service 集成文档

## 概述

本文档描述了 k8s-agent-web 前端应用与 k8s-agent/auth-service 认证授权服务的完整集成方案。

## 系统架构

### 后端服务 (auth-service)

auth-service 是一个基于 Go + Gin 框架的认证授权微服务,提供以下核心功能:

- **用户认证**: JWT Token 认证,会话管理
- **RBAC 权限管理**: 用户、角色、权限的完整管理
- **API 授权**: 基于权限的 API 访问控制
- **强制登出**: 管理员可强制用户下线
- **审计日志**: 完整的操作审计记录

### 前端应用 (k8s-agent-web)

k8s-agent-web 是基于 Vue 3 + Vite + TypeScript 的 Kubernetes 管理前端,采用 Monorepo 架构。

## API 接口集成

### 1. 认证接口

#### 登录

```typescript
POST /api/v1/auth/login

Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "jti": "uuid-for-session",
  "expires_at": "2025-10-21T00:00:00Z",
  "user": {
    "id": "user-uuid",
    "username": "admin",
    "email": "admin@example.com",
    "real_name": "管理员",
    "avatar": "http://...",
    "roles": [
      {
        "id": "role-uuid",
        "name": "超级管理员",
        "code": "super_admin",
        "description": "系统超级管理员",
        "status": 1,
        "sort": 0,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 获取当前用户信息

```typescript
GET /api/v1/auth/me
Authorization: Bearer <token>

Response:
{
  "id": "user-uuid",
  "username": "admin",
  "email": "admin@example.com",
  "real_name": "管理员",
  "avatar": "http://...",
  "roles": [...]
}
```

#### 登出

```typescript
POST /api/v1/auth/logout
Authorization: Bearer <token>

Response:
{
  "message": "Logged out successfully"
}
```

### 2. 用户管理接口

#### 获取用户列表

```typescript
GET /api/v1/users
Authorization: Bearer <token>
Query Parameters:
  - page: 页码 (默认: 1)
  - page_size: 每页数量 (默认: 20, 最大: 100)
  - sort: 排序字段 (默认: created_at)
  - order: 排序方向 (asc/desc, 默认: desc)
  - status: 用户状态筛选 (0: 禁用, 1: 启用)

Response:
{
  "items": [
    {
      "id": "user-uuid",
      "username": "admin",
      "email": "admin@example.com",
      "real_name": "管理员",
      "phone": "13800138000",
      "avatar": "http://...",
      "status": 1,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

#### 创建用户

```typescript
POST /api/v1/users
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "username": "newuser",
  "password": "password123",
  "email": "newuser@example.com",
  "real_name": "新用户",
  "phone": "13800138001",
  "avatar": "http://...",
  "role_ids": ["role-uuid-1", "role-uuid-2"]
}

Response:
{
  "id": "new-user-uuid",
  "username": "newuser",
  "email": "newuser@example.com",
  ...
}
```

#### 更新用户

```typescript
PUT /api/v1/users/:id
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "email": "updated@example.com",
  "real_name": "更新后的名字",
  "phone": "13900139000",
  "avatar": "http://new-avatar.jpg",
  "status": 1,
  "role_ids": ["role-uuid-1"]
}

Response:
{
  "message": "User updated successfully"
}
```

#### 删除用户 (软删除)

```typescript
DELETE /api/v1/users/:id
Authorization: Bearer <token>

Response:
{
  "message": "User deleted successfully"
}
```

#### 分配角色到用户

```typescript
POST /api/v1/users/:id/roles
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "role_ids": ["role-uuid-1", "role-uuid-2"]
}

Response:
{
  "message": "Roles assigned successfully"
}
```

### 3. 角色管理接口

#### 获取角色列表

```typescript
GET /api/v1/roles
Authorization: Bearer <token>

Response:
{
  "items": [
    {
      "id": "role-uuid",
      "name": "管理员",
      "code": "admin",
      "description": "系统管理员角色",
      "status": 1,
      "sort": 10,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### 创建角色

```typescript
POST /api/v1/roles
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "新角色",
  "code": "new_role",
  "description": "角色描述",
  "status": 1,
  "sort": 100
}

Response:
{
  "id": "new-role-uuid",
  "name": "新角色",
  ...
}
```

#### 分配权限到角色

```typescript
POST /api/v1/roles/:id/permissions
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "permission_ids": ["perm-uuid-1", "perm-uuid-2"]
}

Response:
{
  "message": "Permissions assigned successfully"
}
```

#### 获取角色的权限列表

```typescript
GET /api/v1/roles/:id/permissions
Authorization: Bearer <token>

Response:
{
  "permissions": [
    {
      "id": "perm-uuid",
      "name": "用户管理",
      "code": "user:manage",
      "type": "menu",
      "path": "/system/user",
      "component": "UserManage",
      "icon": "user",
      ...
    }
  ]
}
```

### 4. 权限管理接口

#### 获取权限列表

```typescript
GET /api/v1/permissions
Authorization: Bearer <token>
Query Parameters:
  - type: 权限类型筛选 (menu/button/api)
  - status: 状态筛选 (0/1)

Response:
{
  "items": [
    {
      "id": "perm-uuid",
      "parent_id": "parent-uuid",
      "name": "用户管理",
      "code": "user:manage",
      "type": "menu",
      "path": "/system/user",
      "method": "",
      "component": "UserManage",
      "icon": "user",
      "sort": 10,
      "status": 1,
      "description": "用户管理菜单",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### 获取权限树

```typescript
GET /api/v1/permissions/tree
Authorization: Bearer <token>

Response:
{
  "tree": [
    {
      "id": "root-uuid",
      "name": "系统管理",
      "code": "system",
      "type": "menu",
      "path": "/system",
      "icon": "setting",
      "sort": 100,
      "children": [
        {
          "id": "child-uuid",
          "parent_id": "root-uuid",
          "name": "用户管理",
          "code": "system:user",
          "type": "menu",
          "path": "/system/user",
          "icon": "user",
          "sort": 10,
          "children": []
        }
      ]
    }
  ]
}
```

#### 创建权限

```typescript
POST /api/v1/permissions
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "parent_id": "parent-uuid",  // 可选
  "name": "创建用户",
  "code": "user:create",
  "type": "button",  // menu/button/api
  "path": "",
  "method": "",
  "component": "",
  "icon": "",
  "sort": 1,
  "status": 1,
  "description": "创建用户按钮权限"
}

Response:
{
  "id": "new-perm-uuid",
  "name": "创建用户",
  ...
}
```

## 前端集成

### 目录结构

```
k8s-agent-web/apps/web-k8s/src/
├── api/
│   ├── core/
│   │   ├── auth.ts       # 认证 API (已更新)
│   │   ├── user.ts       # 用户信息 API (已更新)
│   │   └── index.ts
│   └── system/           # 新增系统管理 API
│       ├── user.ts       # 用户管理 API
│       ├── role.ts       # 角色管理 API
│       ├── permission.ts # 权限管理 API
│       └── index.ts
├── store/
│   └── auth.ts          # 认证状态管理
└── router/
    └── guard.ts         # 路由守卫
```

### API 使用示例

#### 1. 登录

```typescript
import { loginApi } from '#/api/core/auth';
import { useAuthStore } from '#/store/auth';

const authStore = useAuthStore();

// 登录
await authStore.authLogin({
  username: 'admin',
  password: 'admin123',
});

// loginApi 返回格式:
// {
//   token: "jwt-token-string",
//   jti: "session-uuid",
//   expires_at: "2025-10-21T00:00:00Z",
//   user: { ... },
//   accessToken: "jwt-token-string"  // 为了向后兼容自动添加
// }
```

#### 2. 用户管理

```typescript
import {
  getUserListApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  assignUserRolesApi,
  UserApi,
} from '#/api/system/user';

// 获取用户列表
const users = await getUserListApi({
  page: 1,
  page_size: 20,
  status: UserApi.UserStatus.ACTIVE,
});

// 创建用户
const newUser = await createUserApi({
  username: 'testuser',
  password: 'password123',
  email: 'test@example.com',
  real_name: '测试用户',
  role_ids: ['role-uuid'],
});

// 更新用户
await updateUserApi('user-uuid', {
  real_name: '更新后的名字',
  status: UserApi.UserStatus.ACTIVE,
});

// 删除用户
await deleteUserApi('user-uuid');

// 分配角色
await assignUserRolesApi('user-uuid', {
  role_ids: ['role-uuid-1', 'role-uuid-2'],
});
```

#### 3. 角色管理

```typescript
import {
  getRoleListApi,
  createRoleApi,
  assignRolePermissionsApi,
  getRolePermissionsApi,
  RoleApi,
} from '#/api/system/role';

// 获取角色列表
const roles = await getRoleListApi();

// 创建角色
const newRole = await createRoleApi({
  name: '新角色',
  code: 'new_role',
  description: '角色描述',
  status: RoleApi.RoleStatus.ACTIVE,
  sort: 100,
});

// 分配权限
await assignRolePermissionsApi('role-uuid', {
  permission_ids: ['perm-1', 'perm-2'],
});

// 获取角色权限
const permissions = await getRolePermissionsApi('role-uuid');
```

#### 4. 权限管理

```typescript
import {
  getPermissionListApi,
  getPermissionTreeApi,
  createPermissionApi,
  PermissionApi,
} from '#/api/system/permission';

// 获取权限列表
const permissions = await getPermissionListApi({
  type: PermissionApi.PermissionType.MENU,
});

// 获取权限树
const tree = await getPermissionTreeApi();

// 创建权限
const newPermission = await createPermissionApi({
  name: '新权限',
  code: 'new:permission',
  type: PermissionApi.PermissionType.BUTTON,
  status: PermissionApi.PermissionStatus.ACTIVE,
});
```

## 配置说明

### 后端配置 (auth-service)

编辑 `k8s-agent/auth-service/configs/config.yaml`:

```yaml
server:
  host: '0.0.0.0'
  port: 8090
  mode: 'release' # debug, release

database:
  host: localhost
  port: 3306
  user: root
  password: root
  dbname: k8s_agent_auth
  charset: utf8mb4
  parse_time: true
  max_idle_conns: 10
  max_open_conns: 100

redis:
  host: localhost
  port: 6379
  password: ''
  db: 0
  pool_size: 10

jwt:
  secret: 'your-super-secret-jwt-key-change-in-production'
  expires_hours: 24
```

### 前端配置 (k8s-agent-web)

编辑 `k8s-agent-web/apps/web-k8s/vite.config.mts`:

```typescript
export default defineConfig({
  server: {
    port: 5667,
    proxy: {
      '/api': {
        target: 'http://localhost:8090', // auth-service 地址
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      },
    },
  },
});
```

## 部署说明

### 1. 启动 auth-service

```bash
cd k8s-agent/auth-service

# 使用默认配置
go run cmd/server/main.go

# 或指定配置文件
go run cmd/server/main.go -c configs/config-dev.yaml

# 或使用 Make
make run
```

服务将在 `http://localhost:8090` 启动。

### 2. 启动 k8s-agent-web

```bash
cd k8s-agent-web

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:k8s

# 或使用 Make
make dev-k8s
```

应用将在 `http://localhost:5667` 启动,所有 `/api` 请求会自动代理到 auth-service。

### 3. 初始化数据

首次启动时,auth-service 会自动创建:

- **默认管理员账号**:
  - 用户名: `admin`
  - 密码: `admin123`
  - 角色: 超级管理员

- **默认角色**:
  - super_admin (超级管理员)
  - admin (管理员)
  - user (普通用户)

- **默认权限**: 系统管理相关的菜单、按钮、API 权限

## 错误处理

### 常见错误码

- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证或 Token 无效
- `403 Forbidden`: 无权限访问
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

### 错误响应格式

```json
{
  "error": "错误类型",
  "code": 400,
  "details": "详细错误信息"
}
```

## 安全建议

1. **生产环境配置**:
   - 修改 JWT Secret 为强随机字符串
   - 使用环境变量管理敏感配置
   - 启用 HTTPS
   - 配置适当的 CORS 策略

2. **密码策略**:
   - 要求强密码 (最小 8 位,包含字母、数字)
   - 定期修改密码
   - 密码使用 bcrypt 加密存储

3. **Token 管理**:
   - 设置合理的过期时间 (建议 24 小时)
   - 实现 Token 刷新机制
   - 登出时清除 Token

4. **权限控制**:
   - 最小权限原则
   - 定期审查用户权限
   - 记录所有权限变更

## 测试

### 使用 curl 测试 API

```bash
# 登录
curl -X POST http://localhost:8090/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 获取用户列表
curl -X GET http://localhost:8090/api/v1/users \
  -H "Authorization: Bearer <your-token>"

# 创建用户
curl -X POST http://localhost:8090/api/v1/users \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "real_name": "测试用户"
  }'
```

## 故障排查

### 1. 无法连接到 auth-service

- 检查 auth-service 是否正常运行
- 检查端口 8090 是否被占用
- 检查防火墙设置

### 2. 登录失败

- 检查用户名和密码是否正确
- 检查数据库连接是否正常
- 查看 auth-service 日志

### 3. Token 验证失败

- 检查 JWT Secret 配置是否一致
- 检查 Token 是否过期
- 检查 Token 格式是否正确 (`Bearer <token>`)

### 4. 权限不足

- 检查用户是否分配了正确的角色
- 检查角色是否分配了对应的权限
- 检查权限配置是否正确

## 更新日志

### v1.0.0 (2025-10-20)

✅ **完成的功能**:

1. **后端 (auth-service)**:
   - ✅ 完整的 RBAC 用户、角色、权限管理 API
   - ✅ JWT 认证和会话管理
   - ✅ 所有 CRUD 接口实现
   - ✅ 分页、过滤、排序支持

2. **前端 (k8s-agent-web)**:
   - ✅ TypeScript 类型定义完整
   - ✅ 用户管理 API 接口
   - ✅ 角色管理 API 接口
   - ✅ 权限管理 API 接口
   - ✅ 认证 API 更新匹配后端格式

3. **集成**:
   - ✅ API 接口对接完成
   - ✅ 响应格式统一
   - ✅ 错误处理规范

📋 **待实现功能**:

- [ ] 菜单接口 (`GET /api/v1/auth/menus`)
- [ ] 权限码接口 (`GET /api/v1/auth/codes`)
- [ ] OAuth 2.0 支持
- [ ] 单点登录 (SSO)
- [ ] 多因素认证 (MFA)
- [ ] API Key 管理界面

## 技术支持

如有问题,请联系:

- 项目文档: [README.md](../README.md)
- Issue 追踪: GitHub Issues
