import { computed } from 'vue'
import { useUserStore } from '@/store/user'

/**
 * 权限钩子
 * 用于判断用户是否有某个权限
 */
export function usePermission() {
  const userStore = useUserStore()

  /**
   * 获取用户权限列表
   */
  const permissions = computed(() => userStore.permissions || [])

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
    const userRoles = userStore.userInfo?.roles || []

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
