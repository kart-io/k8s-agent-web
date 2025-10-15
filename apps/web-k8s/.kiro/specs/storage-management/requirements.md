# 存储管理 - 需求文档

## 简介

为 K8s 资源管理 Web 应用添加完整的存储资源管理功能，包括 PersistentVolume (PV)、PersistentVolumeClaim (PVC) 和 StorageClass 的管理界面，以及 PV/PVC 绑定关系的可视化展示和容量使用统计。

## 需求

### 需求 1: PersistentVolume (PV) 管理

**用户故事:** 作为集群管理员，我希望能够查看和管理所有持久化存储卷，以便监控存储资源的使用情况。

#### 验收标准

1. WHEN 用户访问 PV 管理页面 THEN 系统 SHALL 显示所有 PV 的列表，包括名称、容量、存储类、访问模式、回收策略、状态、绑定的 PVC、创建时间
2. WHEN 用户点击 PV 详情 THEN 系统 SHALL 显示完整的 PV 信息，包括基本信息、规格配置、状态信息、绑定关系、YAML 配置
3. WHEN PV 状态为 Available THEN 系统 SHALL 显示绿色成功标签
4. WHEN PV 状态为 Bound THEN 系统 SHALL 显示蓝色标签
5. WHEN PV 状态为 Released 或 Failed THEN 系统 SHALL 显示警告或错误标签
6. WHEN 用户筛选 PV THEN 系统 SHALL 支持按集群、存储类、状态、访问模式进行筛选
7. WHEN 用户搜索 PV THEN 系统 SHALL 支持按名称进行模糊搜索
8. WHEN 用户删除未绑定的 PV THEN 系统 SHALL 提示确认并执行删除操作

### 需求 2: PersistentVolumeClaim (PVC) 管理

**用户故事:** 作为应用开发者，我希望能够管理存储声明，以便为应用分配所需的存储资源。

#### 验收标准

1. WHEN 用户访问 PVC 管理页面 THEN 系统 SHALL 显示所有 PVC 的列表，包括名称、命名空间、状态、容量、存储类、访问模式、绑定的 PV、创建时间
2. WHEN 用户点击 PVC 详情 THEN 系统 SHALL 显示完整的 PVC 信息，包括基本信息、规格配置、状态信息、使用情况、绑定的 PV 详情、YAML 配置
3. WHEN PVC 状态为 Bound THEN 系统 SHALL 显示绿色成功标签
4. WHEN PVC 状态为 Pending THEN 系统 SHALL 显示黄色警告标签
5. WHEN PVC 状态为 Lost THEN 系统 SHALL 显示红色错误标签
6. WHEN 用户筛选 PVC THEN 系统 SHALL 支持按集群、命名空间、存储类、状态进行筛选
7. WHEN 用户查看 PVC 使用的 Pod THEN 系统 SHALL 显示所有使用该 PVC 的 Pod 列表
8. WHEN 用户删除 PVC THEN 系统 SHALL 检查是否有 Pod 正在使用，若有则警告用户

### 需求 3: StorageClass 管理

**用户故事:** 作为集群管理员，我希望能够管理存储类配置，以便为不同应用场景提供合适的存储方案。

#### 验收标准

1. WHEN 用户访问 StorageClass 管理页面 THEN 系统 SHALL 显示所有 StorageClass 的列表，包括名称、提供者、回收策略、卷绑定模式、是否允许扩容、是否为默认存储类、创建时间
2. WHEN 用户点击 StorageClass 详情 THEN 系统 SHALL 显示完整的 StorageClass 信息，包括基本信息、参数配置、挂载选项、使用统计、YAML 配置
3. WHEN StorageClass 为默认存储类 THEN 系统 SHALL 显示特殊标识（如"默认"标签）
4. WHEN 用户查看 StorageClass 使用统计 THEN 系统 SHALL 显示使用该存储类的 PV 和 PVC 数量
5. WHEN 用户筛选 StorageClass THEN 系统 SHALL 支持按集群、提供者、回收策略进行筛选
6. WHEN 用户查看 StorageClass 的 PV/PVC THEN 系统 SHALL 显示所有使用该存储类的 PV 和 PVC 列表

### 需求 4: PV/PVC 绑定关系可视化

**用户故事:** 作为集群管理员，我希望能够直观地查看 PV 和 PVC 的绑定关系，以便快速定位存储问题。

#### 验收标准

