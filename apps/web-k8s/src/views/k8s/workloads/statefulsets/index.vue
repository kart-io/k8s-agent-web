<script lang="ts" setup>
/**
 * StatefulSet 资源管理页面 - 使用 GenericResourcePage 模板
 * 从 ~177 行减少到 ~20 行
 */
import { Tag } from 'ant-design-vue';

import { createStatefulSetConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sStatefulSets' });
</script>

<template>
  <GenericResourcePage :config-factory="createStatefulSetConfig" scalable>
    <!-- 自定义插槽：就绪副本显示 -->
    <template #ready-slot="{ row }">
      <Tag
        v-if="row"
        :color="row.readyReplicas === row.replicas ? 'success' : 'warning'"
      >
        {{ row.readyReplicas ?? 0 }}/{{ row.replicas ?? 0 }}
      </Tag>
    </template>
  </GenericResourcePage>
</template>
