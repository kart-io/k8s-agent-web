# 登录表单配置说明

## 表单字段概述

k8s-agent-web 的登录表单包含 3 个字段，平衡了安全性和用户体验：

| 字段         | 组件              | 必填 | 说明                     |
| ------------ | ----------------- | ---- | ------------------------ |
| **username** | VbenInput         | ✅   | 用户名输入框             |
| **password** | VbenInputPassword | ✅   | 密码输入框（隐藏字符）   |
| **captcha**  | SliderCaptcha     | ✅   | 滑动验证（前端安全验证） |

## 表单字段详细配置

### 1. Username（用户名）

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
- **验证规则**：必填，至少 1 个字符
- **用途**：识别用户身份

### 2. Password（密码）

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

- **类型**：密码输入框
- **验证规则**：必填，至少 1 个字符
- **特性**：自动隐藏输入字符，防止偷窥
- **用途**：验证用户密码

### 3. Captcha（滑动验证）

```typescript
{
  component: markRaw(SliderCaptcha),
  fieldName: 'captcha',
  rules: z.boolean().refine((value) => value, {
    message: $t('authentication.verifyRequiredTip'), // "请完成验证"
  }),
}
```

- **类型**：滑动验证组件
- **验证规则**：必须完成滑动验证（值为 true）
- **用途**：防止机器人自动登录攻击
- **特性**：
  - 用户需要拖动滑块完成拼图
  - 验证通过后才能提交表单
  - 提升安全性，防止暴力破解

## 登录流程

```
1. 用户访问登录页面
   http://localhost:5668/auth/login?redirect=%2F

2. 填写表单
   ┌─────────────────────────┐
   │ 用户名: admin           │
   │ 密码:   ************   │
   │                         │
   │ [=====>        ]  滑块  │
   │                         │
   │     [ 登录 ]           │
   └─────────────────────────┘

3. 前端验证（Zod schema）
   ✓ username 非空
   ✓ password 非空
   ✓ captcha === true

4. authStore.authLogin() 过滤参数
   表单值：{ username, password, captcha }
   API 参数：{ username, password }  ← 只发送这两个

5. API 请求
   POST /api/v1/auth/login
   {
     "username": "admin",
     "password": "admin123"
   }

6. Vite 代理转发
   /api/v1/* → http://localhost:8090

7. auth-service 验证
   - 验证用户名和密码
   - 检查用户状态
   - 生成 JWT token

8. 返回登录结果
   {
     "token": "eyJhbGc...",
     "jti": "uuid-...",
     "expires_at": "2024-10-21T...",
     "user": { ... }
   }

9. 登录成功，跳转
   - 保存 token 到 store
   - 获取用户信息和权限
   - 跳转到首页或 redirect URL
```

## 为什么添加滑动验证？

### 1. **安全性**

- ✅ **防止暴力破解**：机器人无法自动完成滑动验证
- ✅ **防止自动化攻击**：需要真实的用户交互
- ✅ **提升登录安全**：多一层前端保护

### 2. **用户体验**

- ✅ **简单直观**：拖动滑块即可，比输入验证码更友好
- ✅ **视觉反馈**：拼图效果，用户清楚知道是否完成
- ✅ **无需额外输入**：不像传统验证码需要输入字符

### 3. **前后端配合**

- **前端**：滑动验证（captcha 字段）
  - 在表单提交前验证
  - 防止前端层面的自动化攻击
  - 不发送到后端 API

- **后端**：用户名密码验证
  - 验证用户身份
  - 检查账户状态
  - 生成 JWT token

## 参数过滤机制

### 表单提交的完整数据

```typescript
{
  username: "admin",
  password: "admin123",
  captcha: true  // ← 滑动验证完成
}
```

### authStore.authLogin() 过滤

```typescript
async function authLogin(params: Recordable<any>) {
  // 只提取 username 和 password 发送到后端
  const loginParams = {
    username: params.username,
    password: params.password,
  };
  // captcha 字段不发送到后端
  const { accessToken } = await loginApi(loginParams);
}
```

### 发送到后端的数据

```json
{
  "username": "admin",
  "password": "admin123"
}
```

