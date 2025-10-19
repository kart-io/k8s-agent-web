# Minikube 集群添加指南

## 概述

本指南将帮助您将本地运行的 Minikube 集群添加到 K8s 管理平台。已经为您生成了完整的配置文件，只需在 Web UI 中填写相应信息即可。

## 前提条件

✅ **Minikube 已运行**:

```bash
$ minikube status
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

✅ **已生成配置文件**:

- `minikube-kubeconfig.yaml` - 完整的 KubeConfig 文件
- `minikube-cluster-request.json` - API 请求数据（可选，用于直接调用 API）
- `get-minikube-config.sh` - 配置生成脚本

## 集群配置信息

### 基本信息

| 字段       | 值                        |
| ---------- | ------------------------- |
| 集群名称   | `minikube-local`          |
| 描述       | 本地 Minikube 开发集群    |
| API Server | `https://127.0.0.1:32771` |
| IP 地址    | `192.168.49.2`            |
| 区域       | `local`                   |
| 云服务商   | `minikube`                |

### 标签

- `env: development`
- `type: minikube`
- `location: local`

## 方法一：使用 Web UI 添加（推荐）

### 步骤 1: 访问集群管理页面

打开浏览器，访问：

```
http://localhost:5668/k8s/clusters
```

### 步骤 2: 点击"添加集群"按钮

在集群列表页面，点击右上角的"添加集群"按钮。

### 步骤 3: 填写表单

#### 必填字段

1. **集群名称**:

   ```
   minikube-local
   ```

2. **API Server**:

   ```
   https://127.0.0.1:32771
   ```

3. **KubeConfig**:

   复制 `minikube-kubeconfig.yaml` 的完整内容：

   ```bash
   # 在终端中执行
   cat minikube-kubeconfig.yaml
   ```

   然后将输出的所有内容粘贴到表单的 KubeConfig 字段中。

#### 可选字段

4. **描述**:

   ```
   本地 Minikube 开发集群
   ```

5. **区域**:

   ```
   local
   ```

6. **云服务商**:

   ```
   minikube
   ```

7. **标签**（逐个添加）:
   - 键: `env`，值: `development`
   - 键: `type`，值: `minikube`
   - 键: `location`，值: `local`

### 步骤 4: 提交表单

点击"确定"按钮提交表单。

### 步骤 5: 验证结果

- ✅ 看到成功提示消息
- ✅ 对话框自动关闭
- ✅ 集群列表自动刷新，显示新添加的 `minikube-local` 集群

## 方法二：使用 API 直接提交

### 使用 curl 命令

```bash
curl -X POST http://localhost:5668/api/k8s/clusters \
  -H 'Content-Type: application/json' \
  -d @minikube-cluster-request.json
```

### 预期响应

成功响应示例：

```json
{
  "code": 0,
  "message": "Cluster created successfully",
  "data": {
    "id": "cluster-xxx",
    "name": "minikube-local",
    "description": "本地 Minikube 开发集群",
    "apiServer": "https://127.0.0.1:32771",
    "status": "healthy",
    "createdAt": "2025-10-18T...",
    ...
  }
}
```

## 验证集群连接

### 1. 在集群列表中查看

访问 `http://localhost:5668/k8s/clusters`，应该能看到：

- ✅ 集群名称: `minikube-local`
- ✅ 状态: 健康 (绿色标签)
- ✅ K8s 版本: v1.x.x
- ✅ 节点数、Pod 数等信息

### 2. 查看集群资源

点击集群详情或导航到各个资源页面：

**查看 Node**:

```
http://localhost:5668/k8s/nodes
```

**查看 Pod**:

```
http://localhost:5668/k8s/workloads/pods
```

**查看 Namespace**:

```
http://localhost:5668/k8s/namespaces
```

### 3. 使用 kubectl 验证

在终端验证 minikube 集群状态：

```bash
# 查看节点
kubectl get nodes

# 查看所有 Pod
kubectl get pods --all-namespaces

# 查看命名空间
kubectl get namespaces
```

## 常见问题

### Q1: 提交后显示"连接失败"

**可能原因**:

1. Minikube 没有运行
2. API Server 地址错误
3. KubeConfig 内容不完整

**解决方案**:

```bash
# 1. 检查 minikube 状态
minikube status

# 2. 如果没有运行，启动它
minikube start

# 3. 重新生成配置
./get-minikube-config.sh

# 4. 重新提交
```

### Q2: KubeConfig 粘贴后显示验证错误

**解决方案**:

