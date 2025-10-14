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
    redirect: '/k8s/workloads/pods',
    children: [
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
            component: () => import('#/views/k8s/resources/statefulsets.vue'),
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
        ],
      },
    ],
  },
];

export default routes;
