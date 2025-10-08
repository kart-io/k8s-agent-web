import WujieVue from 'wujie-vue3'

export const wujieConfig = {
  apps: [
    {
      name: 'dashboard-app',
      url: '//localhost:3001',
      exec: true,
      alive: true,
      sync: true
    },
    {
      name: 'agent-app',
      url: '//localhost:3002',
      exec: true,
      alive: true,
      sync: true
    },
    {
      name: 'cluster-app',
      url: '//localhost:3003',
      exec: true,
      alive: true,
      sync: true
    },
    {
      name: 'monitor-app',
      url: '//localhost:3004',
      exec: true,
      alive: true,
      sync: true
    },
    {
      name: 'system-app',
      url: '//localhost:3005',
      exec: true,
      alive: true,
      sync: true
    },
    {
      name: 'image-build-app',
      url: '//localhost:3006',
      exec: true,
      alive: true,
      sync: true
    }
  ]
}

export function setupWujie(app) {
  app.use(WujieVue)
}
