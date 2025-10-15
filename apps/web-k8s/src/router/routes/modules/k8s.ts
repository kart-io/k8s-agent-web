import type { RouteRecordRaw } from 'vue-router';

/**
 * K8s 资源管理路由配置
 * 按照资源层级关系组织路由：工作负载、网络、配置、集群
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

      // ==================== 工作负载 ====================
      {
        meta: {
          icon: 'lucide:layers',
          title: '工作负载',
        },
        name: 'K8sWorkloads',
        path: 'workloads',
        redirect: '/k8s/workloads/pods',
        children: [
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
        ],
      },

      // ==================== 网络 ====================
      {
        meta: {
          icon: 'lucide:network',
          title: '网络',
        },
        name: 'K8sNetwork',
        path: 'network',
        redirect: '/k8s/network/services',
        children: [
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
        ],
      },

      // ==================== 配置 ====================
      {
        meta: {
          icon: 'lucide:settings',
          title: '配置',
        },
        name: 'K8sConfig',
        path: 'config',
        redirect: '/k8s/config/configmaps',
        children: [
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
        ],
      },

      // ==================== 存储 ====================
      {
        meta: {
          icon: 'lucide:hard-drive',
          title: '存储',
        },
        name: 'K8sStorage',
        path: 'storage',
        redirect: '/k8s/storage/overview',
        children: [
          {
            name: 'K8sStorageOverview',
            path: 'overview',
            component: () => import('#/views/k8s/storage/overview/index.vue'),
            meta: {
              icon: 'lucide:bar-chart-3',
              title: '存储概览',
            },
          },
          {
            name: 'K8sPersistentVolumes',
            path: 'persistent-volumes',
            component: () => import('#/views/k8s/storage/persistent-volumes/index.vue'),
            meta: {
              icon: 'lucide:hard-drive',
              title: 'PersistentVolumes',
            },
          },
          {
            name: 'K8sPersistentVolumeClaims',
            path: 'persistent-volume-claims',
            component: () => import('#/views/k8s/storage/persistent-volume-claims/index.vue'),
            meta: {
              icon: 'lucide:file-box',
              title: 'PersistentVolumeClaims',
            },
          },
          {
            name: 'K8sStorageClasses',
            path: 'storage-classes',
            component: () => import('#/views/k8s/storage/storage-classes/index.vue'),
            meta: {
              icon: 'lucide:database',
              title: 'StorageClasses',
            },
          },
        ],
      },

      // ==================== 权限与安全 ====================
      {
        meta: {
          icon: 'lucide:shield',
          title: '权限与安全',
        },
        name: 'K8sRBAC',
        path: 'rbac',
        redirect: '/k8s/rbac/service-accounts',
        children: [
          {
            name: 'K8sServiceAccounts',
            path: 'service-accounts',
            component: () => import('#/views/k8s/rbac/service-accounts/index.vue'),
            meta: {
              icon: 'lucide:user',
              title: 'ServiceAccounts',
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
              title: 'RoleBindings',
            },
          },
          {
            name: 'K8sClusterRoles',
            path: 'cluster-roles',
            component: () => import('#/views/k8s/rbac/cluster-roles/index.vue'),
            meta: {
              icon: 'lucide:shield-check',
              title: 'ClusterRoles',
            },
          },
          {
            name: 'K8sClusterRoleBindings',
            path: 'cluster-role-bindings',
            component: () => import('#/views/k8s/rbac/cluster-role-bindings/index.vue'),
            meta: {
              icon: 'lucide:link-2',
              title: 'ClusterRoleBindings',
            },
          },
        ],
      },

      // ==================== 资源配额与限制 ====================
      {
        meta: {
          icon: 'lucide:gauge',
          title: '资源配额',
        },
        name: 'K8sQuota',
        path: 'quota',
        redirect: '/k8s/quota/resource-quotas',
        children: [
          {
            name: 'K8sResourceQuotas',
            path: 'resource-quotas',
            component: () => import('#/views/k8s/quota/resource-quotas/index.vue'),
            meta: {
              icon: 'lucide:pie-chart',
              title: 'ResourceQuotas',
            },
          },
          {
            name: 'K8sLimitRanges',
            path: 'limit-ranges',
            component: () => import('#/views/k8s/quota/limit-ranges/index.vue'),
            meta: {
              icon: 'lucide:sliders',
              title: 'LimitRanges',
            },
          },
        ],
      },

      // ==================== 集群 ====================
      {
        meta: {
          icon: 'lucide:server',
          title: '集群',
        },
        name: 'K8sCluster',
        path: 'cluster',
        redirect: '/k8s/cluster/clusters',
        children: [
          {
            name: 'K8sClusters',
            path: 'clusters',
            component: () => import('#/views/k8s/clusters/index.vue'),
            meta: {
              icon: 'lucide:server',
              title: '集群管理',
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
        ],
      },
    ],
  },
];

export default routes;
