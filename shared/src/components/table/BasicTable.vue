<template>
  <div class="basic-table">
    <div v-if="showToolbar" class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <span v-if="title" class="table-title">{{ title }}</span>
        </slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <a-space>
            <a-button v-if="showRefresh" @click="handleRefresh">
              <template #icon><ReloadOutlined /></template>
              刷新
            </a-button>
            <a-button v-if="showColumnSetting">
              <template #icon><SettingOutlined /></template>
              列设置
            </a-button>
          </a-space>
        </slot>
      </div>
    </div>

    <a-table
      v-bind="$attrs"
      :columns="innerColumns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="innerPagination"
      :row-key="rowKey"
      :scroll="scroll"
      @change="handleTableChange"
    >
      <!-- 透传所有插槽 -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>

      <!-- 操作列插槽 -->
      <template v-if="actionColumn" #action="{ record }">
        <slot name="action" :record="record">
          <a-space>
            <a-button v-if="actionColumn.edit" type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm
              v-if="actionColumn.delete"
              title="确定要删除吗？"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </slot>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  // 数据源
  dataSource: {
    type: Array,
    default: () => []
  },
  // 列配置
  columns: {
    type: Array,
    default: () => []
  },
  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true
  },
  // 表格标题
  title: {
    type: String,
    default: ''
  },
  // 是否显示刷新按钮
  showRefresh: {
    type: Boolean,
    default: true
  },
  // 是否显示列设置按钮
  showColumnSetting: {
    type: Boolean,
    default: false
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 分页配置
  pagination: {
    type: [Object, Boolean],
    default: () => ({})
  },
  // 行的 key
  rowKey: {
    type: [String, Function],
    default: 'id'
  },
  // 滚动配置
  scroll: {
    type: Object,
    default: () => ({ x: 'max-content' })
  },
  // 操作列配置
  actionColumn: {
    type: Object,
    default: null
  },
  // 请求数据的方法
  api: {
    type: Function,
    default: null
  },
  // 立即加载
  immediate: {
    type: Boolean,
    default: true
  },
  // 请求参数
  searchParams: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['refresh', 'edit', 'delete', 'change', 'register'])

// 内部分页配置
const innerPagination = computed(() => {
  if (props.pagination === false) {
    return false
  }
  return {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    ...props.pagination
  }
})

// 内部列配置（添加操作列）
const innerColumns = computed(() => {
  const cols = [...props.columns]
  if (props.actionColumn) {
    cols.push({
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      ...props.actionColumn,
      slots: { customRender: 'action' }
    })
  }
  return cols
})

// 刷新
const handleRefresh = () => {
  emit('refresh')
  if (props.api) {
    reload()
  }
}

// 编辑
const handleEdit = (record) => {
  emit('edit', record)
}

// 删除
const handleDelete = (record) => {
  emit('delete', record)
}

// 表格变化（分页、排序、筛选）
const handleTableChange = (pagination, filters, sorter) => {
  emit('change', { pagination, filters, sorter })
}

// 加载数据
const loading = ref(false)
const reload = async (params = {}) => {
  if (!props.api) return

  try {
    loading.value = true
    const mergedParams = { ...props.searchParams, ...params }

    // 如果有分页配置，添加分页参数
    if (innerPagination.value) {
      mergedParams.page = innerPagination.value.current
      mergedParams.pageSize = innerPagination.value.pageSize
    }

    const result = await props.api(mergedParams)

    // 假设返回格式为 { data: [], total: 0 }
    if (result.data) {
      emit('update:dataSource', result.data)
      if (innerPagination.value) {
        innerPagination.value.total = result.total || 0
      }
    }
  } catch (error) {
    console.error('Failed to load table data:', error)
  } finally {
    loading.value = false
  }
}

// 立即加载
if (props.immediate && props.api) {
  reload()
}

// 监听搜索参数变化
watch(() => props.searchParams, () => {
  if (props.api) {
    reload()
  }
}, { deep: true })

// 暴露方法给父组件
defineExpose({
  reload
})

// 注册表格实例
emit('register', { reload })
</script>

<style scoped>
.basic-table {
  background: #fff;
  border-radius: 2px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  flex-shrink: 0;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
}
</style>