1. WHEN 用户在 PV 详情页 THEN 系统 SHALL 显示绑定的 PVC 信息，包括 PVC 名称、命名空间、使用的 Pod
2. WHEN 用户在 PVC 详情页 THEN 系统 SHALL 显示绑定的 PV 信息，包括 PV 名称、容量、节点亲和性
3. WHEN 用户点击绑定关系中的资源链接 THEN 系统 SHALL 跳转到对应资源的详情页
4. WHEN PV 和 PVC 已绑定 THEN 系统 SHALL 在列表中使用相同的视觉标识（如颜色、图标）
5. WHEN PVC 等待绑定 THEN 系统 SHALL 显示等待绑定的原因（如容量不足、访问模式不匹配）

### 需求 5: 容量使用统计

**用户故事:** 作为集群管理员，我希望能够查看存储容量的使用统计，以便合理规划存储资源。

#### 验收标准

1. WHEN 用户访问存储管理概览页 THEN 系统 SHALL 显示总体存储统计，包括总容量、已使用容量、可用容量、使用率
2. WHEN 用户查看按存储类统计 THEN 系统 SHALL 显示每个存储类的容量分布和使用情况
3. WHEN 用户查看按命名空间统计 THEN 系统 SHALL 显示每个命名空间的存储使用情况
4. WHEN 用户查看存储趋势 THEN 系统 SHALL 显示存储使用量的时间趋势图（如果有历史数据）
5. IF 存储使用率超过 80% THEN 系统 SHALL 显示警告提示
6. IF 存储使用率超过 90% THEN 系统 SHALL 显示错误提示

### 需求 6: 数据安全与权限

**用户故事:** 作为安全管理员，我希望存储管理功能遵循安全最佳实践，以便保护敏感数据。

#### 验收标准

1. WHEN 用户删除 PV 或 PVC THEN 系统 SHALL 显示二次确认弹窗，说明删除的影响
2. WHEN 用户删除已绑定的 PV THEN 系统 SHALL 根据回收策略提示数据保留或删除的后果
3. WHEN 系统显示 PV/PVC 详情 THEN 系统 SHALL 隐藏敏感信息（如密钥路径、访问凭证）
4. WHEN 用户执行敏感操作 THEN 系统 SHALL 记录操作日志（未来扩展）

## 非功能性需求

### 性能要求

1. 资源列表加载时间不应超过 2 秒
2. 支持分页加载，每页显示 20-100 条记录
3. 支持虚拟滚动以处理大量数据

### 兼容性要求

1. 支持 Chrome、Firefox、Safari、Edge 最新版本
2. 响应式设计，支持 1920x1080 及以上分辨率
3. 与现有 K8s API 版本兼容（v1）

### 可维护性要求

1. 遵循现有项目的代码规范和架构模式
2. 使用 TypeScript 进行类型定义
3. 代码注释覆盖率不低于 20%
4. 组件复用率不低于 60%

## 约束条件

1. 必须使用 Vue 3 Composition API
2. 必须使用 Ant Design Vue 和 VxeGrid 组件库
3. 必须复用现有的 ResourceList、ResourceFilter、StatusTag 等通用组件
4. 必须使用 Nitro Mock Service 提供模拟数据
5. 必须保持与现有页面一致的 flexbox 全屏布局

## 依赖关系

1. 依赖现有的 K8s API 类型定义（#/api/k8s/types）
2. 依赖现有的资源管理基础设施（ResourceList、useK8sResource 等）
3. 依赖现有的路由配置和导航系统
4. 依赖 Mock 数据生成工具

## 验收测试场景

### 场景 1: PV 生命周期管理

1. 查看 Available 状态的 PV 列表
2. 查看 PV 详情，确认容量、存储类、访问模式信息正确
3. 删除未绑定的 PV，确认删除成功

### 场景 2: PVC 绑定流程

1. 查看 Pending 状态的 PVC
2. 查看 PVC 等待绑定的原因
3. 查看 PVC 详情，确认请求的容量和访问模式
4. 查看 PVC 绑定成功后的 PV 信息

### 场景 3: 存储类配置查看

1. 查看所有 StorageClass
2. 查看默认 StorageClass 的标识
3. 查看 StorageClass 的参数和挂载选项
4. 查看使用特定 StorageClass 的 PV/PVC 列表

### 场景 4: 容量监控

1. 查看存储概览页的总体统计
2. 查看各存储类的容量分布
3. 查看各命名空间的存储使用情况
4. 验证高使用率警告是否正确显示

## 未来扩展

1. 支持创建和编辑 PVC
2. 支持创建和编辑 StorageClass
3. 支持 PV 扩容操作
4. 支持存储快照（VolumeSnapshot）管理
5. 支持存储监控告警配置
6. 支持存储使用历史趋势分析
