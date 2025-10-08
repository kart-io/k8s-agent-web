import ClusterList from '@/views/ClusterList.vue'
import ClusterDetail from '@/views/ClusterDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/list'
  },
  {
    path: '/list',
    name: 'ClusterList',
    component: ClusterList
  },
  {
    path: '/:id',
    name: 'ClusterDetail',
    component: ClusterDetail
  }
]

export default routes
