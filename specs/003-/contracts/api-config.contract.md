# Contract: API配置契约

**Version**: 1.0.0
**Created**: 2025-10-10
**Owner**: Feature 003 - 项目结构优化

## Purpose

定义`shared/src/config/api.config.js`的导出接口、配置结构和使用规范，确保所有7个应用使用统一的API配置。

---

## 1. 导出接口

### 1.1 ApiConfig对象

**导出路径**: `@k8s-agent/shared/config/api.config.js`

```javascript
export const ApiConfig = {
  baseURL: Object,
  timeout: number,
  retry: Object,
  headers: Object,
  errorHandling: Object
}
```

**类型定义**:

```typescript
interface ApiConfig {
  baseURL: {
    development: string;
    test: string;
    production: string;
  };

  timeout: number;

  retry: {
    maxRetries: number;
    retryDelay: number;
    retryableStatus: number[];
  };

  headers: {
    common: Record<string, string>;
    authenticated: Record<string, string | null>;
  };

  errorHandling: {
    showGlobalMessage: boolean;
    ignoredErrorCodes: number[];
    customMessages: Record<number, string>;
  };
}
```

### 1.2 辅助函数

#### getBaseURL()

获取当前环境的API基础URL。

```javascript
/**
 * 获取当前环境的API基础URL
 * @param {string} [env=import.meta.env.MODE] - 环境名称
 * @returns {string} API基础URL
 */
export function getBaseURL(env = import.meta.env.MODE): string
```

**示例**:

```javascript
import { getBaseURL } from '@k8s-agent/shared/config/api.config.js'

const baseURL = getBaseURL() // 'http://localhost:8080/api' (开发环境)
const prodURL = getBaseURL('production') // 'https://api.k8s-agent.com'
```

#### createAxiosInstance()

创建预配置的Axios实例。

```javascript
/**
 * 创建预配置的Axios实例
 * @param {Object} [options] - 可选配置(覆盖默认配置)
 * @returns {AxiosInstance} Axios实例
 */
export function createAxiosInstance(options = {}): AxiosInstance
```

**示例**:

```javascript
import { createAxiosInstance } from '@k8s-agent/shared/config/api.config.js'

// 使用默认配置
const api = createAxiosInstance()

// 自定义配置
const customApi = createAxiosInstance({
  timeout: 5000,
  headers: {
    'X-Custom-Header': 'value'
  }
})
```

---

## 2. 配置规范

### 2.1 环境变量优先级

API配置支持通过环境变量覆盖默认值：

| 环境变量 | 用途 | 默认值 |
|---------|------|--------|
| `VITE_API_BASE_URL` | API基础URL | 根据MODE自动选择 |
| `VITE_API_TIMEOUT` | 请求超时时间(ms) | 10000 |
| `VITE_ENABLE_MOCK` | 是否启用Mock | false |

**优先级**: 环境变量 > ApiConfig默认值

**示例** (`.env.development`):

```bash
VITE_API_BASE_URL=http://192.168.1.100:8080/api
VITE_API_TIMEOUT=15000
```

### 2.2 请求拦截器规范

所有通过`createAxiosInstance`创建的实例自动包含以下拦截器：

#### 请求拦截器

1. **Token注入**: 从`localStorage.getItem('token')`读取token，注入到`Authorization`头
2. **超时处理**: 根据`ApiConfig.timeout`设置超时
3. **请求日志**: 开发环境下输出请求详情

```javascript
// 自动注入token
config.headers.Authorization = `Bearer ${token}`
```

#### 响应拦截器

1. **自动重试**: 根据`ApiConfig.retry`配置重试失败请求
2. **错误处理**: 根据`ApiConfig.errorHandling`显示用户友好的错误消息
3. **401处理**: 自动跳转到登录页并清除token

```javascript
// 401自动登出
if (error.response?.status === 401) {
  localStorage.removeItem('token')
  router.push('/login')
}
```

