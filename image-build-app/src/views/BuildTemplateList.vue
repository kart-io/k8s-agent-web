<template>
  <div class="build-template-list">
    <a-card title="构建模板" :bordered="false">
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索模板"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-button type="primary" @click="showAddModal">
            <template #icon><PlusOutlined /></template>
            新建模板
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="templates"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div>
              <div style="font-weight: 500;">{{ record.name }}</div>
              <div style="font-size: 12px; color: #999;">{{ record.description }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'baseImage'">
            <a-tag>{{ record.baseImage }}</a-tag>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatTime(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleUseTemplate(record)">
                使用
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个模板吗？"
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

    <!-- 新建/编辑模板弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="900px"
      @ok="handleSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="templateForm" :label-col="{ span: 5 }">
        <a-form-item label="模板名称" required>
          <a-input v-model:value="templateForm.name" placeholder="输入模板名称" />
        </a-form-item>
        <a-form-item label="基础镜像" required>
          <a-input v-model:value="templateForm.baseImage" placeholder="例如: node:18-alpine" />
        </a-form-item>
        <a-form-item label="Dockerfile" required>
          <a-textarea
            v-model:value="templateForm.dockerfile"
            placeholder="粘贴 Dockerfile 内容"
            :rows="15"
            style="font-family: monospace;"
          />
        </a-form-item>
        <a-form-item label="默认构建参数">
          <a-textarea
            v-model:value="templateForm.defaultBuildArgs"
            placeholder="默认构建参数，每行一个，格式: KEY=VALUE"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea
            v-model:value="templateForm.description"
            placeholder="模板描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getBuildTemplates, createBuildTemplate, updateBuildTemplate, deleteBuildTemplate } from '@/api/image-build'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const templates = ref([])
const modalVisible = ref(false)
const modalTitle = ref('新建模板')
const editingId = ref(null)
const searchText = ref('')

const templateForm = reactive({
  name: '',
  baseImage: '',
  dockerfile: '',
  defaultBuildArgs: '',
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
    title: '模板名称',
    dataIndex: 'name',
    key: 'name',
    width: 250
  },
  {
    title: '基础镜像',
    dataIndex: 'baseImage',
    key: 'baseImage',
    width: 200
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
    width: 200,
    fixed: 'right'
  }
]

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const loadTemplates = async () => {
  loading.value = true
  try {
    const res = await getBuildTemplates({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      search: searchText.value
    })
    templates.value = res.data || res.items || []
    pagination.value.total = res.total || 0
  } catch (error) {
    message.error('加载模板列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1
  loadTemplates()
}

const handleRefresh = () => {
  loadTemplates()
}

const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadTemplates()
}

const showAddModal = () => {
  modalTitle.value = '新建模板'
  editingId.value = null
  templateForm.name = ''
  templateForm.baseImage = 'node:18-alpine'
  templateForm.dockerfile = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]`
  templateForm.defaultBuildArgs = ''
  templateForm.description = ''
  modalVisible.value = true
}

const handleEdit = (record) => {
  modalTitle.value = '编辑模板'
  editingId.value = record.id
  templateForm.name = record.name
  templateForm.baseImage = record.baseImage
  templateForm.dockerfile = record.dockerfile
  templateForm.defaultBuildArgs = record.defaultBuildArgs || ''
  templateForm.description = record.description || ''
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!templateForm.name || !templateForm.baseImage || !templateForm.dockerfile) {
    message.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateBuildTemplate(editingId.value, templateForm)
      message.success('更新成功')
    } else {
      await createBuildTemplate(templateForm)
      message.success('创建成功')
    }
    modalVisible.value = false
    loadTemplates()
  } catch (error) {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleUseTemplate = (record) => {
  // 跳转到构建列表页面，并携带模板信息
  router.push({
    path: '/image-builds',
    query: {
      templateId: record.id
    }
  })
  message.success('模板已加载，请填写其他信息')
}

const handleDelete = async (record) => {
  try {
    await deleteBuildTemplate(record.id)
    message.success('删除成功')
    loadTemplates()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped lang="scss">
.build-template-list {
  // 样式
}
</style>
