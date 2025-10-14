<script lang="ts" setup>
/**
 * Namespace 资源管理页面
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';
import type { Namespace } from '#/api/k8s/types';

import { computed } from 'vue';

import { createNamespaceConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

defineOptions({ name: 'K8sNamespaces' });

// 使用配置工厂创建资源配置
const config = computed<ResourceListConfig<Namespace>>(() => createNamespaceConfig());
</script>

<template>
  <ResourceList :config="config" />
</template>
