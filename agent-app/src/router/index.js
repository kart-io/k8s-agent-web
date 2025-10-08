import AgentList from '@/views/AgentList.vue'
import EventList from '@/views/EventList.vue'
import CommandList from '@/views/CommandList.vue'

const routes = [
  {
    path: '/',
    redirect: '/list'
  },
  {
    path: '/list',
    name: 'AgentList',
    component: AgentList
  },
  {
    path: '/events',
    name: 'EventList',
    component: EventList
  },
  {
    path: '/commands',
    name: 'CommandList',
    component: CommandList
  }
]

export default routes
