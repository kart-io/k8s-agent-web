import { useUserStore } from '@/store/user'

export const permission = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()

    if (value) {
      const hasPermission = userStore.hasPermission(value)
      if (!hasPermission) {
        el.style.display = 'none'
      }
    }
  }
}

export const role = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()

    if (value) {
      const hasRole = userStore.hasRole(value)
      if (!hasRole) {
        el.style.display = 'none'
      }
    }
  }
}

export default {
  install(app) {
    app.directive('permission', permission)
    app.directive('role', role)
  }
}
