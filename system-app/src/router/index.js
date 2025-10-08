import UserList from '@/views/UserList.vue'
import RoleList from '@/views/RoleList.vue'
import PermissionList from '@/views/PermissionList.vue'

const routes = [
  {
    path: '/',
    redirect: '/users'
  },
  {
    path: '/users',
    name: 'UserList',
    component: UserList
  },
  {
    path: '/roles',
    name: 'RoleList',
    component: RoleList
  },
  {
    path: '/permissions',
    name: 'PermissionList',
    component: PermissionList
  }
]

export default routes
