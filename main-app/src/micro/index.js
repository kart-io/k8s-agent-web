import { registerMicroApps, start, addGlobalUncaughtErrorHandler } from 'qiankun'
import apps from './apps'
import { useUserStore } from '@/store/user'
import { message } from 'ant-design-vue'

// 使用自定义的全局状态管理（替代 qiankun 的 initGlobalState）
class GlobalStateManager {
  constructor() {
    this.state = {
      user: null,
      token: ''
    }
    this.listeners = new Set()
  }

  setGlobalState(newState) {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...newState }
    this.listeners.forEach(listener => listener(this.state, prevState))
  }

  onGlobalStateChange(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  offGlobalStateChange(callback) {
    this.listeners.delete(callback)
  }

  getGlobalState() {
    return { ...this.state }
  }
}

export const actions = new GlobalStateManager()

// 监听全局状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 状态变化:', state, prev)
})

/**
 * 注册子应用
 */
export function registerApps() {
  const userStore = useUserStore()

  registerMicroApps(
    apps.map(app => ({
      ...app,
      props: {
        // 传递给子应用的数据
        getGlobalState: () => ({
          userInfo: userStore.userInfo,
          token: userStore.token,
          permissions: userStore.permissions
        }),
        actions
      },
      loader: (loading) => {
        console.log(`[主应用] ${app.name} loading:`, loading)
      }
    })),
    {
      beforeLoad: [
        app => {
          console.log('[主应用] before load:', app.name)
        }
      ],
      beforeMount: [
        app => {
          console.log('[主应用] before mount:', app.name)
        }
      ],
      afterMount: [
        app => {
          console.log('[主应用] after mount:', app.name)
        }
      ],
      afterUnmount: [
        app => {
          console.log('[主应用] after unmount:', app.name)
        }
      ]
    }
  )
}

/**
 * 启动 qiankun
 */
export function startQiankun() {
  start({
    prefetch: false, // 禁用预加载，避免并发加载导致超时
    sandbox: {
      strictStyleIsolation: false,
      experimentalStyleIsolation: true // 实验性样式隔离
    },
    singular: false, // 允许多个子应用同时挂载
    getPublicPath: () => '/',
    getTemplate: (tpl) => tpl
  })

  console.log('[主应用] qiankun 已启动')
}

/**
 * 全局错误处理
 */
addGlobalUncaughtErrorHandler((event) => {
  const { message: msg } = event

  // 忽略 ResizeObserver 的警告
  if (msg && msg.includes('ResizeObserver')) {
    return
  }

  console.error('[主应用] 全局错误:', event)
  if (msg) {
    message.error(`微应用加载失败: ${msg}`)
  }
})
