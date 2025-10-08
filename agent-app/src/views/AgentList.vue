<template>
  <div class="agent-list">
    <VxeBasicTable
      title="Agent 列表"
      :api="loadAgents"
      :params="searchParams"
      :grid-options="gridOptions"
      @register="registerTable"
    >
      <template #title-right>
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索 Agent"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-button type="primary" @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #status="{ row }">
        <a-badge v-if="row"
          :status="row.status === 'online' ? 'success' : 'error'"
          :text="row.status === 'online' ? '在线' : '离线'"
        />
      </template>

      <template #lastHeartbeat="{ row }">
        {{ row ? formatTime(row.lastHeartbeat) : '-' }}
      </template>

      <template #action="{ row }">
        <a-space v-if="row">
          <a-button type="link" size="small" @click="handleView(row)">
            查看
          </a-button>
          <a-button type="link" size="small" @click="handleEdit(row)">
            编辑
          </a-button>
          <a-popconfirm
            title="确定要删除这个 Agent 吗？"
            @confirm="handleDelete(row)"
          >
            <a-button type="link" size="small" danger>
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </VxeBasicTable>

    <a-modal
      v-model:open="detailVisible"
      title="Agent 详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="Agent ID">
          {{ currentAgent?.id }}
        </a-descriptions-item>
        <a-descriptions-item label="名称">
          {{ currentAgent?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="集群">
          {{ currentAgent?.clusterName }}
        </a-descriptions-item>
        <a-descriptions-item label="命名空间">
          {{ currentAgent?.namespace }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-badge
            :status="currentAgent?.status === 'online' ? 'success' : 'error'"
            :text="currentAgent?.status === 'online' ? '在线' : '离线'"
          />
        </a-descriptions-item>
        <a-descriptions-item label="版本">
          {{ currentAgent?.version }}
        </a-descriptions-item>
        <a-descriptions-item label="最后心跳" :span="2">
          {{ formatTime(currentAgent?.lastHeartbeat) }}
        </a-descriptions-item>
        <a-descriptions-item label="标签" :span="2">
          <a-tag v-for="(value, key) in currentAgent?.labels" :key="key">
            {{ key }}: {{ value }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { getAgents, deleteAgent } from '@/api/agent'
import { VxeBasicTable } from '@k8s-agent/shared/components'
import dayjs from 'dayjs'

const searchText = ref('')
const searchParams = reactive({
  search: ''
})
const detailVisible = ref(false)
const currentAgent = ref(null)
let tableApi = null

const gridOptions = {
  columns: [
    {
      field: 'id',
      title: 'Agent ID',
      width: 200
    },
    {
      field: 'name',
      title: '名称'
    },
    {
      field: 'clusterName',
      title: '集群'
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
      field: 'version',
      title: '版本'
    },
    {
      field: 'lastHeartbeat',
      title: '最后心跳',
      slots: { default: 'lastHeartbeat' }
    },
    {
      field: 'action',
      title: '操作',
      width: 200,
      slots: { default: 'action' }
    }
  ]
}

const registerTable = (api) => {
  tableApi = api
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const loadAgents = async (params) => {
  try {
    const res = await getAgents(params)
    console.log('[AgentList] 加载数据:', res)
    // Mock API 返回格式: { data: [...], total: 50, page: 1, pageSize: 10 }
    // VxeBasicTable 期望格式: { data: { list: [...], total: 50 } }
    return {
      data: {
        list: res.data || [],
        total: res.total || 0
      }
    }
  } catch (error) {
    console.error('[AgentList] 加载失败:', error)
    message.error('加载 Agent 列表失败')
    throw error
  }
}

const handleSearch = () => {
  searchParams.search = searchText.value
}

const handleRefresh = () => {
  tableApi?.refresh()
}

const handleView = (record) => {
  currentAgent.value = record
  detailVisible.value = true
}

const handleEdit = (record) => {
  message.info('编辑功能开发中')
}

const handleDelete = async (record) => {
  try {
    await deleteAgent(record.id)
    message.success('删除成功')
    tableApi?.refresh()
  } catch (error) {
    message.error('删除失败')
  }
}
</script>

<style scoped lang="scss">
.agent-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
