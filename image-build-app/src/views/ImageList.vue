<template>
  <div class="image-list">
    <VxeBasicTable
      title="镜像列表"
      :api="loadImages"
      :params="searchParams"
      :grid-options="gridOptions"
      @register="registerTable"
    >
      <template #title-right>
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索镜像"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <template #repository="{ row }">
        <div v-if="row">
          <div style="font-weight: 500;">{{ row.repository }}</div>
          <div style="font-size: 12px; color: #999;">{{ row.tag }}</div>
        </div>
      </template>

      <template #size="{ row }">
        {{ row ? formatSize(row.size) : '-' }}
      </template>

      <template #createdAt="{ row }">
        {{ row ? formatTime(row.createdAt) : '-' }}
      </template>

      <template #action="{ row }">
        <a-space v-if="row">
          <a-button type="link" size="small" @click="handleViewBuild(row)">
            查看构建
          </a-button>
          <a-button type="link" size="small" @click="handleCopyTag(row)">
            复制标签
          </a-button>
          <a-popconfirm
            title="确定要删除这个镜像吗？"
            @confirm="handleDelete(row)"
          >
            <a-button type="link" size="small" danger>
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </VxeBasicTable>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { getImages, deleteImage } from '@/api/image-build'
import { VxeBasicTable } from '@k8s-agent/shared/components'
import dayjs from 'dayjs'

const router = useRouter()
const searchText = ref('')
const searchParams = reactive({
  search: ''
})
let tableApi = null

const gridOptions = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'repository', title: '镜像仓库:标签', width: 300, slots: { default: 'repository' } },
    { field: 'digest', title: 'Digest', showOverflow: 'title' },
    { field: 'size', title: '大小', width: 120, slots: { default: 'size' } },
    { field: 'createdAt', title: '创建时间', width: 180, slots: { default: 'createdAt' } },
    { field: 'action', title: '操作', width: 220, fixed: 'right', slots: { default: 'action' } }
  ]
}

const registerTable = (api) => {
  tableApi = api
}

const formatSize = (bytes) => {
  if (!bytes) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const loadImages = async (params) => {
  try {
    const res = await getImages(params)
    return {
      data: {
        list: res.data || res.items || [],
        total: res.total || 0
      }
    }
  } catch (error) {
    message.error('加载镜像列表失败')
    throw error
  }
}

const handleSearch = () => {
  searchParams.search = searchText.value
}

const handleRefresh = () => {
  tableApi?.refresh()
}

const handleViewBuild = (record) => {
  if (record.buildId) {
    router.push(`/image-builds/${record.buildId}`)
  } else {
    message.info('该镜像没有关联的构建记录')
  }
}

const handleCopyTag = (record) => {
  const fullTag = `${record.repository}:${record.tag}`
  navigator.clipboard.writeText(fullTag).then(() => {
    message.success('已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败')
  })
}

const handleDelete = async (record) => {
  try {
    await deleteImage(record.id)
    message.success('删除成功')
    tableApi?.refresh()
  } catch (error) {
    message.error('删除失败')
  }
}
</script>

<style scoped lang="scss">
.image-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
