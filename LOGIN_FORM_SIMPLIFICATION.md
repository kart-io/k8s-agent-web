# 登录表单简化说明

## 修改概述

简化 k8s-agent-web 的登录表单，使其仅包含后端 API 所需的两个字段：`username` 和 `password`。

## 修改内容

### 文件：`apps/web-k8s/src/views/_core/authentication/login.vue`

#### 修改前的表单结构

```typescript
const formSchema = [
  {
    fieldName: 'selectAccount',     // ❌ 移除：演示用的账户选择器
    component: 'VbenSelect',
    // ...
  },
  {
    fieldName: 'username',          // ✅ 保留：必填字段
    component: 'VbenInput',
    dependencies: { ... },          // ❌ 移除：依赖 selectAccount 的逻辑
  },
  {
    fieldName: 'password',          // ✅ 保留：必填字段
    component: 'VbenInputPassword',
  },
  {
    fieldName: 'captcha',           // ❌ 移除：滑块验证
    component: 'SliderCaptcha',
  },
];
```

#### 修改后的表单结构

```typescript
const formSchema = [
  {
    fieldName: 'username', // ✅ 用户名（必填）
    component: 'VbenInput',
    label: $t('authentication.username'),
    rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
  },
  {
    fieldName: 'password', // ✅ 密码（必填）
    component: 'VbenInputPassword',
    label: $t('authentication.password'),
    rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
  },
];
```

## 为什么简化？

### 1. **与真实 API 保持一致**

后端 auth-service 的登录接口只需要两个字段：

```go
type LoginRequest struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}
```

### 2. **移除演示功能**

- **selectAccount**：这是用于快速选择演示账户的下拉框，在真实环境中不需要
  - 原本选项：`vben`、`admin`、`jack`
  - 会自动填充用户名和密码 `123456`
  - 适合演示，但不适合生产环境

### 3. **移除前端验证**

- **captcha (滑块验证)**：前端的滑块验证
  - 在开发环境中可能阻碍快速测试
  - 如需安全验证，应在后端实现（如 Google reCAPTCHA、行为分析等）
  - 或者在生产环境中通过配置启用

### 4. **简化表单逻辑**

- 移除 `selectAccount` 后，不再需要 `dependencies` 配置
- 移除不必要的 imports：`markRaw`、`SliderCaptcha`、`BasicOption`
- 代码更简洁，更易维护

## 表单字段说明

### Username（用户名）

```typescript
{
  component: 'VbenInput',
  componentProps: {
    placeholder: $t('authentication.usernameTip'),  // "请输入用户名"
  },
  fieldName: 'username',
  label: $t('authentication.username'),              // "用户名"
  rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
}
```

- **类型**：文本输入框
- **验证**：必填，至少 1 个字符
- **占位符**：提示用户输入用户名

### Password（密码）

```typescript
{
  component: 'VbenInputPassword',
  componentProps: {
    placeholder: $t('authentication.password'),     // "请输入密码"
  },
  fieldName: 'password',
  label: $t('authentication.password'),              // "密码"
  rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
}
```

- **类型**：密码输入框（自动隐藏字符）
- **验证**：必填，至少 1 个字符
- **占位符**：提示用户输入密码

## 登录流程

```
1. 用户访问登录页面
   http://localhost:5668/auth/login?redirect=%2F

2. 填写表单
   ┌─────────────────────────┐
   │ 用户名: admin           │
   │ 密码:   ************   │
   │                         │
   │     [ 登录 ]           │
   └─────────────────────────┘

3. 表单验证（前端）
   ✓ username 非空
   ✓ password 非空

4. 提交到 authStore.authLogin()
   {
     username: "admin",
     password: "admin123"
   }

5. API 请求
   POST /api/v1/auth/login
   {
     "username": "admin",
     "password": "admin123"
   }

6. 代理转发
   Vite proxy: /api/v1/* → http://localhost:8090

7. 后端验证并返回
   {
     "token": "eyJhbGc...",
     "jti": "uuid-...",
     "expires_at": "2024-10-21T...",
     "user": { ... }
   }

8. 登录成功，跳转到首页或重定向 URL
```

