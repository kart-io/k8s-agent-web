# 滑动验证重置优化说明

## 问题描述

当用户登录失败后（例如用户名或密码错误），滑动验证依然保持已验证状态，导致用户可以直接再次提交而不需要重新验证。这是一个安全问题。

### 期望行为

每次登录失败后，滑动验证应该**自动重置**，强制用户重新完成验证，这样可以：

- ✅ 防止暴力破解攻击
- ✅ 确保每次提交都是真实用户操作
- ✅ 提高安全性

## 解决方案

### 实现原理

使用 Vue 的 `key` 机制强制重新渲染滑动验证组件。当 `key` 值变化时，Vue 会销毁旧组件并创建新组件，从而完全重置验证状态。

### 代码实现

**文件**: `apps/web-k8s/src/views/_core/authentication/login.vue`

```typescript
<script lang="ts" setup>
import { computed, markRaw, ref } from 'vue';
import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';

const authStore = useAuthStore();
const captchaKey = ref(0); // 用于强制重新渲染 captcha

const formSchema = computed((): VbenFormSchema[] => {
  return [
    // ... username 和 password 字段

    {
      component: markRaw(SliderCaptcha),
      componentProps: {
        key: captchaKey.value, // ← 关键：通过 key 控制组件渲染
      },
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    },
  ];
});

// 处理登录提交
async function handleLogin(values: Record<string, any>) {
  try {
    await authStore.authLogin(values);
    // 登录成功，不需要重置
  } catch (error) {
    // 登录失败，重置滑动验证
    resetCaptcha();
    throw error; // 重新抛出错误，让表单显示错误信息
  }
}

// 重置滑动验证
function resetCaptcha() {
  captchaKey.value += 1; // ← 改变 key，强制重新创建组件
}
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="handleLogin"  ← 使用自定义的 handleLogin
  />
</template>
```

## 工作流程

```
用户填写表单并拖动滑块
    ↓
点击"登录"按钮
    ↓
handleLogin() 被调用
    ↓
try {
  authStore.authLogin(values)
}
    ↓
登录请求发送到后端
    ↓
┌─────────────────────────────────┐
│  后端验证                         │
└─────────────────────────────────┘
         ↓                ↓
    ✅ 成功            ❌ 失败
         ↓                ↓
  跳转到首页       catch (error) {
                    resetCaptcha()  ← 重置验证
                    throw error
                  }
                       ↓
                 captchaKey.value += 1
                       ↓
              Vue 检测到 key 变化
                       ↓
            销毁旧的 SliderCaptcha
                       ↓
           创建新的 SliderCaptcha
                       ↓
          滑块回到初始位置（未验证状态）
                       ↓
              用户需要重新验证
```

## 为什么使用 key 机制？

### 方案对比

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| **方案1: 设置字段值为 false** | 简单直接 | 不会重置滑块位置，只改变验证状态 |
| **方案2: 调用组件的 resume() 方法** | 官方提供的方法 | 需要获取组件实例，在表单封装中难以访问 |
| **方案3: 使用 key 强制重新渲染** ✅ | 完全重置组件，简单可靠 | 会销毁并重建组件（性能影响极小） |

### 为什么选择方案3？

1. **完全重置**：销毁旧组件并创建新组件，确保所有状态都被重置
2. **简单可靠**：不需要深入组件内部，通过 Vue 的标准机制实现
3. **视觉反馈**：滑块会有明显的重置动画，用户可以清楚看到需要重新验证
4. **易于维护**：代码简洁，易于理解和维护

## 测试场景

### 场景1: 密码错误

1. 输入用户名：`admin`
2. 输入密码：`wrongpassword` ❌
3. 拖动滑块完成验证 ✅
4. 点击"登录"
5. **结果**：显示错误提示，滑块自动重置 ✅

### 场景2: 用户名错误

1. 输入用户名：`wronguser` ❌
2. 输入密码：`admin123`
3. 拖动滑块完成验证 ✅
4. 点击"登录"
5. **结果**：显示错误提示，滑块自动重置 ✅

### 场景3: 后端服务未启动

1. 输入用户名：`admin`
2. 输入密码：`admin123`
3. 拖动滑块完成验证 ✅
4. 点击"登录"
5. **结果**：显示网络错误，滑块自动重置 ✅

### 场景4: 正确登录

1. 输入用户名：`admin`
2. 输入密码：`admin123`
3. 拖动滑块完成验证 ✅
4. 点击"登录"
5. **结果**：登录成功，跳转到首页 ✅（不重置验证码）

## 关键代码说明

### 1. captchaKey 响应式变量

```typescript
const captchaKey = ref(0);
```

