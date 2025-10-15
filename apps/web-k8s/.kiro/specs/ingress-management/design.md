# Ingress 管理 - 设计文档

## 概述

本设计文档详细说明了 K8s Ingress 管理功能的技术实现方案，包括 Ingress 资源的数据模型、组件架构、API 设计和 UI 实现。

## 架构

### 目录结构

```text
src/
├── api/k8s/
│   ├── types.ts                    # 添加 Ingress 相关类型定义
│   └── mock.ts                     # 添加 Ingress Mock 数据
├── config/
│   └── k8s-resources.ts            # 添加 Ingress 资源配置工厂函数
└── views/k8s/network/
    └── ingresses/
        ├── index.vue               # Ingress 列表页
        ├── DetailDrawer.vue        # Ingress 详情抽屉
        └── components/
            ├── RulesTable.vue      # 路由规则表格组件
            ├── TLSConfig.vue       # TLS 配置组件
            └── BackendMap.vue      # 后端服务映射组件
```

### 组件架构

```text
Ingress 管理页面
├── Ingress 列表页 (Ingresses)
│   ├── ResourceList (复用)
│   │   ├── ResourceFilter (复用)
│   │   └── VxeGrid (复用)
│   └── DetailDrawer
│       ├── 基本信息标签页
│       ├── 路由规则标签页 (RulesTable)
│       ├── TLS 配置标签页 (TLSConfig)
│       ├── 后端服务标签页 (BackendMap)
│       ├── 状态信息标签页
│       └── YAML 配置标签页
```

## 数据模型

### TypeScript 接口定义

```typescript
// ==================== Ingress ====================

export interface IngressRule {
  host?: string;
  http: {
    paths: Array<{
      path?: string;
      pathType: 'Prefix' | 'Exact' | 'ImplementationSpecific';
      backend: {
        service?: {
          name: string;
          port: {
            name?: string;
            number?: number;
          };
        };
        resource?: {
          apiGroup?: string;
          kind: string;
          name: string;
        };
      };
    }>;
  };
}

export interface IngressTLS {
  hosts?: string[];
  secretName?: string;
}

export interface IngressSpec {
  ingressClassName?: string;
  defaultBackend?: {
    service?: {
      name: string;
      port: {
        name?: string;
        number?: number;
      };
    };
    resource?: {
      apiGroup?: string;
      kind: string;
      name: string;
    };
  };
  rules?: IngressRule[];
  tls?: IngressTLS[];
}

export interface IngressLoadBalancerIngress {
  ip?: string;
  hostname?: string;
  ports?: Array<{
    port: number;
    protocol: string;
  }>;
}

export interface IngressStatus {
  loadBalancer?: {
    ingress?: IngressLoadBalancerIngress[];
  };
}

export interface Ingress {
  apiVersion: string;
  kind: 'Ingress';
  metadata: K8sMetadata;
  spec: IngressSpec;
  status?: IngressStatus;
}

export interface IngressListParams {
  clusterId: string;
  namespace?: string;
  ingressClassName?: string;
  page?: number;
  pageSize?: number;
}

export interface IngressListResult {
  apiVersion: string;
  kind: 'IngressList';
  metadata: K8sListMetadata;
  items: Ingress[];
  total: number;
}

// ==================== IngressClass ====================

export interface IngressClass {
  apiVersion: string;
  kind: 'IngressClass';
  metadata: K8sMetadata;
  spec: {
    controller: string;
    parameters?: {
      apiGroup?: string;
      kind: string;
      name: string;
      namespace?: string;
      scope?: string;
    };
  };
}

export interface IngressClassListParams {
  clusterId: string;
  page?: number;
  pageSize?: number;
}

export interface IngressClassListResult {
  apiVersion: string;
  kind: 'IngressClassList';
  metadata: K8sListMetadata;
  items: IngressClass[];
  total: number;
}

// ==================== 辅助类型 ====================

export interface IngressBackendInfo {
  serviceName: string;
  namespace: string;
  port: number | string;
  exists: boolean;
  healthy: boolean;
}

export interface IngressRuleDisplay {
  host: string;
  path: string;
  pathType: string;
  serviceName: string;
  servicePort: number | string;
  tlsEnabled: boolean;
}
```

## 组件设计

### 1. Ingress 列表页

**文件:** `src/views/k8s/network/ingresses/index.vue`

**列配置:**

| 字段 | 标题 | 宽度 | 说明 |
|------|------|------|------|
| metadata.name | Ingress 名称 | 200px | - |
| metadata.namespace | 命名空间 | 150px | - |
| spec.ingressClassName | Ingress 类 | 150px | - |
| spec.rules | 主机名 | 250px | 自定义插槽，显示所有主机名 |
| spec.rules | 路径数量 | 100px | 统计所有路径数量 |
| spec.tls | TLS 状态 | 100px | 是/否，带图标 |
| status.loadBalancer.ingress | 地址 | 200px | 显示 IP 或主机名 |
| metadata.creationTimestamp | 创建时间 | 180px | - |

