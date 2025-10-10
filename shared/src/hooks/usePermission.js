import { computed, ref } from 'vue'

/**
 * 权限钩子
 * 用于判断用户是否有某个权限
 *
 * @param {Object} options - 配置选项
 * @param {Array|Function} options.permissions - 权限列表或返回权限列表的函数
 * @param {Object|Function} options.userInfo - 用户信息或返回用户信息的函数
 * @returns {Object} 权限检查方法
 *
 * @example
 * // 在micro-app中使用（从userStore获取）
 * import { useUserStore } from '@/store/user'
 * const userStore = useUserStore()
 * const { hasPermission, hasRole } = usePermission({
 *   permissions: () => userStore.permissions,
 *   userInfo: () => userStore.userInfo
 * })
 *
 * @example
 * // 直接传入数据
 * const { hasPermission } = usePermission({
 *   permissions: ['user:read', 'user:write']
 * })
 */
export function usePermission(options = {}) {
  const { permissions: permissionsInput, userInfo: userInfoInput } = options

  /**
   * 获取用户权限列表
   */
  const permissions = computed(() => {
    if (typeof permissionsInput === 'function') {
      return permissionsInput() || []
    }
    return permissionsInput || []
  })

  /**
   * 获取用户信息
   */
  const userInfo = computed(() => {
    if (typeof userInfoInput === 'function') {
      return userInfoInput() || {}
    }
    return userInfoInput || {}
  })

  /**
   * 检查是否有权限
   * @param {String|Array} permission - 权限码或权限码数组
   * @param {String} mode - 检查模式：'some'(任一) 或 'every'(全部)
   * @returns {Boolean}
   */
  const hasPermission = (permission, mode = 'some') => {
    // 超级管理员拥有所有权限
    if (permissions.value.includes('*')) {
      return true
    }

    if (!permission) {
      return true
    }

    // 单个权限
    if (typeof permission === 'string') {
      return permissions.value.includes(permission)
    }

    // 多个权限
    if (Array.isArray(permission)) {
      if (mode === 'every') {
        return permission.every(p => permissions.value.includes(p))
      }
      return permission.some(p => permissions.value.includes(p))
    }

    return false
  }

  /**
   * 检查是否有角色
   * @param {String|Array} role - 角色或角色数组
   * @param {String} mode - 检查模式
   * @returns {Boolean}
   */
  const hasRole = (role, mode = 'some') => {
    const userRoles = userInfo.value?.roles || []

    if (!role) {
      return true
    }

    // 单个角色
    if (typeof role === 'string') {
      return userRoles.includes(role)
    }

    // 多个角色
    if (Array.isArray(role)) {
      if (mode === 'every') {
        return role.every(r => userRoles.includes(r))
      }
      return role.some(r => userRoles.includes(r))
    }

    return false
  }

  return {
    permissions,
    hasPermission,
    hasRole
  }
}

