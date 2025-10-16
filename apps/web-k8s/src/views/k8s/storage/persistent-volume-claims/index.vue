<script lang="ts" setup>
/**
 * PersistentVolumeClaim 资源管理页面 - 使用 GenericResourcePage 模板
 */
import { createPVCConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sPersistentVolumeClaims' });
</script>

<template>
  <GenericResourcePage :config-factory="createPVCConfig" />
</template>
