<script lang="ts" setup>
/**
 * ConfigMap 管理页面
 * 使用资源配置工厂，代码从 285 行减少到 ~35 行
 */
import { computed } from 'vue';

import { createConfigMapConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

defineOptions({
  name: 'ConfigMapsManagement',
});

const config = computed(() => createConfigMapConfig());
</script>

<template>
  <ResourceList :config="config">
    <!-- 键数量显示 -->
    <template #keys-slot="{ row }">
      <span>{{ row.data ? Object.keys(row.data).length : 0 }} 个键</span>
    </template>
  </ResourceList>
</template>
