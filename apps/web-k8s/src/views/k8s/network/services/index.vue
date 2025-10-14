<script lang="ts" setup>
/**
 * Service 管理页面
 * 使用资源配置工厂，代码从 304 行减少到 ~45 行
 */
import type { Service } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { Tag } from 'ant-design-vue';

import { createServiceConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

import DetailDrawer from './DetailDrawer.vue';

defineOptions({
  name: 'ServicesManagement',
});

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedService = ref<null | Service>(null);

/**
 * 打开详情抽屉
 */
function openDetailDrawer(service: Service) {
  selectedService.value = service;
  detailDrawerVisible.value = true;
}

const config = computed(() => {
  const baseConfig = createServiceConfig();

  // 覆盖 view 操作，使用详情抽屉
  if (baseConfig.actions) {
    const viewActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'view',
    );
    if (viewActionIndex !== -1) {
      baseConfig.actions[viewActionIndex] = {
        action: 'view',
        label: '详情',
        handler: (row: Service) => {
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
      <!-- Service 类型标签 -->
      <template #type-slot="{ row }">
        <Tag :color="row.spec.type === 'ClusterIP' ? 'blue' : 'green'">
          {{ row.spec.type }}
        </Tag>
      </template>

      <!-- 端口列表 -->
      <template #ports-slot="{ row }">
        <span>{{
          row.spec.ports.map((p) => `${p.port}:${p.targetPort}`).join(', ')
        }}</span>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :service="selectedService"
    />
  </div>
</template>
