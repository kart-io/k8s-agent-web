# 集群添加功能实现文档

## 功能概述

实现了集群管理页面的"添加集群"功能，用户可以通过表单添加新的 Kubernetes 集群到系统中。

## 实现内容

### 1. 类型定义

在 `src/api/k8s/types.ts` 中添加了创建集群的请求类型：

```typescript
export interface CreateClusterRequest {
  name: string; // 集群名称（必填）
  description?: string; // 集群描述（可选）
  endpoint: string; // API Server 地址（必填）
  kubeconfig: string; // KubeConfig 内容（必填）
  region?: string; // 区域（可选）
  provider?: string; // 云服务商（可选）
  labels?: Record<string, string>; // 标签（可选）
}
```

### 2. 添加集群对话框组件

创建了 `src/views/k8s/clusters/AddClusterModal.vue` 组件，包含以下功能：

#### 表单字段

| 字段 | 类型 | 是否必填 | 说明 | 验证规则 |
| --- | --- | --- | --- | --- |
| name | string | 是 | 集群名称 | 小写字母、数字和连字符，必须以字母或数字开头和结尾 |
| description | string | 否 | 集群描述 | - |
| endpoint | string | 是 | API Server 地址 | 必须以 `http://` 或 `https://` 开头 |
| kubeconfig | string | 是 | KubeConfig 内容 | YAML 格式 |
| region | string | 否 | 区域 | 如: us-west-1 |
| provider | string | 否 | 云服务商 | 如: AWS, GCP, Azure |
| labels | object | 否 | 标签 | 键值对 |

#### 主要功能

1. **表单验证**
   - 集群名称格式验证（符合 K8s 命名规范）
   - API Server 地址格式验证
   - KubeConfig 内容必填验证

2. **标签管理**
   - 支持动态添加标签（键值对）
   - 可以删除已添加的标签
   - 标签以美观的标签样式展示

3. **提交处理**
   - 调用后端 API 创建集群
   - 显示加载状态
   - 成功后刷新列表并关闭对话框
   - 失败时显示错误信息

4. **表单重置**
   - 打开对话框时自动重置表单
   - 清除验证错误

### 3. 集群列表页面集成

更新了 `src/views/k8s/clusters/index.vue`：

```typescript
// 添加对话框状态
const addClusterVisible = ref(false);

// 打开添加对话框
function handleAdd() {
  addClusterVisible.value = true;
}

// 添加成功后刷新列表
function handleAddSuccess() {
  gridApi.reload();
}
```

## 后端 API 对接

### 接口定义

**POST** `/api/k8s/clusters`

**请求体**:

```json
{
  "name": "prod-cluster-01",
  "description": "生产环境集群",
  "endpoint": "https://192.168.1.100:6443",
  "kubeconfig": "apiVersion: v1\nkind: Config\n...",
  "region": "us-west-1",
  "provider": "AWS",
  "labels": {
    "env": "production",
    "team": "platform"
  }
}
```

**响应**:

```json
{
  "code": 0,
  "message": "Cluster created successfully",
  "data": {
    "id": "cluster-123",
    "name": "prod-cluster-01",
    "description": "生产环境集群",
    "apiServer": "https://192.168.1.100:6443",
    "version": "v1.28.0",
    "status": "healthy",
    "nodeCount": 3,
    "podCount": 50,
    "namespaceCount": 10,
    "createdAt": "2025-10-18T10:30:00Z",
    "updatedAt": "2025-10-18T10:30:00Z"
  }
}
```

## 使用方法

### 1. 打开添加集群对话框

在集群管理页面（`http://localhost:5668/k8s/clusters`）点击"添加集群"按钮。

### 2. 填写表单

**必填字段**:

- **集群名称**: 如 `prod-cluster-01`
  - 只能包含小写字母、数字和连字符
  - 必须以字母或数字开头和结尾
  - 示例: `my-cluster`, `k8s-prod-01`

- **API Server**: 如 `https://192.168.1.100:6443`
  - 必须以 `http://` 或 `https://` 开头
  - 通常使用 HTTPS + 端口 6443

- **KubeConfig**: 完整的 KubeConfig YAML 内容
  ```yaml
  apiVersion: v1
  kind: Config
  clusters:
    - name: my-cluster
      cluster:
        server: https://192.168.1.100:6443
        certificate-authority-data: LS0tLS...
  users:
    - name: my-user
      user:
        client-certificate-data: LS0tLS...
        client-key-data: LS0tLS...
  contexts:
    - name: my-context
      context:
        cluster: my-cluster
        user: my-user
  current-context: my-context
  ```

**可选字段**:

- **描述**: 集群的描述信息
- **区域**: 如 `us-west-1`, `ap-south-1`
- **云服务商**: 如 `AWS`, `GCP`, `Azure`, `自建`
- **标签**: 键值对形式的标签，用于分类和筛选

### 3. 添加标签（可选）

1. 在"标签"部分输入键和值
2. 点击"添加标签"按钮
3. 已添加的标签会以蓝色标签样式显示
4. 点击标签右侧的"×"可以删除标签

示例标签:

- `env: production`
- `team: platform`
- `region: us-west`
- `cost-center: engineering`

### 4. 提交表单

点击"确定"按钮提交表单：

- 表单会先进行验证
- 通过验证后调用后端 API
- 显示加载状态（按钮上的 loading 图标）
- 成功后显示成功消息并关闭对话框
- 列表自动刷新显示新添加的集群

## 验证规则

### 集群名称验证

```typescript
{
  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
  message: '名称只能包含小写字母、数字和连字符，且必须以字母或数字开头和结尾'
}
```

**有效示例**:

- ✅ `my-cluster`
- ✅ `k8s-prod-01`
- ✅ `cluster123`

