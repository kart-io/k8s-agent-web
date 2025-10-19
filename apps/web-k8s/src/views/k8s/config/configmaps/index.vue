<script lang="ts" setup>
/**
 * ConfigMap 资源管理页面 - 使用通用页面模板
 */

import { Descriptions } from 'ant-design-vue';

import { createConfigMapConfig } from '#/config/k8s-resources';
import GenericResourcePage from '#/views/k8s/_shared/GenericResourcePage.vue';
import GenericDetailDrawer from '#/views/k8s/resources/detail/GenericDetailDrawer.vue';

defineOptions({ name: 'K8sConfigMaps' });
</script>

<template>
  <GenericResourcePage
    :config-factory="createConfigMapConfig"
    :detail-component="GenericDetailDrawer"
  >
    <!-- 自定义插槽：键数量显示 -->
    <template #keys-slot="{ row }">
      <span>{{ row.data ? Object.keys(row.data).length : 0 }} 个键</span>
    </template>

    <!-- 详情抽屉：资源特定字段 -->
    <template #resource-specific="{ resource }">
      <Descriptions.Item label="键数量" :span="2">
        {{ resource.data ? Object.keys(resource.data).length : 0 }}
      </Descriptions.Item>
      <Descriptions.Item label="键列表" :span="2">
        {{ resource.data ? Object.keys(resource.data).join(', ') : '-' }}
      </Descriptions.Item>
    </template>
  </GenericResourcePage>
</template>
