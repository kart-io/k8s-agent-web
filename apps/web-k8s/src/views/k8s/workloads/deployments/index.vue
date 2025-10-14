<script lang="ts" setup>
/**
 * Deployment 管理页面
 * 使用资源配置工厂，代码从 313 行减少到 ~40 行
 */
import { computed } from 'vue';

import { Tag } from 'ant-design-vue';

import { createDeploymentConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

defineOptions({
  name: 'DeploymentsManagement',
});

const config = computed(() => createDeploymentConfig());
</script>

<template>
  <ResourceList :config="config">
    <!-- 就绪副本状态 -->
    <template #ready-slot="{ row }">
      <Tag
        :color="row.status?.readyReplicas === row.spec.replicas ? 'success' : 'warning'"
      >
        {{ row.status?.readyReplicas ?? 0 }}/{{ row.spec.replicas }}
      </Tag>
    </template>
  </ResourceList>
</template>
