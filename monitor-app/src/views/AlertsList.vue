<template>
  <div class="alerts-list">
    <VxeBasicTable
      title="告警规则"
      :api="loadAlerts"
      :grid-options="gridOptions"
      @register="registerTable"
    >
      <template #title-right>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <template #icon><PlusOutlined /></template>
            新建规则
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #enabled="{ row }">
        <a-switch v-if="row"
          v-model:checked="row.enabled"
          @change="handleToggleEnabled(row)"
        />
      </template>

      <template #level="{ row }">
        <a-tag v-if="row" :color="getLevelColor(row.level)">
          {{ getLevelText(row.level) }}
        </a-tag>
      </template>

      <template #action="{ row }">
        <a-space v-if="row">
          <a-button type="link" size="small" @click="handleEdit(row)">
            编辑
          </a-button>
          <a-popconfirm
            title="确定要删除这个告警规则吗？"
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
      v-model:open="modalVisible"
      :title="modalTitle"
      width="800px"
      @ok="handleSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="alertForm" :label-col="{ span: 6 }">
        <a-form-item label="规则名称" required>
          <a-input v-model:value="alertForm.name" placeholder="输入规则名称" />
        </a-form-item>
        <a-form-item label="监控指标" required>
          <a-select v-model:value="alertForm.metricType" placeholder="选择监控指标">
            <a-select-option value="cpu">CPU 使用率</a-select-option>
            <a-select-option value="memory">内存使用率</a-select-option>
            <a-select-option value="disk">磁盘使用率</a-select-option>
            <a-select-option value="network">网络流量</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="条件" required>
          <a-select v-model:value="alertForm.condition" placeholder="选择条件">
            <a-select-option value="gt">大于</a-select-option>
            <a-select-option value="lt">小于</a-select-option>
            <a-select-option value="eq">等于</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="阈值" required>
          <a-input-number
            v-model:value="alertForm.threshold"
            :min="0"
            :max="100"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="告警级别" required>
          <a-select v-model:value="alertForm.level" placeholder="选择告警级别">
            <a-select-option value="critical">严重</a-select-option>
            <a-select-option value="warning">警告</a-select-option>
            <a-select-option value="info">信息</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="通知方式">
          <a-checkbox-group v-model:value="alertForm.notificationChannels">
            <a-checkbox value="email">邮件</a-checkbox>
            <a-checkbox value="sms">短信</a-checkbox>
            <a-checkbox value="webhook">Webhook</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea
            v-model:value="alertForm.description"
            placeholder="告警规则描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getAlerts, createAlert, updateAlert, deleteAlert } from '@/api/monitor'
import { VxeBasicTable } from '@k8s-agent/shared/components'

const submitting = ref(false)
const modalVisible = ref(false)
const modalTitle = ref('新建告警规则')
const editingId = ref(null)
let tableApi = null

const alertForm = reactive({
  name: '',
  metricType: '',
  condition: '',
  threshold: 0,
  level: '',
  notificationChannels: [],
  description: ''
})

const gridOptions = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '规则名称' },
    { field: 'metricType', title: '监控指标' },
    { field: 'threshold', title: '阈值' },
    { field: 'level', title: '告警级别', slots: { default: 'level' } },
    { field: 'enabled', title: '启用状态', slots: { default: 'enabled' } },
    { field: 'action', title: '操作', width: 150, slots: { default: 'action' } }
  ]
}

const registerTable = (api) => {
  tableApi = api
}

const getLevelColor = (level) => {
  const colors = {
    critical: 'error',
    warning: 'warning',
    info: 'default'
  }
  return colors[level] || 'default'
}

const getLevelText = (level) => {
  const texts = {
    critical: '严重',
    warning: '警告',
    info: '信息'
  }
  return texts[level] || level
}

const loadAlerts = async (params) => {
  try {
    const res = await getAlerts(params)
    return {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
  } catch (error) {
    message.error('加载告警规则失败')
    throw error
  }
}

const handleRefresh = () => {
  tableApi?.refresh()
}

const showAddModal = () => {
  modalTitle.value = '新建告警规则'
  editingId.value = null
  alertForm.name = ''
  alertForm.metricType = ''
  alertForm.condition = ''
  alertForm.threshold = 0
  alertForm.level = ''
  alertForm.notificationChannels = []
  alertForm.description = ''
  modalVisible.value = true
}

const handleEdit = (record) => {
  modalTitle.value = '编辑告警规则'
  editingId.value = record.id
  alertForm.name = record.name
  alertForm.metricType = record.metricType
  alertForm.condition = record.condition
  alertForm.threshold = record.threshold
  alertForm.level = record.level
  alertForm.notificationChannels = record.notificationChannels || []
  alertForm.description = record.description || ''
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!alertForm.name || !alertForm.metricType || !alertForm.level) {
    message.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateAlert(editingId.value, alertForm)
      message.success('更新成功')
    } else {
      await createAlert(alertForm)
      message.success('创建成功')
    }
    modalVisible.value = false
    tableApi?.refresh()
  } catch (error) {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleToggleEnabled = async (record) => {
  try {
    await updateAlert(record.id, { enabled: record.enabled })
    message.success('更新成功')
  } catch (error) {
    message.error('更新失败')
    record.enabled = !record.enabled
  }
}

const handleDelete = async (record) => {
  try {
    await deleteAlert(record.id)
    message.success('删除成功')
    tableApi?.refresh()
  } catch (error) {
    message.error('删除失败')
  }
}
</script>

<style scoped lang="scss">
.alerts-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
