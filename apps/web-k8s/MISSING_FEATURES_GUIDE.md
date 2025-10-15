# 缺失功能实现指南

本文档详细说明了所有标记为"功能开发中"的操作功能的实现方案。

---

## 📊 缺失功能总览

| # | 功能 | 状态 | 优先级 | 预计工作量 |
|---|------|------|--------|----------|
| 1 | Deployment 扩缩容 | ✅ 已完成 | P0 | - |
| 2 | StatefulSet 扩缩容 | ⏳ 待实现 | P0 | 15分钟 |
| 3 | Pod 日志查看 | ⏳ 待实现 | P0 | 10分钟 |
| 4 | Deployment 重启 | ⏳ 待实现 | P1 | 20分钟 |
| 5 | CronJob 暂停/启用 | ⏳ 待实现 | P1 | 15分钟 |
| 6 | Job 日志查看 | ⏳ 待实现 | P2 | 15分钟 |
| 7 | 通用编辑功能 | ⏳ 待实现 | P2 | 2小时+ |

---

## ✅ 1. Deployment 扩缩容（已完成）

### 实现内容

1. **创建了 ScaleModal 组件**
   - 文件：`src/views/k8s/_shared/ScaleModal.vue`
   - 功能：通用扩缩容模态框，支持 Deployment 和 StatefulSet

2. **更新了 Deployments 页面**
   - 文件：`src/views/k8s/workloads/deployments/index.vue`
   - 集成了 ScaleModal
   - 添加了扩缩容处理逻辑

### 使用方法

用户点击 Deployment 列表的"扩缩容"按钮 → 弹出 ScaleModal → 输入新的副本数 → 确认 → 调用 API 更新

---

## ⏳ 2. StatefulSet 扩缩容（待实现）

### 实现方案

StatefulSet 扩缩容与 Deployment 完全相同，可以复用 ScaleModal。

### 实现步骤

#### 步骤 1：创建 StatefulSet 页面

由于 StatefulSet 使用 ResourceList，需要创建专门的页面：

```bash
# 创建目录
mkdir -p src/views/k8s/workloads/statefulsets

# 创建页面文件
touch src/views/k8s/workloads/statefulsets/index.vue
```

#### 步骤 2：实现页面内容

```vue
<script setup lang="ts">
import type { StatefulSet } from '#/api/k8s/types';
import { computed, ref } from 'vue';
import { message, Tag } from 'ant-design-vue';
import { createStatefulSetConfig } from '#/config/k8s-resources';
import ResourceList from '#/views/k8s/_shared/ResourceList.vue';
import ScaleModal from '#/views/k8s/_shared/ScaleModal.vue';

defineOptions({ name: 'StatefulSetsManagement' });

// 扩缩容模态框状态
const scaleModalVisible = ref(false);
const scalingStatefulSet = ref<StatefulSet | null>(null);
const resourceListRef = ref();

// 打开扩缩容模态框
function openScaleModal(sts: StatefulSet) {
  scalingStatefulSet.value = sts;
  scaleModalVisible.value = true;
}

// 处理扩缩容确认
async function handleScaleConfirm(replicas: number) {
  if (!scalingStatefulSet.value) return;

  try {
    // TODO: 调用 API
    message.success(`StatefulSet "${scalingStatefulSet.value.metadata.name}" 副本数已更新为 ${replicas}`);
    scaleModalVisible.value = false;
    resourceListRef.value?.refresh();
  } catch (error: any) {
    message.error(`扩缩容失败: ${error.message}`);
  }
}

const config = computed(() => {
  const baseConfig = createStatefulSetConfig();

  // 覆盖 scale 操作
  if (baseConfig.actions) {
    const scaleActionIndex = baseConfig.actions.findIndex(a => a.action === 'scale');
    if (scaleActionIndex !== -1) {
      baseConfig.actions[scaleActionIndex] = {
        action: 'scale',
        label: '扩缩容',
        handler: (row: StatefulSet) => openScaleModal(row),
      };
    }
  }

  return baseConfig;
});
</script>

<template>
  <div>
    <ResourceList ref="resourceListRef" :config="config">
      <template #ready-slot="{ row }">
        <Tag :color="row.status?.readyReplicas === row.spec.replicas ? 'success' : 'warning'">
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
  </div>
</template>
```

#### 步骤 3：更新路由

```typescript
// src/router/routes/modules/k8s.ts
{
  name: 'K8sStatefulSets',
  path: 'statefulsets',
  component: () => import('#/views/k8s/workloads/statefulsets/index.vue'),  // 更新路径
  meta: {
    icon: 'lucide:database',
    title: 'StatefulSets',
  },
},
```

---

## ⏳ 3. Pod 日志查看（待实现）