1. 确保复制了完整的 YAML 内容（从 `apiVersion: v1` 开始到文件结尾）
2. 不要添加额外的空格或换行
3. 使用以下命令直接复制：
   ```bash
   cat minikube-kubeconfig.yaml | pbcopy  # macOS
   # 或
   cat minikube-kubeconfig.yaml | xclip -selection clipboard  # Linux
   ```

### Q3: API Server 地址端口号变化

Minikube 重启后，API Server 的端口可能会变化。

**解决方案**:

```bash
# 1. 获取新的 API Server 地址
kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}'

# 2. 重新生成配置
./get-minikube-config.sh

# 3. 更新集群配置或删除旧集群重新添加
```

### Q4: 集群状态显示"异常"

**可能原因**:

- Minikube 已停止
- 网络问题
- 证书过期

**解决方案**:

```bash
# 检查 minikube 状态
minikube status

# 如果已停止，启动它
minikube start

# 刷新页面查看状态更新
```

## 重新生成配置

如果需要重新生成配置（例如 minikube 重启后）：

```bash
# 执行脚本
./get-minikube-config.sh

# 这将重新生成：
# - minikube-kubeconfig.yaml
# - minikube-cluster-request.json
```

## 删除集群

如果需要删除已添加的集群：

### 使用 Web UI

1. 访问 `http://localhost:5668/k8s/clusters`
2. 找到 `minikube-local` 集群
3. 点击"删除"按钮
4. 确认删除

### 使用 API

```bash
# 获取集群 ID（从列表中查看）
CLUSTER_ID="cluster-xxx"

# 删除集群
curl -X DELETE "http://localhost:5668/api/k8s/clusters/$CLUSTER_ID"
```

## 完整工作流程示例

```bash
# 1. 启动 minikube（如果还没运行）
minikube start

# 2. 确认运行状态
minikube status

# 3. 生成配置文件
cd /path/to/k8s-agent-web/apps/web-k8s
./get-minikube-config.sh

# 4. 启动前端开发服务器（如果还没运行）
pnpm dev:k8s

# 5. 启动后端 cluster-service（如果还没运行）
cd /path/to/cluster-service
go run cmd/server/main.go -config configs/config-local.yaml

# 6. 在浏览器中访问
# http://localhost:5668/k8s/clusters

# 7. 点击"添加集群"并填写表单

# 8. 验证集群添加成功
# 查看集群列表、节点、Pod 等
```

## KubeConfig 内容说明

生成的 `minikube-kubeconfig.yaml` 包含：

### 关键部分

1. **Cluster 配置**:
   - `server`: API Server 地址
   - `certificate-authority-data`: CA 证书（Base64 编码）

2. **User 配置**:
   - `client-certificate-data`: 客户端证书（Base64 编码）
   - `client-key-data`: 客户端私钥（Base64 编码）

3. **Context 配置**:
   - 关联 cluster 和 user
   - 设置默认 namespace

这些信息用于安全地连接到 Kubernetes API Server。

## 安全注意事项

⚠️ **重要**:

1. **KubeConfig 包含敏感信息**（证书和私钥），不要：
   - 提交到公开的 Git 仓库
   - 分享给未授权人员
   - 在不安全的渠道传输

2. **Minikube 用于开发环境**:
   - 仅适用于本地开发
   - 不要用于生产环境
   - 127.0.0.1 地址仅在本机可访问

3. **定期清理**:
   ```bash
   # 完成开发后，可以删除 minikube
   minikube delete
   ```

## 文件说明

### 生成的文件

| 文件                            | 说明                | 用途              |
| ------------------------------- | ------------------- | ----------------- |
| `minikube-kubeconfig.yaml`      | 完整的 KubeConfig   | 复制内容到 Web UI |
| `minikube-cluster-request.json` | JSON 格式的请求数据 | 用于 curl 命令    |
| `get-minikube-config.sh`        | 配置生成脚本        | 重新生成配置      |

### 脚本功能

`get-minikube-config.sh` 脚本执行以下操作：

1. ✅ 检查 minikube 状态
2. ✅ 获取 IP 地址
3. ✅ 获取 API Server 地址
4. ✅ 提取 Kubernetes 版本
5. ✅ 生成 KubeConfig 文件
6. ✅ 生成 JSON 请求数据
7. ✅ 显示使用说明

## 相关文档

- [集群添加功能文档](./ADD_CLUSTER_FEATURE.md)
- [API 路径对齐文档](./API_PATH_ALIGNMENT.md)
- [Minikube 官方文档](https://minikube.sigs.k8s.io/docs/)

---

**生成日期**: 2025-10-18 **Minikube 版本**: v1.36.0 **脚本**: `get-minikube-config.sh` **状态**: ✅ 配置已生成
