<script lang="ts" setup>
/**
 * DaemonSet 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~137 行减少到 ~15 行
 */
import { createDaemonSetConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sDaemonSets' });
</script>

<template>
  <GenericResourcePage :config-factory="createDaemonSetConfig">
    <!-- 自定义插槽：就绪节点数显示 -->
    <template #ready-slot="{ row }">
      <span v-if="row"
        >{{ row.numberReady ?? 0 }} /
        {{ row.desiredNumberScheduled ?? 0 }}</span
      >
    </template>
  </GenericResourcePage>
</template>
