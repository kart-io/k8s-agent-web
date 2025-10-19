<script lang="ts" setup>
/**
 * Service 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~146 行减少到 ~25 行
 */
import { Tag } from 'ant-design-vue';

import { createServiceConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sServices' });
</script>

<template>
  <GenericResourcePage :config-factory="createServiceConfig">
    <!-- 自定义插槽：Service 类型显示 -->
    <template #type-slot="{ row }">
      <Tag :color="row.type === 'ClusterIP' ? 'blue' : 'green'">
        {{ row.type }}
      </Tag>
    </template>

    <!-- 自定义插槽：端口列表显示 -->
    <template #ports-slot="{ row }">
      <span>{{
        row.ports?.map((p) => `${p.port}:${p.targetPort}`).join(', ') || '-'
      }}</span>
    </template>
  </GenericResourcePage>
</template>