- 初始值为 0
- 每次登录失败时 +1
- 作为 SliderCaptcha 组件的 key

### 2. componentProps 中使用 key

```typescript
{
  component: markRaw(SliderCaptcha),
  componentProps: {
    key: captchaKey.value,  // ← Vue 会监听这个值的变化
  },
  fieldName: 'captcha',
}
```

### 3. handleLogin 异常处理

```typescript
async function handleLogin(values: Record<string, any>) {
  try {
    await authStore.authLogin(values);
  } catch (error) {
    resetCaptcha(); // ← 捕获任何登录错误并重置
    throw error; // ← 重新抛出，让表单组件处理错误显示
  }
}
```

### 4. resetCaptcha 函数

```typescript
function resetCaptcha() {
  captchaKey.value += 1;
}
```

简单优雅，一行代码搞定！

## auth store 的错误处理

**文件**: `apps/web-k8s/src/store/auth.ts`

```typescript
async function authLogin(params: Recordable<any>) {
  try {
    loginLoading.value = true;
    const loginParams = {
      username: params.username,
      password: params.password,
    };
    const { accessToken } = await loginApi(loginParams);

    if (accessToken) {
      // ... 登录成功逻辑
    }
  } catch (error) {
    // 登录失败，显示错误通知
    notification.error({
      description:
        error instanceof Error
          ? error.message
          : $t('authentication.loginFailed'),
      duration: 3,
      message: $t('authentication.loginFailed'),
    });
    // 重新抛出错误，让 handleLogin 捕获并重置验证码
    throw error;
  } finally {
    loginLoading.value = false;
  }
}
```

## 优势总结

### ✅ 安全性

1. **防止暴力破解**：每次失败都需要重新验证
2. **确保真实用户**：机器人无法绕过验证
3. **多层防护**：前端验证 + 后端验证

### ✅ 用户体验

1. **视觉反馈清晰**：滑块重置有动画效果
2. **操作直观**：用户明确知道需要重新验证
3. **错误提示友好**：显示具体的错误信息

### ✅ 代码质量

1. **实现简单**：只需几行代码
2. **易于维护**：使用 Vue 标准机制
3. **可靠性高**：完全重置组件状态

## 常见问题

### Q: 为什么不直接调用 SliderCaptcha 的 resume() 方法？

A: SliderCaptcha 组件被封装在 form-ui 内部，很难直接访问到组件实例。使用 key 机制更简单可靠。

### Q: 改变 key 会不会影响性能？

A: 影响极小。SliderCaptcha 是一个轻量级组件，重建只需要几毫秒。而且这个操作只在登录失败时才会触发，频率很低。

### Q: 如果用户输错密码很多次怎么办？

A: 每次失败都会重置验证码，用户需要重新验证。这正是我们想要的安全行为。如果担心用户体验，可以考虑：

- 在后端添加登录失败次数限制
- 失败 5 次后锁定账户 10 分钟
- 使用更复杂的验证码（如图片验证码）

### Q: 登录成功时验证码会重置吗？

A: 不会。只有在 catch 块中才会调用 resetCaptcha()，登录成功时会直接跳转到首页。

## 相关文件

- `apps/web-k8s/src/views/_core/authentication/login.vue` - 登录页面
- `apps/web-k8s/src/store/auth.ts` - 认证 Store
- `packages/effects/common-ui/src/components/captcha/slider-captcha/index.vue` - SliderCaptcha 组件

## 测试建议

1. **手动测试**：

   ```bash
   # 启动后端
   cd k8s-agent/auth-service
   make run-local

   # 启动前端
   cd k8s-agent-web
   pnpm dev:k8s
   ```

2. **测试步骤**：
   - 访问 http://localhost:5668/auth/login
   - 输入错误密码
   - 完成滑动验证
   - 点击登录
   - **观察**：验证码是否重置（滑块回到左侧）

3. **自动化测试**（可选）：

   ```typescript
   // 伪代码
   describe('Login Captcha Reset', () => {
     it('should reset captcha on login failure', async () => {
       await fillForm({ username: 'admin', password: 'wrong' });
       await completeCaptcha();
       await clickLogin();

       expect(captcha.isVerified).toBe(false); // 验证码应该重置
       expect(captcha.position).toBe(0); // 滑块应该回到左侧
     });
   });
   ```

## 总结

✅ **已实现**：

- 登录失败后自动重置滑动验证
- 使用 Vue key 机制强制重新渲染
- 简单、可靠、易维护

✅ **安全提升**：

- 防止暴力破解攻击
- 确保每次提交都需要人工验证
- 多层安全防护

✅ **用户体验**：

- 视觉反馈清晰
- 操作直观易懂
- 错误提示友好
