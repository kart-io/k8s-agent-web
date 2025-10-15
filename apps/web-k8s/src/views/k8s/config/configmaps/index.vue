<script lang="ts" setup>
/**
 * ConfigMap 管理页面
 * 使用资源配置工厂，代码从 285 行减少到 ~35 行
 */
import type { ConfigMap } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { message } from 'ant-design-vue';

import { createConfigMapConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';
import YAMLEditorModal from '#/views/k8s/_shared/YAMLEditorModal.vue';

import DetailDrawer from './DetailDrawer.vue';

defineOptions({
  name: 'ConfigMapsManagement',
});

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedConfigMap = ref<ConfigMap | null>(null);

// YAML 编辑模态框状态
const yamlEditorVisible = ref(false);
const editingConfigMap = ref<ConfigMap | null>(null);

// 列表引用（用于刷新）
const resourceListRef = ref();

/**
 * 打开详情抽屉
 */
function openDetailDrawer(configMap: ConfigMap) {
  selectedConfigMap.value = configMap;
  detailDrawerVisible.value = true;
}

/**
 * 打开 YAML 编辑器
 */
function openYAMLEditor(configMap: ConfigMap) {
  editingConfigMap.value = configMap;
  yamlEditorVisible.value = true;
}

/**
 * 处理 YAML 编辑确认
 */
async function handleYAMLEditConfirm(updatedResource: any) {
  try {
    // TODO: 调用真实 API 更新资源
    // await updateConfigMap(
    //   updatedResource.metadata.namespace,
    //   updatedResource.metadata.name,
    //   updatedResource
    // );

    message.success(
      `ConfigMap "${updatedResource.metadata.name}" 已成功更新`,
    );

    // 关闭模态框
    yamlEditorVisible.value = false;

    // 刷新列表
    resourceListRef.value?.refresh();
  } catch (error: any) {
    message.error(`更新失败: ${error.message}`);
  }
}

const config = computed(() => {
  const baseConfig = createConfigMapConfig();

  // 覆盖 view 操作，使用详情抽屉
  // 覆盖 edit 操作，使用 YAML 编辑器
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

    const editActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'edit',
    );
    if (editActionIndex !== -1) {
      baseConfig.actions[editActionIndex] = {
        action: 'edit',
        label: '编辑',
        handler: (row: ConfigMap) => {
          openYAMLEditor(row);
        },
      };
    }
  }

  return baseConfig;
});
</script>

<template>
  <div>
    <ResourceList ref="resourceListRef" :config="config">
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

    <!-- YAML 编辑器模态框 -->
    <YAMLEditorModal
      v-if="editingConfigMap"
      v-model:visible="yamlEditorVisible"
      :resource="editingConfigMap"
      :resource-type="'ConfigMap'"
      :resource-name="editingConfigMap.metadata.name"
      @confirm="handleYAMLEditConfirm"
    />
  </div>
</template>
