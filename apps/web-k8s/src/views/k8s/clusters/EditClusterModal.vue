<script lang="ts" setup>
import type { Cluster } from '#/api/k8s/types';

import { reactive, ref, watch } from 'vue';

import { Form, Input, message, Modal } from 'ant-design-vue';

import { clusterApi } from '#/api/k8s';

interface Props {
  visible: boolean;
  cluster: Cluster | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  labels: {} as Record<string, string>,
});

// 标签输入（用于辅助输入）
const labelKey = ref('');
const labelValue = ref('');

// 提交loading状态
const submitLoading = ref(false);

// 加载状态
const loading = ref(false);

// 从服务器获取的完整集群数据
const clusterDetail = ref<Cluster | null>(null);

// 表单引用
const formRef = ref();

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入集群名称', trigger: 'blur' },
    {
      pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
      message:
        '名称只能包含小写字母、数字和连字符，且必须以字母或数字开头和结尾',
      trigger: 'blur',
    },
  ],
};

// 监听 visible 和 cluster 变化，初始化表单
watch(
  () => [props.visible, props.cluster],
  ([newVisible, newCluster]) => {
    if (newVisible && newCluster) {
      // 从服务器加载最新的集群数据
      loadClusterDetail(newCluster.id);
    }
  },
  { immediate: true },
);

// 从服务器加载集群详情
async function loadClusterDetail(clusterId: string) {
  try {
    loading.value = true;

    // 调用详情接口获取最新数据
    const detail = await clusterApi.detail(clusterId);
    clusterDetail.value = detail;

    // 使用服务器返回的数据初始化表单
    initForm(detail);
  } catch (error: any) {
    console.error('获取集群详情失败:', error);
    message.error(`获取集群详情失败: ${error.message || '未知错误'}`);

    // 关闭对话框
    emit('update:visible', false);
  } finally {
    loading.value = false;
  }
}

// 初始化表单
function initForm(cluster: Cluster) {
  formData.name = cluster.name;
  formData.description = cluster.description;
  // 处理 labels 为 null 的情况
  formData.labels =
    cluster.labels && typeof cluster.labels === 'object'
      ? { ...cluster.labels }
      : {};
  labelKey.value = '';
  labelValue.value = '';
  formRef.value?.clearValidate();
}

// 添加标签
function addLabel() {
  if (!labelKey.value || !labelValue.value) {
    message.warning('请输入标签的键和值');
    return;
  }

  formData.labels[labelKey.value] = labelValue.value;
  labelKey.value = '';
  labelValue.value = '';
}

// 删除标签
function removeLabel(key: string) {
  delete formData.labels[key];
}

// 处理取消
function handleCancel() {
  emit('update:visible', false);
}

// 处理提交
async function handleOk() {
  if (!clusterDetail.value) {
    return;
  }

  try {
    // 验证表单
    await formRef.value?.validate();

    submitLoading.value = true;

    // 调用 API 更新集群
    await clusterApi.update(clusterDetail.value.id, {
      name: formData.name,
      description: formData.description,
      labels: formData.labels,
    });

    message.success('集群更新成功');
    emit('success');
    emit('update:visible', false);
  } catch (error: any) {
    console.error('更新集群失败:', error);
    if (error.errorFields) {
      // 表单验证失败
      return;
    }
    message.error(`更新集群失败: ${error.message || '未知错误'}`);
  } finally {
    submitLoading.value = false;
  }
}
</script>

<template>
  <Modal
    :open="visible"
    :confirm-loading="submitLoading"
    title="编辑集群"
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">加载中...</div>
    </div>

    <Form
      v-else
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 19 }"
    >
      <Form.Item label="集群名称" name="name">
        <Input
          v-model:value="formData.name"
          placeholder="例如: prod-cluster-01"
        />
      </Form.Item>

      <Form.Item label="描述" name="description">
        <Input
          v-model:value="formData.description"
          placeholder="集群描述（可选）"
        />
      </Form.Item>

      <Form.Item label="API Server">
        <Input
          :value="clusterDetail?.endpoint"
          disabled
          placeholder="API Server 地址（不可修改）"
        />
        <div class="mt-1 text-xs text-gray-500">
          注意：API Server 地址不可修改
        </div>
      </Form.Item>

      <Form.Item label="标签">
        <div class="labels-container">
          <!-- 已添加的标签 -->
          <div
            v-if="Object.keys(formData.labels).length > 0"
            class="labels-list"
          >
            <div
              v-for="(value, key) in formData.labels"
              :key="key"
              class="label-tag"
            >
              <span>{{ key }}: {{ value }}</span>
              <button
                type="button"
                class="label-remove"
                @click="removeLabel(key as string)"
              >
                ×
              </button>
            </div>
          </div>

          <!-- 添加标签输入 -->
          <div class="label-input-group">
            <Input
              v-model:value="labelKey"
              placeholder="键"
              style="width: 200px; margin-right: 8px"
              @press-enter="addLabel"
            />
            <Input
              v-model:value="labelValue"
              placeholder="值"
              style="width: 200px; margin-right: 8px"
              @press-enter="addLabel"
            />
            <button type="button" class="add-label-btn" @click="addLabel">
              添加标签
            </button>
          </div>
        </div>
      </Form.Item>
    </Form>

    <div v-if="!loading" class="info-panel">
      <div class="info-title">集群信息（只读）</div>
      <div class="info-item">
        <span class="info-label">集群 ID:</span>
        <span class="info-value">{{ clusterDetail?.id }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">状态:</span>
        <span class="info-value">{{ clusterDetail?.status }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">K8s 版本:</span>
        <span class="info-value">{{ clusterDetail?.version }}</span>
      </div>
      <div v-if="clusterDetail?.region" class="info-item">
        <span class="info-label">区域:</span>
        <span class="info-value">{{ clusterDetail?.region }}</span>
      </div>
      <div v-if="clusterDetail?.provider" class="info-item">
        <span class="info-label">提供商:</span>
        <span class="info-value">{{ clusterDetail?.provider }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">创建时间:</span>
        <span class="info-value">{{ clusterDetail?.createdAt }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">更新时间:</span>
        <span class="info-value">{{ clusterDetail?.updatedAt }}</span>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-spinner {
  font-size: 16px;
  color: var(--vben-primary-color, #1890ff);
}

.labels-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.labels-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 13px;
  color: var(--vben-primary-color, #1890ff);
  background-color: var(--vben-primary-color-opacity-10, #1890ff1a);
  border: 1px solid var(--vben-primary-color, #1890ff);
  border-radius: 4px;
}

.label-remove {
  padding: 0 4px;
  margin-left: 8px;
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  color: var(--vben-primary-color, #1890ff);
  cursor: pointer;
  background: none;
  border: none;
}

.label-remove:hover {
  color: var(--vben-error-color, #ff4d4f);
}

.label-input-group {
  display: flex;
  align-items: center;
}

.add-label-btn {
  padding: 4px 15px;
  font-size: 14px;
  color: white;
  cursor: pointer;
  background-color: var(--vben-primary-color, #1890ff);
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.add-label-btn:hover {
  background-color: var(--vben-primary-color-hover, #40a9ff);
}

.info-panel {
  padding: 16px;
  margin-top: 24px;
  background-color: var(--vben-background-color-secondary, #f5f5f5);
  border-radius: 4px;
}

.info-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color-primary, #000000d9);
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-label {
  width: 100px;
  color: var(--vben-text-color-secondary, #00000073);
}

.info-value {
  flex: 1;
  color: var(--vben-text-color-primary, #000000d9);
}
</style>
