<template>
  <div class="dashboard">
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总 Agent 数"
            :value="stats.totalAgents"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <ClusterOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="在线 Agent"
            :value="stats.onlineAgents"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="离线 Agent"
            :value="stats.offlineAgents"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <CloseCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="待处理事件"
            :value="stats.pendingEvents"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <WarningOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="charts-row">
      <a-col :span="12">
        <a-card title="Agent 状态分布" :bordered="false">
          <v-chart :option="agentStatusOption" style="height: 300px" />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="事件类型统计" :bordered="false">
          <v-chart :option="eventTypeOption" style="height: 300px" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="charts-row">
      <a-col :span="24">
        <a-card title="最近 7 天事件趋势" :bordered="false">
          <v-chart :option="eventTrendOption" style="height: 300px" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="table-row">
      <a-col :span="24">
        <a-card title="最近事件" :bordered="false">
          <a-table
            :columns="eventColumns"
            :data-source="recentEvents"
            :pagination="{ pageSize: 10 }"
            :loading="loading"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'type'">
                <a-tag>{{ record.type }}</a-tag>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  ClusterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined
} from '@ant-design/icons-vue'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const loading = ref(false)

const stats = ref({
  totalAgents: 25,
  onlineAgents: 20,
  offlineAgents: 5,
  pendingEvents: 12
})

const agentStatusOption = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: '5%',
    left: 'center'
  },
  series: [
    {
      name: 'Agent 状态',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 20, name: '在线', itemStyle: { color: '#52c41a' } },
        { value: 5, name: '离线', itemStyle: { color: '#f5222d' } }
      ]
    }
  ]
})

const eventTypeOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: ['Pod Created', 'Pod Deleted', 'Service Updated', 'Config Changed', 'Error']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150, 80, 70],
      type: 'bar',
      itemStyle: {
        color: '#1890ff'
      }
    }
  ]
})

const eventTrendOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line',
      smooth: true,
      itemStyle: {
        color: '#1890ff'
      },
      areaStyle: {
        color: 'rgba(24, 144, 255, 0.2)'
      }
    }
  ]
})

const eventColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '时间',
    dataIndex: 'timestamp',
    key: 'timestamp'
  }
]

const recentEvents = ref([
  {
    id: 1,
    type: 'Pod Created',
    description: 'nginx-deployment-abc123 创建成功',
    status: 'Success',
    timestamp: '2024-01-10 10:30:25'
  },
  {
    id: 2,
    type: 'Pod Deleted',
    description: 'redis-cluster-xyz789 已删除',
    status: 'Success',
    timestamp: '2024-01-10 10:25:18'
  },
  {
    id: 3,
    type: 'Service Updated',
    description: 'api-gateway 服务配置更新',
    status: 'Success',
    timestamp: '2024-01-10 10:20:45'
  },
  {
    id: 4,
    type: 'Config Changed',
    description: 'mysql-config 配置已修改',
    status: 'Pending',
    timestamp: '2024-01-10 10:15:30'
  },
  {
    id: 5,
    type: 'Error',
    description: 'app-server-001 启动失败',
    status: 'Failed',
    timestamp: '2024-01-10 10:10:12'
  }
])

const getStatusColor = (status) => {
  const colors = {
    Success: 'success',
    Pending: 'warning',
    Failed: 'error'
  }
  return colors[status] || 'default'
}

onMounted(() => {
  // 可以在这里加载真实数据
})
</script>

<style scoped lang="scss">
.dashboard {
  .stats-row {
    margin-bottom: 16px;
  }

  .charts-row {
    margin-bottom: 16px;
  }

  .table-row {
    margin-bottom: 16px;
  }
}
</style>
