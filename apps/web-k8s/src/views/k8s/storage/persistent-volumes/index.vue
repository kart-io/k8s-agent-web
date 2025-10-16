<script lang="ts" setup>
/**
 * PersistentVolume 资源管理页面 - 使用 GenericResourcePage 模板
 */
import { createPVConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sPersistentVolumes' });
</script>

<template>
  <GenericResourcePage :config-factory="createPVConfig" />
</template>
