# 登录参数修复说明

## 问题描述

前端登录表单发送的参数与后端 API 接口期望的参数不一致。

### 后端期望的参数格式

```go
type LoginRequest struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}
```

后端只需要两个必填字段：

- `username` (必填)
- `password` (必填)

### 前端原有问题

1. **类型定义问题**：`LoginParams` 接口中 `username` 和 `password` 被定义为可选字段

   ```typescript
   // ❌ 错误的定义
   export interface LoginParams {
     password?: string; // 可选
     username?: string; // 可选
   }
   ```

2. **额外字段问题**：前端登录表单包含额外字段（`selectAccount`、`captcha`）
   - 虽然后端会忽略这些字段，但会增加网络传输数据量
   - 可能造成接口调用不清晰

## 解决方案

### 1. 更新 TypeScript 类型定义

**文件**: `apps/web-k8s/src/api/core/auth.ts`

```typescript
export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    username: string; // ✅ 必填
    password: string; // ✅ 必填
  }
}
```

### 2. 更新登录方法参数过滤

**文件**: `apps/web-k8s/src/store/auth.ts`

```typescript
async function authLogin(
  params: Recordable<any>,
  onSuccess?: () => Promise<void> | void,
) {
  try {
    loginLoading.value = true;
    // ✅ 只发送 username 和 password 到后端
    const loginParams = {
      username: params.username,
      password: params.password,
    };
    const { accessToken } = await loginApi(loginParams);
    // ... 其余代码
  }
}
```

## 为什么这样设计？

### 前端表单保持灵活

前端登录表单可以包含多个字段以增强用户体验：

```typescript
// 前端表单 schema
const formSchema = [
  {
    fieldName: 'selectAccount', // 快速选择账户
    // ...
  },
  {
    fieldName: 'username', // 用户名
    // ...
  },
  {
    fieldName: 'password', // 密码
    // ...
  },
  {
    fieldName: 'captcha', // 滑块验证
    // ...
  },
];
```

### API 调用保持简洁

通过在 `authStore.authLogin` 中过滤参数，确保：

- ✅ 只发送后端需要的字段
- ✅ 减少网络传输数据
- ✅ API 调用清晰明确
- ✅ 保持前后端接口一致性

## 数据流转示意

```
用户填写表单
    ↓
{
  selectAccount: "admin",     ← 前端使用
  username: "admin",          ← 发送到后端 ✅
  password: "admin123",       ← 发送到后端 ✅
  captcha: true              ← 前端验证
}
    ↓
authStore.authLogin() 过滤
    ↓
{
  username: "admin",          ← 只保留这两个字段
  password: "admin123"
}
    ↓
POST /api/v1/auth/login
    ↓
后端验证并返回
    ↓
{
  token: "eyJhbGc...",
  jti: "uuid-...",
  expires_at: "2024-...",
  user: { ... }
}
```

## 测试

运行测试脚本验证登录参数：

```bash
cd k8s-agent-web
./test-login.sh
```

测试脚本会验证：

1. ✅ 正确的参数格式（只包含 username 和 password）
2. ✅ 包含额外字段的情况（后端正确忽略）
3. ✅ 缺少必填字段（后端返回 400）
4. ✅ 返回值格式（token, jti, expires_at, user）

## 相关文件

- `apps/web-k8s/src/api/core/auth.ts` - API 类型定义
- `apps/web-k8s/src/store/auth.ts` - 认证 Store
- `apps/web-k8s/src/views/_core/authentication/login.vue` - 登录页面
- `test-login.sh` - 登录参数测试脚本

## 后端接口文档

### POST /api/v1/auth/login

**请求参数**:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**成功响应** (200):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "jti": "550e8400-e29b-41d4-a716-446655440000",
  "expires_at": "2024-10-21T10:00:00Z",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "real_name": "Administrator",
    "avatar": "/avatars/admin.png",
    "roles": [
      {
        "id": "1",
        "name": "管理员",
        "code": "admin",
        "status": 1
      }
    ]
  }
}
```

**错误响应** (400):

```json
{
  "error": "Invalid request format"
}
```

**错误响应** (401):

```json
{
  "error": "Invalid username or password"
}
```

**错误响应** (403):

```json
{
  "error": "User account is disabled"
}
```

## 常见问题

### Q: 为什么不直接在表单 schema 中移除额外字段？

A:

- `selectAccount` 提供快捷选择账户功能，改善用户体验
- `captcha` 提供前端安全验证，防止机器人攻击
- 这些字段在前端有其用途，不应该移除
- 通过在 API 调用层过滤参数更为合理

### Q: 后端是否会拒绝包含额外字段的请求？

A:

- 不会。Go 的 JSON 解析会忽略未定义的字段
- `binding:"required"` 只验证必填字段是否存在
- 额外字段不会影响登录流程

### Q: 如何确保参数类型正确？

A:

- TypeScript 类型系统在编译时检查
- 将 `username` 和 `password` 定义为必填（非可选）
- IDE 会在调用时提示类型错误

## 总结

✅ **已修复**:

1. 更新 `LoginParams` 类型定义，确保字段为必填
2. 在 `authStore.authLogin` 中过滤参数，只发送后端需要的字段
3. 创建测试脚本验证登录参数

✅ **优势**:

1. 前端表单保持灵活性（selectAccount, captcha）
2. API 调用保持简洁性（只发送 username, password）
3. 前后端接口完全一致
4. TypeScript 类型安全

✅ **测试**:

1. 正确参数格式测试通过
2. 额外字段正确处理
3. 必填字段验证正常
4. 返回值格式符合预期
