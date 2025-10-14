<script lang="ts" setup>
/**
 * Deployment 管理页面
 * 使用资源配置工厂，代码从 313 行减少到 ~40 行
 */
import type { Deployment } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { Tag } from 'ant-design-vue';

import { createDeploymentConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

import DetailDrawer from './DetailDrawer.vue';

defineOptions({
  name: 'DeploymentsManagement',
});

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedDeployment = ref<Deployment | null>(null);

/**
 * 打开详情抽屉
 */
function openDetailDrawer(deployment: Deployment) {
  selectedDeployment.value = deployment;
  detailDrawerVisible.value = true;
}

const config = computed(() => {
  const baseConfig = createDeploymentConfig();

  // 覆盖 view 操作，使用详情抽屉
  if (baseConfig.actions) {
    const viewActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'view',
    );
    if (viewActionIndex !== -1) {
      baseConfig.actions[viewActionIndex] = {
        action: 'view',
        label: '详情',
        handler: (row: Deployment) => {
          openDetailDrawer(row);
        },
      };
    }
  }

  return baseConfig;
});
</script>

<template>
  <div>
    <ResourceList :config="config">
      <!-- 就绪副本状态 -->
      <template #ready-slot="{ row }">
        <Tag
          :color="
            row.status?.readyReplicas === row.spec.replicas
              ? 'success'
              : 'warning'
          "
        >
          {{ row.status?.readyReplicas ?? 0 }}/{{ row.spec.replicas }}
        </Tag>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :deployment="selectedDeployment"
    />
  </div>
</template>
