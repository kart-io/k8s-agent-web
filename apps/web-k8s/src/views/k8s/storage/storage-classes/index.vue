<script lang="ts" setup>
/**
 * StorageClass 资源管理页面 - 使用 GenericResourcePage 模板
 */
import { createStorageClassConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sStorageClasses' });
</script>

<template>
  <GenericResourcePage :config-factory="createStorageClassConfig" />
</template>
