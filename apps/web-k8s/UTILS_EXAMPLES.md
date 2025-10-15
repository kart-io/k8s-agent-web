# K8s 工具函数使用示例

本文档展示如何使用 `src/utils/k8s.ts` 中的各种工具函数。

## 时间格式化

### formatRelativeTime - 相对时间

将 ISO 8601 时间字符串转换为相对时间（如：5分钟前、2小时前）。

```typescript
import { formatRelativeTime } from '#/utils/k8s';

const createdAt = '2025-10-15T08:00:00Z';
console.log(formatRelativeTime(createdAt)); // "2小时前"

// 在组件中使用
<template>
  <span>{{ formatRelativeTime(pod.metadata.creationTimestamp) }}</span>
</template>
```

### formatDateTime - 完整时间

格式化为本地化的完整日期时间。

```typescript
import { formatDateTime } from '#/utils/k8s';

const timestamp = '2025-10-15T08:00:00Z';
console.log(formatDateTime(timestamp)); // "2025/10/15 16:00:00"

// 在 Tooltip 中显示完整时间
<template>
  <Tooltip :title="formatDateTime(pod.metadata.creationTimestamp)">
    <span>{{ formatRelativeTime(pod.metadata.creationTimestamp) }}</span>
  </Tooltip>
</template>
```

## 资源格式化

### formatBytes - 字节大小

将字节数转换为人类可读的格式。

```typescript
import { formatBytes } from '#/utils/k8s';

console.log(formatBytes(1024));           // "1 KB"
console.log(formatBytes(1048576));        // "1 MB"
console.log(formatBytes(1073741824));     // "1 GB"
console.log(formatBytes(1234567890, 3));  // "1.150 GB" (3 位小数)
```

### formatK8sCapacity - K8s 存储容量

将 Kubernetes 存储格式转换为易读格式。

```typescript
import { formatK8sCapacity } from '#/utils/k8s';

console.log(formatK8sCapacity('10Gi'));   // "10 GB"
console.log(formatK8sCapacity('500Mi'));  // "500 MB"
console.log(formatK8sCapacity('1Ti'));    // "1 TB"

// 在表格中显示存储容量
<template>
  <Table :columns="columns" :data-source="pvList">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'capacity'">
        {{ formatK8sCapacity(record.spec.capacity.storage) }}
      </template>
    </template>
  </Table>
</template>
```

### formatCpu - CPU 资源

格式化 CPU 资源值。

```typescript
import { formatCpu } from '#/utils/k8s';

console.log(formatCpu('500m'));  // "500m (0.50 Cores)"
console.log(formatCpu('2'));     // "2 Cores"
console.log(formatCpu(1.5));     // "1.5 Cores"
```

### formatResources - 综合资源

格式化资源请求或限制对象。

```typescript
import { formatResources } from '#/utils/k8s';

const resources = {
  cpu: '500m',
  memory: '512Mi'
};

console.log(formatResources(resources));
// "CPU: 500m (0.50 Cores), Memory: 512 MB"

// 在 Pod 详情中显示
<template>
  <Descriptions>
    <Descriptions.Item label="资源请求">
      {{ formatResources(pod.spec.containers[0].resources.requests) }}
    </Descriptions.Item>
    <Descriptions.Item label="资源限制">
      {{ formatResources(pod.spec.containers[0].resources.limits) }}
    </Descriptions.Item>
  </Descriptions>
</template>
```

## 状态和颜色

### getPodStatusColor - Pod 状态颜色

获取 Pod 状态对应的 Ant Design 颜色。

```typescript
import { getPodStatusColor } from '#/utils/k8s';

console.log(getPodStatusColor('Running'));     // "success"
console.log(getPodStatusColor('Failed'));      // "error"
console.log(getPodStatusColor('Pending'));     // "warning"

// 在状态标签中使用
<template>
  <Tag :color="getPodStatusColor(pod.status.phase)">
    {{ pod.status.phase }}
  </Tag>
</template>
```

### getNodeStatusColor - 节点状态颜色

获取节点状态颜色。

