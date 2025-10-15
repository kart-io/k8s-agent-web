<script lang="ts" setup>
/**
 * DaemonSet 资源管理页面
 */
import type { ResourceListConfig } from '#/types/k8s-resource-base';
import type { DaemonSet } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { message } from 'ant-design-vue';

import { createDaemonSetConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';
import YAMLEditorModal from '#/views/k8s/_shared/YAMLEditorModal.vue';

import DetailDrawer from './DaemonSetDetailDrawer.vue';

defineOptions({ name: 'K8sDaemonSets' });

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedDaemonSet = ref<DaemonSet | null>(null);

// YAML 编辑模态框状态
const yamlEditorVisible = ref(false);
const editingDaemonSet = ref<DaemonSet | null>(null);

// 列表引用（用于刷新）
const resourceListRef = ref();

/**
 * 打开详情抽屉
 */
function openDetailDrawer(daemonSet: DaemonSet) {
  selectedDaemonSet.value = daemonSet;
  detailDrawerVisible.value = true;
}

/**
 * 打开 YAML 编辑器
 */
function openYAMLEditor(daemonSet: DaemonSet) {
  editingDaemonSet.value = daemonSet;
  yamlEditorVisible.value = true;
}

/**
 * 处理 YAML 编辑确认
 */
async function handleYAMLEditConfirm(updatedResource: any) {
  try {
    // TODO: 调用真实 API 更新资源
    // await updateDaemonSet(
    //   updatedResource.metadata.namespace,
    //   updatedResource.metadata.name,
    //   updatedResource
    // );

    message.success(
      `DaemonSet "${updatedResource.metadata.name}" 已成功更新`,
    );

    // 关闭模态框
    yamlEditorVisible.value = false;

    // 刷新列表
    resourceListRef.value?.refresh();
  } catch (error: any) {
    message.error(`更新失败: ${error.message}`);
  }
}

// 使用配置工厂创建资源配置，并覆盖 view 和 edit 操作
const config = computed<ResourceListConfig<DaemonSet>>(() => {
  const baseConfig = createDaemonSetConfig();

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
        handler: (row: DaemonSet) => {
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
        handler: (row: DaemonSet) => {
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
      <!-- 就绪节点数插槽 -->
      <template #ready-slot="{ row }">
        <span>{{ row.status.numberReady }} / {{ row.status.desiredNumberScheduled }}</span>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :daemon-set="selectedDaemonSet"
    />

    <!-- YAML 编辑器模态框 -->
    <YAMLEditorModal
      v-if="editingDaemonSet"
      v-model:visible="yamlEditorVisible"
      :resource="editingDaemonSet"
      :resource-type="'DaemonSet'"
      :resource-name="editingDaemonSet.metadata.name"
      @confirm="handleYAMLEditConfirm"
    />
  </div>
</template>
