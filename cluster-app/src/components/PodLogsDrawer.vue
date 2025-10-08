<template>
  <a-drawer
    :open="visible"
    :title="`Pod 日志 - ${podInfo.name}`"
    width="80%"
    placement="right"
    @close="handleClose"
    class="pod-logs-drawer"
  >
    <div class="logs-toolbar">
      <a-space>
        <a-select
          v-if="containers.length > 1"
          v-model:value="selectedContainer"
          style="width: 200px"
          @change="handleContainerChange"
        >
          <a-select-option v-for="container in containers" :key="container.name" :value="container.name">
            {{ container.name }}
          </a-select-option>
        </a-select>

        <a-select v-model:value="tailLines" style="width: 150px" @change="handleTailChange">
          <a-select-option :value="100">最近 100 行</a-select-option>
          <a-select-option :value="500">最近 500 行</a-select-option>
          <a-select-option :value="1000">最近 1000 行</a-select-option>
          <a-select-option :value="5000">最近 5000 行</a-select-option>
        </a-select>

        <a-checkbox v-model:checked="autoRefresh" @change="handleAutoRefreshChange">
          自动刷新
        </a-checkbox>

        <a-checkbox v-model:checked="wrapLines">
          自动换行
        </a-checkbox>

        <a-input-search
          v-model:value="searchText"
          placeholder="搜索日志..."
          style="width: 250px"
          @search="handleSearch"
        />

        <a-button @click="handleRefresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>

        <a-button @click="handleDownload">
          <template #icon><DownloadOutlined /></template>
          下载
        </a-button>

        <a-button @click="handleClear">
          <template #icon><ClearOutlined /></template>
          清空
        </a-button>
      </a-space>
    </div>

    <div class="logs-stats">
      <a-space>
        <span>总行数: {{ totalLines }}</span>
        <span v-if="searchText">匹配: {{ filteredLines }}</span>
        <span v-if="loading">加载中...</span>
      </a-space>
    </div>

    <div
      ref="logsContainer"
      class="logs-container"
      :class="{ 'wrap-lines': wrapLines }"
    >
      <pre v-if="displayLogs" class="logs-content">{{ displayLogs }}</pre>
      <a-empty v-else description="暂无日志" />
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  DownloadOutlined,
  ClearOutlined
} from '@ant-design/icons-vue'
import { getPodLogs, getPodContainers } from '@/api/cluster'

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

const logsContainer = ref(null)
const containers = ref([])
const selectedContainer = ref('')
const tailLines = ref(100)
const autoRefresh = ref(false)
const wrapLines = ref(true)
const searchText = ref('')
const logs = ref('')
const loading = ref(false)
const autoRefreshTimer = ref(null)

const totalLines = computed(() => {
  return logs.value ? logs.value.split('\n').length : 0
})

const displayLogs = computed(() => {
  if (!logs.value) return ''

  if (searchText.value) {
    const lines = logs.value.split('\n')
    const filtered = lines.filter(line =>
      line.toLowerCase().includes(searchText.value.toLowerCase())
    )
    return filtered.join('\n')
  }

  return logs.value
})

const filteredLines = computed(() => {
  if (!searchText.value) return 0
  return displayLogs.value.split('\n').length
})

const loadContainers = async () => {
  try {
    const res = await getPodContainers(
      props.clusterId,
      props.podInfo.namespace,
      props.podInfo.name
    )
    containers.value = res.data || res.items || []

    if (containers.value.length > 0) {
      selectedContainer.value = containers.value[0].name
    }
  } catch (error) {
    console.error('[PodLogsModal] Load containers error:', error)
    message.error('加载容器列表失败')
  }
}

const loadLogs = async () => {
  if (!selectedContainer.value) return

  loading.value = true
  try {
    const res = await getPodLogs(
      props.clusterId,
      props.podInfo.namespace,
      props.podInfo.name,
      {
        container: selectedContainer.value,
        tail: tailLines.value
      }
    )

    logs.value = res.data?.logs || res.data?.lines?.join('\n') || ''

    // 滚动到底部
    await nextTick()
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight
    }
  } catch (error) {
    console.error('[PodLogsModal] Load logs error:', error)
    message.error('加载日志失败')
  } finally {
    loading.value = false
  }
}

const handleContainerChange = () => {
  loadLogs()
}

const handleTailChange = () => {
  loadLogs()
}

const handleAutoRefreshChange = (e) => {
  if (e.target.checked) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  if (autoRefreshTimer.value) return

  autoRefreshTimer.value = setInterval(() => {
    loadLogs()
  }, 3000) // 每3秒刷新一次
}

const stopAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
}

const handleSearch = () => {
  // 搜索逻辑已经在 computed 中实现
}

const handleRefresh = () => {
  loadLogs()
}

const handleDownload = () => {
  if (!logs.value) {
    message.warning('暂无日志可下载')
    return
  }

  const blob = new Blob([logs.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.podInfo.name}-${selectedContainer.value}-${Date.now()}.log`
  a.click()
  URL.revokeObjectURL(url)
  message.success('日志下载成功')
}

const handleClear = () => {
  logs.value = ''
  searchText.value = ''
}

const handleClose = () => {
  stopAutoRefresh()
  emit('update:visible', false)
  emit('close')
}

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await loadContainers()
    await loadLogs()
  } else {
    stopAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped lang="scss">
.pod-logs-drawer {
  :deep(.ant-drawer-body) {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.logs-toolbar {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.logs-stats {
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.logs-container {
  flex: 1;
  overflow: auto;
  background: #1e1e1e;
  border-radius: 4px;
  padding: 12px;

  &.wrap-lines {
    .logs-content {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}

.logs-content {
  margin: 0;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
}
</style>
