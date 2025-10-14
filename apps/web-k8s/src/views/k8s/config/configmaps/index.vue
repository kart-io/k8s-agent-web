<script lang="ts" setup>
/**
 * ConfigMap 管理页面
 * 使用资源配置工厂，代码从 285 行减少到 ~35 行
 */
import type { ConfigMap } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { createConfigMapConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

import DetailDrawer from './DetailDrawer.vue';

defineOptions({
  name: 'ConfigMapsManagement',
});

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedConfigMap = ref<ConfigMap | null>(null);

/**
 * 打开详情抽屉
 */
function openDetailDrawer(configMap: ConfigMap) {
  selectedConfigMap.value = configMap;
  detailDrawerVisible.value = true;
}

const config = computed(() => {
  const baseConfig = createConfigMapConfig();

  // 覆盖 view 操作，使用详情抽屉
  if (baseConfig.actions) {
    const viewActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'view',
    );
    if (viewActionIndex !== -1) {
      baseConfig.actions[viewActionIndex] = {
        action: 'view',
        label: '详情',
        handler: (row: ConfigMap) => {
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
      <!-- 键数量显示 -->
      <template #keys-slot="{ row }">
        <span>{{ row.data ? Object.keys(row.data).length : 0 }} 个键</span>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :config-map="selectedConfigMap"
    />
  </div>
</template>
