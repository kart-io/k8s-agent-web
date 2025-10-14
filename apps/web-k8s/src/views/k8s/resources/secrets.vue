<script lang="ts" setup>
/**
 * Secret 资源管理页面
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';
import type { Secret } from '#/api/k8s/types';

import { computed } from 'vue';

import { createSecretConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

defineOptions({ name: 'K8sSecrets' });

// 使用配置工厂创建资源配置
const config = computed<ResourceListConfig<Secret>>(() => createSecretConfig());
</script>

<template>
  <ResourceList :config="config">
    <!-- 键数量插槽 -->
    <template #keys-slot="{ row }">
      <span>{{ row.data ? Object.keys(row.data).length : 0 }}</span>
    </template>
  </ResourceList>
</template>
