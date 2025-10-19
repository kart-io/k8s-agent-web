# 编辑集群功能 - 从 API 获取数据

## 概述

本文档描述了集群编辑功能的实现，重点说明了如何在编辑时从服务器 API 获取最新的集群详情数据，而不是直接使用列表中的缓存数据。

## 问题背景

**原始问题**: 编辑集群时直接使用列表页面中的集群数据，这些数据可能已经过时，不是最新的。

**解决方案**: 在打开编辑对话框时，先调用集群详情接口 (`GET /api/k8s/clusters/:id`) 获取最新数据，然后再进行编辑。

## 实现细节

### 1. 数据流程

```
用户点击"编辑"按钮
    ↓
handleEdit(row) - 传递集群对象（仅包含 id）
    ↓
打开 EditClusterModal，触发 watch
    ↓
loadClusterDetail(clusterId) - 调用 API 获取详情
    ↓
clusterApi.detail(clusterId) - GET /api/k8s/clusters/:id
    ↓
服务器返回最新的集群完整数据
    ↓
initForm(detail) - 使用服务器数据初始化表单
    ↓
用户修改表单数据
    ↓
handleOk() - 调用 update API
    ↓
clusterApi.update(id, formData) - PUT /api/k8s/clusters/:id
```

### 2. 核心代码变更

#### EditClusterModal.vue

**新增状态管理**:

```typescript
// 加载状态
const loading = ref(false);

// 从服务器获取的完整集群数据
const clusterDetail = ref<Cluster | null>(null);
```

**修改 watch 逻辑**:

```typescript
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
```

**新增数据加载函数**:

```typescript
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
    message.error('获取集群详情失败: ' + (error.message || '未知错误'));

    // 关闭对话框
    emit('update:visible', false);
  } finally {
    loading.value = false;
  }
}
```

**更新提交函数**:

```typescript
// 处理提交
async function handleOk() {
  if (!clusterDetail.value) {
    return;
  }

  try {
    // 验证表单
    await formRef.value?.validate();

    submitLoading.value = true;

    // 调用 API 更新集群（使用 clusterDetail.value.id）
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
    message.error('更新集群失败: ' + (error.message || '未知错误'));
  } finally {
    submitLoading.value = false;
  }
}
```

**模板更新**:

```vue
<template>
  <Modal
    :open="visible"
    :confirm-loading="submitLoading"
    title="编辑集群"
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <!-- 加载状态显示 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">加载中...</div>
    </div>

    <!-- 表单（加载完成后显示） -->
    <Form
      v-else
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 19 }"
    >
      <!-- 表单项... -->

      <Form.Item label="API Server">
        <Input
          :value="clusterDetail?.apiServer"
          disabled
          placeholder="API Server 地址（不可修改）"
        />
      </Form.Item>
    </Form>

    <!-- 只读信息面板（使用 clusterDetail 数据） -->
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
      <div class="info-item">
        <span class="info-label">创建时间:</span>
        <span class="info-value">{{ clusterDetail?.createdAt }}</span>
      </div>
    </div>
  </Modal>
</template>
```

**新增样式**:

```css
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-spinner {
  font-size: 16px;
  color: var(--vben-primary-color, #1890ff);
}
```

### 3. API 接口

#### 集群详情 API

**请求**:

```
GET /api/k8s/clusters/:id
```

**响应**:

```json
{
  "id": "cluster-xxx",
  "name": "minikube-local",
  "description": "本地 Minikube 开发集群",
  "apiServer": "https://127.0.0.1:32771",
  "status": "healthy",
  "version": "v1.28.0",
  "nodeCount": 1,
  "podCount": 15,
  "namespaceCount": 5,
  "region": "local",
  "provider": "minikube",
  "labels": {
    "env": "development",
    "type": "minikube",
    "location": "local"
  },
  "createdAt": "2025-10-18T13:58:39Z",
  "updatedAt": "2025-10-18T14:30:00Z"
}
```

#### 集群更新 API

**请求**:

```
PUT /api/k8s/clusters/:id
Content-Type: application/json

{
  "name": "minikube-local-updated",
  "description": "更新后的描述",
  "labels": {
    "env": "development",
    "type": "minikube",
    "location": "local",
    "updated": "true"
  }
}
```

**响应**: 返回更新后的完整集群对象。

## 用户体验优化

### 1. 加载状态提示

当对话框打开时，显示"加载中..."提示，用户可以明确知道系统正在获取数据。

```
┌──────────────────────┐
│   编辑集群           │
├──────────────────────┤
│                      │
│     加载中...        │
│                      │
└──────────────────────┘
```

### 2. 错误处理

如果获取集群详情失败：

- 显示错误消息："获取集群详情失败: [错误信息]"
- 自动关闭编辑对话框
- 用户返回到集群列表页面

```typescript
try {
  const detail = await clusterApi.detail(clusterId);
  clusterDetail.value = detail;
  initForm(detail);
} catch (error: any) {
  console.error('获取集群详情失败:', error);
  message.error('获取集群详情失败: ' + (error.message || '未知错误'));

  // 关闭对话框，防止用户编辑过时数据
  emit('update:visible', false);
}
```

### 3. 数据一致性保证

- **打开对话框时**: 始终从服务器获取最新数据
- **显示时**: 使用 `clusterDetail` 而不是 `props.cluster`
- **提交时**: 使用 `clusterDetail.value.id` 确保操作的是正确的集群

## 与列表页面的集成

### clusters/index.vue

编辑按钮的处理逻辑：

