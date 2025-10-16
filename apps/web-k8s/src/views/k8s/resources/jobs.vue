<script lang="ts" setup>
/**
 * Job 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~165 行减少到 ~20 行
 */
import { Tag } from 'ant-design-vue';

import { createJobConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sJobs' });
</script>

<template>
  <GenericResourcePage :config-factory="createJobConfig">
    <!-- 自定义插槽：运行状态显示 -->
    <template #active-slot="{ row }">
      <Tag v-if="row.status?.active && row.status.active > 0" color="processing">
        {{ row.status.active }} 运行中
      </Tag>
      <Tag v-else-if="row.status?.succeeded && row.status.succeeded >= (row.spec.completions ?? 1)" color="success">
        已完成
      </Tag>
      <Tag v-else-if="row.status?.failed && row.status.failed > 0" color="error">
        已失败
      </Tag>
      <Tag v-else color="default">
        等待中
      </Tag>
    </template>
  </GenericResourcePage>
</template>
