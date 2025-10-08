<template>
  <a-drawer
    :open="visible"
    :title="`Pod 详情 - ${podInfo.name}`"
    width="85%"
    placement="right"
    @close="handleClose"
    class="pod-detail-drawer"
  >
    <a-spin :spinning="loading">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 基本信息 -->
        <a-tab-pane key="basic" tab="基本信息">
          <a-descriptions bordered :column="2">
            <a-descriptions-item label="Pod 名称">
              {{ podDetail.name }}
            </a-descriptions-item>
            <a-descriptions-item label="命名空间">
              {{ podDetail.namespace }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-badge
                :status="getPodStatusBadge(podDetail.status)"
                :text="podDetail.status"
              />
            </a-descriptions-item>
            <a-descriptions-item label="Pod IP">
              {{ podDetail.podIP || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="节点名称">
              {{ podDetail.nodeName || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="节点 IP">
              {{ podDetail.hostIP || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="QoS 等级">
              <a-tag>{{ podDetail.qosClass || '-' }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="重启策略">
              {{ podDetail.restartPolicy || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="服务账号">
              {{ podDetail.serviceAccountName || 'default' }}
            </a-descriptions-item>
            <a-descriptions-item label="优先级">
              {{ podDetail.priority || '0' }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ formatTime(podDetail.createdAt) }}
            </a-descriptions-item>
            <a-descriptions-item label="运行时长">
              {{ podDetail.age || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签" :span="2">
              <a-space v-if="podDetail.labels && Object.keys(podDetail.labels).length > 0">
                <a-tag v-for="(value, key) in podDetail.labels" :key="key" color="blue">
                  {{ key }}: {{ value }}
                </a-tag>
              </a-space>
              <span v-else>-</span>
            </a-descriptions-item>
            <a-descriptions-item label="注解" :span="2">
              <div v-if="podDetail.annotations && Object.keys(podDetail.annotations).length > 0" class="annotations">
                <div v-for="(value, key) in podDetail.annotations" :key="key" class="annotation-item">
                  <span class="annotation-key">{{ key }}:</span>
                  <span class="annotation-value">{{ value }}</span>
                </div>
              </div>
              <span v-else>-</span>
            </a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>

        <!-- 容器信息 -->
        <a-tab-pane key="containers" tab="容器信息">
          <a-table
            :columns="containerColumns"
            :data-source="podDetail.containers || []"
            :pagination="false"
            row-key="name"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'state'">
                <a-tag :color="getContainerStateColor(record.state)">
                  {{ record.state }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'ready'">
                <a-tag :color="record.ready ? 'success' : 'error'">
                  {{ record.ready ? 'Ready' : 'Not Ready' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'restartCount'">
                <a-badge
                  :count="record.restartCount"
                  :number-style="{ backgroundColor: record.restartCount > 0 ? '#faad14' : '#52c41a' }"
                />
              </template>
              <template v-else-if="column.key === 'resources'">
                <div v-if="record.resources">
                  <div v-if="record.resources.requests">
                    请求: CPU {{ record.resources.requests.cpu || '-' }},
                    内存 {{ record.resources.requests.memory || '-' }}
                  </div>
                  <div v-if="record.resources.limits">
                    限制: CPU {{ record.resources.limits.cpu || '-' }},
                    内存 {{ record.resources.limits.memory || '-' }}
                  </div>
                </div>
                <span v-else>-</span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 资源使用 -->
        <a-tab-pane key="resources" tab="资源使用">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-card title="CPU 使用情况">
                <a-statistic
                  title="当前使用"
                  :value="podDetail.cpuUsage || 0"
                  suffix="m"
                />
                <a-progress
                  :percent="podDetail.cpuUsagePercent || 0"
                  :status="podDetail.cpuUsagePercent > 80 ? 'exception' : 'normal'"
                  style="margin-top: 16px"
                />
                <a-descriptions bordered :column="1" style="margin-top: 16px">
                  <a-descriptions-item label="请求">
                    {{ podDetail.cpuRequest || '-' }}
                  </a-descriptions-item>
                  <a-descriptions-item label="限制">
                    {{ podDetail.cpuLimit || '-' }}
                  </a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-col>
            <a-col :span="12">
              <a-card title="内存使用情况">
                <a-statistic
                  title="当前使用"
                  :value="podDetail.memoryUsage || 0"
                  suffix="Mi"
                />
                <a-progress
                  :percent="podDetail.memoryUsagePercent || 0"
                  :status="podDetail.memoryUsagePercent > 80 ? 'exception' : 'normal'"
                  style="margin-top: 16px"
                />
                <a-descriptions bordered :column="1" style="margin-top: 16px">
                  <a-descriptions-item label="请求">
                    {{ podDetail.memoryRequest || '-' }}
                  </a-descriptions-item>
                  <a-descriptions-item label="限制">
                    {{ podDetail.memoryLimit || '-' }}
                  </a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-col>
          </a-row>
        </a-tab-pane>

        <!-- 卷挂载 -->
        <a-tab-pane key="volumes" tab="卷挂载">
          <a-table
            :columns="volumeColumns"
            :data-source="podDetail.volumes || []"
            :pagination="false"
            row-key="name"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-tag>{{ record.type }}</a-tag>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 条件状态 -->
        <a-tab-pane key="conditions" tab="条件状态">
          <a-table
            :columns="conditionColumns"
            :data-source="podDetail.conditions || []"
            :pagination="false"
            row-key="type"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 'True' ? 'success' : 'error'">
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'lastTransitionTime'">
                {{ formatTime(record.lastTransitionTime) }}
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 事件 -->
        <a-tab-pane key="events" tab="事件">
          <a-timeline>
            <a-timeline-item
              v-for="event in podDetail.events || []"
              :key="event.id"
              :color="getEventColor(event.type)"
            >
              <template #dot>
                <WarningOutlined v-if="event.type === 'Warning'" style="font-size: 16px" />
                <InfoCircleOutlined v-else style="font-size: 16px" />
              </template>
              <div class="event-item">
                <div class="event-header">
                  <a-tag :color="getEventColor(event.type)">{{ event.type }}</a-tag>
                  <span class="event-time">{{ formatTime(event.timestamp) }}</span>
                </div>
                <div class="event-reason">{{ event.reason }}</div>
                <div class="event-message">{{ event.message }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
          <a-empty v-if="!podDetail.events || podDetail.events.length === 0" description="暂无事件" />
        </a-tab-pane>

        <!-- YAML -->
        <a-tab-pane key="yaml" tab="YAML">
          <div class="yaml-container">
            <a-button
              type="primary"
              style="margin-bottom: 12px"
              @click="handleCopyYaml"
            >
              <template #icon><CopyOutlined /></template>
              复制 YAML
            </a-button>
            <pre class="yaml-content">{{ podDetail.yaml || '暂无 YAML 数据' }}</pre>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </a-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  WarningOutlined,
  InfoCircleOutlined,
  CopyOutlined
} from '@ant-design/icons-vue'
import { getPodDetail } from '@/api/cluster'
import dayjs from 'dayjs'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  podInfo: {
    type: Object,
    required: true
  },
  clusterId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:visible', 'close'])

const loading = ref(false)
const activeTab = ref('basic')
const podDetail = ref({})

const containerColumns = [
  { title: '容器名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '镜像', dataIndex: 'image', key: 'image' },
  { title: '状态', dataIndex: 'state', key: 'state', width: 120 },
  { title: '就绪', dataIndex: 'ready', key: 'ready', width: 120 },
  { title: '重启次数', dataIndex: 'restartCount', key: 'restartCount', width: 120 },
  { title: '资源配置', key: 'resources', width: 300 }
]

const volumeColumns = [
  { title: '卷名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 150 },
  { title: '挂载路径', dataIndex: 'mountPath', key: 'mountPath' },
  { title: '只读', dataIndex: 'readOnly', key: 'readOnly', width: 100 }
]

const conditionColumns = [
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '原因', dataIndex: 'reason', key: 'reason' },
  { title: '消息', dataIndex: 'message', key: 'message' },
  { title: '最后转换时间', dataIndex: 'lastTransitionTime', key: 'lastTransitionTime', width: 200 }
]

const getPodStatusBadge = (status) => {
  const statusMap = {
    'Running': 'success',
    'Pending': 'processing',
    'Succeeded': 'success',
    'Failed': 'error',
    'Unknown': 'warning',
    'CrashLoopBackOff': 'error',
    'ContainerCreating': 'processing',
    'Terminating': 'warning'
  }
  return statusMap[status] || 'default'
}

const getContainerStateColor = (state) => {
  const stateMap = {
    'running': 'success',
    'waiting': 'warning',
    'terminated': 'error'
  }
  return stateMap[state?.toLowerCase()] || 'default'
}

const getEventColor = (type) => {
  return type === 'Warning' ? 'red' : 'blue'
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const loadPodDetail = async () => {
  loading.value = true
  try {
    const res = await getPodDetail(
      props.clusterId,
      props.podInfo.namespace,
      props.podInfo.name
    )
    podDetail.value = res.data || res || {}
  } catch (error) {
    console.error('[PodDetailModal] Load error:', error)
    message.error('加载 Pod 详情失败')
  } finally {
    loading.value = false
  }
}

const handleCopyYaml = () => {
  if (!podDetail.value.yaml) {
    message.warning('暂无 YAML 数据')
    return
  }

  navigator.clipboard.writeText(podDetail.value.yaml).then(() => {
    message.success('YAML 已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败')
  })
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    activeTab.value = 'basic'
    loadPodDetail()
  }
})
</script>

<style scoped lang="scss">
.pod-detail-drawer {
  :deep(.ant-drawer-body) {
    padding: 16px;
    height: 100%;
    overflow-y: auto;
  }
}

.annotations {
  max-height: 200px;
  overflow-y: auto;
}

.annotation-item {
  margin-bottom: 8px;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;

  .annotation-key {
    font-weight: 500;
    color: #1890ff;
    margin-right: 8px;
  }

  .annotation-value {
    color: #666;
    word-break: break-all;
  }
}

.event-item {
  .event-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .event-time {
      margin-left: 12px;
      color: #999;
      font-size: 12px;
    }
  }

  .event-reason {
    font-weight: 500;
    margin-bottom: 4px;
    color: #333;
  }

  .event-message {
    color: #666;
    font-size: 13px;
  }
}

.yaml-container {
  background: #1e1e1e;
  border-radius: 4px;
  padding: 16px;

  .yaml-content {
    margin: 0;
    color: #d4d4d4;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre;
    overflow-x: auto;
  }
}
</style>
