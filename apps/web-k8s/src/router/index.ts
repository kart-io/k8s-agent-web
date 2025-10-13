import type { RouteRecordRaw } from 'vue-router';

import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

// K8s 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/clusters',
  },
  {
    path: '/clusters',
    name: 'Clusters',
    component: () => import('../views/k8s/clusters/index.vue'),
    meta: {
      title: '集群管理',
      icon: 'layers',
    },
  },
  {
    path: '/clusters/:id',
    name: 'ClusterDetail',
    component: () => import('../views/k8s/clusters/detail.vue'),
    meta: {
      title: '集群详情',
      hideInMenu: true,
    },
  },
  {
    path: '/pods',
    name: 'Pods',
    component: () => import('../views/k8s/pods/index.vue'),
    meta: {
      title: 'Pod 管理',
      icon: 'box',
    },
  },
  {
    path: '/pods/:cluster/:namespace/:name',
    name: 'PodDetail',
    component: () => import('../views/k8s/pods/detail.vue'),
    meta: {
      title: 'Pod 详情',
      hideInMenu: true,
    },
  },
  {
    path: '/deployments',
    name: 'Deployments',
    component: () => import('../views/k8s/deployments/index.vue'),
    meta: {
      title: 'Deployment 管理',
      icon: 'rocket',
    },
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../views/k8s/services/index.vue'),
    meta: {
      title: 'Service 管理',
      icon: 'network',
    },
  },
  {
    path: '/configmaps',
    name: 'ConfigMaps',
    component: () => import('../views/k8s/configmaps/index.vue'),
    meta: {
      title: 'ConfigMap 管理',
      icon: 'file-text',
    },
  },
  {
    path: '/cronjobs',
    name: 'CronJobs',
    component: () => import('../views/k8s/cronjobs/index.vue'),
    meta: {
      title: 'CronJob 管理',
      icon: 'clock',
    },
  },
  {
    path: '/resources',
    name: 'Resources',
    redirect: '/resources/namespaces',
    meta: {
      title: '其他资源',
      icon: 'package',
    },
    children: [
      {
        path: 'namespaces',
        name: 'Namespaces',
        component: () => import('../views/k8s/resources/namespaces.vue'),
        meta: {
          title: 'Namespace',
          icon: 'folder',
        },
      },
      {
        path: 'nodes',
        name: 'Nodes',
        component: () => import('../views/k8s/resources/nodes.vue'),
        meta: {
          title: 'Node',
          icon: 'server',
        },
      },
      {
        path: 'secrets',
        name: 'Secrets',
        component: () => import('../views/k8s/resources/secrets.vue'),
        meta: {
          title: 'Secret',
          icon: 'key',
        },
      },
      {
        path: 'statefulsets',
        name: 'StatefulSets',
        component: () => import('../views/k8s/resources/statefulsets.vue'),
        meta: {
          title: 'StatefulSet',
          icon: 'database',
        },
      },
      {
        path: 'daemonsets',
        name: 'DaemonSets',
        component: () => import('../views/k8s/resources/daemonsets.vue'),
        meta: {
          title: 'DaemonSet',
          icon: 'workflow',
        },
      },
      {
        path: 'jobs',
        name: 'Jobs',
        component: () => import('../views/k8s/resources/jobs.vue'),
        meta: {
          title: 'Job',
          icon: 'briefcase',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
];

const router = createRouter({
  // 使用 hash 模式更容易部署
  history: import.meta.env.VITE_ROUTER_HISTORY === 'hash'
    ? createWebHashHistory(import.meta.env.VITE_BASE)
    : createWebHistory(import.meta.env.VITE_BASE),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 导入认证工具
import { handleAuthCallback, isAuthenticated, redirectToLogin } from '../utils/auth';

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE}`;
  } else {
    document.title = import.meta.env.VITE_APP_TITLE;
  }

  // 处理认证回调（从主应用跳转回来）
  handleAuthCallback();

  // 检查是否需要认证
  const requireAuth = to.meta.requireAuth !== false; // 默认需要认证

  if (requireAuth && !isAuthenticated()) {
    // 未登录，重定向到主应用登录页
    console.warn('未登录，重定向到主应用登录页');
    redirectToLogin();
    return;
  }

  next();
});

export default router;
