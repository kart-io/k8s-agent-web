<script lang="ts" setup>
/**
 * 资源编辑器模态框
 * 支持表单模式和 YAML 模式两种编辑方式
 */
import type { ResourceFormConfig } from '#/types/k8s-resource-base';

import { computed, ref, watch } from 'vue';

import {
  Alert,
  Button,
  Collapse,
  Form,
  FormItemRest,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Tabs,
  Textarea,
} from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import * as yaml from 'js-yaml';

defineOptions({ name: 'ResourceEditorModal' });

interface Props {
  visible: boolean;
  mode: 'create' | 'edit'; // 创建或编辑模式
  resource?: any; // 编辑时的资源对象
  resourceType: string; // 资源类型
  resourceLabel: string; // 资源显示名称
  formConfig?: ResourceFormConfig; // 表单配置
  clusterId: string; // 集群ID
  namespace?: string; // 命名空间（如果是命名空间资源）
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', resource: any): void; // 确认创建/编辑
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 当前选中的标签页
const activeTab = ref<'form' | 'yaml'>('form');

// 表单数据
const formRef = ref();
const formData = ref<any>({});

// YAML 内容
const yamlContent = ref('');
const yamlValidationError = ref('');
const loading = ref(false);

// 标题
const title = computed(() => {
  const action = props.mode === 'create' ? '创建' : '编辑';
  const name = props.resource?.metadata?.name || '';
  return `${action} ${props.resourceLabel}${name ? ` - ${name}` : ''}`;
});

// 初始化表单数据
watch(
  () => [props.visible, props.resource, props.mode],
  () => {
    if (props.visible) {
      initializeFormData();
      initializeYamlContent();
      activeTab.value = 'form';
      yamlValidationError.value = '';
    }
  },
  { immediate: true },
);

/**
 * 初始化表单数据
 */
function initializeFormData() {
  if (props.mode === 'edit' && props.resource) {
    // 编辑模式：使用资源数据
    formData.value = JSON.parse(JSON.stringify(props.resource));
  } else if (props.mode === 'create') {
    // 创建模式：使用初始值
    if (props.formConfig?.createInitialValues) {
      formData.value = JSON.parse(
        JSON.stringify(props.formConfig.createInitialValues),
      );
    } else {
      // 默认初始值
      formData.value = {
        apiVersion: 'v1',
        kind: props.resourceLabel,
        metadata: {
          name: '',
          namespace: props.namespace || '',
          labels: {},
          annotations: {},
        },
        spec: {},
      };
    }
  }
}

/**
 * 初始化 YAML 内容
 */
function initializeYamlContent() {
  const data =
    props.mode === 'edit' && props.resource
      ? props.resource
      : formData.value;

  try {
    yamlContent.value = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
  } catch (error: any) {
    console.error('转换为 YAML 失败:', error);
  }
}

/**
 * 获取嵌套属性值
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

/**
 * 设置嵌套属性值
 */
function setNestedValue(obj: any, path: string, value: any) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * 判断字段是否禁用
 */
function isFieldDisabled(field: any): boolean {
  if (typeof field.disabled === 'function') {
    return field.disabled(props.mode);
  }
  return field.disabled || false;
}

/**
 * 验证 YAML
 */
function validateYAML(): boolean {
  try {
    yaml.load(yamlContent.value);
    yamlValidationError.value = '';
    return true;
  } catch (error: any) {
    yamlValidationError.value = `YAML 格式错误: ${error.message}`;
    return false;
  }
}

/**
 * 格式化 YAML
 */
function handleFormatYAML() {
  try {
    const parsed = yaml.load(yamlContent.value);
    yamlContent.value = yaml.dump(parsed, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
    yamlValidationError.value = '';
  } catch (error: any) {
    yamlValidationError.value = `格式化失败: ${error.message}`;
  }
}

/**
 * 从表单切换到 YAML 模式时，同步表单数据到 YAML
 */
watch(activeTab, (newTab) => {
  if (newTab === 'yaml') {
    try {
      yamlContent.value = yaml.dump(formData.value, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });
      yamlValidationError.value = '';
    } catch (error: any) {
      console.error('转换为 YAML 失败:', error);
    }
  }
});

/**
 * 处理确认
 */
async function handleOk() {
  try {
    loading.value = true;

    let finalResource: any;

    if (activeTab.value === 'form') {
      // 表单模式：验证表单
      await formRef.value?.validate();
      finalResource = formData.value;
    } else {
      // YAML 模式：验证 YAML
      if (!validateYAML()) {
        return;
      }
      finalResource = yaml.load(yamlContent.value);
    }

    // 发送确认事件
    emit('confirm', finalResource);

    // 关闭模态框
    emit('update:visible', false);
  } catch (error: any) {
    console.error('验证失败:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 处理取消
 */
function handleCancel() {
  emit('update:visible', false);
  yamlValidationError.value = '';
}

/**
 * 添加标签
 */
function addLabel(field: string) {
  const labels = getNestedValue(formData.value, field) || {};
  labels[`key-${Object.keys(labels).length + 1}`] = 'value';
  setNestedValue(formData.value, field, labels);
}

/**
 * 删除标签
 */
function removeLabel(field: string, key: string) {
  const labels = getNestedValue(formData.value, field) || {};
  delete labels[key];
  setNestedValue(formData.value, field, labels);
}

/**
 * 更新标签键
 */
function updateLabelKey(field: string, oldKey: string, newKey: string) {
  const labels = getNestedValue(formData.value, field) || {};
  if (oldKey !== newKey && !labels[newKey]) {
    labels[newKey] = labels[oldKey];
    delete labels[oldKey];
    setNestedValue(formData.value, field, labels);
  }
}

/**
 * 更新标签值
 */
function updateLabelValue(field: string, key: string, value: string) {
  const labels = getNestedValue(formData.value, field) || {};
  labels[key] = value;
  setNestedValue(formData.value, field, labels);
}
</script>

<template>
  <Modal
    :open="visible"
    :title="title"
    width="900px"
    :confirm-loading="loading"
    :destroy-on-close="true"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Tabs v-model:active-key="activeTab">
      <!-- 表单模式 -->
      <Tabs.TabPane v-if="formConfig" key="form" tab="表单模式">
        <div class="form-container">
          <Form
            ref="formRef"
            :model="formData"
            layout="vertical"
            :label-col="{ span: 24 }"
            :wrapper-col="{ span: 24 }"
          >
            <template v-for="group in formConfig.groups" :key="group.title">
              <!-- 可折叠分组 -->
              <Collapse
                v-if="group.collapsible"
                :default-active-key="
                  group.defaultCollapsed ? [] : [group.title]
                "
              >
                <Collapse.Panel :key="group.title" :header="group.title">
                  <template v-for="field in group.fields" :key="field.field">
                    <Form.Item
                      v-if="!field.show || field.show(formData)"
                      :label="field.label"
                      :name="field.field"
                      :required="field.required"
                      :rules="field.rules"
                      :help="field.help"
                    >
                      <!-- 文本输入 -->
                      <Input
                        v-if="field.type === 'input'"
                        :value="getNestedValue(formData, field.field)"
                        :placeholder="field.placeholder"
                        :disabled="isFieldDisabled(field)"
                        @update:value="
                          (val) => setNestedValue(formData, field.field, val)
                        "
                      />

                      <!-- 多行文本 -->
                      <Textarea
                        v-else-if="field.type === 'textarea'"
                        :value="getNestedValue(formData, field.field)"
                        :placeholder="field.placeholder"
                        :disabled="isFieldDisabled(field)"
                        :rows="4"
                        @update:value="
                          (val) => setNestedValue(formData, field.field, val)
                        "
                      />

                      <!-- 数字输入 -->
                      <InputNumber
                        v-else-if="field.type === 'number'"
                        :value="getNestedValue(formData, field.field)"
                        :placeholder="field.placeholder"
                        :disabled="isFieldDisabled(field)"
                        style="width: 100%"
                        @update:value="
                          (val) => setNestedValue(formData, field.field, val)
                        "
                      />

                      <!-- 下拉选择 -->
                      <Select
                        v-else-if="field.type === 'select'"
                        :value="getNestedValue(formData, field.field)"
                        :placeholder="field.placeholder"
                        :disabled="isFieldDisabled(field)"
                        :options="field.options"
                        @update:value="
                          (val) => setNestedValue(formData, field.field, val)
                        "
                      />

                      <!-- 开关 -->
                      <Switch
                        v-else-if="field.type === 'switch'"
                        :checked="getNestedValue(formData, field.field)"
                        :disabled="isFieldDisabled(field)"
                        @update:checked="
                          (val) => setNestedValue(formData, field.field, val)
                        "
                      />

                      <!-- 标签编辑器 -->
                      <FormItemRest v-if="field.type === 'labels'">
                        <div>
                          <div
                            v-for="(value, key) in getNestedValue(
                              formData,
                              field.field,
                            ) || {}"
                            :key="key"
                            class="label-item"
                          >
                            <Input
                              :value="key"
                              placeholder="键"
                              style="width: 45%"
                              @update:value="
                                (newKey) =>
                                  updateLabelKey(field.field, key as string, newKey)
                              "
                            />
                            <Input
                              :value="value"
                              placeholder="值"
                              style="width: 45%"
                              @update:value="
                                (newValue) =>
                                  updateLabelValue(
                                    field.field,
                                    key as string,
                                    newValue,
                                  )
                              "
                            />
                            <Button
                              type="text"
                              danger
                              @click="removeLabel(field.field, key as string)"
                            >
                              <DeleteOutlined />
                            </Button>
                          </div>
                          <Button type="dashed" block @click="addLabel(field.field)">
                            <PlusOutlined /> 添加标签
                          </Button>
                        </div>
                      </FormItemRest>
                    </Form.Item>
                  </template>
                </Collapse.Panel>
              </Collapse>

              <!-- 普通分组 -->
              <div v-else class="form-group">
                <div class="form-group-title">{{ group.title }}</div>
                <template v-for="field in group.fields" :key="field.field">
                  <Form.Item
                    v-if="!field.show || field.show(formData)"
                    :label="field.label"
                    :name="field.field"
                    :required="field.required"
                    :rules="field.rules"
                    :help="field.help"
                  >
                    <!-- 文本输入 -->
                    <Input
                      v-if="field.type === 'input'"
                      :value="getNestedValue(formData, field.field)"
                      :placeholder="field.placeholder"
                      :disabled="isFieldDisabled(field)"
                      @update:value="
                        (val) => setNestedValue(formData, field.field, val)
                      "
                    />

                    <!-- 多行文本 -->
                    <Textarea
                      v-else-if="field.type === 'textarea'"
                      :value="getNestedValue(formData, field.field)"
                      :placeholder="field.placeholder"
                      :disabled="isFieldDisabled(field)"
                      :rows="4"
                      @update:value="
                        (val) => setNestedValue(formData, field.field, val)
                      "
                    />

                    <!-- 数字输入 -->
                    <InputNumber
                      v-else-if="field.type === 'number'"
                      :value="getNestedValue(formData, field.field)"
                      :placeholder="field.placeholder"
                      :disabled="isFieldDisabled(field)"
                      style="width: 100%"
                      @update:value="
                        (val) => setNestedValue(formData, field.field, val)
                      "
                    />

                    <!-- 下拉选择 -->
                    <Select
                      v-else-if="field.type === 'select'"
                      :value="getNestedValue(formData, field.field)"
                      :placeholder="field.placeholder"
                      :disabled="isFieldDisabled(field)"
                      :options="field.options"
                      @update:value="
                        (val) => setNestedValue(formData, field.field, val)
                      "
                    />

                    <!-- 开关 -->
                    <Switch
                      v-else-if="field.type === 'switch'"
                      :checked="getNestedValue(formData, field.field)"
                      :disabled="isFieldDisabled(field)"
                      @update:checked="
                        (val) => setNestedValue(formData, field.field, val)
                      "
                    />

                    <!-- 标签编辑器 -->
                    <FormItemRest v-if="field.type === 'labels'">
                      <div>
                        <div
                          v-for="(value, key) in getNestedValue(
                            formData,
                            field.field,
                          ) || {}"
                          :key="key"
                          class="label-item"
                        >
                          <Input
                            :value="key"
                            placeholder="键"
                            style="width: 45%"
                            @update:value="
                              (newKey) =>
                                updateLabelKey(field.field, key as string, newKey)
                            "
                          />
                          <Input
                            :value="value"
                            placeholder="值"
                            style="width: 45%"
                            @update:value="
                              (newValue) =>
                                updateLabelValue(
                                  field.field,
                                  key as string,
                                  newValue,
                                )
                            "
                          />
                          <Button
                            type="text"
                            danger
                            @click="removeLabel(field.field, key as string)"
                          >
                            <DeleteOutlined />
                          </Button>
                        </div>
                        <Button type="dashed" block @click="addLabel(field.field)">
                          <PlusOutlined /> 添加标签
                        </Button>
                      </div>
                    </FormItemRest>
                  </Form.Item>
                </template>
              </div>
            </template>
          </Form>
        </div>
      </Tabs.TabPane>

      <!-- YAML 模式 -->
      <Tabs.TabPane key="yaml" tab="YAML 模式">
        <div class="yaml-container">
          <!-- 工具栏 -->
          <div class="yaml-toolbar">
            <Button size="small" @click="handleFormatYAML">格式化</Button>
            <span class="yaml-info"> 支持 YAML 格式编辑 K8s 资源配置 </span>
          </div>

          <!-- 错误提示 -->
          <Alert
            v-if="yamlValidationError"
            :message="yamlValidationError"
            type="error"
            show-icon
            closable
            class="yaml-error"
            @close="() => (yamlValidationError = '')"
          />

          <!-- YAML 编辑器 -->
          <div class="yaml-editor-wrapper">
            <textarea
              v-model="yamlContent"
              class="yaml-editor"
              spellcheck="false"
            ></textarea>
          </div>

          <!-- 提示信息 -->
          <Alert
            message="提示"
            description="编辑 YAML 配置时请谨慎操作，错误的配置可能导致资源无法正常工作。"
            type="info"
            show-icon
            class="yaml-hint"
          />
        </div>
      </Tabs.TabPane>
    </Tabs>
  </Modal>
</template>

<style scoped>
.form-container {
  max-height: 600px;
  overflow-y: auto;
  padding: 16px 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-group-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.label-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.yaml-container {
  padding: 12px 0;
}

.yaml-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.yaml-info {
  margin-left: auto;
  font-size: 13px;
  color: var(--vben-text-color-secondary);
}

.yaml-error {
  margin-bottom: 12px;
}

.yaml-hint {
  margin-top: 12px;
}

.yaml-editor-wrapper {
  position: relative;
  height: 500px;
  overflow: hidden;
  border: 2px solid var(--yaml-border-color);
  border-radius: 4px;
}

.yaml-editor {
  width: 100%;
  height: 100%;
  padding: 16px;
  overflow-x: auto;
  font-family:
    Monaco, Menlo, 'Ubuntu Mono', Consolas, source-code-pro, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--yaml-text-color);
  overflow-wrap: normal;
  tab-size: 2;
  white-space: pre;
  resize: none;
  outline: none;
  background-color: var(--yaml-bg-color);
  border: none;
}

/* 滚动条样式 */
.yaml-editor::-webkit-scrollbar,
.form-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.yaml-editor::-webkit-scrollbar-track,
.form-container::-webkit-scrollbar-track {
  background-color: var(--yaml-scrollbar-track-color);
}

.yaml-editor::-webkit-scrollbar-thumb,
.form-container::-webkit-scrollbar-thumb {
  background-color: var(--yaml-scrollbar-thumb-color);
  border-radius: 4px;
}

.yaml-editor::-webkit-scrollbar-thumb:hover,
.form-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--yaml-scrollbar-thumb-hover-color);
}

/* 深色主题 */
html[data-theme='dark'] {
  --yaml-bg-color: #1e1e1e;
  --yaml-text-color: #d4d4d4;
  --yaml-border-color: #3c3c3c;
  --yaml-scrollbar-track-color: #2d2d2d;
  --yaml-scrollbar-thumb-color: #555;
  --yaml-scrollbar-thumb-hover-color: #666;
}

/* 浅色主题 */
html[data-theme='light'],
html:not([data-theme]) {
  --yaml-bg-color: #fff;
  --yaml-text-color: #24292e;
  --yaml-border-color: #d1d5da;
  --yaml-scrollbar-track-color: #f0f0f0;
  --yaml-scrollbar-thumb-color: #c1c1c1;
  --yaml-scrollbar-thumb-hover-color: #a8a8a8;
}
</style>
