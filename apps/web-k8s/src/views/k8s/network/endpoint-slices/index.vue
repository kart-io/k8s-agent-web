<script lang="ts" setup>
/**
 * EndpointSlice 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~22 行简化到 ~10 行
 */
import { createEndpointSliceConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sEndpointSlices' });
</script>

<template>
  <GenericResourcePage :config-factory="createEndpointSliceConfig" />
</template>
