# K8s 管理平台开发指南

本文档提供详细的开发指导和最佳实践，帮助开发者理解项目架构并高效地进行开发。

## 目录

- [快速开始](#快速开始)
- [项目架构](#项目架构)
- [开发规范](#开发规范)
- [组件开发](#组件开发)
- [API 集成](#api-集成)
- [测试指南](#测试指南)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

## 快速开始

### 环境准备

确保已安装以下工具：

```bash
node -v    # v18.0.0+
pnpm -v    # v8.0.0+
```

### 克隆项目

```bash
git clone <repository-url>
cd k8s-agent-web
```

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
# 启动前端应用
pnpm --filter @vben/web-k8s run dev

# 启动 Mock 后端（可选）
pnpm --filter backend-mock run dev
```

访问 `http://localhost:5670` 查看应用。

### 项目目录结构

```text
apps/web-k8s/
├── src/
│   ├── api/                    # API 接口层
│   │   └── k8s/
│   │       ├── types.ts        # TypeScript 类型定义
│   │       └── mock.ts         # Mock 数据生成
│   ├── views/                  # 页面组件
│   │   ├── k8s/                # K8s 管理模块
│   │   │   ├── dashboard/      # Dashboard
│   │   │   ├── workloads/      # 工作负载
│   │   │   ├── network/        # 网络
│   │   │   ├── config/         # 配置
│   │   │   ├── storage/        # 存储
│   │   │   ├── rbac/           # 权限
│   │   │   ├── quota/          # 配额
│   │   │   ├── cluster/        # 集群
│   │   │   └── _shared/        # 共享组件
│   ├── router/                 # 路由配置
│   │   └── routes/
│   │       └── modules/
│   │           └── k8s.ts      # K8s 路由
│   ├── config/                 # 配置文件
│   ├── types/                  # 全局类型
│   ├── utils/                  # 工具函数
│   └── styles/                 # 全局样式
├── public/                     # 静态资源
├── tests/                      # 测试文件
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
└── package.json                # 项目配置
```

## 项目架构

### 技术栈

- **Vue 3**：使用 Composition API
- **TypeScript**：类型安全
- **Vite**：构建工具
- **Ant Design Vue**：UI 组件库
- **Vue Router**：路由管理
- **Pinia**（可选）：状态管理

### 设计原则

1. **组件化**：将 UI 拆分为可复用的组件
2. **类型安全**：使用 TypeScript 定义所有类型
3. **配置驱动**：通过配置减少重复代码
4. **响应式设计**：支持多种屏幕尺寸
5. **性能优化**：懒加载、虚拟滚动等

### 数据流

```text
用户操作 → 组件事件 → API 调用 → 更新状态 → UI 重渲染
```

## 开发规范

### TypeScript 类型定义

#### 资源类型定义

所有 K8s 资源都应该有完整的类型定义：

```typescript
// src/api/k8s/types.ts
export interface Pod {
  apiVersion: string;
  kind: string;
  metadata: ObjectMeta;
  spec: PodSpec;
  status?: PodStatus;
}

export interface ObjectMeta {
  name: string;
  namespace?: string;
  uid?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  creationTimestamp?: string;
}
```

#### API 参数类型

```typescript
export interface PodListParams {
  clusterId: string;
  namespace?: string;
  labelSelector?: string;
  fieldSelector?: string;
  page?: number;
  pageSize?: number;
}
```

#### 组件 Props 类型

```typescript
const props = defineProps<{
  clusterId: string;
  namespace?: string;
  onRefresh?: () => void;
}>();
```

### 命名规范

#### 文件命名

- **组件文件**：PascalCase（`ClusterStatusCards.vue`）
- **工具文件**：camelCase（`formatTime.ts`）
- **常量文件**：UPPER_SNAKE_CASE（`API_ENDPOINTS.ts`）

#### 变量命名

```typescript
// 使用 camelCase
const clusterList = ref<Cluster[]>([]);
const isLoading = ref(false);

// 布尔变量使用 is/has/should 前缀
const isReady = computed(() => status.value === 'Ready');
const hasErrors = computed(() => errors.value.length > 0);

// 常量使用 UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 10;
```

#### 函数命名

```typescript
// 使用动词开头
function loadPods() { }
function handleDelete() { }
function formatDateTime() { }

// 布尔返回值使用 is/has/can 前缀
function isPodRunning(pod: Pod): boolean { }
function hasLabel(resource: any, key: string): boolean { }
```

### 代码风格

#### Vue 组件结构

推荐的组件结构顺序：

```vue
<script lang="ts" setup>
// 1. 导入
import { ref, computed, onMounted } from 'vue';
import type { Pod } from '#/api/k8s/types';

// 2. Props 定义
const props = defineProps<{
  clusterId: string;
}>();

// 3. Emits 定义
const emit = defineEmits<{
  (e: 'update', value: Pod): void;
}>();

// 4. 响应式状态
const pods = ref<Pod[]>([]);
const loading = ref(false);

// 5. 计算属性
const runningPods = computed(() =>
  pods.value.filter(p => p.status === 'Running')
);

// 6. 方法
async function loadPods() {
  // 实现
}

function handleDelete(pod: Pod) {
  // 实现
}

// 7. 生命周期钩子
onMounted(() => {
  loadPods();
});
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
/* 样式 */
</style>
```

#### 样式规范

使用 CSS 变量保持主题一致性：

```vue
<style scoped>
.container {
  padding: 16px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.description {
  font-size: 14px;
  color: var(--vben-text-color-secondary);
}

/* 暗色主题适配 */
html[data-theme='dark'] .container {
  background-color: rgb(255 255 255 / 2%);
}
</style>
```

## 组件开发

### 创建新的资源管理页面

#### 步骤 1：定义类型

在 `src/api/k8s/types.ts` 中添加：

```typescript
export interface MyResource {
  apiVersion: string;
  kind: string;
  metadata: ObjectMeta;
  spec: MyResourceSpec;
  status?: MyResourceStatus;
}

export interface MyResourceSpec {
  // 规格字段
}

export interface MyResourceStatus {
  // 状态字段
}

export interface MyResourceListParams {
  clusterId: string;
  namespace?: string;
  page?: number;
  pageSize?: number;
}
```

#### 步骤 2：添加 Mock 数据

在 `src/api/k8s/mock.ts` 中添加：

```typescript
export function getMockMyResourceList(
  params: MyResourceListParams
): PaginatedList<MyResource> {
  // 生成 Mock 数据
  const items: MyResource[] = [];

  for (let i = 0; i < 10; i++) {
    items.push({
      apiVersion: 'v1',
      kind: 'MyResource',
      metadata: {
        name: `my-resource-${i}`,
        namespace: params.namespace || 'default',
        uid: `uid-${i}`,
        creationTimestamp: new Date().toISOString(),
      },
      spec: {
        // 规格数据
      },
      status: {
        // 状态数据
      },
    });
  }

  return {
    items,
    total: items.length,
  };
}
```

#### 步骤 3：创建列表组件

创建 `src/views/k8s/my-resources/index.vue`：

```vue
<script lang="ts" setup>
import type { MyResource, MyResourceListParams } from '#/api/k8s/types';

import { onMounted, ref } from 'vue';

import { Card, message, Pagination, Table } from 'ant-design-vue';

import { getMockMyResourceList } from '#/api/k8s/mock';

// 当前集群ID
const currentClusterId = ref('cluster-production-01');

// 加载状态
const loading = ref(false);

// 资源列表
const resources = ref<MyResource[]>([]);
const total = ref(0);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);

// 表格列定义
const columns = [
  {
    title: '名称',
    dataIndex: ['metadata', 'name'],
    key: 'name',
  },
  {
    title: '命名空间',
    dataIndex: ['metadata', 'namespace'],
    key: 'namespace',
  },
  {
    title: '创建时间',
    dataIndex: ['metadata', 'creationTimestamp'],
    key: 'creationTimestamp',
  },
];

/**
 * 加载资源列表
 */
async function loadResources() {
  loading.value = true;
  try {
    const params: MyResourceListParams = {
      clusterId: currentClusterId.value,
      page: currentPage.value,
      pageSize: pageSize.value,
    };

    const result = getMockMyResourceList(params);
    resources.value = result.items;
    total.value = result.total;
  } catch (error: any) {
    message.error(`加载资源失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
}

/**
 * 处理分页变化
 */
function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  loadResources();
}

// 组件挂载时加载数据
onMounted(() => {
  loadResources();
});
</script>

<template>
  <div class="my-resources-container">
    <Card class="table-card" :bordered="false">
      <template #title>
        <span>My Resources ({{ total }})</span>
      </template>

      <Table
        :columns="columns"
        :data-source="resources"
        :loading="loading"
        :pagination="false"
        :row-key="(record) => record.metadata.uid"
      />

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-wrapper">
        <Pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :show-size-changer="true"
          :show-total="(total) => `共 ${total} 条`"
          @change="handlePageChange"
        />
      </div>
    </Card>
  </div>
</template>

<style scoped>
.my-resources-container {
  padding: 16px;
}

.table-card {
  background-color: var(--vben-background-color);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--vben-border-color);
}
</style>
```

#### 步骤 4：添加路由

在 `src/router/routes/modules/k8s.ts` 中添加：

```typescript
{
  name: 'K8sMyResources',
  path: 'my-resources',
  component: () => import('#/views/k8s/my-resources/index.vue'),
  meta: {
    icon: 'lucide:box',
    title: 'My Resources',
  },
}
```

### 创建详情抽屉

创建 `src/views/k8s/my-resources/DetailDrawer.vue`：

```vue
<script lang="ts" setup>
import type { MyResource } from '#/api/k8s/types';

import { Descriptions, Drawer } from 'ant-design-vue';

// Props
const props = defineProps<{
  visible: boolean;
  resource?: MyResource;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

/**
 * 关闭抽屉
 */
function handleClose() {
  emit('update:visible', false);
}
</script>

<template>
  <Drawer
    :open="visible"
    :title="`资源详情: ${resource?.metadata.name || ''}`"
    width="600"
    @close="handleClose"
  >
    <div v-if="resource">
      <Descriptions title="基本信息" :column="1" bordered>
        <Descriptions.Item label="名称">
          {{ resource.metadata.name }}
        </Descriptions.Item>
        <Descriptions.Item label="命名空间">
          {{ resource.metadata.namespace }}
        </Descriptions.Item>
        <Descriptions.Item label="UID">
          <code>{{ resource.metadata.uid }}</code>
        </Descriptions.Item>
      </Descriptions>
    </div>
  </Drawer>
</template>
```

### 共享组件开发

#### 创建通用的状态标签组件

创建 `src/views/k8s/_shared/StatusTag.vue`：

```vue
<script lang="ts" setup>
import { Tag } from 'ant-design-vue';

const props = defineProps<{
  status: string;
}>();

/**
 * 获取状态颜色
 */
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    Running: 'success',
    Succeeded: 'success',
    Pending: 'warning',
    Failed: 'error',
    Unknown: 'default',
  };
  return colorMap[status] || 'default';
}
</script>

<template>
  <Tag :color="getStatusColor(status)">
    {{ status }}
  </Tag>
</template>
```

使用示例：

```vue
<script lang="ts" setup>
import StatusTag from '#/views/k8s/_shared/StatusTag.vue';
</script>

<template>
  <StatusTag :status="pod.status" />
</template>
```

## API 集成

### 从 Mock 切换到真实 API

#### 创建 API 客户端

创建 `src/api/k8s/client.ts`：

```typescript
import axios, { type AxiosInstance } from 'axios';

class K8sApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加认证 Token
        const token = localStorage.getItem('k8s-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        // 错误处理
        if (error.response?.status === 401) {
          // 未授权，跳转登录
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 获取 Pod 列表
   */
  async listPods(params: PodListParams): Promise<PaginatedList<Pod>> {
    return this.client.get('/api/v1/pods', { params });
  }

  /**
   * 获取 Pod 详情
   */
  async getPod(clusterId: string, namespace: string, name: string): Promise<Pod> {
    return this.client.get(`/api/v1/clusters/${clusterId}/namespaces/${namespace}/pods/${name}`);
  }

  /**
   * 删除 Pod
   */
  async deletePod(clusterId: string, namespace: string, name: string): Promise<void> {
    return this.client.delete(`/api/v1/clusters/${clusterId}/namespaces/${namespace}/pods/${name}`);
  }
}

// 导出单例
export const k8sApi = new K8sApiClient(import.meta.env.VITE_API_BASE_URL || '');
```

#### 在组件中使用

```typescript
import { k8sApi } from '#/api/k8s/client';

async function loadPods() {
  loading.value = true;
  try {
    const result = await k8sApi.listPods({
      clusterId: currentClusterId.value,
      namespace: selectedNamespace.value,
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    pods.value = result.items;
    total.value = result.total;
  } catch (error: any) {
    message.error(`加载 Pods 失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
}
```

### 错误处理

#### 统一错误处理

创建 `src/utils/errorHandler.ts`：

```typescript
import { message } from 'ant-design-vue';

export function handleApiError(error: any) {
  let errorMessage = '操作失败';

  if (error.response) {
    // 服务器返回错误
    const { status, data } = error.response;

    switch (status) {
      case 400:
        errorMessage = data.message || '请求参数错误';
        break;
      case 401:
        errorMessage = '未授权，请重新登录';
        break;
      case 403:
        errorMessage = '权限不足';
        break;
      case 404:
        errorMessage = '资源不存在';
        break;
      case 500:
        errorMessage = '服务器错误';
        break;
      default:
        errorMessage = data.message || '未知错误';
    }
  } else if (error.request) {
    // 请求发送但未收到响应
    errorMessage = '网络错误，请检查网络连接';
  } else {
    // 其他错误
    errorMessage = error.message || '操作失败';
  }

  message.error(errorMessage);
}
```

使用示例：

```typescript
import { handleApiError } from '#/utils/errorHandler';

async function deletePod(pod: Pod) {
  try {
    await k8sApi.deletePod(
      currentClusterId.value,
      pod.metadata.namespace!,
      pod.metadata.name
    );
    message.success('删除成功');
    await loadPods();
  } catch (error) {
    handleApiError(error);
  }
}
```

## 测试指南

### 单元测试

使用 Vitest 进行单元测试。

#### 安装依赖

```bash
pnpm add -D vitest @vue/test-utils jsdom
```

#### 测试组件

创建 `tests/unit/StatusTag.spec.ts`：

```typescript
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import StatusTag from '@/views/k8s/_shared/StatusTag.vue';

describe('StatusTag.vue', () => {
  it('renders Running status correctly', () => {
    const wrapper = mount(StatusTag, {
      props: {
        status: 'Running',
      },
    });

    expect(wrapper.text()).toBe('Running');
    expect(wrapper.find('.ant-tag-success').exists()).toBe(true);
  });

  it('renders Failed status correctly', () => {
    const wrapper = mount(StatusTag, {
      props: {
        status: 'Failed',
      },
    });

    expect(wrapper.text()).toBe('Failed');
    expect(wrapper.find('.ant-tag-error').exists()).toBe(true);
  });
});
```

#### 测试工具函数

创建 `tests/unit/formatTime.spec.ts`：

```typescript
import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from '@/utils/time';

describe('formatRelativeTime', () => {
  it('formats recent time correctly', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    expect(formatRelativeTime(fiveMinutesAgo.toISOString())).toBe('5分钟前');
  });

  it('formats old time correctly', () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    expect(formatRelativeTime(threeDaysAgo.toISOString())).toBe('3天前');
  });
});
```

#### 运行测试

```bash
pnpm test
```

### E2E 测试

使用 Playwright 进行端到端测试。

#### 安装依赖

```bash
pnpm add -D @playwright/test
```

#### 编写测试

创建 `tests/e2e/pods.spec.ts`：

```typescript
import { expect, test } from '@playwright/test';

test.describe('Pods Page', () => {
  test('should display pods list', async ({ page }) => {
    await page.goto('/k8s/workloads/pods');

    // 等待表格加载
    await page.waitForSelector('.ant-table');

    // 检查表格存在
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();

    // 检查表头
    await expect(page.locator('th:has-text("名称")')).toBeVisible();
    await expect(page.locator('th:has-text("状态")')).toBeVisible();
  });

  test('should filter pods by namespace', async ({ page }) => {
    await page.goto('/k8s/workloads/pods');

    // 选择命名空间
    await page.click('.namespace-select');
    await page.click('text=production');

    // 等待列表更新
    await page.waitForTimeout(1000);

    // 验证筛选结果
    const firstRow = page.locator('.ant-table-tbody tr').first();
    await expect(firstRow).toContainText('production');
  });
});
```

#### 运行测试

```bash
pnpm exec playwright test
```

## 部署指南

### 构建生产版本

```bash
pnpm --filter @vben/web-k8s run build
```

构建产物位于 `dist/` 目录。

### Docker 部署

#### 创建 Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-k8s/package.json apps/web-k8s/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm --filter @vben/web-k8s run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/web-k8s/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 创建 nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://backend-api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
}
```

#### 构建和运行

```bash
# 构建镜像
docker build -t k8s-web:latest .

# 运行容器
docker run -d -p 8080:80 k8s-web:latest
```

### Kubernetes 部署

#### 创建 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: k8s-web
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: k8s-web
  template:
    metadata:
      labels:
        app: k8s-web
    spec:
      containers:
      - name: web
        image: k8s-web:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

#### 创建 Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: k8s-web
  namespace: default
spec:
  selector:
    app: k8s-web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

#### 创建 Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: k8s-web
  namespace: default
spec:
  rules:
  - host: k8s-web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: k8s-web
            port:
              number: 80
```

#### 部署

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## 常见问题

### 如何调试组件？

使用 Vue Devtools 浏览器扩展：

1. 安装 Vue Devtools
2. 打开开发者工具
3. 切换到 Vue 标签页
4. 查看组件树、Props、State 等

### 如何优化首屏加载速度？

1. **代码分割**：使用动态导入
   ```typescript
   component: () => import('#/views/k8s/pods/index.vue')
   ```

2. **路由懒加载**：已默认启用

3. **图片优化**：使用 WebP 格式

4. **启用 Gzip 压缩**：在 Nginx 配置中启用

### 如何处理大量数据的表格？

使用虚拟滚动：

```bash
pnpm add vxe-table
```

```vue
<script setup>
import { VxeTable } from 'vxe-table';
import 'vxe-table/lib/style.css';
</script>

<template>
  <vxe-table
    :data="largeDataset"
    :scroll-y="{ enabled: true }"
    height="600"
  >
    <!-- 列定义 -->
  </vxe-table>
</template>
```

### 如何实现国际化？

使用 Vue I18n：

```bash
pnpm add vue-i18n
```

```typescript
// src/locales/zh-CN.ts
export default {
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
  },
  pods: {
    title: 'Pods',
    status: '状态',
  },
};

// src/locales/en-US.ts
export default {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
  },
  pods: {
    title: 'Pods',
    status: 'Status',
  },
};
```

使用：

```vue
<template>
  <div>{{ t('pods.title') }}</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
```

## 总结

本开发指南提供了从环境搭建到部署上线的完整流程。遵循这些最佳实践，可以高效地开发和维护 K8s 管理平台。

如有任何问题，欢迎提交 Issue 或联系维护者。
