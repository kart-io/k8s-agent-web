<script lang="ts" setup>
/**
 * StatefulSet 资源管理页面
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';
import type { StatefulSet } from '#/api/k8s/types';

import { computed } from 'vue';

import { createStatefulSetConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

defineOptions({ name: 'K8sStatefulSets' });

// 使用配置工厂创建资源配置
const config = computed<ResourceListConfig<StatefulSet>>(() => createStatefulSetConfig());
</script>

<template>
  <ResourceList :config="config">
    <!-- 就绪副本插槽 -->
    <template #ready-slot="{ row }">
      <span>{{ row.status?.readyReplicas ?? 0 }} / {{ row.spec.replicas }}</span>
    </template>
  </ResourceList>
</template>
