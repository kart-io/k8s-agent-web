import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

// 创建路由实例，只包含基础路由（登录页和主布局）
// 业务路由将通过接口动态注册
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'MainLayout',
      component: () => import('@/layouts/VbenMainLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/dashboard',
      children: [
        // 微应用静态路由 - 作为 fallback，优先级低于动态路由
        // 注意：动态路由注册后会覆盖这些静态路由
        {
          path: '/dashboard/:pathMatch(.*)*',
          name: 'Dashboard',
          component: () => import('@/views/MicroAppContainer.vue'),
          meta: { microApp: 'dashboard-app' }
        },
        {
          path: '/agents/:pathMatch(.*)*',
          name: 'Agents',
          component: () => import('@/views/MicroAppContainer.vue'),
          meta: { microApp: 'agent-app' }
        },
        {
          path: '/clusters/:pathMatch(.*)*',
          name: 'Clusters',
          component: () => import('@/views/MicroAppContainer.vue'),
          meta: { microApp: 'cluster-app' }
        },
        {
          path: '/monitor/:pathMatch(.*)*',
          name: 'Monitor',
          component: () => import('@/views/MicroAppContainer.vue'),
          meta: { microApp: 'monitor-app' }
        },
        // /system 路由已移除，完全由动态路由接管
        // 避免静态路由和动态子路由冲突导致的跳转问题
        {
          path: '/image-build/:pathMatch(.*)*',
          name: 'ImageBuild',
          component: () => import('@/views/MicroAppContainer.vue'),
          meta: { microApp: 'image-build-app' }
        }
      ]
    },
    // 404 页面 - 保留作为 fallback
    // 注意：动态路由注册时会移除并重新添加此路由，确保优先级最低
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/layouts/VbenMainLayout.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !userStore.isLogin) {
    // 需要登录但未登录，跳转登录页
    next('/login')
  } else if (to.path === '/login' && userStore.isLogin) {
    // 已登录访问登录页，跳转首页
    next('/')
  } else {
    // 如果已登录但菜单未加载（null），尝试加载菜单（处理刷新页面的情况）
    if (userStore.isLogin && userStore.menuList === null && to.path !== '/login') {
      try {
        await userStore.fetchMenus()
        // 菜单加载成功后，需要重新触发路由导航以使用新注册的动态路由
        // 使用 replace: true 避免在历史记录中留下重复记录
        next({ ...to, replace: true })
        return
      } catch (error) {
        console.error('Failed to fetch menus in router guard', error)
        // 即使失败也继续导航，MainLayout 会使用默认菜单
      }
    }
    next()
  }
})

export default router
