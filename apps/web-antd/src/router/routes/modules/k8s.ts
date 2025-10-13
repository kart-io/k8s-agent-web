import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:server',
      order: 0,
      title: $t('page.k8s.title'),
    },
    name: 'K8s',
    path: '/k8s',
    children: [
      {
        name: 'K8sClusters',
        path: '/k8s/clusters',
        component: () => import('#/views/k8s/clusters/index.vue'),
        meta: {
          icon: 'lucide:layers',
          title: $t('page.k8s.clusters'),
        },
      },
      {
        name: 'K8sClusterDetail',
        path: '/k8s/clusters/:id',
        component: () => import('#/views/k8s/clusters/detail.vue'),
        meta: {
          hideInMenu: true,
          activePath: '/k8s/clusters',
          title: $t('page.k8s.clusterDetail'),
        },
      },
      {
        name: 'K8sPods',
        path: '/k8s/pods',
        component: () => import('#/views/k8s/pods/index.vue'),
        meta: {
          icon: 'lucide:box',
          title: $t('page.k8s.pods'),
        },
      },
      {
        name: 'K8sPodDetail',
        path: '/k8s/pods/:cluster/:namespace/:name',
        component: () => import('#/views/k8s/pods/detail.vue'),
        meta: {
          hideInMenu: true,
          activePath: '/k8s/pods',
          title: $t('page.k8s.podDetail'),
        },
      },
      {
        name: 'K8sDeployments',
        path: '/k8s/deployments',
        component: () => import('#/views/k8s/deployments/index.vue'),
        meta: {
          icon: 'lucide:rocket',
          title: $t('page.k8s.deployments'),
        },
      },
      {
        name: 'K8sServices',
        path: '/k8s/services',
        component: () => import('#/views/k8s/services/index.vue'),
        meta: {
          icon: 'lucide:network',
          title: $t('page.k8s.services'),
        },
      },
      {
        name: 'K8sConfigMaps',
        path: '/k8s/configmaps',
        component: () => import('#/views/k8s/configmaps/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('page.k8s.configmaps'),
        },
      },
      {
        name: 'K8sCronJobs',
        path: '/k8s/cronjobs',
        component: () => import('#/views/k8s/cronjobs/index.vue'),
        meta: {
          icon: 'lucide:clock',
          title: $t('page.k8s.cronjobs'),
        },
      },
      {
        name: 'K8sResources',
        path: '/k8s/resources',
        meta: {
          icon: 'lucide:package',
          title: $t('page.k8s.resources'),
        },
        children: [
          {
            name: 'K8sNamespaces',
            path: '/k8s/resources/namespaces',
            component: () => import('#/views/k8s/resources/namespaces.vue'),
            meta: {
              icon: 'lucide:folder',
              title: $t('page.k8s.namespaces'),
            },
          },
          {
            name: 'K8sNodes',
            path: '/k8s/resources/nodes',
            component: () => import('#/views/k8s/resources/nodes.vue'),
            meta: {
              icon: 'lucide:server',
              title: $t('page.k8s.nodes'),
            },
          },
          {
            name: 'K8sSecrets',
            path: '/k8s/resources/secrets',
            component: () => import('#/views/k8s/resources/secrets.vue'),
            meta: {
              icon: 'lucide:key',
              title: $t('page.k8s.secrets'),
            },
          },
          {
            name: 'K8sStatefulSets',
            path: '/k8s/resources/statefulsets',
            component: () => import('#/views/k8s/resources/statefulsets.vue'),
            meta: {
              icon: 'lucide:database',
              title: $t('page.k8s.statefulsets'),
            },
          },
          {
            name: 'K8sDaemonSets',
            path: '/k8s/resources/daemonsets',
            component: () => import('#/views/k8s/resources/daemonsets.vue'),
            meta: {
              icon: 'lucide:workflow',
              title: $t('page.k8s.daemonsets'),
            },
          },
          {
            name: 'K8sJobs',
            path: '/k8s/resources/jobs',
            component: () => import('#/views/k8s/resources/jobs.vue'),
            meta: {
              icon: 'lucide:briefcase',
              title: $t('page.k8s.jobs'),
            },
          },
        ],
      },
    ],
  },
];

export default routes;
