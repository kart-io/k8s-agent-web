<script lang="ts" setup>
/**
 * PersistentVolumeClaim 列表页面
 */
import type { PersistentVolumeClaim } from '#/api/k8s/types';

import { ref } from 'vue';

import { message } from 'ant-design-vue';

import {
  checkPVCBeforeDelete,
  mockDeletePVC,
} from '#/api/k8s/mock';
import { createPVCConfig } from '#/config/k8s-resources';

import DeleteConfirmModal from '#/views/k8s/_shared/DeleteConfirmModal.vue';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

import DetailDrawer from './DetailDrawer.vue';

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedPVC = ref<null | PersistentVolumeClaim>(null);

// 删除确认对话框状态
const deleteModalVisible = ref(false);
const pvcToDelete = ref<null | PersistentVolumeClaim>(null);
const deleteWarnings = ref<string[]>([]);
const isDeleting = ref(false);

// ResourceList 引用
const resourceListRef = ref();

/**
 * 打开详情抽屉
 */
function openDetailDrawer(pvc: PersistentVolumeClaim) {
  selectedPVC.value = pvc;
  detailDrawerVisible.value = true;
}

/**
 * 关闭详情抽屉
 */
function closeDetailDrawer() {
  detailDrawerVisible.value = false;
  selectedPVC.value = null;
}

/**
 * 打开删除确认对话框
 */
function openDeleteModal(pvc: PersistentVolumeClaim) {
  pvcToDelete.value = pvc;

  // 执行删除前检查
  const checkResult = checkPVCBeforeDelete(
    'cluster-prod-01',
    pvc.metadata.namespace,
    pvc.metadata.name,
  );

  if (!checkResult.canDelete) {
    message.error(checkResult.warnings[0] || '无法删除此 PVC');
    return;
  }

  deleteWarnings.value = checkResult.warnings;
  deleteModalVisible.value = true;
}

/**
 * 确认删除 PVC
 */
async function confirmDelete() {
  if (!pvcToDelete.value) return;

  isDeleting.value = true;

  try {
    const result = await mockDeletePVC(
      'cluster-prod-01',
      pvcToDelete.value.metadata.namespace,
      pvcToDelete.value.metadata.name,
    );

    if (result.success) {
      message.success(result.message);
      deleteModalVisible.value = false;
      pvcToDelete.value = null;
      deleteWarnings.value = [];

      // 刷新列表
      if (resourceListRef.value) {
        resourceListRef.value.refresh();
      }
    } else {
      message.error(result.message);
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning) => {
          message.warning(warning);
        });
      }
    }
  } catch (error: any) {
    message.error(error.message || '删除失败');
  } finally {
    isDeleting.value = false;
  }
}

/**
 * 取消删除
 */
function cancelDelete() {
  deleteModalVisible.value = false;
  pvcToDelete.value = null;
  deleteWarnings.value = [];
}

// 获取 PVC 资源配置
const config = createPVCConfig();

// 覆盖操作的 handler
if (config.actions && config.actions.length > 0) {
  const viewAction = config.actions.find((action) => action.action === 'view');
  if (viewAction) {
    viewAction.handler = openDetailDrawer;
  }

  const deleteAction = config.actions.find((action) => action.action === 'delete');
  if (deleteAction) {
    deleteAction.handler = openDeleteModal;
  }
}
</script>

<template>
  <div class="persistent-volume-claims-page">
    <ResourceList ref="resourceListRef" :config="config">
      <!-- 访问模式插槽 -->
      <template #access-modes-slot="{ row }">
        <a-tag
          v-for="mode in row.spec.accessModes"
          :key="mode"
          color="blue"
          size="small"
        >
          {{
            mode === 'ReadWriteOnce'
              ? 'RWO'
              : mode === 'ReadOnlyMany'
                ? 'ROX'
                : mode === 'ReadWriteMany'
                  ? 'RWX'
                  : 'RWOP'
          }}
        </a-tag>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :pvc="selectedPVC"
      @close="closeDetailDrawer"
    />

    <!-- 删除确认对话框 -->
    <DeleteConfirmModal
      v-model:visible="deleteModalVisible"
      :resource-type="`PersistentVolumeClaim`"
      :resource-name="`${pvcToDelete?.metadata.namespace}/${pvcToDelete?.metadata.name}` || ''"
      :warnings="deleteWarnings"
      :require-confirm-text="true"
      :confirm-text="pvcToDelete?.metadata.name"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.persistent-volume-claims-page {
  height: 100%;
}
</style>
