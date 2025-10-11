import { getUserInfo, getUserMenus, login as loginApi, logout as logoutApi } from '@/api/auth'
import router from '@/router'
import { defineStore } from 'pinia'
import { registerDynamicRoutes, removeDynamicRoutes, extractRouteNames } from '@/router/dynamic'

export const useUserStore = defineStore('user', {
  state: () => {
    const savedMenus = localStorage.getItem('menus')
    let menus = null // 初始值为 null，表示未加载
    try {
      if (savedMenus) {
        menus = JSON.parse(savedMenus)
      }
    } catch (error) {
      console.error('Failed to parse menus from localStorage', error)
      menus = null
    }
    return {
      token: localStorage.getItem('token') || '',
      userInfo: null,
      permissions: [],
      menus,
      dynamicRouteNames: [] // 存储动态注册的路由名称，用于登出时清理
    }
  },

  getters: {
    isLogin: (state) => !!state.token,
    username: (state) => state.userInfo?.username || '',
    avatar: (state) => state.userInfo?.avatar || '',
    roles: (state) => state.userInfo?.roles || [],
    // 直接返回菜单数组（空数组表示无权限，undefined/null 由 MainLayout 处理为默认菜单）
    menuList: (state) => state.menus
  },

  actions: {
    // 用户登录
    async login(username, password) {
      const res = await loginApi(username, password)
      this.token = res.token
      this.userInfo = res.user
      this.permissions = res.permissions || []

      localStorage.setItem('token', res.token)

      // 登录成功后获取菜单
      await this.fetchMenus()

      return res
    },

    // 获取用户信息
    async fetchUserInfo() {
      const userInfo = await getUserInfo()
      this.userInfo = userInfo
      this.permissions = userInfo.permissions || []
      return userInfo
    },

    // 获取用户菜单并注册动态路由
    async fetchMenus() {
      try {
        const menus = await getUserMenus()
        // 只在返回 undefined 或 null 时使用默认菜单
        // 空数组 [] 是有效返回值，表示用户无菜单权限
        if (menus === undefined || menus === null) {
          this.menus = this.getDefaultMenus()
        } else {
          this.menus = menus
        }
        localStorage.setItem('menus', JSON.stringify(this.menus))

        // 注册动态路由
        this.registerRoutes()

        return this.menus
      } catch (error) {
        console.error('Failed to fetch menus, using default menus', error)
        // 如果获取失败，使用默认菜单
        this.menus = this.getDefaultMenus()
        localStorage.setItem('menus', JSON.stringify(this.menus))

        // 注册动态路由
        this.registerRoutes()

        return this.menus
      }
    },

    // 注册动态路由
    registerRoutes() {
      if (!this.menus || this.menus.length === 0) {
        console.warn('[动态路由] 无菜单数据，跳过路由注册')
        return
      }

      // 清除旧的动态路由
      if (this.dynamicRouteNames.length > 0) {
        removeDynamicRoutes(router, this.dynamicRouteNames)
        this.dynamicRouteNames = []
      }

      // 注册新的动态路由（添加到 MainLayout 的子路由）
      registerDynamicRoutes(router, this.menus, 'MainLayout')

      // 保存路由名称，用于后续清理
      this.dynamicRouteNames = extractRouteNames(this.menus)

      console.log('[动态路由] 已注册路由:', this.dynamicRouteNames)
    },

    // 获取默认菜单（作为 fallback）
    getDefaultMenus() {
      return [
        {
          key: '/dashboard',
          path: '/dashboard',
          name: 'dashboard',
          label: '仪表盘',
          icon: 'DashboardOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: '仪表盘',
            affix: true
          }
        },
        {
          key: '/agents',
          path: '/agents',
          name: 'agents',
          label: 'Agent 管理',
          icon: 'ClusterOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: 'Agent 管理'
          }
        },
        {
          key: '/clusters',
          path: '/clusters',
          name: 'clusters',
          label: '集群管理',
          icon: 'DeploymentUnitOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: '集群管理'
          }
        },
        {
          key: '/monitor',
          path: '/monitor',
          name: 'monitor',
          label: '监控管理',
          icon: 'MonitorOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: '监控管理'
          }
        },
        {
          key: '/image-build',
          path: '/image-build',
          name: 'image-build',
          label: '镜像构建',
          icon: 'BuildOutlined',
          component: 'MicroAppPlaceholder',
          meta: {
            requiresAuth: true,
            title: '镜像构建'
          }
        },
        {
          key: '/system',
          path: '/system',
          name: 'system',
          label: '系统管理',
          icon: 'SettingOutlined',
          component: 'SubMenu',
          meta: {
            requiresAuth: true,
            title: '系统管理'
          }
        }
      ]
    },

    // 用户登出
    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // 清除动态路由
        if (this.dynamicRouteNames.length > 0) {
          removeDynamicRoutes(router, this.dynamicRouteNames)
          this.dynamicRouteNames = []
        }

        this.token = ''
        this.userInfo = null
        this.permissions = []
        this.menus = null // 重置为 null
        localStorage.removeItem('token')
        localStorage.removeItem('menus')
        router.push('/login')
      }
    },

    // 检查权限
    hasPermission(permission) {
      if (!permission) return true
      return this.permissions.includes(permission)
    },

    // 检查角色
    hasRole(role) {
      if (!role) return true
      // 兼容字符串数组和对象数组
      return this.roles.some(r => {
        if (typeof r === 'string') return r === role
        return r.code === role || r.name === role
      })
    }
  }
})
