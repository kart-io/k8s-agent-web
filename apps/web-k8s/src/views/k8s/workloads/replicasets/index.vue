<script lang="ts" setup>
/**
 * ReplicaSet 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~22 行简化到 ~18 行
 */
import { Tag } from 'ant-design-vue';

import { createReplicaSetConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sReplicaSets' });
</script>

<template>
  <GenericResourcePage :config-factory="createReplicaSetConfig" scalable>
    <!-- 自定义插槽：就绪副本显示 -->
    <template #ready-slot="{ row }">
      <Tag :color="row.status?.readyReplicas === row.spec.replicas ? 'success' : 'warning'">
        {{ row.status?.readyReplicas ?? 0 }}/{{ row.spec.replicas }}
      </Tag>
    </template>
  </GenericResourcePage>
</template>
