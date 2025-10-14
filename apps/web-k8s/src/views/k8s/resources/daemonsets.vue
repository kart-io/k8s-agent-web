<script lang="ts" setup>
/**
 * DaemonSet 资源管理页面
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';
import type { DaemonSet } from '#/api/k8s/types';

import { computed } from 'vue';

import { createDaemonSetConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

defineOptions({ name: 'K8sDaemonSets' });

// 使用配置工厂创建资源配置
const config = computed<ResourceListConfig<DaemonSet>>(() => createDaemonSetConfig());
</script>

<template>
  <ResourceList :config="config">
    <!-- 就绪节点数插槽 -->
    <template #ready-slot="{ row }">
      <span>{{ row.status.numberReady }} / {{ row.status.desiredNumberScheduled }}</span>
    </template>
  </ResourceList>
</template>
