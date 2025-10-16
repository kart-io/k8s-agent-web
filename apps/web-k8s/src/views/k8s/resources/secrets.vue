<script lang="ts" setup>
/**
 * Secret 资源管理页面 - 使用通用页面模板
 */
import { createSecretConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/_shared/GenericResourcePage.vue';

defineOptions({ name: 'K8sSecrets' });
</script>

<template>
  <GenericResourcePage :config-factory="createSecretConfig">
    <!-- 自定义插槽：键数量显示 -->
    <template #keys-slot="{ row }">
      <span>{{ row.data ? Object.keys(row.data).length : 0 }} 个键</span>
    </template>
  </GenericResourcePage>
</template>
