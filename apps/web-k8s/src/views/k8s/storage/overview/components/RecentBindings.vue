<script lang="ts" setup>
/**
 * 最近绑定组件
 * 显示最近绑定的 PV-PVC 关系
 */
import { onMounted, ref } from 'vue';

import { Table, Tag, Tooltip } from 'ant-design-vue';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';

interface BindingRecord {
  pvName: string;
  pvcName: string;
  namespace: string;
  storageClass: string;
  capacity: string;
  accessMode: string;
  bindTime: string;
  status: 'bound' | 'pending';
}

// Mock 最近绑定数据
const bindingRecords = ref<BindingRecord[]>([
  {
    pvName: 'pv-standard-0045',
    pvcName: 'pvc-standard-012',
    namespace: 'production',
    storageClass: 'standard',
    capacity: '50Gi',
    accessMode: 'ReadWriteOnce',
    bindTime: '2 分钟前',
    status: 'bound',
  },
  {
    pvName: 'pv-fast-ssd-0032',
    pvcName: 'pvc-fast-ssd-008',
    namespace: 'staging',
    storageClass: 'fast-ssd',
    capacity: '100Gi',
    accessMode: 'ReadWriteOnce',
    bindTime: '15 分钟前',
    status: 'bound',
  },
  {
    pvName: 'pv-nfs-storage-0018',
    pvcName: 'pvc-nfs-storage-005',
    namespace: 'development',
    storageClass: 'nfs-storage',
    capacity: '20Gi',
    accessMode: 'ReadWriteMany',
    bindTime: '32 分钟前',
    status: 'bound',
  },
  {
    pvName: 'pv-standard-0067',
    pvcName: 'pvc-standard-023',
    namespace: 'production',
    storageClass: 'standard',
    capacity: '200Gi',
    accessMode: 'ReadWriteOnce',
    bindTime: '1 小时前',
    status: 'bound',
  },
  {
    pvName: 'pv-slow-hdd-0021',
    pvcName: 'pvc-slow-hdd-009',
    namespace: 'default',
    storageClass: 'slow-hdd',
    capacity: '500Gi',
    accessMode: 'ReadWriteOnce',
    bindTime: '2 小时前',
    status: 'bound',
  },
  {
    pvName: 'pv-fast-ssd-0089',
    pvcName: 'pvc-fast-ssd-031',
    namespace: 'staging',
    storageClass: 'fast-ssd',
    capacity: '50Gi',
    accessMode: 'ReadWriteOnce',
    bindTime: '3 小时前',
    status: 'pending',
  },
]);

// 表格加载状态
const loading = ref(false);

// 表格列配置
const columns = [
  {
    title: 'PV 名称',
    dataIndex: 'pvName',
    key: 'pvName',
    width: 180,
  },
  {
    title: 'PVC 名称',
    dataIndex: 'pvcName',
    key: 'pvcName',
    width: 180,
  },
  {
    title: '命名空间',
    dataIndex: 'namespace',
    key: 'namespace',
    width: 120,
  },
  {
    title: '存储类',
    dataIndex: 'storageClass',
    key: 'storageClass',
    width: 140,
  },
  {
    title: '容量',
    dataIndex: 'capacity',
    key: 'capacity',
    width: 100,
  },
  {
    title: '访问模式',
    dataIndex: 'accessMode',
    key: 'accessMode',
    width: 140,
  },
  {
    title: '绑定时间',
    dataIndex: 'bindTime',
    key: 'bindTime',
    width: 120,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
  },
];

/**
 * 格式化访问模式
 */
function formatAccessMode(mode: string): string {
  const modeMap: Record<string, string> = {
    ReadWriteOnce: 'RWO',
    ReadOnlyMany: 'ROX',
    ReadWriteMany: 'RWX',
    ReadWriteOncePod: 'RWOP',
  };
  return modeMap[mode] || mode;
}

/**
 * 加载最近绑定数据
 */
async function loadRecentBindings() {
  loading.value = true;
  try {
    // TODO: 调用 API 获取真实数据
    // 目前使用 Mock 数据
    await new Promise((resolve) => setTimeout(resolve, 300));
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRecentBindings();
});
</script>

<template>
  <div class="recent-bindings">
    <Table
      :columns="columns"
      :data-source="bindingRecords"
      :loading="loading"
      :pagination="false"
      size="small"
      :scroll="{ x: 1100 }"
    >
      <!-- 命名空间列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'namespace'">
          <Tag color="blue">
            {{ record.namespace }}
          </Tag>
        </template>

        <!-- 存储类列 -->
        <template v-else-if="column.key === 'storageClass'">
          <Tag color="cyan">
            {{ record.storageClass }}
          </Tag>
        </template>

        <!-- 访问模式列 -->
        <template v-else-if="column.key === 'accessMode'">
          <Tooltip :title="record.accessMode">
            <Tag :color="record.accessMode === 'ReadWriteMany' ? 'purple' : 'blue'">
              {{ formatAccessMode(record.accessMode) }}
            </Tag>
          </Tooltip>
        </template>

        <!-- 状态列 -->
        <template v-else-if="column.key === 'status'">
          <Tag v-if="record.status === 'bound'" color="success">
            <template #icon>
              <CheckCircleOutlined />
            </template>
            已绑定
          </Tag>
          <Tag v-else color="warning">
            <template #icon>
              <ClockCircleOutlined />
            </template>
            等待中
          </Tag>
        </template>
      </template>
    </Table>

    <div v-if="bindingRecords.length === 0" class="empty-state">
      <p>暂无绑定记录</p>
    </div>
  </div>
</template>

<style scoped>
.recent-bindings {
  width: 100%;
}

:deep(.ant-table) {
  font-size: 13px;
}

:deep(.ant-table-thead > tr > th) {
  padding: 12px 8px;
  font-weight: 600;
  background-color: var(--vben-background-color);
}

:deep(.ant-table-tbody > tr > td) {
  padding: 10px 8px;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: var(--vben-background-color);
}

:deep(.ant-tag) {
  margin: 0;
  font-size: 12px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--vben-text-color-secondary);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>
