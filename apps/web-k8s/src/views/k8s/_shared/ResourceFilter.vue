<script lang="ts" setup>
/**
 * 通用资源筛选器组件
 * 提供集群选择、命名空间选择、搜索等通用筛选功能
 */
import { Button, Input, Select, Space } from 'ant-design-vue';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue';

interface Props {
  /** 是否显示集群选择器 */
  showClusterSelector?: boolean;
  /** 是否显示命名空间选择器 */
  showNamespaceSelector?: boolean;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 搜索框占位文本 */
  searchPlaceholder?: string;
  /** 集群选项 */
  clusterOptions?: Array<{ label: string; value: string }>;
  /** 命名空间选项 */
  namespaceOptions?: Array<{ label: string; value: string | undefined }>;
}

const props = withDefaults(defineProps<Props>(), {
  showClusterSelector: true,
  showNamespaceSelector: true,
  showSearch: true,
  searchPlaceholder: '搜索资源名称',
  clusterOptions: () => [
    { label: 'Production Cluster', value: 'cluster-prod-01' },
    { label: 'Staging Cluster', value: 'cluster-staging-01' },
    { label: 'Development Cluster', value: 'cluster-dev-01' },
  ],
  namespaceOptions: () => [
    { label: '全部命名空间', value: undefined },
    { label: 'default', value: 'default' },
    { label: 'kube-system', value: 'kube-system' },
    { label: 'production', value: 'production' },
  ],
});

const emit = defineEmits<{
  search: [];
  reset: [];
}>();

// v-model 支持
const clusterId = defineModel<string>('clusterId', { default: 'cluster-prod-01' });
const namespace = defineModel<string | undefined>('namespace');
const keyword = defineModel<string>('keyword', { default: '' });

function handleSearch() {
  emit('search');
}

function handleReset() {
  emit('reset');
}
</script>

<template>
  <div class="mb-4 rounded-lg p-4 bg-white dark:bg-gray-800">
    <Space :size="12" wrap>
      <!-- 集群选择器 -->
      <Select
        v-if="showClusterSelector"
        v-model:value="clusterId"
        :options="clusterOptions"
        :style="{ width: '200px' }"
        placeholder="选择集群"
        @change="handleSearch"
      />

      <!-- 命名空间选择器 -->
      <Select
        v-if="showNamespaceSelector"
        v-model:value="namespace"
        :options="namespaceOptions"
        :style="{ width: '150px' }"
        placeholder="命名空间"
        @change="handleSearch"
      />

      <!-- 搜索框 -->
      <Input
        v-if="showSearch"
        v-model:value="keyword"
        :style="{ width: '240px' }"
        :placeholder="searchPlaceholder"
        allow-clear
        @press-enter="handleSearch"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </Input>

      <!-- 自定义插槽 -->
      <slot name="custom-filters" />

      <!-- 搜索按钮 -->
      <Button type="primary" @click="handleSearch">
        <SearchOutlined />
        搜索
      </Button>

      <!-- 重置按钮 -->
      <Button @click="handleReset">
        <ReloadOutlined />
        重置
      </Button>

      <!-- 额外操作插槽 -->
      <slot name="actions" />
    </Space>
  </div>
</template>
