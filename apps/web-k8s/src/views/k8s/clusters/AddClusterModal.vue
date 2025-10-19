<script lang="ts" setup>
import type { CreateClusterRequest } from '#/api/k8s/types';

import { reactive, ref, watch } from 'vue';

import { Form, Input, message, Modal, Textarea } from 'ant-design-vue';

import { clusterApi } from '#/api/k8s';

interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单数据
const formData = reactive<CreateClusterRequest>({
  name: '',
  description: '',
  endpoint: '',
  kubeconfig: '',
  region: '',
  provider: '',
  labels: {},
});

// 标签输入（用于辅助输入）
const labelKey = ref('');
const labelValue = ref('');

// 提交loading状态
const submitLoading = ref(false);

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
  endpoint: [
    { required: true, message: '请输入 API Server 地址', trigger: 'blur' },
    {
      pattern: /^https?:\/\/.+/,
      message: 'API Server 地址必须以 http:// 或 https:// 开头',
      trigger: 'blur',
    },
  ],
  kubeconfig: [
    { required: true, message: '请输入 KubeConfig 内容', trigger: 'blur' },
  ],
};

// 监听 visible 变化，重置表单
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      resetForm();
    }
  },
);

// 重置表单
function resetForm() {
  Object.assign(formData, {
    name: '',
    description: '',
    endpoint: '',
    kubeconfig: '',
    region: '',
    provider: '',
    labels: {},
  });
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

  if (!formData.labels) {
    formData.labels = {};
  }

  formData.labels[labelKey.value] = labelValue.value;
  labelKey.value = '';
  labelValue.value = '';
}

// 删除标签
function removeLabel(key: string) {
  if (formData.labels) {
    delete formData.labels[key];
  }
}

// 处理取消
function handleCancel() {
  emit('update:visible', false);
}

// 处理提交
async function handleOk() {
  try {
    // 验证表单
    await formRef.value?.validate();

    submitLoading.value = true;

    // 调用 API 创建集群
    await clusterApi.create(formData);

    message.success('集群添加成功');
    emit('success');
    emit('update:visible', false);
  } catch (error: any) {
    console.error('添加集群失败:', error);
    if (error.errorFields) {
      // 表单验证失败
      return;
    }
    message.error(`添加集群失败: ${error.message || '未知错误'}`);
  } finally {
    submitLoading.value = false;
  }
}
</script>

<template>
  <Modal
    :open="visible"
    :confirm-loading="submitLoading"
    title="添加集群"
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <Form
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

      <Form.Item label="API Server" name="endpoint">
        <Input
          v-model:value="formData.endpoint"
          placeholder="例如: https://192.168.1.100:6443"
        />
      </Form.Item>

      <Form.Item label="KubeConfig" name="kubeconfig">
        <Textarea
          v-model:value="formData.kubeconfig"
          :rows="8"
          placeholder="粘贴完整的 KubeConfig YAML 内容"
        />
      </Form.Item>

      <Form.Item label="区域" name="region">
        <Input
          v-model:value="formData.region"
          placeholder="例如: us-west-1（可选）"
        />
      </Form.Item>

      <Form.Item label="云服务商" name="provider">
        <Input
          v-model:value="formData.provider"
          placeholder="例如: AWS, GCP, Azure（可选）"
        />
      </Form.Item>

      <Form.Item label="标签">
        <div class="labels-container">
          <!-- 已添加的标签 -->
          <div
            v-if="formData.labels && Object.keys(formData.labels).length > 0"
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
  </Modal>
</template>

<style scoped>
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
</style>