```typescript
// 编辑集群
function handleEdit(row: Cluster) {
  // 只传递集群对象（包含 id），EditClusterModal 会自己获取详情
  clusterToEdit.value = row;
  editClusterVisible.value = true;
}

// 编辑成功回调
function handleEditSuccess() {
  // 刷新列表以显示更新后的数据
  gridApi.reload();
}
```

模板中的使用：

```vue
<EditClusterModal
  v-model:visible="editClusterVisible"
  :cluster="clusterToEdit"
  @success="handleEditSuccess"
/>
```

## 优势

### 1. 数据准确性

- 始终使用服务器最新数据
- 避免编辑过时的缓存数据
- 减少数据不一致的风险

### 2. 安全性

- 服务器端是唯一的真实数据源
- 客户端缓存仅用于显示，不用于编辑
- 更新操作基于最新状态

### 3. 可维护性

- 清晰的数据流向
- 单一数据源原则
- 便于调试和追踪问题

### 4. 扩展性

- 可以轻松添加更多字段
- 支持复杂的数据验证
- 便于添加权限控制

## 完整的编辑流程示例

### 场景：更新集群标签

1. **用户操作**: 在集群列表中点击"编辑"按钮

2. **系统行为**:

   ```
   加载中... (loading = true)
   ↓
   调用 GET /api/k8s/clusters/cluster-123
   ↓
   收到最新数据: {
     id: "cluster-123",
     name: "minikube-local",
     labels: { env: "dev", type: "minikube" },
     ...
   }
   ↓
   初始化表单 (loading = false)
   ↓
   显示表单和只读信息
   ```

3. **用户编辑**:
   - 添加新标签: `location: local`
   - 修改描述

4. **提交更新**:
   ```
   提交中... (submitLoading = true)
   ↓
   调用 PUT /api/k8s/clusters/cluster-123
   Body: {
     name: "minikube-local",
     description: "新的描述",
     labels: {
       env: "dev",
       type: "minikube",
       location: "local"
     }
   }
   ↓
   成功: "集群更新成功"
   ↓
   关闭对话框 (submitLoading = false)
   ↓
   刷新列表 (gridApi.reload())
   ```

## 与后端 API 对齐

### 后端接口定义

参考 `@cluster-service/internal/handler/k8s_api.go`:

```go
// GetCluster 获取集群详情
func (h *K8sAPIHandler) GetCluster(c *gin.Context) {
    id := c.Param("id")
    cluster, err := h.clusterService.GetCluster(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
        return
    }
    c.JSON(http.StatusOK, cluster)
}

// UpdateCluster 更新集群
func (h *K8sAPIHandler) UpdateCluster(c *gin.Context) {
    id := c.Param("id")

    var req struct {
        Name        string            `json:"name"`
        Description string            `json:"description"`
        Labels      map[string]string `json:"labels"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    cluster, err := h.clusterService.UpdateCluster(id, req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, cluster)
}
```

### 前端 API 调用

```typescript
// apps/web-k8s/src/api/k8s/index.ts

export const clusterApi = {
  /**
   * 获取集群详情
   */
  detail: async (id: string): Promise<Cluster> => {
    return requestClient.get(`/k8s/clusters/${id}`);
  },

  /**
   * 更新集群
   */
  update: async (id: string, data: Partial<Cluster>): Promise<Cluster> => {
    return requestClient.put(`/k8s/clusters/${id}`, data);
  },
};
```

## 测试建议

### 1. 正常流程测试

```bash
# 启动开发服务器
pnpm dev:k8s

# 访问集群列表
http://localhost:5668/k8s/clusters

# 测试步骤：
1. 点击任意集群的"编辑"按钮
2. 等待加载完成
3. 验证显示的数据与列表中一致
4. 修改名称、描述或标签
5. 点击"确定"提交
6. 验证成功提示
7. 验证列表自动刷新并显示更新后的数据
```

### 2. 错误场景测试

#### 场景 1: 集群已被删除

```
1. 在列表中选择一个集群
2. 在另一个窗口删除该集群
3. 点击"编辑"按钮
4. 预期: 显示"获取集群详情失败"，对话框自动关闭
```

#### 场景 2: 网络错误

```
1. 断开网络或停止后端服务
2. 点击"编辑"按钮
3. 预期: 显示连接错误信息，对话框自动关闭
```

#### 场景 3: 权限不足

```
1. 使用只读用户登录
2. 点击"编辑"按钮
3. 预期: 可以查看详情，但提交时返回权限错误
```

### 3. 性能测试

```
测试指标：
- 详情加载时间应 < 500ms
- 更新提交时间应 < 1000ms
- 列表刷新时间应 < 2000ms

优化建议：
- 考虑添加请求缓存（短时间内重复请求）
- 考虑添加乐观更新（先更新 UI，后同步服务器）
```

## 相关文件

- `apps/web-k8s/src/views/k8s/clusters/EditClusterModal.vue` - 编辑对话框组件
- `apps/web-k8s/src/views/k8s/clusters/index.vue` - 集群列表页面
- `apps/web-k8s/src/api/k8s/index.ts` - K8s API 定义
- `apps/web-k8s/src/api/k8s/types.ts` - TypeScript 类型定义

## 相关文档

- [ADD_CLUSTER_FEATURE.md](./ADD_CLUSTER_FEATURE.md) - 集群添加功能文档
- [API_PATH_ALIGNMENT.md](./API_PATH_ALIGNMENT.md) - API 路径对齐文档
- [MINIKUBE_SETUP_GUIDE.md](./MINIKUBE_SETUP_GUIDE.md) - Minikube 设置指南

---

**更新日期**: 2025-10-18 **版本**: 1.0 **作者**: Claude Code