---

## 3. 使用示例

### 3.1 基础使用

```javascript
// 1. 导入配置
import { createAxiosInstance } from '@k8s-agent/shared/config/api.config.js'

// 2. 创建API实例
const api = createAxiosInstance()

// 3. 发起请求
export async function getUserList(params) {
  const response = await api.get('/users', { params })
  return response.data
}

export async function createUser(userData) {
  const response = await api.post('/users', userData)
  return response.data
}
```

### 3.2 自定义错误处理

```javascript
import { createAxiosInstance } from '@k8s-agent/shared/config/api.config.js'

const api = createAxiosInstance({
  errorHandling: {
    // 禁用全局错误提示
    showGlobalMessage: false
  }
})

// 手动处理错误
async function deleteUser(userId) {
  try {
    await api.delete(`/users/${userId}`)
    message.success('删除成功')
  } catch (error) {
    // 自定义错误处理
    if (error.response?.status === 409) {
      message.error('该用户存在关联数据,无法删除')
    } else {
      message.error('删除失败')
    }
  }
}
```

### 3.3 多环境配置

```javascript
// .env.development
VITE_API_BASE_URL=http://localhost:8080/api

// .env.test
VITE_API_BASE_URL=https://test-api.k8s-agent.com

// .env.production
VITE_API_BASE_URL=https://api.k8s-agent.com
```

应用启动时自动根据`import.meta.env.MODE`选择正确的baseURL。

---

## 4. 迁移指南

### 4.1 从现有代码迁移

**迁移前** (各应用自定义axios实例):

```javascript
// agent-app/src/utils/request.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // 硬编码
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**迁移后** (使用统一配置):

```javascript
// agent-app/src/utils/request.js
import { createAxiosInstance } from '@k8s-agent/shared/config/api.config.js'

// ✅ 使用统一配置,自动包含拦截器
export const api = createAxiosInstance()
```

### 4.2 迁移检查清单

- [ ] 删除各应用的`src/utils/request.js`或`src/api/request.js`
- [ ] 替换所有`axios.create()`为`createAxiosInstance()`
- [ ] 移除手动编写的token注入拦截器
- [ ] 移除手动编写的错误处理拦截器
- [ ] 更新环境变量文件(`.env.*`)
- [ ] 测试API请求在dev/test/prod环境正常工作

---

## 5. 错误码规范

### 5.1 标准HTTP错误码处理

| 错误码 | 含义 | 默认处理 |
|--------|------|----------|
| 401 | 未授权 | 自动跳转登录页 |
| 403 | 无权限 | 显示"无权访问此资源" |
| 404 | 资源不存在 | 显示"请求的资源不存在" |
| 408 | 请求超时 | 自动重试(最多3次) |
| 429 | 请求过多 | 自动重试(延迟1秒) |
| 500 | 服务器错误 | 显示"服务器内部错误" |
| 502 | 网关错误 | 自动重试 |
| 503 | 服务不可用 | 自动重试 |

### 5.2 自定义业务错误码

后端API应返回以下格式：

```json
{
  "code": 40001,
  "message": "用户名已存在",
  "data": null
}
```

前端处理：

```javascript
api.interceptors.response.use(
  response => {
    const { code, message, data } = response.data

    // 业务错误码处理
    if (code !== 0 && code !== 200) {
      Message.error(message)
      return Promise.reject(new Error(message))
    }

    return data
  }
)
```

---

## 6. 测试契约

### 6.1 单元测试

```javascript
import { describe, it, expect, vi } from 'vitest'
import { getBaseURL, createAxiosInstance, ApiConfig } from '@k8s-agent/shared/config/api.config.js'

