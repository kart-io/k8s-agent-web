/**
 * 动态路由工具
 * 根据接口返回的菜单数据动态生成和注册路由
 */
import { h } from 'vue'
import { RouterView } from 'vue-router'
import MicroAppContainer from '@/views/MicroAppContainer.vue'
import { getMicroAppByBasePath } from '@/config/micro-apps.config.js'

// 微前端占位组件 - 使用真实的 MicroAppContainer 组件
const MicroAppPlaceholder = MicroAppContainer

// SubMenu 组件 - 用于有子菜单的父路由
// 使用渲染函数而不是模板字符串，避免需要运行时模板编译
const SubMenuComponent = {
  name: 'SubMenu',
  render() {
    return h(RouterView)
  }
}

// 组件映射表
const componentMap = {
  MicroAppPlaceholder,
  SubMenu: SubMenuComponent
}

/**
 * Infer micro-app name from route path
 * @param {String} path - Route path (e.g., '/dashboard', '/system/users')
 * @returns {String|undefined} Micro-app name or undefined
 */
function inferMicroAppFromPath(path) {
  if (!path) return undefined

  // Extract base path (first segment)
  const basePath = '/' + path.split('/').filter(Boolean)[0]

  // Look up config by base path
  const config = getMicroAppByBasePath(basePath)

  return config ? config.name : undefined
}

/**
 * 将菜单配置转换为路由配置
 * @param {Array} menus - 菜单配置数组
 * @param {String} parentPath - 父路由路径
 * @returns {Array} 路由配置数组
 */
export function menusToRoutes(menus, parentPath = '') {
  const routes = []

  menus.forEach(menu => {
    // 处理路径：如果有父路径且当前路径是绝对路径，转换为相对路径
    let routePath = menu.path || menu.key
    if (parentPath && routePath.startsWith(parentPath + '/')) {
      routePath = routePath.substring(parentPath.length + 1)
    }
    // 其他情况保持原路径

    // Infer microApp from path if not explicitly set
    const inferredMicroApp = inferMicroAppFromPath(menu.path || menu.key)

    const route = {
      path: routePath,
      name: menu.name || menu.key.replace(/\//g, '-').slice(1),
      meta: {
        ...(menu.meta || {}),
        title: menu.label,
        icon: menu.icon,
        // Auto-add microApp if not present and path matches a micro-app
        microApp: menu.meta?.microApp || inferredMicroApp
      }
    }

    // 如果有子菜单，递归处理
    if (menu.children && menu.children.length > 0) {
      route.children = menusToRoutes(menu.children, menu.path || menu.key)
      // 有子菜单的父路由需要一个路由占位组件（router-view）
      // 使用 SubMenu 组件渲染子路由
      const component = menu.component || 'SubMenu'
      route.component = componentMap[component] || SubMenuComponent

      // 只有在 menu.redirect 明确指定时才设置 redirect，避免自动跳转到第一个子路由
      if (menu.redirect) {
        route.redirect = menu.redirect
      }
    } else {
      // 叶子节点路由
      // 注意：不要为所有微前端路由添加通配符，否则会导致精确路径匹配失败
      // 通配符只应该用于顶级微应用路由（在静态路由中已定义）

      // 设置组件
      const component = menu.component || 'MicroAppPlaceholder'
      route.component = componentMap[component] || MicroAppPlaceholder
    }

    routes.push(route)
  })

  return routes
}

/**
 * 动态注册路由
 * @param {Object} router - Vue Router 实例
 * @param {Array} menus - 菜单配置数组
 * @param {String} parentName - 父路由名称（可选）
 */
export function registerDynamicRoutes(router, menus, parentName = null) {
  const routes = menusToRoutes(menus)

  routes.forEach(route => {
    if (parentName) {
      // 添加到父路由的子路由
      // 重要：如果路径是绝对路径（以 / 开头），需要转换为相对路径
      const routeToAdd = { ...route }
      if (routeToAdd.path && routeToAdd.path.startsWith('/')) {
        routeToAdd.path = routeToAdd.path.substring(1)
      }
      router.addRoute(parentName, routeToAdd)
    } else {
      // 添加为顶级路由
      router.addRoute(route)
    }
  })

  console.log('[动态路由] 路由注册完成:', routes)
  return routes
}

/**
 * 清除动态路由
 * @param {Object} router - Vue Router 实例
 * @param {Array} routeNames - 需要清除的路由名称数组
 */
export function removeDynamicRoutes(router, routeNames) {
  routeNames.forEach(name => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
      console.log('[动态路由] 已移除路由:', name)
    }
  })
}

/**
 * 从菜单数据中提取所有路由名称
 * @param {Array} menus - 菜单配置数组
 * @returns {Array} 路由名称数组
 */
export function extractRouteNames(menus) {
  const names = []

  menus.forEach(menu => {
    const name = menu.name || menu.key.replace(/\//g, '-').slice(1)
    names.push(name)

    if (menu.children && menu.children.length > 0) {
      names.push(...extractRouteNames(menu.children))
    }
  })

  return names
}
