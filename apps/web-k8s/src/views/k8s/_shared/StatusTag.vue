<script lang="ts" setup>
/**
 * 通用状态标签组件
 * 根据状态自动显示对应颜色的标签
 */
import { computed } from 'vue';

import { Tag } from 'ant-design-vue';

interface Props {
  /** 状态值 */
  status: string;
  /** 状态映射配置 */
  statusMap?: Record<
    string,
    {
      color: 'success' | 'warning' | 'error' | 'default' | 'processing' | 'blue' | 'green';
      label?: string;
    }
  >;
}

const props = defineProps<Props>();

// 默认状态映射
const defaultStatusMap: Record<string, { color: any; label?: string }> = {
  // Pod 状态
  Running: { color: 'success', label: 'Running' },
  Pending: { color: 'warning', label: 'Pending' },
  Succeeded: { color: 'success', label: 'Succeeded' },
  Failed: { color: 'error', label: 'Failed' },
  Unknown: { color: 'default', label: 'Unknown' },

  // 通用状态
  Active: { color: 'success', label: 'Active' },
  Inactive: { color: 'default', label: 'Inactive' },
  Terminating: { color: 'warning', label: 'Terminating' },

  // Service 类型
  ClusterIP: { color: 'blue' },
  NodePort: { color: 'green' },
  LoadBalancer: { color: 'green' },
};

const statusConfig = computed(() => {
  const map = props.statusMap || defaultStatusMap;
  return map[props.status] || { color: 'default', label: props.status };
});
</script>

<template>
  <Tag :color="statusConfig.color">
    {{ statusConfig.label || status }}
  </Tag>
</template>
