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
        :tree-config="treeConfig"
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
import { ref, computed, watch, onMounted, onActivated, nextTick } from 'vue'

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

// 提取树形配置
const treeConfig = computed(() => {
  return props.gridOptions?.treeConfig || null
})

// 表格选项（不包含列和treeConfig）
const tableOptions = computed(() => {
  const { columns: _, treeConfig: __, ...options } = props.gridOptions || {}
  return {
    border: 'inner',
    round: true,
    showOverflow: 'title',
    showHeaderOverflow: 'title',
    stripe: true,
    align: 'left',
    headerAlign: 'left',
    rowConfig: {
      isHover: true,
      isCurrent: false
    },
    cellConfig: {
      height: 54
    },
    columnConfig: {
      resizable: true,
      minWidth: 100
    },
    autoResize: true,
    scrollY: {
      enabled: true,
      gt: 20
    },
    emptyText: '暂无数据',
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
  console.log('[VxeBasicTable] loadData called, current page:', pagerConfig.value.currentPage)

  try {
    const params = {
      page: pagerConfig.value.currentPage,
      pageSize: pagerConfig.value.pageSize,
      ...props.params
    }

    console.log('[VxeBasicTable] Calling API with params:', params)
    const result = await props.api(params)
    console.log('[VxeBasicTable] API result:', result)

    if (result && result.data) {
      tableData.value = result.data.list || result.data || []
      pagerConfig.value.total = result.data.total || 0

      console.log('[VxeBasicTable] Data loaded successfully, count:', tableData.value.length, 'total:', pagerConfig.value.total)
      emit('load-success', result.data)
    } else {
      console.warn('[VxeBasicTable] API returned invalid data structure:', result)
      tableData.value = []
      pagerConfig.value.total = 0
    }
  } catch (error) {
    console.error('[VxeBasicTable] 加载数据失败:', error)
    tableData.value = []
    pagerConfig.value.total = 0
    emit('load-error', error)
  } finally {
    loading.value = false
    console.log('[VxeBasicTable] loadData finished, loading:', loading.value, 'data count:', tableData.value.length)
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
  console.log('[VxeBasicTable] Component mounted, immediate:', props.immediate, 'has api:', !!props.api)
  nextTick(() => {
    console.log('[VxeBasicTable] nextTick, emitting register event')
    emit('register', tableApi)

    if (props.immediate && props.api) {
      console.log('[VxeBasicTable] immediate is true and api exists, calling loadData()')
      loadData()
    } else {
      console.log('[VxeBasicTable] Skipping initial loadData, immediate:', props.immediate, 'api:', !!props.api)
    }
  })
})

// 组件激活（用于 keep-alive 场景，如 Wujie 微前端）
// 注意：这个钩子只在使用 <keep-alive> 包裹的组件中才会触发
// Wujie 的 alive 模式在主应用层面实现 keep-alive，子应用内部的组件不会触发 onActivated
// 所以这个钩子主要用于子应用内部使用 keep-alive 的场景
onActivated(() => {
  console.log('[VxeBasicTable] onActivated triggered')
  // 在 keep-alive 场景中，组件激活时刷新数据
  if (props.immediate && props.api && tableData.value.length === 0) {
    console.log('[VxeBasicTable] onActivated: loading data because tableData is empty')
    loadData()
  }
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
  background: #fff;
  border-radius: 4px;
  border: 1px solid #f0f0f0;

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
    padding: 14px 16px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;

    .title-left {
      flex: 1;

      .title-text {
        font-size: 16px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.88);
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
    padding: 0;
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
    padding: 12px 16px;
    flex-shrink: 0;
    background: #fff;
    border-top: 1px solid #f0f0f0;
  }

  // VXE Table 样式优化 - Vben风格
  :deep(.vxe-table) {
    border-radius: 0;
    overflow: hidden;
    border: none;
    background: #fff;

    // 移除VXE Table默认边框
    &.vxe-table--border {
      border: none;
    }

    // 表头样式 - Vben风格
    .vxe-table--header-wrapper {
      background: #fafafa;

      .vxe-header--row {
        .vxe-header--column {
          background: #fafafa !important;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.88);
          font-size: 14px;
          border-bottom: 1px solid #f0f0f0;
          border-right: none;

          &:not(:last-child) {
            border-right: 1px solid #f0f0f0;
          }

          .vxe-cell {
            padding: 12px 16px;
            line-height: 1.5715;
            font-weight: 500;
          }

          // 排序图标样式
          .vxe-sort--asc-btn,
          .vxe-sort--desc-btn {
            color: rgba(0, 0, 0, 0.45);

            &:hover {
              color: #1890ff;
            }

            &.sort--active {
              color: #1890ff;
            }
          }
        }
      }
    }

    // 表体样式 - Vben风格
    .vxe-table--body-wrapper {
      background: #fff;

      .vxe-body--row {
        background: #fff !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          background-color: #f5f7fa !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        // 斑马纹（如果启用）
        &.row--stripe {
          background-color: #fafafa !important;

          &:hover {
            background-color: #f5f7fa !important;
          }
        }

        .vxe-body--column {
          background: transparent !important;
          color: rgba(0, 0, 0, 0.85);
          font-size: 14px;
          border-bottom: 1px solid #f0f0f0;
          border-right: none;

          &:not(:last-child) {
            border-right: 1px solid #f0f0f0;
          }

          .vxe-cell {
            padding: 12px 16px;
            line-height: 1.5715;
          }

          // 序号列特殊样式
          &.col--seq .vxe-cell {
            color: rgba(0, 0, 0, 0.45);
            font-weight: normal;
          }

          // 操作列按钮样式
          .vxe-cell {
            a {
              color: #1890ff;
              transition: color 0.2s;

              &:hover {
                color: #40a9ff;
              }
            }

            button {
              &:not(:last-child) {
                margin-right: 8px;
              }
            }
          }
        }

        // 最后一行不显示底部边框
        &:last-child .vxe-body--column {
          border-bottom: none;
        }
      }
    }

    // 空数据样式
    .vxe-table--empty-block {
      padding: 48px 0;
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
    }

    // Loading样式
    .vxe-table--loading {
      .vxe-table--spinner {
        color: #1890ff;
      }
    }

    // 固定列阴影
    .vxe-fixed-left-wrapper {
      box-shadow: 2px 0 4px rgba(0, 0, 0, 0.08);
    }

    .vxe-fixed-right-wrapper {
      box-shadow: -2px 0 4px rgba(0, 0, 0, 0.08);
    }
  }

  // Ant Design Pagination 样式优化
  :deep(.ant-pagination) {
    .ant-pagination-item {
      border-radius: 4px;
      border-color: #d9d9d9;
      transition: all 0.2s;

      &:hover {
        border-color: #1890ff;

        a {
          color: #1890ff;
        }
      }

      &.ant-pagination-item-active {
        border-color: #1890ff;
        background: #1890ff;

        a {
          color: #fff;
        }
      }
    }

    .ant-pagination-prev,
    .ant-pagination-next {
      .ant-pagination-item-link {
        border-radius: 4px;
        border-color: #d9d9d9;
        transition: all 0.2s;

        &:hover {
          border-color: #1890ff;
          color: #1890ff;
        }
      }
    }

    .ant-pagination-options {
      .ant-select-selector {
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          border-color: #1890ff;
        }
      }
    }
  }
}
</style>
