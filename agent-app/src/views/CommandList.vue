<template>
  <div class="command-list">
    <VxeBasicTable
      title="命令管理"
      :api="loadCommands"
      :grid-options="gridOptions"
      @register="registerTable"
    >
      <template #title-right>
        <a-space>
          <a-button type="primary" @click="showSendModal">
            <template #icon><SendOutlined /></template>
            发送命令
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #commandType="{ row }">
        <a-tag v-if="row" color="blue">{{ row.commandType }}</a-tag>
      </template>

      <template #status="{ row }">
        <a-tag v-if="row" :color="getStatusColor(row.status)">
          {{ row.status }}
        </a-tag>
      </template>

      <template #createdAt="{ row }">
        {{ row ? formatTime(row.createdAt) : '-' }}
      </template>
    </VxeBasicTable>

    <a-modal
      v-model:open="sendModalVisible"
      title="发送命令"
      @ok="handleSendCommand"
      :confirm-loading="sending"
    >
      <a-form :model="commandForm" :label-col="{ span: 6 }">
        <a-form-item label="Agent ID" required>
          <a-input v-model:value="commandForm.agentId" placeholder="输入 Agent ID" />
        </a-form-item>
        <a-form-item label="命令类型" required>
          <a-select v-model:value="commandForm.commandType" placeholder="选择命令类型">
            <a-select-option value="restart">重启</a-select-option>
            <a-select-option value="scale">扩缩容</a-select-option>
            <a-select-option value="update">更新配置</a-select-option>
            <a-select-option value="execute">执行脚本</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="命令参数">
          <a-textarea
            v-model:value="commandForm.payload"
            placeholder='输入 JSON 格式参数，如: {"replicas": 3}'
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { SendOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getCommands, sendCommand } from '@/api/agent'
import { VxeBasicTable } from '@k8s-agent/shared/components'
import dayjs from 'dayjs'

const sending = ref(false)
const sendModalVisible = ref(false)
let tableApi = null

const commandForm = reactive({
  agentId: '',
  commandType: '',
  payload: ''
})

const gridOptions = {
  columns: [
    {
      field: 'id',
      title: '命令 ID',
      width: 180
    },
    {
      field: 'agentId',
      title: 'Agent ID'
    },
    {
      field: 'commandType',
      title: '命令类型',
      slots: { default: 'commandType' }
    },
    {
      field: 'status',
      title: '状态',
      slots: { default: 'status' }
    },
    {
      field: 'createdAt',
      title: '创建时间',
      slots: { default: 'createdAt' }
    }
  ]
}

const registerTable = (api) => {
  tableApi = api
}

const getStatusColor = (status) => {
  const colors = {
    Pending: 'default',
    Sent: 'processing',
    Acknowledged: 'warning',
    Completed: 'success',
    Failed: 'error'
  }
  return colors[status] || 'default'
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const loadCommands = async (params) => {
  try {
    const res = await getCommands(params)
    return {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
  } catch (error) {
    message.error('加载命令列表失败')
    throw error
  }
}

const handleRefresh = () => {
  tableApi?.refresh()
}

const showSendModal = () => {
  commandForm.agentId = ''
  commandForm.commandType = ''
  commandForm.payload = ''
  sendModalVisible.value = true
}

const handleSendCommand = async () => {
  if (!commandForm.agentId || !commandForm.commandType) {
    message.warning('请填写必填项')
    return
  }

  let payload = {}
  if (commandForm.payload) {
    try {
      payload = JSON.parse(commandForm.payload)
    } catch (error) {
      message.error('参数格式错误，请输入有效的 JSON')
      return
    }
  }

  sending.value = true
  try {
    await sendCommand({
      agentId: commandForm.agentId,
      commandType: commandForm.commandType,
      payload
    })
    message.success('命令发送成功')
    sendModalVisible.value = false
    tableApi?.refresh()
  } catch (error) {
    message.error('命令发送失败')
  } finally {
    sending.value = false
  }
}
</script>

<style scoped lang="scss">
.command-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
