<script lang="ts" setup>
/**
 * Namespace 资源管理页面 - 使用通用页面模板
 */
import { createNamespaceConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/_shared/GenericResourcePage.vue';

defineOptions({ name: 'K8sNamespaces' });
</script>

<template>
  <GenericResourcePage :config-factory="createNamespaceConfig" />
</template>