```typescript
import { getNodeStatusColor } from '#/utils/k8s';

console.log(getNodeStatusColor('Ready'));      // "success"
console.log(getNodeStatusColor('NotReady'));   // "error"

// 在节点列表中使用
<template>
  <Tag :color="getNodeStatusColor(node.status)">
    {{ node.status }}
  </Tag>
</template>
```

## 验证函数

### isValidK8sName - 验证资源名称

检查名称是否符合 Kubernetes 命名规范。

```typescript
import { isValidK8sName } from '#/utils/k8s';

console.log(isValidK8sName('my-app'));        // true
console.log(isValidK8sName('my_app'));        // false (不能有下划线)
console.log(isValidK8sName('MyApp'));         // false (必须小写)
console.log(isValidK8sName('-my-app'));       // false (不能以 - 开头)

// 在表单验证中使用
const validateName = (rule: any, value: string) => {
  if (!value) {
    return Promise.reject('请输入名称');
  }
  if (!isValidK8sName(value)) {
    return Promise.reject('名称必须为小写字母、数字、- 和 .，不能以 - 或 . 开头或结尾');
  }
  return Promise.resolve();
};
```

### isValidLabelKey / isValidLabelValue - 验证标签

检查标签键和值是否有效。

```typescript
import { isValidLabelKey, isValidLabelValue } from '#/utils/k8s';

// 标签键
console.log(isValidLabelKey('app'));                    // true
console.log(isValidLabelKey('kubernetes.io/name'));     // true (带前缀)
console.log(isValidLabelKey('invalid@key'));            // false

// 标签值
console.log(isValidLabelValue('production'));           // true
console.log(isValidLabelValue('v1.0.0'));              // true
console.log(isValidLabelValue(''));                     // true (空值允许)
console.log(isValidLabelValue('invalid value'));       // false (不能有空格)

// 在 Label 编辑器中使用
const validateLabel = (key: string, value: string) => {
  if (!isValidLabelKey(key)) {
    message.error('无效的标签键');
    return false;
  }
  if (!isValidLabelValue(value)) {
    message.error('无效的标签值');
    return false;
  }
  return true;
};
```

## 计算和转换

### calculatePercentage - 百分比计算

计算资源使用百分比。

```typescript
import { calculatePercentage } from '#/utils/k8s';

const used = 75;
const total = 100;
console.log(calculatePercentage(used, total)); // 75

// 在进度条中使用
<template>
  <Progress
    :percent="calculatePercentage(quota.used.cpu, quota.hard.cpu)"
  />
</template>
```

### getChartColor - 图表颜色

为图表获取一致的颜色。

```typescript
import { getChartColor } from '#/utils/k8s';

console.log(getChartColor(0)); // "#1890ff"
console.log(getChartColor(1)); // "#52c41a"
console.log(getChartColor(2)); // "#faad14"

// 在图表中使用
const chartData = storageClasses.map((sc, index) => ({
  name: sc.name,
  value: sc.pvCount,
  color: getChartColor(index)
}));
```

## 工具函数

### truncateText - 文本截断

截断过长的文本并添加省略号。

```typescript
import { truncateText } from '#/utils/k8s';

const longText = 'This is a very long text that needs to be truncated';
console.log(truncateText(longText, 20)); // "This is a very long..."

// 在表格单元格中使用
<template>
  <Tooltip :title="record.description">
    {{ truncateText(record.description, 50) }}
  </Tooltip>
</template>
```

### copyToClipboard - 复制到剪贴板

将文本复制到剪贴板。

```typescript
import { copyToClipboard } from '#/utils/k8s';
import { message } from 'ant-design-vue';

async function handleCopy(text: string) {
  const success = await copyToClipboard(text);
  if (success) {
    message.success('已复制到剪贴板');
  } else {
    message.error('复制失败');
  }
}

// 在按钮中使用
<template>
  <Button @click="handleCopy(pod.metadata.uid)">
    复制 UID
  </Button>
</template>
```

### downloadTextFile - 下载文件

下载文本内容为文件。

```typescript
import { downloadTextFile } from '#/utils/k8s';

function downloadPodYaml(pod: Pod) {
  const yamlContent = toYaml(pod);
  downloadTextFile(
    yamlContent,
    `${pod.metadata.name}.yaml`,
    'application/x-yaml'
  );
}

// 在导出按钮中使用
<template>
  <Button @click="downloadPodYaml(pod)">
    导出 YAML
  </Button>
</template>
```

