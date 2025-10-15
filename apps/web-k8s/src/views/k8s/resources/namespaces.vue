<script lang="ts" setup>
/**
 * Namespace 资源管理页面
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';
import type { Namespace } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { message } from 'ant-design-vue';

import { createNamespaceConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';
import YAMLEditorModal from '#/views/k8s/_shared/YAMLEditorModal.vue';

defineOptions({ name: 'K8sNamespaces' });

// YAML 编辑模态框状态
const yamlEditorVisible = ref(false);
const editingNamespace = ref<Namespace | null>(null);

// 列表引用（用于刷新）
const resourceListRef = ref();

/**
 * 打开 YAML 编辑器
 */
function openYAMLEditor(namespace: Namespace) {
  editingNamespace.value = namespace;
  yamlEditorVisible.value = true;
}

/**
 * 处理 YAML 编辑确认
 */
async function handleYAMLEditConfirm(updatedResource: any) {
  try {
    // TODO: 调用真实 API 更新资源
    // await updateNamespace(
    //   updatedResource.metadata.name,
    //   updatedResource
    // );

    message.success(
      `Namespace "${updatedResource.metadata.name}" 已成功更新`,
    );

    // 关闭模态框
    yamlEditorVisible.value = false;

    // 刷新列表
    resourceListRef.value?.refresh();
  } catch (error: any) {
    message.error(`更新失败: ${error.message}`);
  }
}

// 使用配置工厂创建资源配置，并覆盖 edit 操作
const config = computed<ResourceListConfig<Namespace>>(() => {
  const baseConfig = createNamespaceConfig();

  // 覆盖 edit 操作，使用 YAML 编辑器
  if (baseConfig.actions) {
    const editActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'edit',
    );
    if (editActionIndex !== -1) {
      baseConfig.actions[editActionIndex] = {
        action: 'edit',
        label: '编辑',
        handler: (row: Namespace) => {
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
    <ResourceList ref="resourceListRef" :config="config" />

    <!-- YAML 编辑器模态框 -->
    <YAMLEditorModal
      v-if="editingNamespace"
      v-model:visible="yamlEditorVisible"
      :resource="editingNamespace"
      :resource-type="'Namespace'"
      :resource-name="editingNamespace.metadata.name"
      @confirm="handleYAMLEditConfirm"
    />
  </div>
</template>