**筛选器:**

- 集群选择器
- 命名空间选择器
- Ingress 类选择器
- TLS 状态筛选器（启用/未启用）
- 名称搜索

### 2. Ingress 详情抽屉

**标签页:**

1. **基本信息:** 名称、命名空间、UID、Ingress 类、负载均衡器地址、创建时间
2. **路由规则:** 使用 RulesTable 组件显示规则
3. **TLS 配置:** 使用 TLSConfig 组件显示 TLS 配置
4. **后端服务:** 使用 BackendMap 组件显示服务映射
5. **状态信息:** 显示负载均衡器状态、条件信息
6. **YAML 配置:** 完整的 YAML 配置

### 3. 路由规则表格组件

**文件:** `src/views/k8s/network/ingresses/components/RulesTable.vue`

**功能:**

- 按主机分组显示路由规则
- 显示路径、路径类型、后端服务、服务端口
- 支持路径类型的图标化显示（Prefix 用前缀图标，Exact 用等号图标）
- 支持默认后端的特殊显示

**表格结构:**

```text
主机: example.com (TLS 启用标识)
+------------+------------+----------------+------------+
| 路径       | 路径类型   | 后端服务       | 服务端口   |
+------------+------------+----------------+------------+
| /api       | Prefix     | api-service    | 8080       |
| /app       | Prefix     | app-service    | 80         |
+------------+------------+----------------+------------+

主机: api.example.com
+------------+------------+----------------+------------+
| 路径       | 路径类型   | 后端服务       | 服务端口   |
+------------+------------+----------------+------------+
| /v1        | Exact      | api-v1-service | 8080       |
+------------+------------+----------------+------------+
```

### 4. TLS 配置组件

**文件:** `src/views/k8s/network/ingresses/components/TLSConfig.vue`

**功能:**

- 显示每个 TLS 配置的主机列表
- 显示关联的 Secret 名称
- 支持点击 Secret 名称跳转到 Secret 详情
- 检查 Secret 是否存在，不存在则显示警告

**显示格式:**

```text
TLS 配置 1:
  主机: [example.com] [www.example.com]
  Secret: tls-secret-example (查看)

TLS 配置 2:
  主机: [api.example.com]
  Secret: tls-secret-api (查看) ⚠️ Secret 不存在
```

### 5. 后端服务映射组件

**文件:** `src/views/k8s/network/ingresses/components/BackendMap.vue`

**功能:**

- 显示所有后端服务的列表
- 显示服务名称、命名空间、端口、健康状态
- 支持点击服务名称跳转到 Service 详情
- 使用树形结构或卡片形式展示 Host -> Path -> Service 的映射关系

**显示格式（树形）:**

```text
📍 example.com
  ├─ /api -> api-service:8080 ✓
  └─ /app -> app-service:80 ✓

📍 api.example.com
  └─ /v1 -> api-v1-service:8080 ✓

📍 默认后端
  └─ default-backend:80 ✓
```

## Mock 数据生成

**文件:** `src/api/k8s/mock.ts`

```typescript
/**
 * 生成 Mock Ingress 数据
 */
export function getMockIngressList(params: IngressListParams): IngressListResult {
  const ingressClasses = ['nginx', 'traefik', 'haproxy'];
  const hosts = ['example.com', 'api.example.com', 'app.example.com', 'test.example.com'];

  const items: Ingress[] = Array.from({ length: 30 }, (_, i) => {
    const hasTLS = i % 2 === 0;
    const host = hosts[i % hosts.length];

    return {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: `ingress-${i + 1}`,
        namespace: `namespace-${(i % 3) + 1}`,
        uid: `ingress-uid-${i + 1}`,
        creationTimestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        annotations: {
          'nginx.ingress.kubernetes.io/rewrite-target': '/',
        },
      },
      spec: {
        ingressClassName: ingressClasses[i % ingressClasses.length],
        rules: [
          {
            host,
            http: {
              paths: [
                {
                  path: '/api',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: `api-service-${i + 1}`,
                      port: { number: 8080 },
                    },
                  },
                },
                {
                  path: '/app',
                  pathType: 'Exact',
                  backend: {
                    service: {
                      name: `app-service-${i + 1}`,
                      port: { number: 80 },
                    },
                  },
                },
              ],
            },
          },
        ],
        ...(hasTLS && {
          tls: [
            {
              hosts: [host],
              secretName: `tls-secret-${i + 1}`,
            },
          ],
        }),
        ...(i % 5 === 0 && {
          defaultBackend: {
            service: {
              name: 'default-backend',
              port: { number: 80 },
            },
          },
        }),
      },
      status: {
        loadBalancer: {
          ingress: [
            {
              ip: `192.168.1.${100 + i}`,
            },
          ],
        },
      },
    };
  });

  // 应用筛选和分页
  let filteredItems = items;
  if (params.namespace) {
    filteredItems = filteredItems.filter(item => item.metadata.namespace === params.namespace);
  }
  if (params.ingressClassName) {
    filteredItems = filteredItems.filter(item => item.spec.ingressClassName === params.ingressClassName);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'IngressList',
    metadata: {},
    items: filteredItems.slice(start, end),
    total: filteredItems.length,
  };
}

/**
 * 生成 Mock IngressClass 数据
 */
export function getMockIngressClassList(params: IngressClassListParams): IngressClassListResult {
  // 类似实现...
}
```

