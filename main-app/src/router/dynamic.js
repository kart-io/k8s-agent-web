/**
 * 动态路由工具
 * 根据接口返回的菜单数据动态生成和注册路由
 */
import { h } from 'vue'
import MicroAppContainer from '@/views/MicroAppContainer.vue'

// 微前端占位组件 - 使用真实的 MicroAppContainer 组件
const MicroAppPlaceholder = MicroAppContainer

// 组件映射表
const componentMap = {
  MicroAppPlaceholder,
  SubMenu: null // 有子菜单的不需要组件
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
    } else if (parentPath && routePath.startsWith('/')) {
      // 如果父路径存在但当前路径不是以父路径开头的绝对路径，保持原样
      // 这种情况下路径可能配置有误，保留原路径
      routePath = routePath
    }

    const route = {
      path: routePath,
      name: menu.name || menu.key.replace(/\//g, '-').slice(1),
      meta: {
        ...(menu.meta || {}),
        title: menu.label,
        icon: menu.icon
      }
    }

    // 如果有子菜单，递归处理
    if (menu.children && menu.children.length > 0) {
      route.children = menusToRoutes(menu.children, menu.path || menu.key)
      // 有子菜单的路由不需要组件
      route.redirect = menu.redirect || route.children[0]?.path
    } else {
      // 微前端路由需要匹配所有子路径
      if (menu.component === 'MicroAppPlaceholder') {
        route.path = `${route.path}/:pathMatch(.*)*`
      }

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
      router.addRoute(parentName, route)
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
