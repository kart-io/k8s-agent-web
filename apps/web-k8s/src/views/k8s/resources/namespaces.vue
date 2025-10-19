<script lang="ts" setup>
/**
 * Namespace 资源管理页面 - 使用通用页面模板
 */
import { computed } from 'vue';

import { Descriptions } from 'ant-design-vue';

import { createNamespaceConfig } from '#/config/k8s-resources';
import { useClusterOptions } from '#/stores/clusterStore';
import GenericResourcePage from '#/views/k8s/_shared/GenericResourcePage.vue';
import GenericDetailDrawer from '#/views/k8s/resources/detail/GenericDetailDrawer.vue';

defineOptions({ name: 'K8sNamespaces' });

const { clusterOptions, selectedClusterId } = useClusterOptions();

// 获取当前选中集群的名称
const selectedClusterName = computed(() => {
  const cluster = clusterOptions.value.find(
    (c) => c.value === selectedClusterId.value,
  );
  return cluster?.label || '-';
});
</script>

<template>
  <GenericResourcePage
    :config-factory="createNamespaceConfig"
    :detail-component="GenericDetailDrawer"
  >
    <!-- 环境列插槽 - 显示集群名称 -->
    <template #environment-slot>
      {{ selectedClusterName }}
    </template>

    <!-- 详情抽屉：资源特定字段 -->
    <template #resource-specific="{ resource }">
      <Descriptions.Item label="环境" :span="2">
        {{ selectedClusterName }}
      </Descriptions.Item>
    </template>
  </GenericResourcePage>
</template>
