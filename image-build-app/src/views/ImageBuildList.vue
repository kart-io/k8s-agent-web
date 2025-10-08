<template>
  <div class="image-build-list">
    <a-card title="镜像构建列表" :bordered="false">
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索构建名称或仓库"
            style="width: 220px"
            @search="handleSearch"
          />
          <a-select
            v-model:value="statusFilter"
            placeholder="状态筛选"
            style="width: 120px"
            allowClear
            @change="handleSearch"
          >
            <a-select-option value="pending">待构建</a-select-option>
            <a-select-option value="building">构建中</a-select-option>
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
          </a-select>
          <a-popconfirm
            v-if="selectedRowKeys.length > 0"
            :title="`确定要删除选中的 ${selectedRowKeys.length} 个构建记录吗？`"
            @confirm="handleBatchDelete"
          >
            <a-button type="primary" danger>
              <template #icon><DeleteOutlined /></template>
              批量删除 ({{ selectedRowKeys.length }})
            </a-button>
          </a-popconfirm>
          <a-button type="primary" @click="showAddModal">
            <template #icon><PlusOutlined /></template>
            新建构建
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="builds"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        :row-key="record => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'repository'">
            <div>
              <div style="font-weight: 500;">{{ record.repository }}</div>
              <div style="font-size: 12px; color: #999;">{{ record.tag }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge
              :status="getStatusBadge(record.status)"
              :text="getStatusText(record.status)"
            />
          </template>
          <template v-else-if="column.key === 'buildTime'">
            {{ formatDuration(record.buildTime) }}
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatTime(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                详情
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleRebuild(record)"
                :disabled="record.status === 'building'"
              >
                重新构建
              </a-button>
              <a-popconfirm
                title="确定要删除这个构建记录吗？"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新建构建弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      title="新建镜像构建"
      width="900px"
      @ok="handleSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="buildForm" :label-col="{ span: 5 }">
        <a-form-item label="构建名称" required>
          <a-input v-model:value="buildForm.name" placeholder="输入构建名称" />
        </a-form-item>
        <a-form-item label="镜像仓库" required>
          <a-input v-model:value="buildForm.repository" placeholder="例如: docker.io/myapp" />
        </a-form-item>
        <a-form-item label="镜像标签" required>
          <a-input v-model:value="buildForm.tag" placeholder="例如: latest, v1.0.0" />
        </a-form-item>
        <a-form-item label="Dockerfile" required>
          <a-textarea
            v-model:value="buildForm.dockerfile"
            placeholder="粘贴 Dockerfile 内容"
            :rows="12"
            style="font-family: monospace;"
          />
        </a-form-item>
        <a-form-item label="构建参数">
          <a-textarea
            v-model:value="buildForm.buildArgs"
            placeholder="构建参数，每行一个，格式: KEY=VALUE"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea
            v-model:value="buildForm.description"
            placeholder="构建描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getImageBuilds, createImageBuild, deleteImageBuild, rebuildImage } from '@/api/image-build'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const builds = ref([])
const modalVisible = ref(false)
const searchText = ref('')
const statusFilter = ref(undefined)
const selectedRowKeys = ref([])

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  },
  columnWidth: 60
}))

const buildForm = reactive({
  name: '',
  repository: '',
  tag: '',
  dockerfile: '',
  buildArgs: '',
  description: ''
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: '构建名称',
    dataIndex: 'name',
    key: 'name',
    width: 180
  },
  {
    title: '镜像仓库:标签',
    dataIndex: 'repository',
    key: 'repository',
    width: 250
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '构建耗时',
    dataIndex: 'buildTime',
    key: 'buildTime',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right'
  }
]

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

const loadBuilds = async () => {
  loading.value = true
  try {
    const res = await getImageBuilds({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      search: searchText.value,
      status: statusFilter.value
    })
    builds.value = res.data || res.items || []
    pagination.value.total = res.total || 0
  } catch (error) {
    message.error('加载构建列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1
  loadBuilds()
}

const handleRefresh = () => {
  loadBuilds()
}

const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadBuilds()
}

const showAddModal = () => {
  buildForm.name = ''
  buildForm.repository = ''
  buildForm.tag = 'latest'
  buildForm.dockerfile = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]`
  buildForm.buildArgs = ''
  buildForm.description = ''
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!buildForm.name || !buildForm.repository || !buildForm.tag || !buildForm.dockerfile) {
    message.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    await createImageBuild({
      name: buildForm.name,
      repository: buildForm.repository,
      tag: buildForm.tag,
      dockerfile: buildForm.dockerfile,
      buildArgs: buildForm.buildArgs,
      description: buildForm.description
    })
    message.success('构建创建成功')
    modalVisible.value = false
    loadBuilds()
  } catch (error) {
    message.error('创建失败')
  } finally {
    submitting.value = false
  }
}

const handleView = (record) => {
  router.push(`/image-builds/${record.id}`)
}

const handleRebuild = async (record) => {
  try {
    await rebuildImage(record.id)
    message.success('重新构建已启动')
    loadBuilds()
  } catch (error) {
    message.error('重新构建失败')
  }
}

const handleDelete = async (record) => {
  try {
    await deleteImageBuild(record.id)
    message.success('删除成功')
    loadBuilds()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleBatchDelete = async () => {
  try {
    // 批量删除所有选中的记录
    await Promise.all(selectedRowKeys.value.map(id => deleteImageBuild(id)))
    message.success(`成功删除 ${selectedRowKeys.value.length} 条记录`)
    selectedRowKeys.value = []
    loadBuilds()
  } catch (error) {
    message.error('批量删除失败')
  }
}

onMounted(() => {
  loadBuilds()
})
</script>

<style scoped lang="scss">
.image-build-list {
  // 样式
}
</style>
