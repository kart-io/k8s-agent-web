import type { RouteRecordRaw } from 'vue-router';

import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import { AuthPageLayout } from '../layouts';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthPageLayout,
    children: [
      {
        path: '',
        name: 'LoginForm',
        component: () => import('../views/Login.vue'),
        meta: {
          title: '登录',
        },
      },
    ],
  },
];

const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === 'hash'
      ? createWebHashHistory(import.meta.env.VITE_BASE)
      : createWebHistory(import.meta.env.VITE_BASE),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE}`
    : import.meta.env.VITE_APP_TITLE;

  next();
});

export { router };
export default router;
