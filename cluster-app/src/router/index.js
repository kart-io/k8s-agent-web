import ClusterList from '@/views/ClusterList.vue'
import ClusterDetail from '@/views/ClusterDetail.vue'
import NodeList from '@/views/NodeList.vue'
import PodList from '@/views/PodList.vue'
import ServiceList from '@/views/ServiceList.vue'

const routes = [
  {
    path: '/',
    name: 'ClusterList',
    component: ClusterList
  },
  {
    path: '/list',
    redirect: '/'
  },
  {
    path: '/:id/nodes',
    name: 'NodeList',
    component: NodeList
  },
  {
    path: '/:id/pods',
    name: 'PodList',
    component: PodList
  },
  {
    path: '/:id/services',
    name: 'ServiceList',
    component: ServiceList
  },
  {
    path: '/:id',
    name: 'ClusterDetail',
    component: ClusterDetail
  }
]

export default routes
