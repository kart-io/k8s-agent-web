# Kubernetes Agent Web - API 接口文档

## 文档版本

- **版本**: v1.0.0
- **更新日期**: 2025-10-17
- **基础路径**: `/api/k8s`

## 目录

- [Kubernetes Agent Web - API 接口文档](#kubernetes-agent-web---api-接口文档)
  - [文档版本](#文档版本)
  - [目录](#目录)
  - [通用说明](#通用说明)
    - [请求格式](#请求格式)
    - [响应格式](#响应格式)
    - [错误码](#错误码)
    - [分页参数](#分页参数)
  - [1. 集群管理](#1-集群管理)
    - [1.1 获取集群列表](#11-获取集群列表)
    - [1.2 获取集群详情](#12-获取集群详情)
    - [1.3 创建集群](#13-创建集群)
    - [1.4 更新集群](#14-更新集群)
    - [1.5 删除集群](#15-删除集群)
    - [1.6 获取集群监控指标](#16-获取集群监控指标)
  - [2. 命名空间管理 (Namespace)](#2-命名空间管理-namespace)
    - [2.1 获取命名空间列表](#21-获取命名空间列表)
    - [2.2 获取命名空间详情](#22-获取命名空间详情)
    - [2.3 创建命名空间](#23-创建命名空间)
    - [2.4 删除命名空间](#24-删除命名空间)
  - [3. 节点管理 (Node)](#3-节点管理-node)
    - [3.1 获取节点列表](#31-获取节点列表)
    - [3.2 获取节点详情](#32-获取节点详情)
    - [3.3 封锁节点 (Cordon)](#33-封锁节点-cordon)
    - [3.4 解除封锁节点 (Uncordon)](#34-解除封锁节点-uncordon)
    - [3.5 驱逐节点 (Drain)](#35-驱逐节点-drain)
    - [3.6 更新节点标签](#36-更新节点标签)
    - [3.7 更新节点污点](#37-更新节点污点)
  - [4. 工作负载管理](#4-工作负载管理)
    - [4.1 Pod 管理](#41-pod-管理)
      - [4.1.1 获取 Pod 列表](#411-获取-pod-列表)
      - [4.1.2 获取 Pod 详情](#412-获取-pod-详情)
      - [4.1.3 创建 Pod](#413-创建-pod)
      - [4.1.4 更新 Pod](#414-更新-pod)
      - [4.1.5 删除 Pod](#415-删除-pod)
      - [4.1.6 获取 Pod 日志](#416-获取-pod-日志)
      - [4.1.7 执行 Pod 命令](#417-执行-pod-命令)
    - [4.2 Deployment 管理](#42-deployment-管理)
      - [4.2.1 获取 Deployment 列表](#421-获取-deployment-列表)
      - [4.2.2 获取 Deployment 详情](#422-获取-deployment-详情)
      - [4.2.3 创建 Deployment](#423-创建-deployment)
      - [4.2.4 更新 Deployment](#424-更新-deployment)
      - [4.2.5 删除 Deployment](#425-删除-deployment)
      - [4.2.6 扩缩容 Deployment](#426-扩缩容-deployment)
      - [4.2.7 重启 Deployment](#427-重启-deployment)
    - [4.3 StatefulSet 管理](#43-statefulset-管理)
      - [4.3.1 获取 StatefulSet 列表](#431-获取-statefulset-列表)
      - [4.3.2 获取 StatefulSet 详情](#432-获取-statefulset-详情)
      - [4.3.3 创建 StatefulSet](#433-创建-statefulset)
      - [4.3.4 删除 StatefulSet](#434-删除-statefulset)
      - [4.3.5 扩缩容 StatefulSet](#435-扩缩容-statefulset)
    - [4.4 DaemonSet 管理](#44-daemonset-管理)
      - [4.4.1 获取 DaemonSet 列表](#441-获取-daemonset-列表)
      - [4.4.2 获取 DaemonSet 详情](#442-获取-daemonset-详情)
      - [4.4.3 创建 DaemonSet](#443-创建-daemonset)
      - [4.4.4 删除 DaemonSet](#444-删除-daemonset)
    - [4.5 ReplicaSet 管理](#45-replicaset-管理)
      - [4.5.1 获取 ReplicaSet 列表](#451-获取-replicaset-列表)
      - [4.5.2 获取 ReplicaSet 详情](#452-获取-replicaset-详情)
      - [4.5.3 创建 ReplicaSet](#453-创建-replicaset)
      - [4.5.4 更新 ReplicaSet](#454-更新-replicaset)
      - [4.5.5 删除 ReplicaSet](#455-删除-replicaset)
      - [4.5.6 扩缩容 ReplicaSet](#456-扩缩容-replicaset)
    - [4.6 Job 管理](#46-job-管理)
      - [4.6.1 获取 Job 列表](#461-获取-job-列表)
      - [4.6.2 获取 Job 详情](#462-获取-job-详情)
      - [4.6.3 创建 Job](#463-创建-job)
      - [4.6.4 删除 Job](#464-删除-job)
    - [4.7 CronJob 管理](#47-cronjob-管理)
      - [4.7.1 获取 CronJob 列表](#471-获取-cronjob-列表)
      - [4.7.2 获取 CronJob 详情](#472-获取-cronjob-详情)
      - [4.7.3 创建 CronJob](#473-创建-cronjob)
      - [4.7.4 更新 CronJob](#474-更新-cronjob)
      - [4.7.5 删除 CronJob](#475-删除-cronjob)
      - [4.7.6 暂停/恢复 CronJob](#476-暂停恢复-cronjob)
  - [5. 服务与网络](#5-服务与网络)
    - [5.1 Service 管理](#51-service-管理)
      - [5.1.1 获取 Service 列表](#511-获取-service-列表)
      - [5.1.2 获取 Service 详情](#512-获取-service-详情)
      - [5.1.3 创建 Service](#513-创建-service)
      - [5.1.4 更新 Service](#514-更新-service)
      - [5.1.5 删除 Service](#515-删除-service)
    - [5.2 Ingress 管理](#52-ingress-管理)
      - [5.2.1 获取 Ingress 列表](#521-获取-ingress-列表)
      - [5.2.2 获取 Ingress 详情](#522-获取-ingress-详情)
      - [5.2.3 创建 Ingress](#523-创建-ingress)
      - [5.2.4 更新 Ingress](#524-更新-ingress)
      - [5.2.5 删除 Ingress](#525-删除-ingress)
    - [5.3 NetworkPolicy 管理](#53-networkpolicy-管理)
      - [5.3.1 获取 NetworkPolicy 列表](#531-获取-networkpolicy-列表)
      - [5.3.2 获取 NetworkPolicy 详情](#532-获取-networkpolicy-详情)
      - [5.3.3 创建 NetworkPolicy](#533-创建-networkpolicy)
      - [5.3.4 更新 NetworkPolicy](#534-更新-networkpolicy)
      - [5.3.5 删除 NetworkPolicy](#535-删除-networkpolicy)
    - [5.4 Endpoints 管理](#54-endpoints-管理)
      - [5.4.1 获取 Endpoints 列表](#541-获取-endpoints-列表)
      - [5.4.2 获取 Endpoints 详情](#542-获取-endpoints-详情)
      - [5.4.3 创建 Endpoints](#543-创建-endpoints)
      - [5.4.4 更新 Endpoints](#544-更新-endpoints)
      - [5.4.5 删除 Endpoints](#545-删除-endpoints)
    - [5.5 EndpointSlice 管理](#55-endpointslice-管理)
      - [5.5.1 获取 EndpointSlice 列表](#551-获取-endpointslice-列表)
      - [5.5.2 获取 EndpointSlice 详情](#552-获取-endpointslice-详情)
      - [5.5.3 创建 EndpointSlice](#553-创建-endpointslice)
      - [5.5.4 更新 EndpointSlice](#554-更新-endpointslice)
      - [5.5.5 删除 EndpointSlice](#555-删除-endpointslice)
  - [6. 配置与存储](#6-配置与存储)
    - [6.1 ConfigMap 管理](#61-configmap-管理)
      - [6.1.1 获取 ConfigMap 列表](#611-获取-configmap-列表)
      - [6.1.2 获取 ConfigMap 详情](#612-获取-configmap-详情)
      - [6.1.3 创建 ConfigMap](#613-创建-configmap)
      - [6.1.4 更新 ConfigMap](#614-更新-configmap)
      - [6.1.5 删除 ConfigMap](#615-删除-configmap)
    - [6.2 Secret 管理](#62-secret-管理)
      - [6.2.1 获取 Secret 列表](#621-获取-secret-列表)
      - [6.2.2 获取 Secret 详情](#622-获取-secret-详情)
      - [6.2.3 创建 Secret](#623-创建-secret)
      - [6.2.4 更新 Secret](#624-更新-secret)
      - [6.2.5 删除 Secret](#625-删除-secret)
    - [6.3 PersistentVolume 管理](#63-persistentvolume-管理)
      - [6.3.1 获取 PV 列表](#631-获取-pv-列表)
      - [6.3.2 获取 PV 详情](#632-获取-pv-详情)
      - [6.3.3 创建 PV](#633-创建-pv)
      - [6.3.4 更新 PV](#634-更新-pv)
      - [6.3.5 删除 PV](#635-删除-pv)
    - [6.4 PersistentVolumeClaim 管理](#64-persistentvolumeclaim-管理)
      - [6.4.1 获取 PVC 列表](#641-获取-pvc-列表)
      - [6.4.2 获取 PVC 详情](#642-获取-pvc-详情)
      - [6.4.3 创建 PVC](#643-创建-pvc)
      - [6.4.4 更新 PVC](#644-更新-pvc)
      - [6.4.5 删除 PVC](#645-删除-pvc)
    - [6.5 StorageClass 管理](#65-storageclass-管理)
      - [6.5.1 获取 StorageClass 列表](#651-获取-storageclass-列表)
      - [6.5.2 获取 StorageClass 详情](#652-获取-storageclass-详情)
      - [6.5.3 创建 StorageClass](#653-创建-storageclass)
      - [6.5.4 更新 StorageClass](#654-更新-storageclass)
      - [6.5.5 删除 StorageClass](#655-删除-storageclass)
  - [7. RBAC 权限管理](#7-rbac-权限管理)
    - [7.1 ServiceAccount 管理](#71-serviceaccount-管理)
      - [7.1.1 获取 ServiceAccount 列表](#711-获取-serviceaccount-列表)
      - [7.1.2 获取 ServiceAccount 详情](#712-获取-serviceaccount-详情)
      - [7.1.3 创建 ServiceAccount](#713-创建-serviceaccount)
      - [7.1.4 更新 ServiceAccount](#714-更新-serviceaccount)
      - [7.1.5 删除 ServiceAccount](#715-删除-serviceaccount)
    - [7.2 Role 管理](#72-role-管理)
      - [7.2.1 获取 Role 列表](#721-获取-role-列表)
      - [7.2.2 获取 Role 详情](#722-获取-role-详情)
      - [7.2.3 创建 Role](#723-创建-role)
      - [7.2.4 更新 Role](#724-更新-role)
      - [7.2.5 删除 Role](#725-删除-role)
    - [7.3 RoleBinding 管理](#73-rolebinding-管理)
      - [7.3.1 获取 RoleBinding 列表](#731-获取-rolebinding-列表)
      - [7.3.2 获取 RoleBinding 详情](#732-获取-rolebinding-详情)
      - [7.3.3 创建 RoleBinding](#733-创建-rolebinding)
      - [7.3.4 更新 RoleBinding](#734-更新-rolebinding)
      - [7.3.5 删除 RoleBinding](#735-删除-rolebinding)
    - [7.4 ClusterRole 管理](#74-clusterrole-管理)
      - [7.4.1 获取 ClusterRole 列表](#741-获取-clusterrole-列表)
      - [7.4.2 获取 ClusterRole 详情](#742-获取-clusterrole-详情)
      - [7.4.3 创建 ClusterRole](#743-创建-clusterrole)
      - [7.4.4 更新 ClusterRole](#744-更新-clusterrole)
      - [7.4.5 删除 ClusterRole](#745-删除-clusterrole)
    - [7.5 ClusterRoleBinding 管理](#75-clusterrolebinding-管理)
      - [7.5.1 获取 ClusterRoleBinding 列表](#751-获取-clusterrolebinding-列表)
      - [7.5.2 获取 ClusterRoleBinding 详情](#752-获取-clusterrolebinding-详情)
      - [7.5.3 创建 ClusterRoleBinding](#753-创建-clusterrolebinding)
      - [7.5.4 更新 ClusterRoleBinding](#754-更新-clusterrolebinding)
      - [7.5.5 删除 ClusterRoleBinding](#755-删除-clusterrolebinding)
  - [8. 资源配额管理](#8-资源配额管理)
    - [8.1 ResourceQuota 管理](#81-resourcequota-管理)
      - [8.1.1 获取 ResourceQuota 列表](#811-获取-resourcequota-列表)
      - [8.1.2 获取 ResourceQuota 详情](#812-获取-resourcequota-详情)
      - [8.1.3 创建 ResourceQuota](#813-创建-resourcequota)
      - [8.1.4 更新 ResourceQuota](#814-更新-resourcequota)
      - [8.1.5 删除 ResourceQuota](#815-删除-resourcequota)
    - [8.2 LimitRange 管理](#82-limitrange-管理)
      - [8.2.1 获取 LimitRange 列表](#821-获取-limitrange-列表)
      - [8.2.2 获取 LimitRange 详情](#822-获取-limitrange-详情)
      - [8.2.3 创建 LimitRange](#823-创建-limitrange)
      - [8.2.4 更新 LimitRange](#824-更新-limitrange)
      - [8.2.5 删除 LimitRange](#825-删除-limitrange)
  - [9. 自动扩缩容](#9-自动扩缩容)
    - [9.1 HorizontalPodAutoscaler (HPA) 管理](#91-horizontalpodautoscaler-hpa-管理)
      - [9.1.1 获取 HPA 列表](#911-获取-hpa-列表)
      - [9.1.2 获取 HPA 详情](#912-获取-hpa-详情)
      - [9.1.3 创建 HPA](#913-创建-hpa)
      - [9.1.4 更新 HPA](#914-更新-hpa)
      - [9.1.5 删除 HPA](#915-删除-hpa)
  - [10. 调度与优先级](#10-调度与优先级)
    - [10.1 PriorityClass 管理](#101-priorityclass-管理)
      - [10.1.1 获取 PriorityClass 列表](#1011-获取-priorityclass-列表)
      - [10.1.2 获取 PriorityClass 详情](#1012-获取-priorityclass-详情)
      - [10.1.3 创建 PriorityClass](#1013-创建-priorityclass)
      - [10.1.4 更新 PriorityClass](#1014-更新-priorityclass)
      - [10.1.5 删除 PriorityClass](#1015-删除-priorityclass)
  - [11. 事件管理](#11-事件管理)
    - [11.1 获取事件列表](#111-获取事件列表)
    - [11.2 获取事件详情](#112-获取事件详情)
  - [附录](#附录)
    - [A. 数据结构定义](#a-数据结构定义)
      - [K8sMetadata](#k8smetadata)
      - [K8sListMetadata](#k8slistmetadata)
      - [Container](#container)
      - [PodSpec](#podspec)
      - [PodStatus](#podstatus)
    - [B. 枚举值说明](#b-枚举值说明)
    - [C. 状态码说明](#c-状态码说明)

---

## 通用说明

### 请求格式

- **Content-Type**: `application/json`
- **Authorization**: `Bearer {token}` (如需要)
- **字符编码**: UTF-8

### 响应格式

成功响应示例：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

错误响应示例：

```json
{
  "code": 400,
  "message": "Invalid request parameters",
  "error": "Validation failed"
}
```

### 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

### 分页参数

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码（从 1 开始） | 1 |
| pageSize | number | 否 | 每页数量 | 10 |

---

## 1. 集群管理

### 1.1 获取集群列表

**接口地址**: `GET /api/k8s/clusters`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| keyword | string | 否 | 搜索关键词 |
| status | string | 否 | 集群状态过滤 (healthy/unhealthy/unknown) |

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "cluster-prod-01",
        "name": "生产集群",
        "description": "生产环境 K8s 集群",
        "apiServer": "https://k8s-api.example.com",
        "version": "v1.28.0",
        "status": "healthy",
        "nodeCount": 10,
        "podCount": 150,
        "namespaceCount": 20,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-10-17T00:00:00Z",
        "resources": {
          "cpu": {
            "total": 160,
            "used": 80
          },
          "memory": {
            "total": 640000,
            "used": 320000
          }
        }
      }
    ],
    "total": 1
  }
}
```

---

### 1.2 获取集群详情

**接口地址**: `GET /api/k8s/clusters/:id`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 集群 ID |

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "cluster-prod-01",
    "name": "生产集群",
    "description": "生产环境 K8s 集群",
    "apiServer": "https://k8s-api.example.com",
    "version": "v1.28.0",
    "status": "healthy",
    "nodeCount": 10,
    "podCount": 150,
    "namespaceCount": 20,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-10-17T00:00:00Z"
  }
}
```

---

### 1.3 创建集群

**接口地址**: `POST /api/k8s/clusters`

**请求体**:

```json
{
  "name": "测试集群",
  "description": "测试环境集群",
  "apiServer": "https://test-k8s-api.example.com",
  "kubeconfig": "base64编码的kubeconfig内容"
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "Cluster created successfully",
  "data": {
    "id": "cluster-test-01",
    "name": "测试集群",
    "status": "healthy"
  }
}
```

---

### 1.4 更新集群

**接口地址**: `PUT /api/k8s/clusters/:id`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 集群 ID |

**请求体**:

```json
{
  "name": "生产集群（更新）",
  "description": "生产环境主集群"
}
```

---

### 1.5 删除集群

**接口地址**: `DELETE /api/k8s/clusters/:id`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 集群 ID |

---

### 1.6 获取集群监控指标

**接口地址**: `GET /api/k8s/clusters/:id/metrics`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 集群 ID |

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "cpuUsage": 50.5,
    "memoryUsage": 50.0,
    "diskUsage": 30.0,
    "podCount": 150,
    "nodeCount": 10,
    "namespaceCount": 20
  }
}
```

---

## 2. 命名空间管理 (Namespace)

### 2.1 获取命名空间列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "apiVersion": "v1",
    "kind": "NamespaceList",
    "metadata": {
      "resourceVersion": "12345"
    },
    "items": [
      {
        "apiVersion": "v1",
        "kind": "Namespace",
        "metadata": {
          "name": "default",
          "uid": "abc-123",
          "creationTimestamp": "2024-01-01T00:00:00Z",
          "labels": {
            "environment": "production"
          }
        },
        "status": {
          "phase": "Active"
        }
      }
    ],
    "total": 1
  }
}
```

---

### 2.2 获取命名空间详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:name`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| name | string | 是 | 命名空间名称 |

---

### 2.3 创建命名空间

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces`

**请求体**:

```json
{
  "apiVersion": "v1",
  "kind": "Namespace",
  "metadata": {
    "name": "my-namespace",
    "labels": {
      "environment": "production"
    }
  }
}
```

---

### 2.4 删除命名空间

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:name`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| name | string | 是 | 命名空间名称 |

---

## 3. 节点管理 (Node)

### 3.1 获取节点列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/nodes`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "apiVersion": "v1",
    "kind": "NodeList",
    "items": [
      {
        "apiVersion": "v1",
        "kind": "Node",
        "metadata": {
          "name": "node-1",
          "uid": "node-abc-123",
          "creationTimestamp": "2024-01-01T00:00:00Z",
          "labels": {
            "kubernetes.io/hostname": "node-1",
            "node-role.kubernetes.io/master": ""
          }
        },
        "spec": {
          "taints": [
            {
              "key": "node-role.kubernetes.io/master",
              "effect": "NoSchedule"
            }
          ]
        },
        "status": {
          "capacity": {
            "cpu": "16",
            "memory": "64Gi",
            "pods": "110"
          },
          "allocatable": {
            "cpu": "15500m",
            "memory": "62Gi",
            "pods": "110"
          },
          "conditions": [
            {
              "type": "Ready",
              "status": "True",
              "lastHeartbeatTime": "2024-10-17T10:00:00Z",
              "lastTransitionTime": "2024-01-01T00:00:00Z",
              "reason": "KubeletReady",
              "message": "kubelet is posting ready status"
            }
          ],
          "addresses": [
            {
              "type": "InternalIP",
              "address": "192.168.1.10"
            },
            {
              "type": "Hostname",
              "address": "node-1"
            }
          ],
          "nodeInfo": {
            "kubeletVersion": "v1.28.0",
            "osImage": "Ubuntu 22.04.3 LTS",
            "containerRuntimeVersion": "containerd://1.7.2",
            "architecture": "amd64"
          }
        }
      }
    ],
    "total": 1
  }
}
```

---

### 3.2 获取节点详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/nodes/:name`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| name | string | 是 | 节点名称 |

---

### 3.3 封锁节点 (Cordon)

**接口地址**: `POST /api/k8s/clusters/:clusterId/nodes/:name/cordon`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| name | string | 是 | 节点名称 |

**说明**: 封锁节点后，新的 Pod 将不会调度到该节点

---

### 3.4 解除封锁节点 (Uncordon)

**接口地址**: `POST /api/k8s/clusters/:clusterId/nodes/:name/uncordon`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| name | string | 是 | 节点名称 |

---

### 3.5 驱逐节点 (Drain)

**接口地址**: `POST /api/k8s/clusters/:clusterId/nodes/:name/drain`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| name | string | 是 | 节点名称 |

**请求体**:

```json
{
  "deleteLocalData": true,
  "force": false,
  "ignoreDaemonsets": true,
  "timeout": 60
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| deleteLocalData | boolean | 否 | 是否删除本地数据 |
| force | boolean | 否 | 是否强制驱逐 |
| ignoreDaemonsets | boolean | 否 | 是否忽略 DaemonSet |
| timeout | number | 否 | 超时时间（秒） |

---

### 3.6 更新节点标签

**接口地址**: `PUT /api/k8s/clusters/:clusterId/nodes/:name/labels`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| name | string | 是 | 节点名称 |

**请求体**:

```json
{
  "labels": {
    "environment": "production",
    "zone": "us-west-1a"
  }
}
```

---

### 3.7 更新节点污点

**接口地址**: `PUT /api/k8s/clusters/:clusterId/nodes/:name/taints`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| name | string | 是 | 节点名称 |

**请求体**:

```json
{
  "taints": [
    {
      "key": "dedicated",
      "value": "gpu",
      "effect": "NoSchedule"
    }
  ]
}
```

**污点效果说明**:

- **NoSchedule**: 不会将 Pod 调度到该节点
- **PreferNoSchedule**: 尽量不调度到该节点
- **NoExecute**: 不调度新 Pod，并驱逐现有 Pod

---

## 4. 工作负载管理

### 4.1 Pod 管理

#### 4.1.1 获取 Pod 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/pods`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| namespace | string | 是 | 命名空间 |

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| labelSelector | string | 否 | 标签选择器（如：app=nginx） |
| fieldSelector | string | 否 | 字段选择器（如：status.phase=Running） |

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "apiVersion": "v1",
    "kind": "PodList",
    "items": [
      {
        "apiVersion": "v1",
        "kind": "Pod",
        "metadata": {
          "name": "nginx-pod",
          "namespace": "default",
          "uid": "pod-123",
          "creationTimestamp": "2024-10-17T10:00:00Z",
          "labels": {
            "app": "nginx"
          }
        },
        "spec": {
          "containers": [
            {
              "name": "nginx",
              "image": "nginx:1.21",
              "ports": [
                {
                  "containerPort": 80,
                  "protocol": "TCP"
                }
              ]
            }
          ],
          "nodeName": "node-1"
        },
        "status": {
          "phase": "Running",
          "podIP": "10.244.1.10",
          "startTime": "2024-10-17T10:00:10Z",
          "conditions": [
            {
              "type": "Ready",
              "status": "True"
            }
          ],
          "containerStatuses": [
            {
              "name": "nginx",
              "ready": true,
              "restartCount": 0,
              "image": "nginx:1.21",
              "state": {
                "running": {
                  "startedAt": "2024-10-17T10:00:15Z"
                }
              }
            }
          ]
        }
      }
    ],
    "total": 1
  }
}
```

---

#### 4.1.2 获取 Pod 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/pods/:name`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| namespace | string | 是 | 命名空间 |
| name | string | 是 | Pod 名称 |

---

#### 4.1.3 创建 Pod

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/pods`

**请求体**:

```json
{
  "apiVersion": "v1",
  "kind": "Pod",
  "metadata": {
    "name": "nginx-pod",
    "labels": {
      "app": "nginx"
    }
  },
  "spec": {
    "containers": [
      {
        "name": "nginx",
        "image": "nginx:1.21",
        "ports": [
          {
            "containerPort": 80
          }
        ]
      }
    ]
  }
}
```

---

#### 4.1.4 更新 Pod

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/pods/:name`

**说明**: Pod 大部分字段不可变，通常通过删除重建来更新

---

#### 4.1.5 删除 Pod

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/pods/:name`

---

#### 4.1.6 获取 Pod 日志

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/pods/:name/logs`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| namespace | string | 是 | 命名空间 |
| name | string | 是 | Pod 名称 |

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| container | string | 否 | 容器名称（多容器时必填） |
| follow | boolean | 否 | 是否持续输出日志 |
| previous | boolean | 否 | 是否查看上一个实例的日志 |
| sinceSeconds | number | 否 | 只返回最近 N 秒的日志 |
| timestamps | boolean | 否 | 是否显示时间戳 |
| tailLines | number | 否 | 只返回最后 N 行日志 |
| limitBytes | number | 否 | 限制返回的字节数 |

**响应示例**:

```text
2024-10-17T10:00:00Z Starting nginx...
2024-10-17T10:00:01Z Nginx started successfully
```

---

#### 4.1.7 执行 Pod 命令

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/pods/:name/exec`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| clusterId | string | 是 | 集群 ID |
| namespace | string | 是 | 命名空间 |
| name | string | 是 | Pod 名称 |

**请求体**:

```json
{
  "container": "nginx",
  "command": ["/bin/sh", "-c", "ls -la"],
  "stdin": false,
  "stdout": true,
  "stderr": true,
  "tty": false
}
```

---

### 4.2 Deployment 管理

#### 4.2.1 获取 Deployment 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/deployments`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "apiVersion": "apps/v1",
    "kind": "DeploymentList",
    "items": [
      {
        "apiVersion": "apps/v1",
        "kind": "Deployment",
        "metadata": {
          "name": "nginx-deployment",
          "namespace": "default",
          "uid": "deploy-123",
          "creationTimestamp": "2024-10-17T10:00:00Z"
        },
        "spec": {
          "replicas": 3,
          "selector": {
            "matchLabels": {
              "app": "nginx"
            }
          },
          "template": {
            "metadata": {
              "labels": {
                "app": "nginx"
              }
            },
            "spec": {
              "containers": [
                {
                  "name": "nginx",
                  "image": "nginx:1.21",
                  "ports": [
                    {
                      "containerPort": 80
                    }
                  ]
                }
              ]
            }
          },
          "strategy": {
            "type": "RollingUpdate",
            "rollingUpdate": {
              "maxSurge": 1,
              "maxUnavailable": 0
            }
          }
        },
        "status": {
          "replicas": 3,
          "updatedReplicas": 3,
          "readyReplicas": 3,
          "availableReplicas": 3
        }
      }
    ],
    "total": 1
  }
}
```

---

#### 4.2.2 获取 Deployment 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/deployments/:name`

---

#### 4.2.3 创建 Deployment

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/deployments`

**请求体**:

```json
{
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {
    "name": "nginx-deployment"
  },
  "spec": {
    "replicas": 3,
    "selector": {
      "matchLabels": {
        "app": "nginx"
      }
    },
    "template": {
      "metadata": {
        "labels": {
          "app": "nginx"
        }
      },
      "spec": {
        "containers": [
          {
            "name": "nginx",
            "image": "nginx:1.21",
            "ports": [
              {
                "containerPort": 80
              }
            ]
          }
        ]
      }
    }
  }
}
```

---

#### 4.2.4 更新 Deployment

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/deployments/:name`

---

#### 4.2.5 删除 Deployment

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/deployments/:name`

---

#### 4.2.6 扩缩容 Deployment

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/deployments/:name/scale`

**请求体**:

```json
{
  "replicas": 5
}
```

---

#### 4.2.7 重启 Deployment

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/deployments/:name/restart`

**请求体**:

```json
{
  "restartedAt": "2024-10-17T10:00:00Z"
}
```

---

### 4.3 StatefulSet 管理

#### 4.3.1 获取 StatefulSet 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/statefulsets`

---

#### 4.3.2 获取 StatefulSet 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/statefulsets/:name`

---

#### 4.3.3 创建 StatefulSet

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/statefulsets`

---

#### 4.3.4 删除 StatefulSet

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/statefulsets/:name`

---

#### 4.3.5 扩缩容 StatefulSet

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/statefulsets/:name/scale`

**请求体**:

```json
{
  "replicas": 5
}
```

---

### 4.4 DaemonSet 管理

#### 4.4.1 获取 DaemonSet 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/daemonsets`

---

#### 4.4.2 获取 DaemonSet 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/daemonsets/:name`

---

#### 4.4.3 创建 DaemonSet

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/daemonsets`

---

#### 4.4.4 删除 DaemonSet

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/daemonsets/:name`

---

### 4.5 ReplicaSet 管理

#### 4.5.1 获取 ReplicaSet 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/replicasets`

---

#### 4.5.2 获取 ReplicaSet 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/replicasets/:name`

---

#### 4.5.3 创建 ReplicaSet

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/replicasets`

---

#### 4.5.4 更新 ReplicaSet

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/replicasets/:name`

---

#### 4.5.5 删除 ReplicaSet

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/replicasets/:name`

---

#### 4.5.6 扩缩容 ReplicaSet

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/replicasets/:name/scale`

**请求体**:

```json
{
  "replicas": 3
}
```

---

### 4.6 Job 管理

#### 4.6.1 获取 Job 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/jobs`

---

#### 4.6.2 获取 Job 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/jobs/:name`

---

#### 4.6.3 创建 Job

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/jobs`

---

#### 4.6.4 删除 Job

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/jobs/:name`

---

### 4.7 CronJob 管理

#### 4.7.1 获取 CronJob 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/cronjobs`

---

#### 4.7.2 获取 CronJob 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/cronjobs/:name`

---

#### 4.7.3 创建 CronJob

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/cronjobs`

**请求体**:

```json
{
  "apiVersion": "batch/v1",
  "kind": "CronJob",
  "metadata": {
    "name": "hello-cron"
  },
  "spec": {
    "schedule": "*/5 * * * *",
    "jobTemplate": {
      "spec": {
        "template": {
          "spec": {
            "containers": [
              {
                "name": "hello",
                "image": "busybox",
                "command": ["/bin/sh", "-c", "echo Hello from CronJob"]
              }
            ],
            "restartPolicy": "OnFailure"
          }
        }
      }
    }
  }
}
```

---

#### 4.7.4 更新 CronJob

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/cronjobs/:name`

---

#### 4.7.5 删除 CronJob

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/cronjobs/:name`

---

#### 4.7.6 暂停/恢复 CronJob

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/cronjobs/:name`

**请求体**:

```json
{
  "spec": {
    "suspend": true
  }
}
```

**说明**: `suspend: true` 暂停，`suspend: false` 恢复

---

## 5. 服务与网络

### 5.1 Service 管理

#### 5.1.1 获取 Service 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/services`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "apiVersion": "v1",
    "kind": "ServiceList",
    "items": [
      {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
          "name": "nginx-service",
          "namespace": "default"
        },
        "spec": {
          "type": "ClusterIP",
          "clusterIP": "10.96.0.10",
          "ports": [
            {
              "port": 80,
              "targetPort": 80,
              "protocol": "TCP"
            }
          ],
          "selector": {
            "app": "nginx"
          }
        }
      }
    ],
    "total": 1
  }
}
```

---

#### 5.1.2 获取 Service 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/services/:name`

---

#### 5.1.3 创建 Service

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/services`

**请求体**:

```json
{
  "apiVersion": "v1",
  "kind": "Service",
  "metadata": {
    "name": "nginx-service"
  },
  "spec": {
    "type": "ClusterIP",
    "ports": [
      {
        "port": 80,
        "targetPort": 80,
        "protocol": "TCP"
      }
    ],
    "selector": {
      "app": "nginx"
    }
  }
}
```

**Service 类型说明**:

- **ClusterIP**: 仅集群内部访问
- **NodePort**: 通过节点端口访问
- **LoadBalancer**: 通过云厂商负载均衡器访问
- **ExternalName**: 映射到外部域名

---

#### 5.1.4 更新 Service

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/services/:name`

---

#### 5.1.5 删除 Service

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/services/:name`

---

### 5.2 Ingress 管理

#### 5.2.1 获取 Ingress 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/ingresses`

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ingressClass | string | 否 | Ingress 类名过滤 |

---

#### 5.2.2 获取 Ingress 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/ingresses/:name`

---

#### 5.2.3 创建 Ingress

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/ingresses`

**请求体**:

```json
{
  "apiVersion": "networking.k8s.io/v1",
  "kind": "Ingress",
  "metadata": {
    "name": "example-ingress",
    "annotations": {
      "nginx.ingress.kubernetes.io/rewrite-target": "/"
    }
  },
  "spec": {
    "ingressClassName": "nginx",
    "rules": [
      {
        "host": "example.com",
        "http": {
          "paths": [
            {
              "path": "/",
              "pathType": "Prefix",
              "backend": {
                "service": {
                  "name": "nginx-service",
                  "port": {
                    "number": 80
                  }
                }
              }
            }
          ]
        }
      }
    ],
    "tls": [
      {
        "hosts": ["example.com"],
        "secretName": "example-tls"
      }
    ]
  }
}
```

---

#### 5.2.4 更新 Ingress

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/ingresses/:name`

---

#### 5.2.5 删除 Ingress

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/ingresses/:name`

---

### 5.3 NetworkPolicy 管理

#### 5.3.1 获取 NetworkPolicy 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/networkpolicies`

---

#### 5.3.2 获取 NetworkPolicy 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/networkpolicies/:name`

---

#### 5.3.3 创建 NetworkPolicy

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/networkpolicies`

**请求体**:

```json
{
  "apiVersion": "networking.k8s.io/v1",
  "kind": "NetworkPolicy",
  "metadata": {
    "name": "allow-nginx"
  },
  "spec": {
    "podSelector": {
      "matchLabels": {
        "app": "nginx"
      }
    },
    "policyTypes": ["Ingress", "Egress"],
    "ingress": [
      {
        "from": [
          {
            "podSelector": {
              "matchLabels": {
                "role": "frontend"
              }
            }
          }
        ],
        "ports": [
          {
            "protocol": "TCP",
            "port": 80
          }
        ]
      }
    ],
    "egress": [
      {
        "to": [
          {
            "ipBlock": {
              "cidr": "10.0.0.0/24"
            }
          }
        ]
      }
    ]
  }
}
```

---

#### 5.3.4 更新 NetworkPolicy

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/networkpolicies/:name`

---

#### 5.3.5 删除 NetworkPolicy

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/networkpolicies/:name`

---

### 5.4 Endpoints 管理

#### 5.4.1 获取 Endpoints 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/endpoints`

---

#### 5.4.2 获取 Endpoints 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/endpoints/:name`

---

#### 5.4.3 创建 Endpoints

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/endpoints`

---

#### 5.4.4 更新 Endpoints

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/endpoints/:name`

---

#### 5.4.5 删除 Endpoints

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/endpoints/:name`

---

### 5.5 EndpointSlice 管理

#### 5.5.1 获取 EndpointSlice 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/endpointslices`

---

#### 5.5.2 获取 EndpointSlice 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/endpointslices/:name`

---

#### 5.5.3 创建 EndpointSlice

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/endpointslices`

---

#### 5.5.4 更新 EndpointSlice

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/endpointslices/:name`

---

#### 5.5.5 删除 EndpointSlice

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/endpointslices/:name`

---

## 6. 配置与存储

### 6.1 ConfigMap 管理

#### 6.1.1 获取 ConfigMap 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/configmaps`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "apiVersion": "v1",
    "kind": "ConfigMapList",
    "items": [
      {
        "apiVersion": "v1",
        "kind": "ConfigMap",
        "metadata": {
          "name": "app-config",
          "namespace": "default"
        },
        "data": {
          "database.host": "mysql.example.com",
          "database.port": "3306",
          "app.env": "production"
        }
      }
    ],
    "total": 1
  }
}
```

---

#### 6.1.2 获取 ConfigMap 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/configmaps/:name`

---

#### 6.1.3 创建 ConfigMap

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/configmaps`

**请求体**:

```json
{
  "apiVersion": "v1",
  "kind": "ConfigMap",
  "metadata": {
    "name": "app-config"
  },
  "data": {
    "database.host": "mysql.example.com",
    "database.port": "3306"
  }
}
```

---

#### 6.1.4 更新 ConfigMap

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/configmaps/:name`

---

#### 6.1.5 删除 ConfigMap

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/configmaps/:name`

---

### 6.2 Secret 管理

#### 6.2.1 获取 Secret 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/secrets`

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "apiVersion": "v1",
    "kind": "SecretList",
    "items": [
      {
        "apiVersion": "v1",
        "kind": "Secret",
        "metadata": {
          "name": "db-credentials",
          "namespace": "default"
        },
        "type": "Opaque",
        "data": {
          "username": "YWRtaW4=",
          "password": "cGFzc3dvcmQxMjM="
        }
      }
    ],
    "total": 1
  }
}
```

---

#### 6.2.2 获取 Secret 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/secrets/:name`

---

#### 6.2.3 创建 Secret

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/secrets`

**请求体**:

```json
{
  "apiVersion": "v1",
  "kind": "Secret",
  "metadata": {
    "name": "db-credentials"
  },
  "type": "Opaque",
  "data": {
    "username": "YWRtaW4=",
    "password": "cGFzc3dvcmQxMjM="
  }
}
```

**说明**: data 字段的值需要进行 Base64 编码

---

#### 6.2.4 更新 Secret

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/secrets/:name`

---

#### 6.2.5 删除 Secret

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/secrets/:name`

---

### 6.3 PersistentVolume 管理

#### 6.3.1 获取 PV 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/persistentvolumes`

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| storageClass | string | 否 | 存储类名过滤 |
| status | string | 否 | 状态过滤 (Available/Bound/Released/Failed) |
| accessMode | string | 否 | 访问模式过滤 |

---

#### 6.3.2 获取 PV 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/persistentvolumes/:name`

---

#### 6.3.3 创建 PV

**接口地址**: `POST /api/k8s/clusters/:clusterId/persistentvolumes`

**请求体**:

```json
{
  "apiVersion": "v1",
  "kind": "PersistentVolume",
  "metadata": {
    "name": "pv-nfs-001"
  },
  "spec": {
    "capacity": {
      "storage": "10Gi"
    },
    "accessModes": ["ReadWriteMany"],
    "persistentVolumeReclaimPolicy": "Retain",
    "storageClassName": "nfs",
    "nfs": {
      "server": "nfs.example.com",
      "path": "/exports/data"
    }
  }
}
```

---

#### 6.3.4 更新 PV

**接口地址**: `PUT /api/k8s/clusters/:clusterId/persistentvolumes/:name`

---

#### 6.3.5 删除 PV

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/persistentvolumes/:name`

---

### 6.4 PersistentVolumeClaim 管理

#### 6.4.1 获取 PVC 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/persistentvolumeclaims`

---

#### 6.4.2 获取 PVC 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/persistentvolumeclaims/:name`

---

#### 6.4.3 创建 PVC

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/persistentvolumeclaims`

**请求体**:

```json
{
  "apiVersion": "v1",
  "kind": "PersistentVolumeClaim",
  "metadata": {
    "name": "data-claim"
  },
  "spec": {
    "accessModes": ["ReadWriteOnce"],
    "resources": {
      "requests": {
        "storage": "5Gi"
      }
    },
    "storageClassName": "standard"
  }
}
```

---

#### 6.4.4 更新 PVC

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/persistentvolumeclaims/:name`

---

#### 6.4.5 删除 PVC

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/persistentvolumeclaims/:name`

---

### 6.5 StorageClass 管理

#### 6.5.1 获取 StorageClass 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/storageclasses`

---

#### 6.5.2 获取 StorageClass 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/storageclasses/:name`

---

#### 6.5.3 创建 StorageClass

**接口地址**: `POST /api/k8s/clusters/:clusterId/storageclasses`

**请求体**:

```json
{
  "apiVersion": "storage.k8s.io/v1",
  "kind": "StorageClass",
  "metadata": {
    "name": "fast-ssd"
  },
  "provisioner": "kubernetes.io/aws-ebs",
  "parameters": {
    "type": "gp3",
    "iops": "3000"
  },
  "reclaimPolicy": "Delete",
  "volumeBindingMode": "WaitForFirstConsumer",
  "allowVolumeExpansion": true
}
```

---

#### 6.5.4 更新 StorageClass

**接口地址**: `PUT /api/k8s/clusters/:clusterId/storageclasses/:name`

---

#### 6.5.5 删除 StorageClass

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/storageclasses/:name`

---

## 7. RBAC 权限管理

### 7.1 ServiceAccount 管理

#### 7.1.1 获取 ServiceAccount 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/serviceaccounts`

---

#### 7.1.2 获取 ServiceAccount 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/serviceaccounts/:name`

---

#### 7.1.3 创建 ServiceAccount

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/serviceaccounts`

**请求体**:

```json
{
  "apiVersion": "v1",
  "kind": "ServiceAccount",
  "metadata": {
    "name": "app-sa"
  },
  "automountServiceAccountToken": false
}
```

---

#### 7.1.4 更新 ServiceAccount

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/serviceaccounts/:name`

---

#### 7.1.5 删除 ServiceAccount

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/serviceaccounts/:name`

---

### 7.2 Role 管理

#### 7.2.1 获取 Role 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/roles`

---

#### 7.2.2 获取 Role 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/roles/:name`

---

#### 7.2.3 创建 Role

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/roles`

**请求体**:

```json
{
  "apiVersion": "rbac.authorization.k8s.io/v1",
  "kind": "Role",
  "metadata": {
    "name": "pod-reader"
  },
  "rules": [
    {
      "apiGroups": [""],
      "resources": ["pods"],
      "verbs": ["get", "list", "watch"]
    }
  ]
}
```

---

#### 7.2.4 更新 Role

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/roles/:name`

---

#### 7.2.5 删除 Role

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/roles/:name`

---

### 7.3 RoleBinding 管理

#### 7.3.1 获取 RoleBinding 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/rolebindings`

---

#### 7.3.2 获取 RoleBinding 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/rolebindings/:name`

---

#### 7.3.3 创建 RoleBinding

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/rolebindings`

**请求体**:

```json
{
  "apiVersion": "rbac.authorization.k8s.io/v1",
  "kind": "RoleBinding",
  "metadata": {
    "name": "read-pods"
  },
  "subjects": [
    {
      "kind": "User",
      "name": "jane",
      "apiGroup": "rbac.authorization.k8s.io"
    }
  ],
  "roleRef": {
    "kind": "Role",
    "name": "pod-reader",
    "apiGroup": "rbac.authorization.k8s.io"
  }
}
```

---

#### 7.3.4 更新 RoleBinding

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/rolebindings/:name`

---

#### 7.3.5 删除 RoleBinding

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/rolebindings/:name`

---

### 7.4 ClusterRole 管理

#### 7.4.1 获取 ClusterRole 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/clusterroles`

---

#### 7.4.2 获取 ClusterRole 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/clusterroles/:name`

---

#### 7.4.3 创建 ClusterRole

**接口地址**: `POST /api/k8s/clusters/:clusterId/clusterroles`

---

#### 7.4.4 更新 ClusterRole

**接口地址**: `PUT /api/k8s/clusters/:clusterId/clusterroles/:name`

---

#### 7.4.5 删除 ClusterRole

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/clusterroles/:name`

---

### 7.5 ClusterRoleBinding 管理

#### 7.5.1 获取 ClusterRoleBinding 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/clusterrolebindings`

---

#### 7.5.2 获取 ClusterRoleBinding 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/clusterrolebindings/:name`

---

#### 7.5.3 创建 ClusterRoleBinding

**接口地址**: `POST /api/k8s/clusters/:clusterId/clusterrolebindings`

---

#### 7.5.4 更新 ClusterRoleBinding

**接口地址**: `PUT /api/k8s/clusters/:clusterId/clusterrolebindings/:name`

---

#### 7.5.5 删除 ClusterRoleBinding

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/clusterrolebindings/:name`

---

## 8. 资源配额管理

### 8.1 ResourceQuota 管理

#### 8.1.1 获取 ResourceQuota 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/resourcequotas`

---

#### 8.1.2 获取 ResourceQuota 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/resourcequotas/:name`

---

#### 8.1.3 创建 ResourceQuota

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/resourcequotas`

**请求体**:

```json
{
  "apiVersion": "v1",
  "kind": "ResourceQuota",
  "metadata": {
    "name": "compute-quota"
  },
  "spec": {
    "hard": {
      "requests.cpu": "10",
      "requests.memory": "20Gi",
      "limits.cpu": "20",
      "limits.memory": "40Gi",
      "pods": "50"
    }
  }
}
```

---

#### 8.1.4 更新 ResourceQuota

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/resourcequotas/:name`

---

#### 8.1.5 删除 ResourceQuota

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/resourcequotas/:name`

---

### 8.2 LimitRange 管理

#### 8.2.1 获取 LimitRange 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/limitranges`

---

#### 8.2.2 获取 LimitRange 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/limitranges/:name`

---

#### 8.2.3 创建 LimitRange

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/limitranges`

**请求体**:

```json
{
  "apiVersion": "v1",
  "kind": "LimitRange",
  "metadata": {
    "name": "mem-limit-range"
  },
  "spec": {
    "limits": [
      {
        "type": "Container",
        "max": {
          "memory": "2Gi",
          "cpu": "2"
        },
        "min": {
          "memory": "100Mi",
          "cpu": "100m"
        },
        "default": {
          "memory": "512Mi",
          "cpu": "500m"
        },
        "defaultRequest": {
          "memory": "256Mi",
          "cpu": "200m"
        }
      }
    ]
  }
}
```

---

#### 8.2.4 更新 LimitRange

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/limitranges/:name`

---

#### 8.2.5 删除 LimitRange

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/limitranges/:name`

---

## 9. 自动扩缩容

### 9.1 HorizontalPodAutoscaler (HPA) 管理

#### 9.1.1 获取 HPA 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/horizontalpodautoscalers`

---

#### 9.1.2 获取 HPA 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/horizontalpodautoscalers/:name`

---

#### 9.1.3 创建 HPA

**接口地址**: `POST /api/k8s/clusters/:clusterId/namespaces/:namespace/horizontalpodautoscalers`

**请求体**:

```json
{
  "apiVersion": "autoscaling/v2",
  "kind": "HorizontalPodAutoscaler",
  "metadata": {
    "name": "nginx-hpa"
  },
  "spec": {
    "scaleTargetRef": {
      "apiVersion": "apps/v1",
      "kind": "Deployment",
      "name": "nginx-deployment"
    },
    "minReplicas": 2,
    "maxReplicas": 10,
    "metrics": [
      {
        "type": "Resource",
        "resource": {
          "name": "cpu",
          "target": {
            "type": "Utilization",
            "averageUtilization": 50
          }
        }
      },
      {
        "type": "Resource",
        "resource": {
          "name": "memory",
          "target": {
            "type": "Utilization",
            "averageUtilization": 80
          }
        }
      }
    ]
  }
}
```

---

#### 9.1.4 更新 HPA

**接口地址**: `PUT /api/k8s/clusters/:clusterId/namespaces/:namespace/horizontalpodautoscalers/:name`

---

#### 9.1.5 删除 HPA

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/namespaces/:namespace/horizontalpodautoscalers/:name`

---

## 10. 调度与优先级

### 10.1 PriorityClass 管理

#### 10.1.1 获取 PriorityClass 列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/priorityclasses`

---

#### 10.1.2 获取 PriorityClass 详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/priorityclasses/:name`

---

#### 10.1.3 创建 PriorityClass

**接口地址**: `POST /api/k8s/clusters/:clusterId/priorityclasses`

**请求体**:

```json
{
  "apiVersion": "scheduling.k8s.io/v1",
  "kind": "PriorityClass",
  "metadata": {
    "name": "high-priority"
  },
  "value": 1000000,
  "globalDefault": false,
  "description": "高优先级工作负载",
  "preemptionPolicy": "PreemptLowerPriority"
}
```

---

#### 10.1.4 更新 PriorityClass

**接口地址**: `PUT /api/k8s/clusters/:clusterId/priorityclasses/:name`

---

#### 10.1.5 删除 PriorityClass

**接口地址**: `DELETE /api/k8s/clusters/:clusterId/priorityclasses/:name`

---

## 11. 事件管理

### 11.1 获取事件列表

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/events`

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| involvedObjectKind | string | 否 | 关联对象类型 (如 Pod) |
| involvedObjectName | string | 否 | 关联对象名称 |
| type | string | 否 | 事件类型 (Normal/Warning) |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "apiVersion": "v1",
    "kind": "EventList",
    "items": [
      {
        "apiVersion": "v1",
        "kind": "Event",
        "metadata": {
          "name": "nginx-pod.17a9b8c",
          "namespace": "default"
        },
        "involvedObject": {
          "kind": "Pod",
          "name": "nginx-pod",
          "namespace": "default"
        },
        "reason": "Started",
        "message": "Started container nginx",
        "source": {
          "component": "kubelet",
          "host": "node-1"
        },
        "firstTimestamp": "2024-10-17T10:00:00Z",
        "lastTimestamp": "2024-10-17T10:00:00Z",
        "count": 1,
        "type": "Normal"
      }
    ],
    "total": 1
  }
}
```

---

### 11.2 获取事件详情

**接口地址**: `GET /api/k8s/clusters/:clusterId/namespaces/:namespace/events/:name`

---

## 附录

### A. 数据结构定义

#### K8sMetadata

```typescript
interface K8sMetadata {
  name: string;
  namespace?: string;
  uid?: string;
  resourceVersion?: string;
  creationTimestamp?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}
```

---

#### K8sListMetadata

```typescript
interface K8sListMetadata {
  resourceVersion?: string;
  continue?: string;
  remainingItemCount?: number;
}
```

---

#### Container

```typescript
interface Container {
  name: string;
  image: string;
  ports?: Array<{
    containerPort: number;
    name?: string;
    protocol?: string;
  }>;
  env?: Array<{
    name: string;
    value?: string;
    valueFrom?: any;
  }>;
  resources?: {
    limits?: { cpu?: string; memory?: string };
    requests?: { cpu?: string; memory?: string };
  };
  volumeMounts?: Array<{
    mountPath: string;
    name: string;
    readOnly?: boolean;
  }>;
}
```

---

#### PodSpec

```typescript
interface PodSpec {
  containers: Container[];
  restartPolicy?: string;
  nodeName?: string;
  serviceAccountName?: string;
  volumes?: any[];
}
```

---

#### PodStatus

```typescript
interface PodStatus {
  phase: 'Running' | 'Pending' | 'Succeeded' | 'Failed' | 'Unknown';
  conditions: PodCondition[];
  hostIP?: string;
  podIP?: string;
  podIPs?: Array<{ ip: string }>;
  startTime?: string;
  containerStatuses?: ContainerStatus[];
  qosClass?: string;
}
```

---

### B. 枚举值说明

**Pod 状态 (Phase)**:

- `Running`: 运行中
- `Pending`: 等待中
- `Succeeded`: 成功完成
- `Failed`: 失败
- `Unknown`: 未知状态

**Service 类型 (Type)**:

- `ClusterIP`: 集群内部 IP
- `NodePort`: 节点端口
- `LoadBalancer`: 负载均衡器
- `ExternalName`: 外部名称

**Deployment 更新策略 (Strategy)**:

- `RollingUpdate`: 滚动更新
- `Recreate`: 重建更新

**PV 回收策略 (ReclaimPolicy)**:

- `Retain`: 保留
- `Recycle`: 回收
- `Delete`: 删除

**访问模式 (AccessModes)**:

- `ReadWriteOnce`: 单节点读写
- `ReadOnlyMany`: 多节点只读
- `ReadWriteMany`: 多节点读写
- `ReadWriteOncePod`: 单 Pod 读写

---

### C. 状态码说明

**通用状态码**:

| 状态码 | 说明 | 处理建议 |
|--------|------|----------|
| 0 | 成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和内容 |
| 401 | 未授权 | 检查认证信息 |
| 403 | 权限不足 | 联系管理员授权 |
| 404 | 资源不存在 | 确认资源名称是否正确 |
| 409 | 资源冲突 | 资源已存在或名称冲突 |
| 500 | 服务器内部错误 | 联系技术支持 |
| 503 | 服务不可用 | 稍后重试或联系技术支持 |

---

**文档说明**:

1. 所有接口返回的日期时间格式遵循 ISO 8601 标准（如：`2024-10-17T10:00:00Z`）
2. 所有分页接口的页码从 1 开始
3. 建议在生产环境使用 HTTPS 协议
4. 所有创建/更新请求必须符合 Kubernetes API 规范
5. 删除操作通常是异步的，资源可能不会立即删除

**更新记录**:

- 2025-10-17: 初始版本发布