## 测试账户

| 用户名    | 密码         | 角色     | 说明         |
| --------- | ------------ | -------- | ------------ |
| **admin** | **admin123** | 管理员   | 拥有所有权限 |
| **user**  | **user123**  | 普通用户 | 权限受限     |

## 如何测试

### 1. 启动服务

```bash
# 启动后端
cd k8s-agent/auth-service
make run-local

# 启动前端
cd k8s-agent-web
pnpm dev:k8s
```

### 2. 访问登录页面

浏览器访问：http://localhost:5668/auth/login

### 3. 登录步骤

1. 输入用户名：`admin`
2. 输入密码：`admin123`
3. **拖动滑块**完成验证（重要！）
4. 点击"登录"按钮

### 4. 验证结果

**成功**：

- ✅ 滑动验证通过（拼图完成）
- ✅ 用户名密码正确
- ✅ 显示登录成功提示
- ✅ 跳转到首页

**失败**：

- ❌ 未完成滑动验证：显示"请完成验证"
- ❌ 用户名或密码错误：显示"用户名或密码错误"
- ❌ 后端服务未启动：显示网络错误

## 组件说明

### SliderCaptcha 组件

这是 `@vben/common-ui` 提供的滑动验证组件，特性：

- **交互方式**：拖动滑块完成拼图
- **返回值**：布尔值（true = 验证通过，false = 未验证）
- **使用 markRaw**：防止 Vue 对组件进行深度响应式处理，提升性能

```typescript
import { markRaw } from 'vue';
import { SliderCaptcha } from '@vben/common-ui';

{
  component: markRaw(SliderCaptcha),  // 使用 markRaw 包裹
  fieldName: 'captcha',
  rules: z.boolean().refine((value) => value, {
    message: '请完成验证',
  }),
}
```

## 进阶配置（可选）

### 仅在生产环境启用滑动验证

如果开发时觉得滑动验证影响测试效率，可以：

```typescript
const isDev = import.meta.env.DEV;

const formSchema = computed((): VbenFormSchema[] => {
  const fields = [
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
  ];

  // 仅在生产环境添加滑动验证
  if (!isDev) {
    fields.push({
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    });
  }

  return fields;
});
```

### 自定义验证消息

```typescript
{
  component: markRaw(SliderCaptcha),
  fieldName: 'captcha',
  rules: z.boolean().refine((value) => value, {
    message: '请拖动滑块完成验证后再登录',  // 自定义消息
  }),
}
```

## 与后端接口的关系

### 后端不需要 captcha 字段

```go
// auth-service/pkg/types/types.go
type LoginRequest struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
    // 注意：没有 Captcha 字段
}
```

### 前端自动过滤

前端 `authStore.authLogin()` 会自动过滤 captcha 字段，只发送 username 和 password：

```typescript
// apps/web-k8s/src/store/auth.ts
async function authLogin(params: Recordable<any>) {
  const loginParams = {
    username: params.username,
    password: params.password,
    // captcha 字段不包含在内
  };
  const { accessToken } = await loginApi(loginParams);
}
```

## 相关文件

- `apps/web-k8s/src/views/_core/authentication/login.vue` - 登录表单组件
- `apps/web-k8s/src/store/auth.ts` - 认证 Store（参数过滤）
- `apps/web-k8s/src/api/core/auth.ts` - 登录 API 类型定义
- `packages/effects/common-ui/src/ui/authentication/` - 登录组件库
- `packages/effects/common-ui/src/components/captcha/` - 滑动验证组件

## 总结

✅ **当前配置**：

1. Username 输入框（必填）
2. Password 输入框（必填）
3. SliderCaptcha 滑动验证（必填）

✅ **设计理念**：

1. **前端安全**：滑动验证防止机器人攻击
2. **后端验证**：用户名密码验证用户身份
3. **参数过滤**：前端字段不影响后端 API
4. **用户体验**：滑动验证比传统验证码更友好

✅ **测试要点**：

1. 确保完成滑动验证
2. 输入正确的用户名和密码
3. 验证登录成功后的跳转
4. 检查浏览器控制台无错误
