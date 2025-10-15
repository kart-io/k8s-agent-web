# K8s 管理平台功能特性详解

本文档详细介绍 Kubernetes 管理平台各个模块的功能特性和使用方法。

## 目录

- [Dashboard 总览](#dashboard-总览)
- [工作负载管理](#工作负载管理)
- [网络管理](#网络管理)
- [配置管理](#配置管理)
- [存储管理](#存储管理)
- [权限与安全](#权限与安全)
- [资源配额管理](#资源配额管理)
- [集群管理](#集群管理)

## Dashboard 总览

Dashboard 是平台的首页，提供了集群整体状态的快速概览。

### 顶部统计卡片

展示 6 个核心指标的实时统计：

1. **集群总数**
   - 图标：集群图标（蓝色）
   - 显示当前管理的所有集群数量
   - 点击可跳转到集群管理页面

2. **节点总数**
   - 图标：服务器图标（绿色）
   - 显示所有集群的节点总数
   - 包含 Master 和 Worker 节点

3. **命名空间**
   - 图标：文件夹图标（紫色）
   - 显示所有命名空间数量
   - 包含系统和用户创建的命名空间

4. **Pod 总数**
   - 图标：数据库图标（青色）
   - 显示运行中的 Pod 总数
   - 实时更新

5. **Deployments**
   - 图标：火箭图标（橙色）
   - 显示部署的应用数量
   - 反映应用部署规模

6. **Services**
   - 图标：API 图标（粉色）
   - 显示服务总数
   - 包含各种类型的服务

### 集群状态卡片

显示每个集群的详细状态信息：

- **状态标签**：
  - 健康（绿色）：集群运行正常
  - 异常（红色）：存在严重问题
  - 警告（黄色）：存在需要关注的问题

- **基本信息**：
  - 集群版本
  - 节点数量
  - Pod 数量

- **资源使用情况**：
  - CPU 使用率（已用/总量）
  - 内存使用率（已用/总量）
  - 进度条可视化

### 资源健康状态

按资源类型统计健康状态：

1. **Pods 健康状态**
   - Running：正常运行的 Pods
   - Pending：等待调度或启动的 Pods
   - Failed/Error：运行失败的 Pods

2. **Nodes 健康状态**
   - Ready：可用节点
   - NotReady：不可用节点
   - Unknown：状态未知的节点

3. **Deployments 健康状态**
   - 根据可用副本数判断
   - 完全可用：绿色
   - 部分可用：黄色
   - 不可用：红色

4. **Services 健康状态**
   - 默认全部显示为健康状态

### 最近事件

展示集群中最近发生的事件：

- **事件类型**：
  - Normal（蓝色）：正常事件
  - Warning（黄色）：警告事件
  - Error（红色）：错误事件

- **显示内容**：
  - 事件时间（相对时间）
  - 关联对象（Kind/Name）
  - 事件原因
  - 详细消息
  - 命名空间

## 工作负载管理

### Pods

Pod 是 Kubernetes 中最小的部署单元。

#### 列表功能

- **列信息**：
  - 名称：Pod 名称
  - 命名空间：所属命名空间
  - 状态：Running、Pending、Failed、Succeeded、Unknown
  - 就绪容器数：Ready/Total
  - 重启次数：容器重启统计
  - IP 地址：Pod IP
  - 节点：运行的节点名称
  - 创建时间：相对时间或绝对时间

- **筛选功能**：
  - 按命名空间筛选
  - 按状态筛选
  - 关键字搜索（名称、IP）

- **操作按钮**：
  - 查看详情
  - 查看日志
  - 删除 Pod

#### 详情抽屉

- **基本信息**：
  - UID、Labels、Annotations
  - QoS Class（服务质量类别）
  - Node Selector、Tolerations

- **容器列表**：
  - 容器名称、镜像
  - 资源请求和限制（CPU、Memory）
  - 环境变量
  - 挂载的卷

- **状态信息**：
  - Pod Phase
  - Pod IP、Host IP
  - 启动时间

- **事件列表**：
  - 与该 Pod 相关的所有事件
  - 按时间倒序排列

#### 日志查看

- **功能特性**：
  - 实时滚动日志
  - 多容器支持（如果 Pod 包含多个容器）
  - 日志搜索和高亮
  - 下载日志文件
  - 显示行号
  - 暗色主题支持

### Deployments

Deployment 提供声明式的应用部署和更新。

#### 列表功能

- **列信息**：
  - 名称
  - 命名空间
  - 副本数（Desired/Current/Ready/Available）
  - 更新策略：RollingUpdate、Recreate
  - 镜像
  - 创建时间

- **操作功能**：
  - 扩缩容：调整副本数
  - 重启：滚动重启所有 Pods
  - 查看详情
  - 编辑配置
  - 删除

#### 详情抽屉

- **基本信息**：
  - 选择器（Selector）
  - 副本数配置
  - 更新策略详情

- **容器模板**：
  - 容器镜像和标签
  - 资源配置
  - 环境变量
  - 挂载卷

- **状态信息**：
  - Replicas 状态
  - Conditions 列表
  - 可用性状态

- **关联的 Pods**：
  - 由该 Deployment 创建的所有 Pods
  - 可点击跳转到 Pod 详情

### StatefulSets

StatefulSet 用于管理有状态应用。

#### 主要特性

- **稳定的网络标识**：
  - 每个 Pod 有固定的名称
  - 格式：`<statefulset-name>-<ordinal>`

- **稳定的存储**：
  - PVC 与 Pod 绑定
  - Pod 重建后使用相同的 PVC

- **有序部署和扩展**：
  - Pod 按顺序创建和删除
  - 支持滚动更新

#### 列表显示

- 名称、命名空间
- 副本数（Ready/Desired）
- 镜像
- 服务名称（Headless Service）
- 创建时间

### DaemonSets

DaemonSet 确保所有（或某些）节点运行一个 Pod 副本。

#### 使用场景

- 集群日志收集（Fluentd、Logstash）
- 节点监控（Prometheus Node Exporter）
- 网络插件（Calico、Flannel）

#### 列表显示

- 名称、命名空间
- 就绪节点数（Current/Desired）
- 可用节点数
- 镜像
- 节点选择器
- 创建时间

### Jobs

Job 创建一个或多个 Pods，确保指定数量的 Pods 成功完成。

#### 主要配置

- **Completions**：需要成功完成的 Pod 数量
- **Parallelism**：并行运行的 Pod 数量
- **BackoffLimit**：失败重试次数
- **ActiveDeadlineSeconds**：任务超时时间

#### 状态显示

- 运行中（Active）
- 已成功（Succeeded）
- 已失败（Failed）
- 完成时间

### CronJobs

CronJob 按照时间表（Cron 格式）定期创建 Jobs。

#### 主要功能

- **Schedule 配置**：
  - Cron 表达式：`* * * * *`（分 时 日 月 周）
  - 支持标准 Cron 语法

- **Job 历史限制**：
  - SuccessfulJobsHistoryLimit：保留成功 Job 数量
  - FailedJobsHistoryLimit：保留失败 Job 数量

- **并发策略**：
  - Allow：允许并发运行
  - Forbid：禁止并发，跳过新的运行
  - Replace：取消当前运行，启动新的

#### 列表显示

- 名称、命名空间
- Schedule 表达式
- 挂起状态
- 活跃 Job 数
  - 最后调度时间
- 下次调度时间（预计）

## 网络管理

### Services

Service 为一组 Pods 提供稳定的网络访问入口。

#### Service 类型

1. **ClusterIP**（默认）
   - 集群内部访问
   - 分配一个内部 IP
   - 仅在集群内可访问

2. **NodePort**
   - 在每个节点上开放端口
   - 格式：`<NodeIP>:<NodePort>`
   - 端口范围：30000-32767

3. **LoadBalancer**
   - 使用云服务商的负载均衡器
   - 自动分配外部 IP
   - 适用于云环境

4. **ExternalName**
   - 将服务映射到外部 DNS 名称
   - 返回 CNAME 记录

#### 列表功能

- **列信息**：
  - 名称、命名空间
  - 类型
  - Cluster IP
  - External IP（如果有）
  - 端口映射（Port:TargetPort/Protocol）
  - 选择器
  - 创建时间

- **详情显示**：
  - Selector Labels
  - Session Affinity（会话亲和性）
  - Endpoints 列表（关联的 Pod IP 和端口）

### Ingress

Ingress 提供从集群外部到集群内服务的 HTTP 和 HTTPS 路由。

#### 主要功能

1. **路由规则**：
   - 基于主机名（Host）
   - 基于路径（Path）
   - 支持正则表达式

2. **TLS 配置**：
   - HTTPS 支持
   - 证书管理
   - 多域名支持

3. **后端服务**：
   - 服务名称
   - 服务端口
   - 路径重写

#### 列表显示

- 名称、命名空间
- Ingress Class
- 域名列表
- 地址（LoadBalancer IP）
- 端口（80、443）
- 创建时间

#### 详情抽屉

- **规则列表**：
  - Host
  - Path
  - PathType（Prefix、Exact、ImplementationSpecific）
  - Backend Service
  - Service Port

- **TLS 配置**：
  - Hosts
  - Secret Name（证书存储）

## 配置管理

### ConfigMaps

ConfigMap 用于存储非敏感的配置数据。

#### 使用场景

- 应用配置文件
- 命令行参数
- 环境变量
- 配置项

#### 数据格式

支持两种格式：

1. **data**：UTF-8 字符串
2. **binaryData**：Base64 编码的二进制数据

#### 列表功能

- 名称、命名空间
- 数据项数量（Keys）
- 创建时间

#### 详情抽屉

- **键值对列表**：
  - Key
  - Value（支持多行显示）
  - 长度信息

- **使用方式**：
  - 作为环境变量
  - 作为命令行参数
  - 作为配置文件（Volume 挂载）

### Secrets

Secret 用于存储敏感信息（密码、Token、密钥等）。

#### Secret 类型

1. **Opaque**：任意用户定义的数据（默认）
2. **kubernetes.io/service-account-token**：ServiceAccount Token
3. **kubernetes.io/dockercfg**：Docker 配置文件
4. **kubernetes.io/dockerconfigjson**：Docker 配置 JSON
5. **kubernetes.io/basic-auth**：基本认证凭据
6. **kubernetes.io/ssh-auth**：SSH 认证凭据
7. **kubernetes.io/tls**：TLS 证书和密钥

#### 安全特性

- Base64 编码存储
- RBAC 权限控制
- 支持加密存储（Encryption at Rest）
- 最小化暴露原则

#### 列表显示

- 名称、命名空间
- 类型
- 数据项数量
- 创建时间

#### 详情抽屉

- Keys 列表（不显示 Value）
- 类型信息
- 使用该 Secret 的资源

## 存储管理

### 存储概览

提供存储资源的全局视图。

#### 容量统计

- **总容量**：所有 PV 的总容量
- **已使用容量**：已绑定 PV 的容量
- **可用容量**：未绑定 PV 的容量
- **使用率**：已使用/总容量百分比

#### StorageClass 分布

- 饼图或柱状图展示
- 每个 StorageClass 的 PV 数量
- 容量分布

#### 命名空间使用情况

- 按命名空间统计 PVC 数量和容量
- 排行榜展示
- 可点击跳转到详情

#### 最近的 PV/PVC 绑定

- 最近绑定的 PV 和 PVC
- 绑定状态
- 时间线展示

### PersistentVolumes (PV)

PV 是集群级别的存储资源。

#### PV 生命周期

1. **Available**：可用，未被 PVC 绑定
2. **Bound**：已绑定到 PVC
3. **Released**：PVC 已删除，但资源未回收
4. **Failed**：自动回收失败

#### 访问模式

- **ReadWriteOnce (RWO)**：单节点读写
- **ReadOnlyMany (ROX)**：多节点只读
- **ReadWriteMany (RWX)**：多节点读写
- **ReadWriteOncePod (RWOP)**：单 Pod 读写

#### 回收策略

- **Retain**：手动回收
- **Recycle**：基本清理（已废弃）
- **Delete**：自动删除

#### 列表显示

- 名称
- 容量
- 访问模式
- 回收策略
- 状态
- StorageClass
- 声明（绑定的 PVC）
- 创建时间

### PersistentVolumeClaims (PVC)

PVC 是用户的存储请求。

#### 主要配置

- **资源请求**：
  - 存储容量（Storage）
  - 访问模式

- **选择器**：
  - Label Selector：选择特定的 PV
  - StorageClass：指定存储类

- **卷模式**：
  - Filesystem：文件系统
  - Block：块设备

#### 列表显示

- 名称、命名空间
- 状态（Pending、Bound、Lost）
- 卷名称（绑定的 PV）
- 容量
- 访问模式
- StorageClass
- 创建时间

### StorageClasses

StorageClass 为动态存储供应提供描述。

#### 主要配置

- **Provisioner**：存储供应商
  - kubernetes.io/aws-ebs
  - kubernetes.io/gce-pd
  - kubernetes.io/cinder
  - kubernetes.io/nfs
  - 自定义 Provisioner

- **参数**：
  - type：存储类型
  - zone：可用区
  - iopsPerGB：IOPS
  - encrypted：加密

- **回收策略**：
  - Delete（默认）
  - Retain

- **卷绑定模式**：
  - Immediate：立即绑定
  - WaitForFirstConsumer：延迟绑定

#### 列表显示

- 名称
- Provisioner
- 回收策略
- 卷绑定模式
- 是否为默认 StorageClass
- 创建时间

## 权限与安全

### ServiceAccounts

ServiceAccount 为 Pod 中的进程提供身份标识。

#### 主要功能

- **自动挂载**：
  - Token 自动挂载到 Pod
  - 路径：`/var/run/secrets/kubernetes.io/serviceaccount/`

- **关联资源**：
  - Secrets：存储 Token
  - ImagePullSecrets：拉取私有镜像

#### 列表显示

- 名称、命名空间
- Secrets 数量
- 创建时间

### Roles

Role 定义命名空间级别的权限。

#### 权限规则（PolicyRules）

每个规则包含：

- **apiGroups**：API 组
  - "" (core)
  - "apps"
  - "batch"
  - 等

- **resources**：资源类型
  - pods
  - services
  - deployments
  - 等

- **verbs**：操作动词
  - get：获取单个资源
  - list：列出资源
  - watch：监听资源变化
  - create：创建资源
  - update：更新资源
  - patch：部分更新
  - delete：删除资源
  - deletecollection：批量删除

- **resourceNames**（可选）：特定资源名称

#### 列表显示

- 名称、命名空间
- 规则数量
- 权限摘要
- 创建时间

### RoleBindings

RoleBinding 将 Role 绑定到主体（Subject）。

#### Subject 类型

1. **User**：用户
   - name：用户名
   - apiGroup：rbac.authorization.k8s.io

2. **Group**：组
   - name：组名
   - apiGroup：rbac.authorization.k8s.io

3. **ServiceAccount**：服务账号
   - name：ServiceAccount 名称
   - namespace：所属命名空间

#### 列表显示

- 名称、命名空间
- 角色引用（Role）
- 主体列表
- 创建时间

### ClusterRoles

ClusterRole 定义集群级别的权限。

#### 与 Role 的区别

- 作用域：整个集群
- 可用于集群级别的资源（Nodes、PV 等）
- 可在多个命名空间中使用

#### 内置 ClusterRoles

- **cluster-admin**：超级管理员
- **admin**：命名空间管理员
- **edit**：编辑者
- **view**：查看者

### ClusterRoleBindings

ClusterRoleBinding 将 ClusterRole 绑定到主体。

#### 列表显示

- 名称
- ClusterRole 引用
- 主体列表（User、Group、ServiceAccount）
- 创建时间

## 资源配额管理

### ResourceQuotas

ResourceQuota 限制命名空间的资源使用。

#### 可限制的资源

1. **计算资源**：
   - requests.cpu
   - requests.memory
   - limits.cpu
   - limits.memory

2. **存储资源**：
   - requests.storage
   - persistentvolumeclaims

3. **对象数量**：
   - pods
   - services
   - configmaps
   - secrets
   - replicationcontrollers
   - deployments.apps
   - statefulsets.apps

#### 列表显示

- 名称、命名空间
- 配额项数量
- 硬限制列表
- 当前使用情况
- 创建时间

#### 使用情况可视化

- 进度条显示使用率
- 颜色区分：
  - 绿色：< 70%
  - 黄色：70% - 90%
  - 红色：> 90%

### LimitRanges

LimitRange 为命名空间中的资源设置默认值和限制范围。

#### 限制类型

1. **Container**：容器级别
   - default：默认限制
   - defaultRequest：默认请求
   - max：最大值
   - min：最小值
   - maxLimitRequestRatio：限制/请求比率

2. **Pod**：Pod 级别
   - max：最大资源
   - min：最小资源

3. **PersistentVolumeClaim**：存储声明
   - max：最大容量
   - min：最小容量

#### 列表显示

- 名称、命名空间
- 限制项数量
- 限制类型（Container、Pod、PVC）
- 创建时间

## 集群管理

### 集群信息

管理多个 Kubernetes 集群。

#### 集群属性

- 名称、描述
- API Server 地址
- 版本信息
- 健康状态
- 节点数、Pod 数
- 资源使用情况

### Nodes

节点是 Kubernetes 集群中的工作机器。

#### 节点类型

- **Master Node**：控制平面节点
- **Worker Node**：工作负载节点

#### 节点状态

- **Ready**：节点健康，可以接受 Pod
- **NotReady**：节点异常，不能接受 Pod
- **Unknown**：节点状态未知

#### 节点信息

- **系统信息**：
  - OS：操作系统
  - Kernel 版本
  - Container Runtime：containerd、docker 等
  - Kubelet 版本

- **资源容量**：
  - CPU（核心数）
  - Memory（GB）
  - Pods（可调度 Pod 数）
  - Ephemeral Storage

#### 列表功能

- 名称
- 状态
- 角色（Master、Worker）
- 版本
- 内部 IP
- 外部 IP
- 创建时间

#### Labels 管理

- 查看所有 Labels
- 添加新 Label
- 编辑 Label
- 删除 Label

#### Taints 管理

- 查看 Taints 列表
- 添加 Taint
  - Key
  - Value
  - Effect（NoSchedule、PreferNoSchedule、NoExecute）
- 删除 Taint

### Namespaces

Namespace 提供虚拟集群隔离。

#### 系统 Namespaces

- **default**：默认命名空间
- **kube-system**：Kubernetes 系统组件
- **kube-public**：公共资源
- **kube-node-lease**：节点心跳

#### 列表显示

- 名称
- 状态（Active、Terminating）
- Labels
- 创建时间

### Events

事件记录集群中发生的操作和状态变化。

#### 事件类型

- **Normal**：正常事件
  - Scheduled：Pod 被调度
  - Pulling：拉取镜像
  - Pulled：镜像拉取完成
  - Created：容器创建
  - Started：容器启动

- **Warning**：警告事件
  - Failed：操作失败
  - FailedScheduling：调度失败
  - BackOff：退避重试
  - Unhealthy：健康检查失败

#### 列表功能

- 类型
- 对象（Kind/Name）
- 原因
- 消息
- 来源
- 首次出现时间
- 最后出现时间
- 次数

#### 筛选功能

- 按命名空间筛选
- 按事件类型筛选
- 按对象类型筛选
- 关键字搜索

## 总结

本平台提供了全面的 Kubernetes 资源管理功能，涵盖了从工作负载、网络、存储到权限管理的各个方面。通过直观的用户界面和丰富的功能特性，使得 K8s 集群管理变得更加简单高效。