### 现状

- ✅ LogDrawer 组件已存在：`src/views/k8s/workloads/pods/LogDrawer.vue`
- ❌ 但未在 Pods 列表中接入

### 实现方案

更新 Pods 页面，接入现有的 LogDrawer。

### 实现步骤

#### 步骤 1：更新 Pods 页面

```vue
<script setup lang="ts">
// ... 现有代码

// 添加日志抽屉状态
const logDrawerVisible = ref(false);
const logPod = ref<Pod | null>(null);

// 打开日志抽屉
function openLogDrawer(pod: Pod) {
  logPod.value = pod;
  logDrawerVisible.value = true;
}

// 在 config 中覆盖 logs 操作
const config = computed(() => {
  const baseConfig = createPodConfig();

  if (baseConfig.actions) {
    const logsActionIndex = baseConfig.actions.findIndex(a => a.action === 'logs');
    if (logsActionIndex !== -1) {
      baseConfig.actions[logsActionIndex] = {
        action: 'logs',
        label: '日志',
        handler: (row: Pod) => openLogDrawer(row),
      };
    }
  }

  return baseConfig;
});
</script>

<template>
  <div>
    <ResourceList :config="config" />

    <!-- 日志抽屉 -->
    <LogDrawer
      v-model:visible="logDrawerVisible"
      :pod="logPod"
    />
  </div>
</template>
```

---

## ⏳ 4. Deployment 重启（待实现）

### 实现方案

Kubernetes 中重启 Deployment 的方法是更新 Pod Template 的 annotation，触发滚动更新。

### 实现步骤

#### 步骤 1：更新配置文件

```typescript
// src/config/k8s-resources.ts

// 在 createDeploymentConfig 中更新 restart 操作
{
  action: 'restart',
  label: '重启',
  handler: (row: Deployment) => {
    Modal.confirm({
      title: '确认重启',
      content: `确定要重启 Deployment "${row.metadata.name}" 吗？这将触发滚动更新，重新创建所有 Pod。`,
      onOk: async () => {
        try {
          // TODO: 调用 API
          // 更新 annotation: kubectl.kubernetes.io/restartedAt: new Date().toISOString()

          message.success(`Deployment "${row.metadata.name}" 正在重启`);
        } catch (error: any) {
          message.error(`重启失败: ${error.message}`);
        }
      },
    });
  },
},
```

#### API 调用示例

```typescript
// 伪代码
async function restartDeployment(namespace: string, name: string) {
  const patch = {
    spec: {
      template: {
        metadata: {
          annotations: {
            'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
          }
        }
      }
    }
  };

  await apiClient.patch(
    `/apis/apps/v1/namespaces/${namespace}/deployments/${name}`,
    patch
  );
}
```

---

## ⏳ 5. CronJob 暂停/启用（待实现）

### 实现方案

切换 CronJob 的 `spec.suspend` 字段。

### 实现步骤

#### 更新配置文件

```typescript
// src/config/k8s-resources.ts

{
  action: 'toggle',
  label: row => (row.spec.suspend ? '启用' : '暂停'),
  handler: async (row: CronJob) => {
    const action = row.spec.suspend ? '启用' : '暂停';
    const newSuspend = !row.spec.suspend;

    Modal.confirm({
      title: `确认${action}`,
      content: `确定要${action} CronJob "${row.metadata.name}" 吗？`,
      onOk: async () => {
        try {
          // TODO: 调用 API
          // 更新 spec.suspend = newSuspend

          message.success(`CronJob "${row.metadata.name}" 已${action}`);
        } catch (error: any) {
          message.error(`${action}失败: ${error.message}`);
        }
      },
    });
  },
},
```

#### API 调用示例

```typescript
async function toggleCronJob(namespace: string, name: string, suspend: boolean) {
  const patch = {
    spec: {
      suspend: suspend
    }
  };

  await apiClient.patch(
    `/apis/batch/v1/namespaces/${namespace}/cronjobs/${name}`,
    patch
  );
}
```

---

## ⏳ 6. Job 日志查看（待实现）

### 实现方案

Job 的日志实际上是其 Pod 的日志。需要：
1. 获取 Job 关联的 Pods
2. 显示 Pod 日志

### 实现步骤

#### 步骤 1：创建 Job 日志抽屉

可以复用 Pod 的 LogDrawer，但需要先获取 Job 的 Pod。

#### 步骤 2：更新配置

