/**
 * 子应用配置列表
 */
const isDev = import.meta.env.DEV

const apps = [
  {
    name: 'dashboard-app',
    entry: isDev ? '//localhost:3001' : '/dashboard',
    container: '#micro-app-container',
    activeRule: '/dashboard',
  },
  {
    name: 'agent-app',
    entry: isDev ? '//localhost:3002' : '/agent',
    container: '#micro-app-container',
    activeRule: '/agents',
  },
  {
    name: 'cluster-app',
    entry: isDev ? '//localhost:3003' : '/cluster',
    container: '#micro-app-container',
    activeRule: '/clusters',
  },
  {
    name: 'monitor-app',
    entry: isDev ? '//localhost:3004' : '/monitor',
    container: '#micro-app-container',
    activeRule: '/monitor',
  },
  {
    name: 'system-app',
    entry: isDev ? '//localhost:3005' : '/system',
    container: '#micro-app-container',
    activeRule: '/system',
  },
  {
    name: 'image-build-app',
    entry: isDev ? '//localhost:3006' : '/image-build',
    container: '#micro-app-container',
    activeRule: '/image-build',
  }
]

export default apps
