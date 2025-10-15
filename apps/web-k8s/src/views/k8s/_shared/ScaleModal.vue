<script lang="ts" setup>
/**
 * 扩缩容模态框
 * 用于 Deployment、StatefulSet 等资源的副本数调整
 */
import { computed, ref, watch } from 'vue';

import { Form, InputNumber, message, Modal } from 'ant-design-vue';

defineOptions({
  name: 'ScaleModal',
});

interface Props {
  visible: boolean;
  resourceName: string;
  resourceType: string;
  currentReplicas: number;
  namespace: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', replicas: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单数据
const formData = ref({
  replicas: props.currentReplicas,
});

// 监听 props.currentReplicas 变化
watch(
  () => props.currentReplicas,
  (newValue) => {
    formData.value.replicas = newValue;
  },
);

// 表单验证规则
const rules = {
  replicas: [
    { required: true, message: '请输入副本数' },
    {
      type: 'number',
      min: 0,
      max: 100,
      message: '副本数必须在 0-100 之间',
    },
  ],
};

// 表单引用
const formRef = ref();

// 加载状态
const loading = ref(false);

// 计算差异
const replicasDiff = computed(() => {
  const diff = formData.value.replicas - props.currentReplicas;
  if (diff > 0) return `+${diff}`;
  if (diff < 0) return diff.toString();
  return '0';
});

// 计算差异颜色
const diffColor = computed(() => {
  const diff = formData.value.replicas - props.currentReplicas;
  if (diff > 0) return 'success';
  if (diff < 0) return 'warning';
  return 'default';
});

/**
 * 处理确认
 */
async function handleOk() {
  try {
    await formRef.value.validate();

    if (formData.value.replicas === props.currentReplicas) {
      message.warning('副本数未发生变化');
      return;
    }

    loading.value = true;

    // 发送确认事件
    emit('confirm', formData.value.replicas);
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 处理取消
 */
function handleCancel() {
  formRef.value?.resetFields();
  emit('update:visible', false);
}

/**
 * 处理数字增加
 */
function handleIncrement() {
  if (formData.value.replicas < 100) {
    formData.value.replicas += 1;
  }
}

/**
 * 处理数字减少
 */
function handleDecrement() {
  if (formData.value.replicas > 0) {
    formData.value.replicas -= 1;
  }
}
</script>

<template>
  <Modal
    :open="visible"
    :title="`${resourceType} 扩缩容`"
    :confirm-loading="loading"
    width="500px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="scale-modal-content">
      <div class="resource-info">
        <div class="info-item">
          <span class="label">资源名称：</span>
          <span class="value">{{ resourceName }}</span>
        </div>
        <div class="info-item">
          <span class="label">命名空间：</span>
          <span class="value">{{ namespace }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前副本数：</span>
          <span class="value current-replicas">{{ currentReplicas }}</span>
        </div>
      </div>

      <Form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        class="scale-form"
      >
        <Form.Item label="目标副本数" name="replicas">
          <div class="replicas-input-wrapper">
            <a-button class="decrement-btn" @click="handleDecrement">
              -
            </a-button>
            <InputNumber
              v-model:value="formData.replicas"
              :min="0"
              :max="100"
              :step="1"
              class="replicas-input"
            />
            <a-button class="increment-btn" @click="handleIncrement">
              +
            </a-button>
          </div>
        </Form.Item>

        <div v-if="replicasDiff !== '0'" class="diff-info">
          <a-badge
            :count="replicasDiff"
            :color="diffColor === 'success' ? '#52c41a' : '#faad14'"
          />
          <span class="diff-text">
            {{
              Number(replicasDiff) > 0
                ? `将扩容 ${replicasDiff} 个副本`
                : `将缩容 ${Math.abs(Number(replicasDiff))} 个副本`
            }}
          </span>
        </div>
      </Form>

      <a-alert
        message="提示"
        description="扩缩容操作会立即生效，请谨慎操作。扩容会创建新的 Pod，缩容会删除多余的 Pod。"
        type="warning"
        show-icon
        class="warning-alert"
      />
    </div>
  </Modal>
</template>

<style scoped>
.scale-modal-content {
  padding: 16px 0;
}

.resource-info {
  margin-bottom: 24px;
  padding: 16px;
  background-color: rgb(0 0 0 / 2%);
  border-radius: 4px;
}

html[data-theme='dark'] .resource-info {
  background-color: rgb(255 255 255 / 4%);
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 22px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  width: 100px;
  color: var(--vben-text-color-secondary);
}

.info-item .value {
  flex: 1;
  font-weight: 500;
  color: var(--vben-text-color);
}

.current-replicas {
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  color: var(--vben-primary-color);
}

.scale-form {
  margin-bottom: 16px;
}

.replicas-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.decrement-btn,
.increment-btn {
  width: 40px;
  height: 40px;
  font-size: 18px;
  font-weight: bold;
}

.replicas-input {
  flex: 1;
  height: 40px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

:deep(.replicas-input .ant-input-number-input) {
  height: 38px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.diff-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background-color: rgb(0 0 0 / 2%);
  border-radius: 4px;
}

html[data-theme='dark'] .diff-info {
  background-color: rgb(255 255 255 / 4%);
}

.diff-text {
  font-size: 13px;
  color: var(--vben-text-color-secondary);
}

.warning-alert {
  margin-top: 16px;
}
</style>
