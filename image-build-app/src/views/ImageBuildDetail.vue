<template>
  <div class="image-build-detail">
    <a-page-header
      title="构建详情"
      @back="handleBack"
      :sub-title="`ID: ${buildId}`"
    >
      <template #extra>
        <a-space>
          <a-button
            type="primary"
            @click="handleRebuild"
            :disabled="buildDetail?.status === 'building'"
          >
            <template #icon><ReloadOutlined /></template>
            重新构建
          </a-button>
          <a-popconfirm
            title="确定要删除这个构建吗？"
            @confirm="handleDelete"
          >
            <a-button danger>
              <template #icon><DeleteOutlined /></template>
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </a-page-header>

    <div style="margin-top: 16px;">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-card title="基本信息" :bordered="false">
            <a-descriptions :column="3" bordered>
              <a-descriptions-item label="构建名称">
                {{ buildDetail?.name }}
              </a-descriptions-item>
              <a-descriptions-item label="状态">
                <a-badge
                  :status="getStatusBadge(buildDetail?.status)"
                  :text="getStatusText(buildDetail?.status)"
                />
              </a-descriptions-item>
              <a-descriptions-item label="构建耗时">
                {{ formatDuration(buildDetail?.buildTime) }}
              </a-descriptions-item>
              <a-descriptions-item label="镜像仓库" :span="2">
                {{ buildDetail?.repository }}
              </a-descriptions-item>
              <a-descriptions-item label="镜像标签">
                <a-tag>{{ buildDetail?.tag }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="创建时间" :span="2">
                {{ formatTime(buildDetail?.createdAt) }}
              </a-descriptions-item>
              <a-descriptions-item label="完成时间">
                {{ formatTime(buildDetail?.completedAt) }}
              </a-descriptions-item>
              <a-descriptions-item label="描述" :span="3">
                {{ buildDetail?.description || '-' }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="24">
          <a-card title="Dockerfile" :bordered="false">
            <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto;">{{ buildDetail?.dockerfile }}</pre>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="16" style="margin-top: 16px;" v-if="buildDetail?.buildArgs">
        <a-col :span="24">
          <a-card title="构建参数" :bordered="false">
            <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px;">{{ buildDetail?.buildArgs }}</pre>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="24">
          <a-card :bordered="false">
            <template #title>
              <a-space>
                <span>构建日志</span>
                <a-button
                  type="link"
                  size="small"
                  @click="loadBuildLogs"
                  :loading="logsLoading"
                >
                  <template #icon><ReloadOutlined /></template>
                  刷新日志
                </a-button>
              </a-space>
            </template>
            <div class="log-container">
              <pre v-if="buildLogs" class="log-content">{{ buildLogs }}</pre>
              <a-empty v-else description="暂无构建日志" />
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getImageBuildDetail, getBuildLogs, rebuildImage, deleteImageBuild } from '@/api/image-build'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const buildId = ref(route.params.id)
const buildDetail = ref(null)
const buildLogs = ref('')
const loading = ref(false)
const logsLoading = ref(false)

const getStatusBadge = (status) => {
  const map = {
    pending: 'default',
    building: 'processing',
    success: 'success',
    failed: 'error'
  }
  return map[status] || 'default'
}

const getStatusText = (status) => {
  const map = {
    pending: '待构建',
    building: '构建中',
    success: '成功',
    failed: '失败'
  }
  return map[status] || status
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '-'
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`
}

const loadBuildDetail = async () => {
  loading.value = true
  try {
    const res = await getImageBuildDetail(buildId.value)
    buildDetail.value = res
  } catch (error) {
    message.error('加载构建详情失败')
  } finally {
    loading.value = false
  }
}

const loadBuildLogs = async () => {
  logsLoading.value = true
  try {
    const res = await getBuildLogs(buildId.value)
    buildLogs.value = res.logs || res
  } catch (error) {
    message.error('加载构建日志失败')
  } finally {
    logsLoading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleRebuild = async () => {
  try {
    await rebuildImage(buildId.value)
    message.success('重新构建已启动')
    loadBuildDetail()
    loadBuildLogs()
  } catch (error) {
    message.error('重新构建失败')
  }
}

const handleDelete = async () => {
  try {
    await deleteImageBuild(buildId.value)
    message.success('删除成功')
    router.push('/image-builds')
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadBuildDetail()
  loadBuildLogs()
})
</script>

<style scoped lang="scss">
.image-build-detail {
  .log-container {
    max-height: 500px;
    overflow-y: auto;
    background: #1e1e1e;
    border-radius: 4px;
    padding: 16px;

    .log-content {
      margin: 0;
      color: #d4d4d4;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}
</style>
