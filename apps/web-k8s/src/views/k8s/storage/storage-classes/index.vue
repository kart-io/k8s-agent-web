<script lang="ts" setup>
/**
 * StorageClass 列表页面
 */
import type { StorageClass } from '#/api/k8s/types';

import { ref } from 'vue';

import { message } from 'ant-design-vue';

import {
  checkStorageClassBeforeDelete,
  mockDeleteStorageClass,
} from '#/api/k8s/mock';
import { createStorageClassConfig } from '#/config/k8s-resources';

import DeleteConfirmModal from '#/views/k8s/_shared/DeleteConfirmModal.vue';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';

import DetailDrawer from './DetailDrawer.vue';

// 详情抽屉状态
const detailDrawerVisible = ref(false);
const selectedStorageClass = ref<null | StorageClass>(null);

// 删除确认对话框状态
const deleteModalVisible = ref(false);
const scToDelete = ref<null | StorageClass>(null);
const deleteWarnings = ref<string[]>([]);
const isDeleting = ref(false);

// ResourceList 引用
const resourceListRef = ref();

/**
 * 打开详情抽屉
 */
function openDetailDrawer(storageClass: StorageClass) {
  selectedStorageClass.value = storageClass;
  detailDrawerVisible.value = true;
}

/**
 * 关闭详情抽屉
 */
function closeDetailDrawer() {
  detailDrawerVisible.value = false;
  selectedStorageClass.value = null;
}

/**
 * 打开删除确认对话框
 */
function openDeleteModal(storageClass: StorageClass) {
  scToDelete.value = storageClass;

  // 执行删除前检查
  const checkResult = checkStorageClassBeforeDelete(
    'cluster-prod-01',
    storageClass.metadata.name,
  );

  if (!checkResult.canDelete) {
    message.error(checkResult.warnings[0] || '无法删除此 StorageClass');
    return;
  }

  deleteWarnings.value = checkResult.warnings;
  deleteModalVisible.value = true;
}

/**
 * 确认删除 StorageClass
 */
async function confirmDelete() {
  if (!scToDelete.value) return;

  isDeleting.value = true;

  try {
    const result = await mockDeleteStorageClass(
      'cluster-prod-01',
      scToDelete.value.metadata.name,
    );

    if (result.success) {
      message.success(result.message);
      deleteModalVisible.value = false;
      scToDelete.value = null;
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
  scToDelete.value = null;
  deleteWarnings.value = [];
}

// 获取 StorageClass 资源配置
const config = createStorageClassConfig();

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
  <div class="storage-classes-page">
    <ResourceList ref="resourceListRef" :config="config">
      <!-- 绑定模式插槽 -->
      <template #binding-mode-slot="{ row }">
        <a-tag
          :color="row.volumeBindingMode === 'Immediate' ? 'blue' : 'cyan'"
        >
          {{ row.volumeBindingMode || 'Immediate' }}
        </a-tag>
      </template>

      <!-- 允许扩容插槽 -->
      <template #expansion-slot="{ row }">
        <a-tag :color="row.allowVolumeExpansion ? 'success' : 'default'">
          {{ row.allowVolumeExpansion ? '是' : '否' }}
        </a-tag>
      </template>
    </ResourceList>

    <!-- 详情抽屉 -->
    <DetailDrawer
      v-model:visible="detailDrawerVisible"
      :storage-class="selectedStorageClass"
      @close="closeDetailDrawer"
    />

    <!-- 删除确认对话框 -->
    <DeleteConfirmModal
      v-model:visible="deleteModalVisible"
      :resource-type="`StorageClass`"
      :resource-name="scToDelete?.metadata.name || ''"
      :warnings="deleteWarnings"
      :require-confirm-text="true"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.storage-classes-page {
  height: 100%;
}
</style>
