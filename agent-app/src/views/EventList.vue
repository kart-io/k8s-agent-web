<template>
  <div class="event-list">
    <VxeBasicTable
      title="事件列表"
      :api="loadEvents"
      :params="searchParams"
      :grid-options="gridOptions"
      @register="registerTable"
    >
      <template #title-right>
        <a-space>
          <a-select
            v-model:value="eventType"
            placeholder="事件类型"
            style="width: 150px"
            @change="handleSearch"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="Pod">Pod</a-select-option>
            <a-select-option value="Service">Service</a-select-option>
            <a-select-option value="Deployment">Deployment</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #eventType="{ row }">
        <a-tag v-if="row" color="blue">{{ row.eventType }}</a-tag>
      </template>

      <template #status="{ row }">
        <a-tag v-if="row" :color="getStatusColor(row.status)">
          {{ row.status }}
        </a-tag>
      </template>

      <template #timestamp="{ row }">
        {{ row ? formatTime(row.timestamp) : '-' }}
      </template>

      <template #action="{ row }">
        <a-button v-if="row" type="link" size="small" @click="handleView(row)">
          详情
        </a-button>
      </template>
    </VxeBasicTable>

    <a-modal
      v-model:open="detailVisible"
      title="事件详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="事件 ID">
          {{ currentEvent?.id }}
        </a-descriptions-item>
        <a-descriptions-item label="事件类型">
          {{ currentEvent?.eventType }}
        </a-descriptions-item>
        <a-descriptions-item label="资源名称">
          {{ currentEvent?.resourceName }}
        </a-descriptions-item>
        <a-descriptions-item label="命名空间">
          {{ currentEvent?.namespace }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentEvent?.status)">
            {{ currentEvent?.status }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="时间">
          {{ formatTime(currentEvent?.timestamp) }}
        </a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">
          {{ currentEvent?.message }}
        </a-descriptions-item>
        <a-descriptions-item label="详细信息" :span="2">
          <pre>{{ JSON.stringify(currentEvent?.metadata, null, 2) }}</pre>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { getEvents } from '@/api/agent'
import { VxeBasicTable } from '@k8s-agent/shared/components'
import dayjs from 'dayjs'

const eventType = ref('')
const searchParams = reactive({
  eventType: ''
})
const detailVisible = ref(false)
const currentEvent = ref(null)
let tableApi = null

const gridOptions = {
  columns: [
    {
      field: 'id',
      title: '事件 ID',
      width: 180
    },
    {
      field: 'eventType',
      title: '事件类型',
      slots: { default: 'eventType' }
    },
    {
      field: 'resourceName',
      title: '资源名称'
    },
    {
      field: 'namespace',
      title: '命名空间'
    },
    {
      field: 'status',
      title: '状态',
      slots: { default: 'status' }
    },
    {
      field: 'message',
      title: '描述',
      showOverflow: 'title'
    },
    {
      field: 'timestamp',
      title: '时间',
      slots: { default: 'timestamp' }
    },
    {
      field: 'action',
      title: '操作',
      width: 100,
      slots: { default: 'action' }
    }
  ]
}

const registerTable = (api) => {
  tableApi = api
}

const getStatusColor = (status) => {
  const colors = {
    Success: 'success',
    Pending: 'warning',
    Failed: 'error',
    Processing: 'processing'
  }
  return colors[status] || 'default'
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const loadEvents = async (params) => {
  try {
    const res = await getEvents(params)
    return {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
  } catch (error) {
    message.error('加载事件列表失败')
    throw error
  }
}

const handleSearch = () => {
  searchParams.eventType = eventType.value
}

const handleRefresh = () => {
  tableApi?.refresh()
}

const handleView = (record) => {
  currentEvent.value = record
  detailVisible.value = true
}
</script>

<style scoped lang="scss">
.event-list {
  height: 100%;
  display: flex;
  flex-direction: column;

  pre {
    background: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    max-height: 300px;
    overflow: auto;
  }
}
</style>