```typescript
// src/config/k8s-resources.ts

{
  action: 'logs',
  label: '日志',
  handler: async (row: Job) => {
    try {
      // 1. 获取 Job 的 Pods
      const pods = await getJobPods(row.metadata.namespace, row.metadata.name);

      if (pods.length === 0) {
        message.warning('该 Job 没有运行的 Pod');
        return;
      }

      // 2. 打开第一个 Pod 的日志
      // 或者显示 Pod 列表让用户选择
      openLogDrawer(pods[0]);
    } catch (error: any) {
      message.error(`获取日志失败: ${error.message}`);
    }
  },
},
```

---

## ⏳ 7. 通用编辑功能（待实现）

### 实现方案（两种选择）

#### 方案 A：YAML 编辑器（推荐）

使用 Monaco Editor 创建 YAML 编辑模态框。

**优点**：
- 适用于所有资源类型
- 完全符合 Kubernetes 规范
- 支持语法高亮和验证

**缺点**：
- 需要安装 Monaco Editor
- 开发工作量较大（~2小时）

**实现步骤**：

```bash
# 1. 安装依赖
pnpm add monaco-editor @monaco-editor/react

# 2. 创建 YAMLEditorModal.vue
# 文件：src/views/k8s/_shared/YAMLEditorModal.vue
```

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import * as monaco from 'monaco-editor';
import yaml from 'js-yaml';

defineOptions({ name: 'YAMLEditorModal' });

interface Props {
  visible: boolean;
  resource: any;
  resourceType: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', resource: any): void;
}>();

const yamlContent = ref('');
const loading = ref(false);

watch(() => props.resource, (newResource) => {
  if (newResource) {
    yamlContent.value = yaml.dump(newResource);
  }
}, { immediate: true });

async function handleOk() {
  try {
    // 解析 YAML
    const updatedResource = yaml.load(yamlContent.value);

    loading.value = true;
    emit('confirm', updatedResource);
  } catch (error: any) {
    message.error(`YAML 格式错误: ${error.message}`);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Modal
    :open="visible"
    :title="`编辑 ${resourceType}`"
    width="900px"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="emit('update:visible', false)"
  >
    <!-- Monaco Editor -->
    <div style="height: 600px;">
      <MonacoEditor
        v-model="yamlContent"
        language="yaml"
        theme="vs-dark"
      />
    </div>
  </Modal>
</template>
```

#### 方案 B：表单编辑器（针对特定资源）

为每种资源类型创建专门的表单编辑器。

**优点**：
- 用户体验更好
- 有字段验证

**缺点**：
- 需要为每种资源创建表单
- 开发工作量大
- 维护成本高

---

## 📋 实现优先级建议

### 立即实现（P0）

1. ✅ **Deployment 扩缩容** - 已完成
2. **StatefulSet 扩缩容** - 15分钟（复用 ScaleModal）
3. **Pod 日志查看** - 10分钟（LogDrawer 已存在）

### 尽快实现（P1）

4. **Deployment 重启** - 20分钟
5. **CronJob 暂停/启用** - 15分钟

### 可选实现（P2）

6. **Job 日志查看** - 15分钟
7. **通用编辑功能** - 2小时+（建议使用 YAML 编辑器）

---

## 🎯 快速实现清单

如果要快速完成所有 P0 和 P1 功能，按照以下顺序：

1. **5分钟** - StatefulSet 扩缩容（复制 Deployment 代码）
2. **5分钟** - Pod 日志查看（接入现有 LogDrawer）
3. **10分钟** - Deployment 重启（更新 annotation）
4. **10分钟** - CronJob 暂停/启用（切换 suspend）

**总计：约 30 分钟可完成所有核心运维功能！**

---

## 🔧 API 对接说明

所有功能都标记了 `TODO: 调用真实 API`。实际对接时：

1. **扩缩容**: `PATCH /apis/apps/v1/namespaces/{ns}/deployments/{name}`
   ```json
   { "spec": { "replicas": 3 } }
   ```

2. **重启**: `PATCH /apis/apps/v1/namespaces/{ns}/deployments/{name}`
   ```json
   {
     "spec": {
       "template": {
         "metadata": {
           "annotations": {
             "kubectl.kubernetes.io/restartedAt": "2025-10-15T10:00:00Z"
           }
         }
       }
     }
   }
   ```

3. **CronJob 暂停**: `PATCH /apis/batch/v1/namespaces/{ns}/cronjobs/{name}`
   ```json
   { "spec": { "suspend": true } }
   ```

4. **日志**: `GET /api/v1/namespaces/{ns}/pods/{name}/log?container={container}`

---

## 📝 总结

- ✅ **已完成 1/7**: Deployment 扩缩容
- ⏳ **待实现 6/7**: 其他功能
- 🚀 **预计时间**: P0+P1 功能约 1小时可完成

所有功能的技术方案已明确，代码示例已提供，可以直接按照指南实现。

---

**文档创建时间**：2025-10-15
**最后更新**：2025-10-15