describe('ApiConfig', () => {
  it('should export correct baseURL for each environment', () => {
    expect(getBaseURL('development')).toBe('http://localhost:8080/api')
    expect(getBaseURL('production')).toBe('https://api.k8s-agent.com')
  })

  it('should create axios instance with default config', () => {
    const api = createAxiosInstance()
    expect(api.defaults.timeout).toBe(ApiConfig.timeout)
    expect(api.defaults.baseURL).toBe(getBaseURL())
  })

  it('should allow custom config override', () => {
    const api = createAxiosInstance({ timeout: 5000 })
    expect(api.defaults.timeout).toBe(5000)
  })

  it('should inject Authorization header when token exists', async () => {
    localStorage.setItem('token', 'test-token')
    const api = createAxiosInstance()

    const mockAdapter = vi.fn()
    api.interceptors.request.use(mockAdapter)

    await api.get('/test')
    expect(mockAdapter).toHaveBeenCalled()
    expect(mockAdapter.mock.calls[0][0].headers.Authorization).toBe('Bearer test-token')
  })
})
```

### 6.2 集成测试

```javascript
import { describe, it, expect } from 'vitest'
import { createAxiosInstance } from '@k8s-agent/shared/config/api.config.js'
import MockAdapter from 'axios-mock-adapter'

describe('ApiConfig Integration', () => {
  it('should retry on 503 error', async () => {
    const api = createAxiosInstance()
    const mock = new MockAdapter(api)

    let callCount = 0
    mock.onGet('/test').reply(() => {
      callCount++
      return callCount < 3 ? [503] : [200, { success: true }]
    })

    const response = await api.get('/test')
    expect(callCount).toBe(3) // 重试2次后成功
    expect(response.data.success).toBe(true)
  })

  it('should redirect to /login on 401', async () => {
    const api = createAxiosInstance()
    const mock = new MockAdapter(api)
    mock.onGet('/protected').reply(401)

    const mockPush = vi.fn()
    vi.mock('vue-router', () => ({
      useRouter: () => ({ push: mockPush })
    }))

    await expect(api.get('/protected')).rejects.toThrow()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
```

---

## 7. 版本兼容性

### 7.1 当前版本

- **ApiConfig版本**: 1.0.0
- **最低axios版本**: ^1.6.2
- **支持的环境**: development, test, production

### 7.2 Breaking Changes

无(首次发布)

### 7.3 未来计划

- v1.1.0: 支持请求取消(AbortController)
- v1.2.0: 支持请求去重(防止重复提交)
- v2.0.0: 支持GraphQL客户端配置

---

## 8. FAQ

### Q1: 如何在微应用中使用不同的baseURL？

A: 使用环境变量覆盖：

```javascript
// 微应用的 .env.development
VITE_API_BASE_URL=http://localhost:9090/custom-api
```

### Q2: 如何禁用自动重试？

A: 创建实例时传入自定义配置：

```javascript
const api = createAxiosInstance({
  retry: { maxRetries: 0 }
})
```

### Q3: 如何添加自定义请求头？

A: 两种方式：

```javascript
// 方式1: 全局配置
const api = createAxiosInstance({
  headers: {
    'X-Custom-Header': 'value'
  }
})

// 方式2: 单次请求
api.get('/test', {
  headers: { 'X-Custom-Header': 'value' }
})
```

### Q4: 如何处理文件上传？

A: 使用`multipart/form-data`：

```javascript
const formData = new FormData()
formData.append('file', file)

await api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

---

## 9. 验收标准

- [ ] `ApiConfig`对象正确导出所有字段
- [ ] `getBaseURL()`根据环境返回正确URL
- [ ] `createAxiosInstance()`创建包含所有拦截器的实例
- [ ] 401错误自动跳转登录页
- [ ] 503/502错误自动重试(最多3次)
- [ ] 自定义配置可覆盖默认值
- [ ] 所有7个应用成功迁移到统一配置
- [ ] 单元测试覆盖率≥90%
- [ ] 集成测试通过所有场景

---

**签署**:
- 开发团队: ___________
- 审核人: ___________
- 日期: 2025-10-10