**无效示例**:

- ❌ `My-Cluster` (包含大写字母)
- ❌ `-my-cluster` (以连字符开头)
- ❌ `my-cluster-` (以连字符结尾)
- ❌ `my_cluster` (包含下划线)

### API Server 验证

```typescript
{
  pattern: /^https?:\/\/.+/,
  message: 'API Server 地址必须以 http:// 或 https:// 开头'
}
```

**有效示例**:

- ✅ `https://192.168.1.100:6443`
- ✅ `https://k8s.example.com`
- ✅ `http://localhost:8080`

**无效示例**:

- ❌ `192.168.1.100:6443` (缺少协议)
- ❌ `k8s.example.com` (缺少协议)

## 用户体验优化

### 1. 表单自动重置

每次打开对话框时，表单会自动重置为空白状态，确保不会保留上次的输入。

### 2. 验证提示

- 实时验证（失焦时触发）
- 清晰的错误提示信息
- 红色边框标识错误字段

### 3. 加载状态

- 提交时显示 loading 动画
- 按钮禁用防止重复提交

### 4. 成功反馈

- 成功消息提示
- 自动关闭对话框
- 列表自动刷新

### 5. 标签管理

- 直观的标签展示（蓝色标签样式）
- 简单的添加/删除操作
- 支持回车快速添加标签

## 错误处理

### 1. 表单验证失败

```typescript
// 表单字段验证失败
if (error.errorFields) {
  // 显示字段级别的错误提示
  // 不关闭对话框，允许用户修正
  return;
}
```

### 2. API 调用失败

```typescript
// 网络错误或后端错误
message.error('添加集群失败: ' + (error.message || '未知错误'));
```

常见错误:

- **网络错误**: 无法连接到后端
- **KubeConfig 无效**: KubeConfig 格式错误或无法连接到集群
- **集群名称重复**: 已存在同名集群
- **权限不足**: 没有创建集群的权限

## 后续优化建议

### 1. KubeConfig 文件上传

当前需要手动粘贴 KubeConfig 内容，可以添加文件上传功能：

```vue
<Upload accept=".yaml,.yml" :before-upload="handleKubeconfigUpload">
  <Button>上传 KubeConfig</Button>
</Upload>
```

### 2. KubeConfig 验证

在提交前验证 KubeConfig 格式：

```typescript
function validateKubeconfig(content: string): boolean {
  try {
    const config = YAML.parse(content);
    return config.apiVersion === 'v1' && config.kind === 'Config';
  } catch {
    return false;
  }
}
```

### 3. 连接测试

添加"测试连接"按钮，提交前验证能否连接到集群：

```typescript
async function testConnection() {
  const result = await clusterApi.testConnection({
    endpoint: formData.endpoint,
    kubeconfig: formData.kubeconfig,
  });

  if (result.success) {
    message.success('连接测试成功');
  } else {
    message.error('连接失败: ' + result.error);
  }
}
```

### 4. 预设模板

为常见云服务商提供 KubeConfig 模板：

```typescript
const templates = {
  aws: '...',
  gcp: '...',
  azure: '...',
};
```

### 5. 批量导入

支持从 CSV/JSON 文件批量导入多个集群。

## 技术细节

### 组件通信

使用 Vue 3 的组合式 API：

```typescript
// Props 定义
interface Props {
  visible: boolean;
}

// Emits 定义
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

// 父组件使用
<AddClusterModal
  v-model:visible="addClusterVisible"
  @success="handleAddSuccess"
/>
```

### 响应式表单

使用 `reactive` 管理表单数据：

```typescript
const formData = reactive<CreateClusterRequest>({
  name: '',
  description: '',
  // ...
});
```

### 样式设计

- 使用 CSS 变量支持主题切换
- 响应式布局适配不同屏幕尺寸
- 符合 Ant Design 设计规范

## 测试方法

### 1. 手动测试

1. 访问 `http://localhost:5668/k8s/clusters`
2. 点击"添加集群"按钮
3. 填写表单（可以使用测试数据）
4. 提交并验证结果

### 2. 测试数据示例

```yaml
# KubeConfig 示例（用于测试）
apiVersion: v1
kind: Config
clusters:
  - name: test-cluster
    cluster:
      server: https://192.168.1.100:6443
      insecure-skip-tls-verify: true
users:
  - name: test-user
    user:
      token: eyJhbGciOiJSUzI1NiIsImtpZCI6...
contexts:
  - name: test-context
    context:
      cluster: test-cluster
      user: test-user
current-context: test-context
```

### 3. 验证检查项

- [ ] 表单打开正常
- [ ] 必填字段验证生效
- [ ] 名称格式验证正确
- [ ] API Server 格式验证正确
- [ ] 标签添加/删除正常
- [ ] 提交时显示 loading
- [ ] 成功后关闭对话框
- [ ] 列表自动刷新
- [ ] 错误提示显示正确

## 相关文件

- ✅ `src/api/k8s/types.ts` - 添加 `CreateClusterRequest` 类型
- ✅ `src/views/k8s/clusters/AddClusterModal.vue` - 添加集群对话框组件
- ✅ `src/views/k8s/clusters/index.vue` - 集群列表页面（集成对话框）
- ✅ `src/api/k8s/index.ts` - `clusterApi.create()` API 已存在

## 总结

实现了完整的集群添加功能，包括：

- ✅ 完整的表单验证
- ✅ 标签管理功能
- ✅ 良好的用户体验
- ✅ 错误处理机制
- ✅ 响应式设计

用户现在可以通过友好的界面添加新的 Kubernetes 集群到系统中。

---

**实现日期**: 2025-10-18 **相关 API**: `POST /api/k8s/clusters` **组件**: `AddClusterModal.vue` **状态**: ✅ 已完成