### debounce - 防抖

延迟函数执行，避免频繁调用。

```typescript
import { debounce } from '#/utils/k8s';

// 搜索输入防抖
const handleSearch = debounce((keyword: string) => {
  searchPods(keyword);
}, 300);

// 在搜索框中使用
<template>
  <Input
    placeholder="搜索 Pod"
    @input="handleSearch($event.target.value)"
  />
</template>
```

### throttle - 节流

限制函数执行频率。

```typescript
import { throttle } from '#/utils/k8s';

// 滚动事件节流
const handleScroll = throttle(() => {
  console.log('Scrolling...');
}, 500);

// 在组件中使用
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
```

### delay - 延迟执行

延迟指定时间后执行。

```typescript
import { delay } from '#/utils/k8s';

async function retryOperation() {
  for (let i = 0; i < 3; i++) {
    try {
      await performOperation();
      break;
    } catch (error) {
      if (i < 2) {
        await delay(1000); // 等待 1 秒后重试
      }
    }
  }
}
```

## 综合示例

### Pod 列表组件

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { Table, Tag, Tooltip, Button, Input, message } from 'ant-design-vue';
import {
  formatRelativeTime,
  formatDateTime,
  formatResources,
  getPodStatusColor,
  truncateText,
  copyToClipboard,
  debounce,
} from '#/utils/k8s';
import type { Pod } from '#/api/k8s/types';

const pods = ref<Pod[]>([]);
const searchKeyword = ref('');

// 搜索防抖
const handleSearch = debounce((keyword: string) => {
  searchKeyword.value = keyword;
}, 300);

// 筛选后的 Pods
const filteredPods = computed(() => {
  if (!searchKeyword.value) return pods.value;
  return pods.value.filter(pod =>
    pod.metadata.name.includes(searchKeyword.value)
  );
});

// 复制 UID
async function handleCopyUid(uid: string) {
  const success = await copyToClipboard(uid);
  if (success) {
    message.success('UID 已复制');
  }
}
</script>

<template>
  <div class="pod-list">
    <Input
      placeholder="搜索 Pod"
      @input="handleSearch($event.target.value)"
    />

    <Table :dataSource="filteredPods" :rowKey="record => record.metadata.uid">
      <Column title="名称" dataIndex={['metadata', 'name']}>
        <template #default="{ text }">
          <Tooltip :title="text">
            {{ truncateText(text, 30) }}
          </Tooltip>
        </template>
      </Column>

      <Column title="状态">
        <template #default="{ record }">
          <Tag :color="getPodStatusColor(record.status.phase)">
            {{ record.status.phase }}
          </Tag>
        </template>
      </Column>

      <Column title="资源">
        <template #default="{ record }">
          <div>
            <div>请求: {{ formatResources(record.spec.containers[0].resources?.requests) }}</div>
            <div>限制: {{ formatResources(record.spec.containers[0].resources?.limits) }}</div>
          </div>
        </template>
      </Column>

      <Column title="创建时间">
        <template #default="{ record }">
          <Tooltip :title="formatDateTime(record.metadata.creationTimestamp)">
            {{ formatRelativeTime(record.metadata.creationTimestamp) }}
          </Tooltip>
        </template>
      </Column>

      <Column title="操作">
        <template #default="{ record }">
          <Button
            size="small"
            @click="handleCopyUid(record.metadata.uid)"
          >
            复制 UID
          </Button>
        </template>
      </Column>
    </Table>
  </div>
</template>
```

## 总结

这些工具函数覆盖了 Kubernetes 管理平台开发中的常见需求：

- **时间处理**：相对时间和完整时间格式化
- **资源格式化**：字节、CPU、内存、K8s 容量
- **状态管理**：状态颜色映射
- **验证**：K8s 命名规范验证
- **计算**：百分比、颜色选择
- **工具**：文本截断、剪贴板、文件下载、防抖节流

使用这些函数可以让代码更简洁、更易维护，并保持整个应用的一致性。
