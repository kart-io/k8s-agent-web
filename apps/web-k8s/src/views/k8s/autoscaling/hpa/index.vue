<script lang="ts" setup>
/**
 * HPA 资源管理页面 - 使用 GenericResourcePage 模板
 */
import { Tag } from 'ant-design-vue';

import { createHPAConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/resources/GenericResourcePage.vue';

defineOptions({ name: 'K8sHPA' });
</script>

<template>
  <GenericResourcePage :config-factory="createHPAConfig" scalable>
    <!-- 自定义插槽：副本数显示 -->
    <template #replicas-slot="{ row }">
      <Tag>
        {{ row.status?.currentReplicas ?? 0 }} / {{ row.spec.minReplicas }}-{{
          row.spec.maxReplicas
        }}
      </Tag>
    </template>
  </GenericResourcePage>
</template>
