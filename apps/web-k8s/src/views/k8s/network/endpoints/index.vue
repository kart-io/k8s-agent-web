<script lang="ts" setup>
/**
 * Endpoints 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~22 行简化到 ~10 行
 */
import { createEndpointsConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sEndpoints' });
</script>

<template>
  <GenericResourcePage :config-factory="createEndpointsConfig" />
</template>