## 资源配置工厂

**文件:** `src/config/k8s-resources.ts`

```typescript
/**
 * Ingress 资源配置
 */
export function createIngressConfig(): ResourceListConfig<Ingress> {
  return {
    resourceType: 'ingress',
    resourceLabel: 'Ingress',
    fetchData: async (params) => {
      const result = getMockIngressList({
        clusterId: params.clusterId || 'cluster-prod-01',
        namespace: params.namespace,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: result.items, total: result.total };
    },
    columns: [
      { field: 'metadata.name', title: 'Ingress 名称', minWidth: 200 },
      { field: 'metadata.namespace', title: '命名空间', width: 150 },
      { field: 'spec.ingressClassName', title: 'Ingress 类', width: 150 },
      {
        field: 'spec.rules',
        title: '主机名',
        width: 250,
        slots: { default: 'hosts-slot' },
      },
      {
        field: 'spec.rules',
        title: '路径数',
        width: 100,
        formatter: ({ cellValue }: any) => {
          if (!cellValue) return '0';
          return cellValue.reduce((sum: number, rule: any) => {
            return sum + (rule.http?.paths?.length || 0);
          }, 0).toString();
        },
      },
      {
        field: 'spec.tls',
        title: 'TLS',
        width: 100,
        slots: { default: 'tls-slot' },
      },
      {
        field: 'status.loadBalancer.ingress',
        title: '地址',
        width: 200,
        formatter: ({ cellValue }: any) => {
          if (!cellValue || cellValue.length === 0) return '-';
          return cellValue[0].ip || cellValue[0].hostname || '-';
        },
      },
      {
        field: 'metadata.creationTimestamp',
        title: '创建时间',
        width: 180,
        formatter: 'formatDateTime',
      },
    ],
    actions: [
      createViewAction('Ingress', (row: Ingress) => {
        const hosts = row.spec.rules?.map(r => r.host).join(', ') || '-';
        const tlsEnabled = row.spec.tls && row.spec.tls.length > 0 ? '是' : '否';
        return `
          名称: ${row.metadata.name}
          命名空间: ${row.metadata.namespace}
          Ingress 类: ${row.spec.ingressClassName || '-'}
          主机名: ${hosts}
          TLS 启用: ${tlsEnabled}
          地址: ${row.status?.loadBalancer?.ingress?.[0]?.ip || '-'}
          创建时间: ${row.metadata.creationTimestamp}
        `;
      }),
      createEditAction('Ingress'),
      createDeleteAction('Ingress'),
    ],
    filters: {
      showClusterSelector: true,
      showNamespaceSelector: true,
      showSearch: true,
      searchPlaceholder: '搜索 Ingress 名称',
      customFilters: [
        {
          field: 'ingressClassName',
          label: 'Ingress 类',
          type: 'select',
          options: [
            { label: 'Nginx', value: 'nginx' },
            { label: 'Traefik', value: 'traefik' },
            { label: 'HAProxy', value: 'haproxy' },
          ],
        },
        {
          field: 'tlsEnabled',
          label: 'TLS 状态',
          type: 'select',
          options: [
            { label: '已启用', value: 'true' },
            { label: '未启用', value: 'false' },
          ],
        },
      ],
    },
  };
}
```

## 路由配置

**文件:** `src/router/routes/modules/k8s.ts`

```typescript
{
  path: 'network',
  children: [
    // ... 其他网络资源
    {
      path: 'ingresses',
      name: 'K8sIngresses',
      component: () => import('#/views/k8s/network/ingresses/index.vue'),
      meta: {
        title: 'Ingress',
        icon: 'lucide:git-branch',
      },
    },
  ],
}
```

## 测试策略

### 单元测试

- Mock 数据生成函数测试
- 路径统计函数测试
- TLS 状态判断函数测试

### 组件测试

- 路由规则表格渲染测试
- TLS 配置显示测试
- 后端服务映射显示测试

### 集成测试

- Ingress 到 Service 的跳转测试
- Ingress 到 Secret 的跳转测试

## 性能优化

- 使用 computed 缓存路径统计
- 懒加载详情抽屉的子组件
- 优化大量规则的渲染性能

## 安全考虑

- 不显示敏感的注解内容
- 删除操作需要二次确认
- 记录关键操作日志（未来）
