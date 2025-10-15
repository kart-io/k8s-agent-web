<script lang="ts" setup>
/**
 * Deployment 管理页面
 * 使用资源配置工厂，代码从 313 行减少到 ~40 行
 */
import type { Deployment } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import { message, Modal, Tag } from 'ant-design-vue';

import { createDeploymentConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';
import ScaleModal from '#/views/k8s/_shared/ScaleModal.vue';
import YAMLEditorModal from '#/views/k8s/_shared/YAMLEditorModal.vue';

import DetailDrawer from './DetailDrawer.vue';

defineOptions({
  name: 'DeploymentsManagement',
});

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedDeployment = ref<Deployment | null>(null);

// 扩缩容模态框状态
const scaleModalVisible = ref(false);
const scalingDeployment = ref<Deployment | null>(null);

// YAML 编辑模态框状态
const yamlEditorVisible = ref(false);
const editingDeployment = ref<Deployment | null>(null);

// 列表引用（用于刷新）
const resourceListRef = ref();

/**
 * 打开详情抽屉
 */
function openDetailDrawer(deployment: Deployment) {
  selectedDeployment.value = deployment;
  detailDrawerVisible.value = true;
}

/**
 * 打开扩缩容模态框
 */
function openScaleModal(deployment: Deployment) {
  scalingDeployment.value = deployment;
  scaleModalVisible.value = true;
}

/**
 * 处理扩缩容确认
 */
async function handleScaleConfirm(replicas: number) {
  if (!scalingDeployment.value) return;

  try {
    // TODO: 调用真实 API 更新副本数
    // await updateDeploymentReplicas(
    //   scalingDeployment.value.metadata.namespace,
    //   scalingDeployment.value.metadata.name,
    //   replicas
    // );

    message.success(
      `Deployment "${scalingDeployment.value.metadata.name}" 副本数已更新为 ${replicas}`,
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
 * 处理重启 Deployment
 * 通过更新 Pod Template annotation 触发滚动更新
 */
function handleRestart(deployment: Deployment) {
  Modal.confirm({
    title: '确认重启',
    content: `确定要重启 Deployment "${deployment.metadata.name}" 吗？这将触发滚动更新，重新创建所有 Pod。`,
    onOk: async () => {
      try {
        // TODO: 调用真实 API 更新 annotation
        // 实际的 API 调用应该是：
        // await patchDeployment(
        //   deployment.metadata.namespace,
        //   deployment.metadata.name,
        //   {
        //     spec: {
        //       template: {
        //         metadata: {
        //           annotations: {
        //             'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
        //           }
        //         }
        //       }
        //     }
        //   }
        // );

        message.success(
          `Deployment "${deployment.metadata.name}" 正在重启，将进行滚动更新`,
        );

        // 刷新列表
        resourceListRef.value?.refresh();
      } catch (error: any) {
        message.error(`重启失败: ${error.message}`);
      }
    },
  });
}

/**
 * 打开 YAML 编辑器
 */
function openYAMLEditor(deployment: Deployment) {
  editingDeployment.value = deployment;
  yamlEditorVisible.value = true;
}

/**
 * 处理 YAML 编辑确认
 */
async function handleYAMLEditConfirm(updatedResource: any) {
  try {
    // TODO: 调用真实 API 更新资源
    // await updateDeployment(
    //   updatedResource.metadata.namespace,
    //   updatedResource.metadata.name,
    //   updatedResource
    // );

    message.success(
      `Deployment "${updatedResource.metadata.name}" 已成功更新`,
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
  const baseConfig = createDeploymentConfig();

  // 覆盖 view 操作，使用详情抽屉
  // 覆盖 scale 操作，使用扩缩容模态框
  // 覆盖 restart 操作，使用自定义重启逻辑
  // 覆盖 edit 操作，使用 YAML 编辑器
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

    const scaleActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'scale',
    );
    if (scaleActionIndex !== -1) {
      baseConfig.actions[scaleActionIndex] = {
        action: 'scale',
        label: '扩缩容',
        handler: (row: Deployment) => {
          openScaleModal(row);
        },
      };
    }

    const restartActionIndex = baseConfig.actions.findIndex(
      (a) => a.action === 'restart',
    );
    if (restartActionIndex !== -1) {
      baseConfig.actions[restartActionIndex] = {
        action: 'restart',
        label: '重启',
        handler: (row: Deployment) => {
          handleRestart(row);
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
        handler: (row: Deployment) => {
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

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :deployment="selectedDeployment"
    />

    <!-- 扩缩容模态框 -->
    <ScaleModal
      v-if="scalingDeployment"
      v-model:visible="scaleModalVisible"
      :resource-name="scalingDeployment.metadata.name"
      :resource-type="'Deployment'"
      :current-replicas="scalingDeployment.spec.replicas"
      :namespace="scalingDeployment.metadata.namespace"
      @confirm="handleScaleConfirm"
    />

    <!-- YAML 编辑器模态框 -->
    <YAMLEditorModal
      v-if="editingDeployment"
      v-model:visible="yamlEditorVisible"
      :resource="editingDeployment"
      :resource-type="'Deployment'"
      :resource-name="editingDeployment.metadata.name"
      @confirm="handleYAMLEditConfirm"
    />
  </div>
</template>
