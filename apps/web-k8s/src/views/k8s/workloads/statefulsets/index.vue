<script lang="ts" setup>
/**
 * StatefulSet 管理页面
 */
import type { StatefulSet } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { message, Tag } from 'ant-design-vue';

import { createStatefulSetConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';
import ScaleModal from '#/views/k8s/_shared/ScaleModal.vue';
import YAMLEditorModal from '#/views/k8s/_shared/YAMLEditorModal.vue';

defineOptions({
  name: 'StatefulSetsManagement',
});

// 扩缩容模态框状态
const scaleModalVisible = ref(false);
const scalingStatefulSet = ref<StatefulSet | null>(null);

// YAML 编辑模态框状态
const yamlEditorVisible = ref(false);
const editingStatefulSet = ref<StatefulSet | null>(null);

// 列表引用（用于刷新）
const resourceListRef = ref();

/**
 * 打开扩缩容模态框
 */
function openScaleModal(sts: StatefulSet) {
  scalingStatefulSet.value = sts;
  scaleModalVisible.value = true;
}

/**
 * 处理扩缩容确认
 */
async function handleScaleConfirm(replicas: number) {
  if (!scalingStatefulSet.value) return;

  try {
    // TODO: 调用真实 API 更新副本数
    // await updateStatefulSetReplicas(
    //   scalingStatefulSet.value.metadata.namespace,
    //   scalingStatefulSet.value.metadata.name,
    //   replicas
    // );

    message.success(
      `StatefulSet "${scalingStatefulSet.value.metadata.name}" 副本数已更新为 ${replicas}`,
    );

    // 关闭模态框
    scaleModalVisible.value = false;

    // 刷新列表
    resourceListRef.value?.refresh();
  } catch (error: any) {
    message.error(`扩缩容失败: ${error.message}`);
  }
}

/**
 * 打开 YAML 编辑器
 */
function openYAMLEditor(sts: StatefulSet) {
  editingStatefulSet.value = sts;
  yamlEditorVisible.value = true;
}

/**
 * 处理 YAML 编辑确认
 */
async function handleYAMLEditConfirm(updatedResource: any) {
  try {
    // TODO: 调用真实 API 更新资源
    // await updateStatefulSet(
    //   updatedResource.metadata.namespace,
    //   updatedResource.metadata.name,
    //   updatedResource
    // );

    message.success(
      `StatefulSet "${updatedResource.metadata.name}" 已成功更新`,
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
  const baseConfig = createStatefulSetConfig();

  // 覆盖 scale 操作，使用扩缩容模态框
  // 覆盖 edit 操作，使用 YAML 编辑器
  if (baseConfig.actions) {
    const scaleActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'scale',
    );
    if (scaleActionIndex !== -1) {
      baseConfig.actions[scaleActionIndex] = {
        action: 'scale',
        label: '扩缩容',
        handler: (row: StatefulSet) => {
          openScaleModal(row);
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
        handler: (row: StatefulSet) => {
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

    <!-- 扩缩容模态框 -->
    <ScaleModal
      v-if="scalingStatefulSet"
      v-model:visible="scaleModalVisible"
      :resource-name="scalingStatefulSet.metadata.name"
      :resource-type="'StatefulSet'"
      :current-replicas="scalingStatefulSet.spec.replicas"
      :namespace="scalingStatefulSet.metadata.namespace"
      @confirm="handleScaleConfirm"
    />

    <!-- YAML 编辑器模态框 -->
    <YAMLEditorModal
      v-if="editingStatefulSet"
      v-model:visible="yamlEditorVisible"
      :resource="editingStatefulSet"
      :resource-type="'StatefulSet'"
      :resource-name="editingStatefulSet.metadata.name"
      @confirm="handleYAMLEditConfirm"
    />
  </div>
</template>
