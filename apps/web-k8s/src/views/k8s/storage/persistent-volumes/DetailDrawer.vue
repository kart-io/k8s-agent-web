<script lang="ts" setup>
/**
 * PersistentVolume 详情抽屉组件
 * 显示 PersistentVolume 的完整信息
 */
import type { PersistentVolume } from '#/api/k8s/types';

import { computed, ref } from 'vue';

import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  message,
  Tabs,
  Tag,
} from 'ant-design-vue';

interface DetailDrawerProps {
  visible: boolean;
  pv: null | PersistentVolume;
}

const props = withDefaults(defineProps<DetailDrawerProps>(), {
  visible: false,
  pv: null,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

// 当前激活的标签页
const activeTab = ref('basic');

/**
 * 格式化时间
 */
function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
}

/**
 * 格式化访问模式
 */
function formatAccessMode(mode: string): string {
  const modeMap: Record<string, string> = {
    ReadWriteOnce: 'RWO (ReadWriteOnce)',
    ReadOnlyMany: 'ROX (ReadOnlyMany)',
    ReadWriteMany: 'RWX (ReadWriteMany)',
    ReadWriteOncePod: 'RWOP (ReadWriteOncePod)',
  };
  return modeMap[mode] || mode;
}

/**
 * 获取存储后端类型
 */
const storageBackendType = computed(() => {
  if (!props.pv) return '未知';

  if (props.pv.spec.nfs) return 'NFS';
  if (props.pv.spec.hostPath) return 'HostPath';
  if (props.pv.spec.csi) return 'CSI';
  if (props.pv.spec.awsElasticBlockStore) return 'AWS EBS';
  if (props.pv.spec.gcePersistentDisk) return 'GCE PD';
  if (props.pv.spec.azureDisk) return 'Azure Disk';

  return '其他';
});

/**
 * 获取存储后端详细配置
 */
const storageBackendConfig = computed(() => {
  if (!props.pv) return [];

  const config: Array<{ label: string; value: any }> = [];

  if (props.pv.spec.nfs) {
    config.push(
      { label: 'NFS 服务器', value: props.pv.spec.nfs.server },
      { label: 'NFS 路径', value: props.pv.spec.nfs.path },
      { label: '只读', value: props.pv.spec.nfs.readOnly ? '是' : '否' },
    );
  } else if (props.pv.spec.hostPath) {
    config.push(
      { label: '主机路径', value: props.pv.spec.hostPath.path },
      { label: '路径类型', value: props.pv.spec.hostPath.type || '-' },
    );
  } else if (props.pv.spec.csi) {
    config.push(
      { label: 'CSI 驱动', value: props.pv.spec.csi.driver },
      { label: '卷句柄', value: props.pv.spec.csi.volumeHandle },
      { label: '文件系统类型', value: props.pv.spec.csi.fsType || '-' },
      { label: '只读', value: props.pv.spec.csi.readOnly ? '是' : '否' },
    );

    if (props.pv.spec.csi.volumeAttributes) {
      Object.entries(props.pv.spec.csi.volumeAttributes).forEach(
        ([key, value]) => {
          config.push({ label: `属性: ${key}`, value });
        },
      );
    }
  } else if (props.pv.spec.awsElasticBlockStore) {
    config.push(
      {
        label: 'Volume ID',
        value: props.pv.spec.awsElasticBlockStore.volumeID,
      },
      {
        label: '文件系统类型',
        value: props.pv.spec.awsElasticBlockStore.fsType || '-',
      },
      {
        label: '只读',
        value: props.pv.spec.awsElasticBlockStore.readOnly ? '是' : '否',
      },
    );
  }

  return config;
});

/**
 * 标签数据
 */
const labels = computed(() => {
  if (!props.pv?.metadata.labels) return [];
  return Object.entries(props.pv.metadata.labels).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 注解数据
 */
const annotations = computed(() => {
  if (!props.pv?.metadata.annotations) return [];
  return Object.entries(props.pv.metadata.annotations).map(([key, value]) => ({
    key,
    value,
  }));
});

/**
 * 生成 YAML 格式的 PV 配置
 */
const pvYaml = computed(() => {
  if (!props.pv) return '';

  const yamlObj = {
    apiVersion: props.pv.apiVersion,
    kind: props.pv.kind,
    metadata: props.pv.metadata,
    spec: props.pv.spec,
    status: props.pv.status,
  };

  return formatYaml(yamlObj);
});

/**
 * 简单的 YAML 格式化函数
 */
function formatYaml(obj: any, indent = 0): string {
  const indentStr = '  '.repeat(indent);
  let result = '';

  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
        return `"${obj.replaceAll('"', String.raw`\"`)}"`;
      }
      return obj;
    }
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    obj.forEach((item) => {
      result += `${indentStr}- ${formatYaml(item, indent + 1).trimStart()}\n`;
    });
    return result.trimEnd();
  }

  // 对象处理
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) return;

    if (value === null) {
      result += `${indentStr}${key}: null\n`;
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          result += `${indentStr}${key}: []\n`;
        } else {
          result += `${indentStr}${key}:\n`;
          value.forEach((item) => {
            result +=
              typeof item === 'object'
                ? `${indentStr}- \n${formatYaml(item, indent + 2)}`
                : `${indentStr}- ${formatYaml(item, indent + 1)}\n`;
          });
        }
      } else {
        result += `${indentStr}${key}:\n${formatYaml(value, indent + 1)}`;
      }
    } else {
      result += `${indentStr}${key}: ${formatYaml(value, indent)}\n`;
    }
  });

  return result;
}

/**
 * 复制 YAML 到剪贴板
 */
async function copyYaml() {
  try {
    await navigator.clipboard.writeText(pvYaml.value);
    message.success('YAML 已复制到剪贴板');
  } catch {
    message.error('复制失败');
  }
}

/**
 * 下载 YAML 文件
 */
function downloadYaml() {
  if (!props.pv) return;

  const blob = new Blob([pvYaml.value], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.pv.metadata.name}.yaml`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('YAML 文件已下载');
}

/**
 * 关闭抽屉
 */
function handleClose() {
  emit('update:visible', false);
  emit('close');
  activeTab.value = 'basic';
}
</script>

<template>
  <Drawer
    :open="visible"
    :title="`PersistentVolume 详情 - ${pv?.metadata.name || ''}`"
    width="80%"
    placement="right"
    @close="handleClose"
  >
    <div v-if="pv" class="detail-drawer-content">
      <Tabs v-model:active-key="activeTab" type="card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions :column="2" bordered size="small">
            <Descriptions.Item label="名称">
              {{ pv.metadata.name }}
            </Descriptions.Item>
            <Descriptions.Item label="UID">
              {{ pv.metadata.uid }}
            </Descriptions.Item>
            <Descriptions.Item label="容量">
              <Tag color="blue">
                {{ pv.spec.capacity.storage }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag
                :color="
                  pv.status?.phase === 'Available'
                    ? 'success'
                    : pv.status?.phase === 'Bound'
                      ? 'processing'
                      : pv.status?.phase === 'Released'
                        ? 'warning'
                        : pv.status?.phase === 'Failed'
                          ? 'error'
                          : 'default'
                "
              >
                {{ pv.status?.phase }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="存储类">
              {{ pv.spec.storageClassName || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="访问模式">
              <div class="access-modes">
                <Tag
                  v-for="mode in pv.spec.accessModes"
                  :key="mode"
                  color="blue"
                  size="small"
                >
                  {{ formatAccessMode(mode) }}
                </Tag>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="回收策略">
              <Tag
                :color="
                  pv.spec.persistentVolumeReclaimPolicy === 'Retain'
                    ? 'warning'
                    : 'default'
                "
              >
                {{ pv.spec.persistentVolumeReclaimPolicy || 'Delete' }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="卷模式">
              {{ pv.spec.volumeMode || 'Filesystem' }}
            </Descriptions.Item>
            <Descriptions.Item label="存储后端">
              <Tag color="cyan">
                {{ storageBackendType }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" :span="2">
              {{ formatDateTime(pv.metadata.creationTimestamp) }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 规格配置标签页 -->
        <Tabs.TabPane key="spec" tab="规格配置">
          <div class="spec-section">
            <h4 class="section-title">存储后端配置</h4>
            <Descriptions :column="1" bordered size="small">
              <Descriptions.Item label="后端类型">
                <Tag color="cyan">{{ storageBackendType }}</Tag>
              </Descriptions.Item>
              <Descriptions.Item
                v-for="config in storageBackendConfig"
                :key="config.label"
                :label="config.label"
              >
                {{ config.value }}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div
            v-if="pv.spec.mountOptions && pv.spec.mountOptions.length > 0"
            class="spec-section"
          >
            <h4 class="section-title">挂载选项</h4>
            <div class="mount-options">
              <Tag
                v-for="option in pv.spec.mountOptions"
                :key="option"
                color="blue"
              >
                {{ option }}
              </Tag>
            </div>
          </div>

          <div v-if="pv.spec.nodeAffinity" class="spec-section">
            <h4 class="section-title">节点亲和性</h4>
            <pre class="json-content">{{
              JSON.stringify(pv.spec.nodeAffinity, null, 2)
            }}</pre>
          </div>
        </Tabs.TabPane>

        <!-- 绑定关系标签页 -->
        <Tabs.TabPane key="binding" tab="绑定关系">
          <div v-if="pv.spec.claimRef" class="binding-section">
            <h4 class="section-title">绑定的 PVC</h4>
            <Descriptions :column="2" bordered size="small">
              <Descriptions.Item label="PVC 名称">
                {{ pv.spec.claimRef.name }}
              </Descriptions.Item>
              <Descriptions.Item label="命名空间">
                {{ pv.spec.claimRef.namespace }}
              </Descriptions.Item>
              <Descriptions.Item label="PVC UID" :span="2">
                {{ pv.spec.claimRef.uid }}
              </Descriptions.Item>
            </Descriptions>

            <div class="binding-info">
              <Alert
                message="此 PV 已绑定到 PVC"
                :description="`PVC: ${pv.spec.claimRef.namespace}/${pv.spec.claimRef.name}`"
                type="info"
                show-icon
              />
            </div>
          </div>
          <div v-else class="binding-section">
            <Alert
              message="未绑定"
              description="此 PV 尚未绑定到任何 PVC"
              type="warning"
              show-icon
            />
          </div>
        </Tabs.TabPane>

        <!-- 标签标签页 -->
        <Tabs.TabPane key="labels" tab="标签">
          <div v-if="labels.length > 0" class="label-list">
            <Tag v-for="label in labels" :key="label.key" class="label-tag">
              <strong>{{ label.key }}:</strong> {{ label.value }}
            </Tag>
          </div>
          <div v-else class="empty-text">无标签</div>
        </Tabs.TabPane>

        <!-- 注解标签页 -->
        <Tabs.TabPane key="annotations" tab="注解">
          <div v-if="annotations.length > 0" class="annotation-list">
            <div
              v-for="anno in annotations"
              :key="anno.key"
              class="annotation-item"
            >
              <strong>{{ anno.key }}:</strong>
              <div class="annotation-value">{{ anno.value }}</div>
            </div>
          </div>
          <div v-else class="empty-text">无注解</div>
        </Tabs.TabPane>

        <!-- YAML 配置标签页 -->
        <Tabs.TabPane key="yaml" tab="YAML 配置">
          <div class="yaml-actions">
            <Button type="primary" size="small" @click="copyYaml">
              复制 YAML
            </Button>
            <Button size="small" @click="downloadYaml"> 下载 YAML </Button>
          </div>
          <div class="yaml-wrapper">
            <div class="yaml-content">
              <pre>{{ pvYaml }}</pre>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <div v-else class="empty-text">未选择 PersistentVolume</div>
  </Drawer>
</template>

<style scoped>
.detail-drawer-content {
  height: 100%;
  padding-bottom: 24px;
}

.detail-tabs {
  height: 100%;
}

.detail-tabs :deep(.ant-tabs-content) {
  height: calc(100vh - 180px);
  overflow-y: auto;
}

.detail-tabs :deep(.ant-tabs-tabpane) {
  padding: 16px 0;
}

.detail-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}

.access-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.spec-section {
  margin-bottom: 24px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vben-text-color);
}

.mount-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.json-content {
  padding: 12px;
  margin: 0;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--vben-text-color);
  background-color: var(--vben-background-color-deep);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.binding-section {
  padding: 16px 0;
}

.binding-info {
  margin-top: 16px;
}

.label-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label-tag {
  padding: 6px 12px;
  margin: 0;
  font-size: 13px;
}

.annotation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.annotation-item {
  padding: 12px;
  font-size: 13px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.annotation-item strong {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--vben-text-color);
}

.annotation-value {
  padding: 8px;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--vben-text-color-secondary);
  word-break: break-all;
  background-color: rgb(0 0 0 / 2%);
  border-radius: 2px;
}

html[data-theme='dark'] .annotation-value {
  background-color: rgb(255 255 255 / 5%);
}

.empty-text {
  padding: 32px;
  font-size: 14px;
  color: var(--vben-text-color-secondary);
  text-align: center;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
  background-color: var(--vben-background-color);
}

/* YAML 配置样式 */
.yaml-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 4px;
}

.yaml-wrapper {
  padding: 12px;
  background-color: var(--vben-background-color);
  border: 1px solid var(--vben-border-color);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
}

.yaml-content {
  max-height: calc(100vh - 320px);
  padding: 16px;
  overflow: auto;
  background-color: var(--vben-background-color-deep);
  border: 2px solid #808080;
  border-radius: 4px;
}

html[data-theme='dark'] .yaml-content {
  border-color: #fff !important;
}

html[data-theme='light'] .yaml-content,
html:not([data-theme]) .yaml-content {
  border-color: #808080 !important;
}

.yaml-content pre {
  margin: 0;
  font-family: Menlo, Monaco, 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vben-text-color);
  word-wrap: normal;
  white-space: pre;
}

.yaml-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.yaml-content::-webkit-scrollbar-track {
  background-color: var(--vben-background-color);
}

.yaml-content::-webkit-scrollbar-thumb {
  background-color: var(--vben-border-color);
  border-radius: 4px;
}

.yaml-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--vben-text-color-secondary);
}
</style>
