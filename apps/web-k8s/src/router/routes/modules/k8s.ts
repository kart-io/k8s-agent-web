import type { RouteRecordRaw } from 'vue-router';

/**
 * K8s 资源管理路由配置 - 优化版本
 * 采用扁平化结构，减少层级深度，提升导航效率
 *
 * 优化重点：
 * 1. 路由层级从 4 层降至 2 层
 * 2. URL 更简洁：/k8s/deployments 而非 /k8s/workloads/deployments
 * 3. 保留分组用于菜单组织，但路由直接挂载到 /k8s 下
 * 4. 便于快速访问和书签
 */
const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:server',
      order: 0,
      title: 'K8s Management',
    },
    name: 'K8sManagement',
    path: '/k8s',
    redirect: '/k8s/dashboard',
    children: [
      // ==================== Dashboard ====================
      {
        name: 'K8sDashboard',
        path: 'dashboard',
        component: () => import('#/views/k8s/dashboard/index.vue'),
        meta: {
          icon: 'lucide:layout-dashboard',
          title: 'Dashboard',
        },
      },

      // ==================== 全局搜索 ====================
      {
        name: 'K8sSearch',
        path: 'search',
        component: () => import('#/views/k8s/search/index.vue'),
        meta: {
          icon: 'lucide:search',
          title: '搜索结果',
          hideInMenu: true, // 不在菜单中显示
        },
      },

      // ==================== 工作负载（扁平化） ====================
      {
        name: 'K8sPods',
        path: 'pods',
        component: () => import('#/views/k8s/workloads/pods/index.vue'),
        meta: {
          icon: 'lucide:box',
          title: 'Pods',
        },
      },
      {
        name: 'K8sDeployments',
        path: 'deployments',
        component: () => import('#/views/k8s/workloads/deployments/index.vue'),
        meta: {
          icon: 'lucide:rocket',
          title: 'Deployments',
        },
      },
      {
        name: 'K8sStatefulSets',
        path: 'statefulsets',
        component: () => import('#/views/k8s/workloads/statefulsets/index.vue'),
        meta: {
          icon: 'lucide:database',
          title: 'StatefulSets',
        },
      },
      {
        name: 'K8sDaemonSets',
        path: 'daemonsets',
        component: () => import('#/views/k8s/resources/daemonsets.vue'),
        meta: {
          icon: 'lucide:layers',
          title: 'DaemonSets',
        },
      },
      {
        name: 'K8sJobs',
        path: 'jobs',
        component: () => import('#/views/k8s/resources/jobs.vue'),
        meta: {
          icon: 'lucide:briefcase',
          title: 'Jobs',
        },
      },
      {
        name: 'K8sCronJobs',
        path: 'cronjobs',
        component: () => import('#/views/k8s/workloads/cronjobs/index.vue'),
        meta: {
          icon: 'lucide:clock',
          title: 'CronJobs',
        },
      },
      {
        name: 'K8sReplicaSets',
        path: 'replicasets',
        component: () => import('#/views/k8s/workloads/replicasets/index.vue'),
        meta: {
          icon: 'lucide:copy',
          title: 'ReplicaSets',
        },
      },

      // ==================== 网络（扁平化） ====================
      {
        name: 'K8sServices',
        path: 'services',
        component: () => import('#/views/k8s/network/services/index.vue'),
        meta: {
          icon: 'lucide:network',
          title: 'Services',
        },
      },
      {
        name: 'K8sIngress',
        path: 'ingress',
        component: () => import('#/views/k8s/network/ingress/index.vue'),
        meta: {
          icon: 'lucide:globe',
          title: 'Ingress',
        },
      },
      {
        name: 'K8sNetworkPolicies',
        path: 'network-policies',
        component: () =>
          import('#/views/k8s/network/network-policies/index.vue'),
        meta: {
          icon: 'lucide:shield',
          title: 'Network Policies',
        },
      },
      {
        name: 'K8sEndpoints',
        path: 'endpoints',
        component: () => import('#/views/k8s/network/endpoints/index.vue'),
        meta: {
          icon: 'lucide:target',
          title: 'Endpoints',
        },
      },
      {
        name: 'K8sEndpointSlices',
        path: 'endpoint-slices',
        component: () =>
          import('#/views/k8s/network/endpoint-slices/index.vue'),
        meta: {
          icon: 'lucide:slice',
          title: 'Endpoint Slices',
        },
      },

      // ==================== 配置（扁平化） ====================
      {
        name: 'K8sConfigMaps',
        path: 'configmaps',
        component: () => import('#/views/k8s/config/configmaps/index.vue'),
        meta: {
          icon: 'lucide:file-code',
          title: 'ConfigMaps',
        },
      },
      {
        name: 'K8sSecrets',
        path: 'secrets',
        component: () => import('#/views/k8s/resources/secrets.vue'),
        meta: {
          icon: 'lucide:key',
          title: 'Secrets',
        },
      },

      // ==================== 存储（扁平化） ====================
      {
        name: 'K8sStorageOverview',
        path: 'storage-overview',
        component: () => import('#/views/k8s/storage/overview/index.vue'),
        meta: {
          icon: 'lucide:bar-chart-3',
          title: 'Storage Overview',
        },
      },
      {
        name: 'K8sPersistentVolumes',
        path: 'persistent-volumes',
        component: () =>
          import('#/views/k8s/storage/persistent-volumes/index.vue'),
        meta: {
          icon: 'lucide:hard-drive',
          title: 'Persistent Volumes',
        },
      },
      {
        name: 'K8sPersistentVolumeClaims',
        path: 'persistent-volume-claims',
        component: () =>
          import('#/views/k8s/storage/persistent-volume-claims/index.vue'),
        meta: {
          icon: 'lucide:file-box',
          title: 'PV Claims',
        },
      },
      {
        name: 'K8sStorageClasses',
        path: 'storage-classes',
        component: () =>
          import('#/views/k8s/storage/storage-classes/index.vue'),
        meta: {
          icon: 'lucide:database',
          title: 'Storage Classes',
        },
      },

      // ==================== 集群管理（扁平化） ====================
      {
        name: 'K8sClusters',
        path: 'clusters',
        component: () => import('#/views/k8s/clusters/index.vue'),
        meta: {
          icon: 'lucide:server',
          title: 'Clusters',
        },
      },
      {
        name: 'K8sNodes',
        path: 'nodes',
        component: () => import('#/views/k8s/nodes/index.vue'),
        meta: {
          icon: 'lucide:server',
          title: 'Nodes',
        },
      },
      {
        name: 'K8sNamespaces',
        path: 'namespaces',
        component: () => import('#/views/k8s/resources/namespaces.vue'),
        meta: {
          icon: 'lucide:folder',
          title: 'Namespaces',
        },
      },
      {
        name: 'K8sEvents',
        path: 'events',
        component: () => import('#/views/k8s/cluster/events/index.vue'),
        meta: {
          icon: 'lucide:clock',
          title: 'Events',
        },
      },

      // ==================== RBAC（扁平化） ====================
      {
        name: 'K8sServiceAccounts',
        path: 'service-accounts',
        component: () => import('#/views/k8s/rbac/service-accounts/index.vue'),
        meta: {
          icon: 'lucide:user',
          title: 'Service Accounts',
        },
      },
      {
        name: 'K8sRoles',
        path: 'roles',
        component: () => import('#/views/k8s/rbac/roles/index.vue'),
        meta: {
          icon: 'lucide:lock',
          title: 'Roles',
        },
      },
      {
        name: 'K8sRoleBindings',
        path: 'role-bindings',
        component: () => import('#/views/k8s/rbac/role-bindings/index.vue'),
        meta: {
          icon: 'lucide:link',
          title: 'Role Bindings',
        },
      },
      {
        name: 'K8sClusterRoles',
        path: 'cluster-roles',
        component: () => import('#/views/k8s/rbac/cluster-roles/index.vue'),
        meta: {
          icon: 'lucide:shield-check',
          title: 'Cluster Roles',
        },
      },
      {
        name: 'K8sClusterRoleBindings',
        path: 'cluster-role-bindings',
        component: () =>
          import('#/views/k8s/rbac/cluster-role-bindings/index.vue'),
        meta: {
          icon: 'lucide:link-2',
          title: 'Cluster Role Bindings',
        },
      },

      // ==================== 资源配额（扁平化） ====================
      {
        name: 'K8sResourceQuotas',
        path: 'resource-quotas',
        component: () => import('#/views/k8s/quota/resource-quotas/index.vue'),
        meta: {
          icon: 'lucide:pie-chart',
          title: 'Resource Quotas',
        },
      },
      {
        name: 'K8sLimitRanges',
        path: 'limit-ranges',
        component: () => import('#/views/k8s/quota/limit-ranges/index.vue'),
        meta: {
          icon: 'lucide:sliders',
          title: 'Limit Ranges',
        },
      },

      // ==================== 其他（扁平化） ====================
      {
        name: 'K8sHPA',
        path: 'hpa',
        component: () => import('#/views/k8s/autoscaling/hpa/index.vue'),
        meta: {
          icon: 'lucide:trending-up',
          title: 'HPA',
        },
      },
      {
        name: 'K8sPriorityClasses',
        path: 'priority-classes',
        component: () =>
          import('#/views/k8s/scheduling/priority-classes/index.vue'),
        meta: {
          icon: 'lucide:star',
          title: 'Priority Classes',
        },
      },
    ],
  },
];

export default routes;