## 测试账户

根据 auth-service 的初始化数据：

| 用户名 | 密码     | 角色     | 说明                     |
| ------ | -------- | -------- | ------------------------ |
| admin  | admin123 | 管理员   | 超级管理员，拥有所有权限 |
| user   | user123  | 普通用户 | 普通用户，权限受限       |

## 如何测试

### 1. 启动后端服务

```bash
cd k8s-agent/auth-service
make run-local
```

服务运行在：http://localhost:8090

### 2. 启动前端应用

```bash
cd k8s-agent-web
pnpm dev:k8s
```

应用运行在：http://localhost:5668

### 3. 访问登录页面

浏览器访问：http://localhost:5668/auth/login

### 4. 登录测试

输入：

- 用户名：`admin`
- 密码：`admin123`

点击"登录"按钮

### 5. 验证结果

**成功**：

- ✅ 显示登录成功提示
- ✅ 跳转到首页 `/`
- ✅ 可以看到用户信息和菜单

**失败**：

- ❌ 检查后端服务是否运行（`make run-local`）
- ❌ 检查代理配置（vite.config.mts）
- ❌ 检查浏览器控制台错误
- ❌ 运行 `./test-login.sh` 验证 API

## 与其他应用的对比

### web-antd、web-ele、web-naive（演示版本）

这些应用保留了完整的演示功能：

- ✅ selectAccount（快速选择账户）
- ✅ captcha（滑块验证）
- ✅ 第三方登录（GitHub、Google、Wechat）
- ✅ 手机号登录、二维码登录

### web-k8s（生产版本）

专注于真实的 Kubernetes 管理功能：

- ✅ 简洁的登录表单（仅 username + password）
- ✅ 与 auth-service 完全集成
- ✅ 生产级的认证授权
- ❌ 移除演示性质的功能

## 恢复演示功能（可选）

如果在开发环境中需要快速测试，可以保留 `selectAccount`：

```typescript
// 开发环境快速登录配置（可选）
const isDev = import.meta.env.DEV;

const formSchema = computed((): VbenFormSchema[] => {
  const fields = [];

  // 仅在开发环境显示快速选择
  if (isDev) {
    fields.push({
      component: 'VbenSelect',
      componentProps: {
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ],
        placeholder: '快速选择测试账户',
      },
      fieldName: 'selectAccount',
      label: '快速选择',
      dependencies: {
        trigger(values, form) {
          if (values.selectAccount === 'admin') {
            form.setValues({ username: 'admin', password: 'admin123' });
          } else if (values.selectAccount === 'user') {
            form.setValues({ username: 'user', password: 'user123' });
          }
        },
        triggerFields: ['selectAccount'],
      },
    });
  }

  // 必填字段
  fields.push(
    {
      fieldName: 'username',
      component: 'VbenInput',
      // ...
    },
    {
      fieldName: 'password',
      component: 'VbenInputPassword',
      // ...
    },
  );

  return fields;
});
```

## 相关文件

- `apps/web-k8s/src/views/_core/authentication/login.vue` - 登录页面组件
- `apps/web-k8s/src/store/auth.ts` - 认证 Store
- `apps/web-k8s/src/api/core/auth.ts` - 认证 API
- `apps/web-k8s/vite.config.mts` - API 代理配置
- `LOGIN_PARAMS_FIX.md` - 登录参数修复说明

## 总结

✅ **已完成**：

1. 移除 `selectAccount` 演示账户选择器
2. 移除 `captcha` 滑块验证
3. 简化表单为仅 `username` 和 `password` 两个字段
4. 移除不必要的依赖和导入
5. 保持表单验证规则

✅ **优势**：

1. 与后端 API 完全一致
2. 代码更简洁易维护
3. 专注于真实生产功能
4. 登录流程更清晰

✅ **测试**：

1. 使用 `admin` / `admin123` 登录
2. 使用 `user` / `user123` 登录
3. 验证表单验证规则
4. 验证登录成功后的跳转
