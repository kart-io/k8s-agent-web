<!--
  VXE Table 基础表格组件
  参考 vue-vben-admin 实现
-->
<template>
  <div class="vxe-basic-table" :class="{ 'is-full-screen': isFullScreen }">
    <!-- 表格标题 -->
    <div v-if="title" class="vxe-table-title">
      <div class="title-left">
        <slot name="title">
          <span class="title-text">{{ title }}</span>
        </slot>
      </div>
      <div class="title-right">
        <slot name="title-right" />
      </div>
    </div>

    <!-- VXE Grid 表格 -->
    <div ref="gridContainer" class="vxe-grid-container">
      <vxe-table
        ref="gridRef"
        v-bind="tableOptions"
        :data="tableData"
        :loading="loading"
        class="vxe-table-main"
      >
        <vxe-column
          v-for="(col, index) in columns"
          :key="index"
          v-bind="col"
        >
          <template v-if="col.slots?.default" #default="scope">
            <slot :name="col.slots.default" v-bind="scope" />
          </template>
        </vxe-column>
      </vxe-table>

      <!-- 自定义分页器 -->
      <div v-if="showPager" class="vxe-custom-pager">
        <a-pagination
          v-model:current="pagerConfig.currentPage"
          v-model:page-size="pagerConfig.pageSize"
          :total="pagerConfig.total"
          :show-total="total => `共 ${total} 条`"
          :show-size-changer="true"
          :page-size-options="['10', '20', '50', '100']"
          @change="handlePageChange"
          @show-size-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  // 表格标题
  title: {
    type: String,
    default: ''
  },
  // 表格配置
  gridOptions: {
    type: Object,
    default: () => ({})
  },
  // 表格事件
  gridEvents: {
    type: Object,
    default: () => ({})
  },
  // 表单配置
  formOptions: {
    type: Object,
    default: () => ({})
  },
  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true
  },
  // 是否显示分页
  showPager: {
    type: Boolean,
    default: true
  },
  // 是否立即加载
  immediate: {
    type: Boolean,
    default: true
  },
  // 表格类名
  tableClass: {
    type: [String, Array, Object],
    default: ''
  },
  // 表格样式
  tableStyle: {
    type: Object,
    default: () => ({})
  },
  // API 请求方法
  api: {
    type: Function,
    default: null
  },
  // 请求参数
  params: {
    type: Object,
    default: () => ({})
  },
  // 数据源
  dataSource: {
    type: Array,
    default: null
  },
  // 分页配置
  pagination: {
    type: [Object, Boolean],
    default: () => ({})
  },
  // 是否自动高度
  autoHeight: {
    type: Boolean,
    default: true
  },
  // 最大高度
  maxHeight: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits([
  'register',
  'checkbox-change',
  'checkbox-all',
  'page-change',
  'sort-change',
  'filter-change',
  'toolbar-button-click',
  'load-success',
  'load-error'
])

const isFullScreen = ref(false)
const gridContainer = ref(null)
const gridRef = ref(null)
const loading = ref(false)
const tableData = ref([])
const pagerConfig = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 提取列配置
const columns = computed(() => {
  return props.gridOptions?.columns || []
})

// 表格选项（不包含列）
const tableOptions = computed(() => {
  const { columns: _, ...options } = props.gridOptions || {}
  return {
    border: true,
    showOverflow: 'title',
    showHeaderOverflow: 'title',
    stripe: true,
    rowConfig: {
      isHover: true
    },
    columnConfig: {
      resizable: true
    },
    autoResize: true,
    scrollY: {
      enabled: true
    },
    ...options
  }
})

// 加载数据
const loadData = async () => {
  if (!props.api) {
    // 如果没有 API，使用 dataSource
    if (props.dataSource) {
      tableData.value = props.dataSource
    }
    return
  }

  loading.value = true
  try {
    const params = {
      page: pagerConfig.value.currentPage,
      pageSize: pagerConfig.value.pageSize,
      ...props.params
    }

    const result = await props.api(params)

    if (result && result.data) {
      tableData.value = result.data.list || result.data || []
      pagerConfig.value.total = result.data.total || 0

      emit('load-success', result.data)
    }
  } catch (error) {
    console.error('[VxeBasicTable] 加载数据失败:', error)
    emit('load-error', error)
  } finally {
    loading.value = false
  }
}

// 分页变化
const handlePageChange = (page, pageSize) => {
  pagerConfig.value.currentPage = page
  pagerConfig.value.pageSize = pageSize
  loadData()
  emit('page-change', { currentPage: page, pageSize })
}

// 暴露的 API 方法
const tableApi = {
  reload: () => {
    pagerConfig.value.currentPage = 1
    loadData()
  },
  query: () => {
    pagerConfig.value.currentPage = 1
    loadData()
  },
  refresh: () => {
    loadData()
  },
  getTableData: () => tableData.value,
  setTableData: (data) => {
    tableData.value = data
  }
}

// 监听 dataSource 变化
watch(() => props.dataSource, (newVal) => {
  if (newVal && !props.api) {
    tableData.value = newVal
  }
}, { immediate: true })

// 监听 params 变化
watch(() => props.params, () => {
  if (props.api) {
    loadData()
  }
}, { deep: true })

// 组件挂载
onMounted(() => {
  nextTick(() => {
    emit('register', tableApi)

    if (props.immediate && props.api) {
      loadData()
    }
  })
})

// 暴露 API 方法
defineExpose({
  gridContainer,
  gridRef,
  ...tableApi
})
</script>

<style scoped lang="scss">
.vxe-basic-table {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.is-full-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: #fff;
    padding: 16px;
  }

  .vxe-table-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;

    .title-left {
      flex: 1;

      .title-text {
        font-size: 16px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
      }
    }

    .title-right {
      flex-shrink: 0;
      margin-left: 16px;
    }
  }

  .vxe-grid-container {
    flex: 1;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .vxe-table-main {
    flex: 1;
    min-height: 0;
  }

  .vxe-table-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
  }

  .vxe-custom-pager {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
    margin-top: 16px;
    flex-shrink: 0;
  }
}
</style>
