# RBAC 权限管理 - 设计文档（精简版）

## 数据模型

```typescript
// ServiceAccount
export interface ServiceAccount {
  apiVersion: string;
  kind: 'ServiceAccount';
  metadata: K8sMetadata;
  secrets?: Array<{ name: string }>;
  imagePullSecrets?: Array<{ name: string }>;
  automountServiceAccountToken?: boolean;
}

// Role / ClusterRole
export interface PolicyRule {
  apiGroups: string[];
  resources: string[];
  resourceNames?: string[];
  verbs: string[]; // get, list, watch, create, update, patch, delete, *
  nonResourceURLs?: string[];
}

export interface Role {
  apiVersion: string;
  kind: 'Role';
  metadata: K8sMetadata;
  rules: PolicyRule[];
}

export interface ClusterRole {
  apiVersion: string;
  kind: 'ClusterRole';
  metadata: K8sMetadata;
  rules: PolicyRule[];
  aggregationRule?: {
    clusterRoleSelectors: Array<{
      matchLabels?: Record<string, string>;
    }>;
  };
}

// RoleBinding / ClusterRoleBinding
export interface Subject {
  kind: 'User' | 'Group' | 'ServiceAccount';
  name: string;
  namespace?: string;
  apiGroup?: string;
}

export interface RoleRef {
  apiGroup: string;
  kind: 'Role' | 'ClusterRole';
  name: string;
}

export interface RoleBinding {
  apiVersion: string;
  kind: 'RoleBinding';
  metadata: K8sMetadata;
  subjects?: Subject[];
  roleRef: RoleRef;
}

export interface ClusterRoleBinding {
  apiVersion: string;
  kind: 'ClusterRoleBinding';
  metadata: K8sMetadata;
  subjects?: Subject[];
  roleRef: RoleRef;
}
```

## 组件架构

```text
RBAC 管理
├── ServiceAccount 管理页
│   ├── ResourceList
│   └── DetailDrawer
│       ├── 基本信息
│       ├── Secret 列表
│       ├── 使用的 Pod
│       ├── 拥有的角色
│       └── YAML 配置
├── Role 管理页
│   ├── ResourceList
│   └── DetailDrawer
│       ├── 基本信息
│       ├── 权限规则表格
│       ├── RoleBinding 列表
│       └── YAML 配置
├── ClusterRole 管理页（类似 Role）
├── RoleBinding 管理页
│   ├── ResourceList
│   └── DetailDrawer
│       ├── 基本信息
│       ├── 绑定的 Role
│       ├── 主体列表
│       ├── 绑定关系图
│       └── YAML 配置
└── ClusterRoleBinding 管理页（类似 RoleBinding）
```

## 关键组件

### 权限规则表格组件

显示 PolicyRule 列表，包括：
- API 组
- 资源类型
- 资源名称
- 动作（verbs）
- 高危权限标识

### 主体列表组件

显示 Subject 列表，包括：
- 主体类型（用户/组/ServiceAccount）
- 主体名称
- 命名空间（ServiceAccount）
- 跳转链接

### 绑定关系图组件

使用树形或图形展示：
```text
ServiceAccount: my-app-sa
  └─ RoleBinding: my-app-binding
      └─ Role: my-app-role
          ├─ 规则1: pods (get, list)
          └─ 规则2: configmaps (get)
```

## 路由配置

```typescript
{
  path: 'rbac',
  name: 'K8sRBAC',
  meta: { title: 'RBAC 权限', icon: 'lucide:shield' },
  children: [
    {
      path: 'service-accounts',
      component: () => import('#/views/k8s/rbac/service-accounts/index.vue'),
      meta: { title: 'ServiceAccount' },
    },
    {
      path: 'roles',
      component: () => import('#/views/k8s/rbac/roles/index.vue'),
      meta: { title: 'Role' },
    },
    {
      path: 'cluster-roles',
      component: () => import('#/views/k8s/rbac/cluster-roles/index.vue'),
      meta: { title: 'ClusterRole' },
    },
    {
      path: 'role-bindings',
      component: () => import('#/views/k8s/rbac/role-bindings/index.vue'),
      meta: { title: 'RoleBinding' },
    },
    {
      path: 'cluster-role-bindings',
      component: () => import('#/views/k8s/rbac/cluster-role-bindings/index.vue'),
      meta: { title: 'ClusterRoleBinding' },
    },
  ],
}
```

## Mock 数据要点

- 生成不同权限级别的 Role（只读、读写、管理员）
- 生成不同类型的 Subject（User、Group、ServiceAccount）
- 确保 RoleBinding 与 Role 的关联关系正确
- 为 ServiceAccount 生成关联的 Secret
- 模拟高危权限（*, cluster-admin 等）用于测试警告功能

## 安全考虑

- 高危 verbs 标识：*, delete, deletecollection, create
- 高危 resources 标识：*, secrets, clusterroles, clusterrolebindings
- 高危 apiGroups 标识：*
- 不显示 ServiceAccount token 内容
- 删除操作显示影响范围
