import MetricsList from '@/views/MetricsList.vue'
import AlertsList from '@/views/AlertsList.vue'

const routes = [
  {
    path: '/',
    redirect: '/metrics'
  },
  {
    path: '/metrics',
    name: 'MetricsList',
    component: MetricsList
  },
  {
    path: '/alerts',
    name: 'AlertsList',
    component: AlertsList
  }
]

export default routes
