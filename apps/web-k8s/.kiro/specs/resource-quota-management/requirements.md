# 资源配额管理 - 需求文档

## 简介

为 K8s 资源管理 Web 应用添加资源配额管理功能，包括 ResourceQuota 和 LimitRange 的管理界面，资源使用统计和可视化，以及配额告警功能。

## 需求

### 需求 1: ResourceQuota 管理

**用户故事:** 作为集群管理员，我希望能够查看和管理命名空间的资源配额，以便控制资源使用并防止资源耗尽。

#### 验收标准

1. WHEN 用户访问 ResourceQuota 管理页面 THEN 系统 SHALL 显示所有 ResourceQuota 的列表，包括名称、命名空间、配额类型、硬限制、已使用量、使用率、创建时间
2. WHEN 用户点击 ResourceQuota 详情 THEN 系统 SHALL 显示完整信息，包括基本信息、配额规格、使用统计、使用率图表、YAML 配置
3. WHEN ResourceQuota 使用率超过 80% THEN 系统 SHALL 在列表中显示警告标识
4. WHEN ResourceQuota 使用率超过 90% THEN 系统 SHALL 在列表中显示错误标识
5. WHEN 用户筛选 ResourceQuota THEN 系统 SHALL 支持按集群、命名空间、使用率范围进行筛选

### 需求 2: LimitRange 管理

**用户故事:** 作为集群管理员，我希望能够查看和管理资源限制范围，以便确保 Pod 和容器的资源请求合理。

#### 验收标准

1. WHEN 用户访问 LimitRange 管理页面 THEN 系统 SHALL 显示所有 LimitRange 的列表，包括名称、命名空间、限制类型、创建时间
2. WHEN 用户点击 LimitRange 详情 THEN 系统 SHALL 显示完整的限制配置，包括容器、Pod、PVC 的最小值、最大值、默认值、默认请求
3. WHEN 显示限制值 THEN 系统 SHALL 清晰区分不同资源类型（CPU、内存、存储）和不同限制类型（min、max、default、defaultRequest）
4. WHEN 用户筛选 LimitRange THEN 系统 SHALL 支持按集群、命名空间进行筛选

### 需求 3: 资源使用统计和可视化

**用户故事:** 作为集群管理员，我希望能够查看资源使用统计和可视化图表，以便了解资源使用趋势。

#### 验收标准

1. WHEN 用户查看 ResourceQuota 详情 THEN 系统 SHALL 显示每种资源的使用率进度条
2. WHEN 显示使用率 THEN 系统 SHALL 使用不同颜色表示不同的使用率级别（绿色 <80%，黄色 80-90%，红色 >90%）
3. WHEN 用户查看资源使用统计 THEN 系统 SHALL 显示 CPU、内存、存储、Pod 数量等多种资源的统计
4. WHEN 用户查看命名空间资源概览 THEN 系统 SHALL 显示该命名空间的所有资源配额和使用情况

### 需求 4: 配额告警

**用户故事:** 作为运维人员，我希望能够及时发现资源配额即将耗尽的情况，以便采取措施。

#### 验收标准

1. WHEN ResourceQuota 使用率超过 80% THEN 系统 SHALL 在概览页显示警告提示
2. WHEN ResourceQuota 使用率超过 90% THEN 系统 SHALL 在概览页显示紧急告警
3. WHEN 用户访问告警列表 THEN 系统 SHALL 显示所有超过阈值的 ResourceQuota
4. WHEN 显示告警 THEN 系统 SHALL 包含命名空间、资源类型、当前使用率、剩余配额

### 需求 5: 删除和安全

**用户故事:** 作为集群管理员，我希望删除资源配额时能收到明确的提示，以避免影响正在运行的工作负载。

#### 验收标准

1. WHEN 用户删除 ResourceQuota THEN 系统 SHALL 显示警告，说明删除后命名空间将不再受配额限制
2. WHEN 用户删除 LimitRange THEN 系统 SHALL 显示警告，说明删除后新创建的 Pod 将不再受限制范围约束

## 非功能性需求

### 性能要求

1. 资源列表加载时间不应超过 2 秒
2. 使用率计算应实时准确

### 兼容性要求

1. 支持 ResourceQuota API v1
2. 支持 LimitRange API v1

### 可维护性要求

1. 遵循现有项目的代码规范和架构模式
2. 使用 TypeScript 进行类型定义

## 验收测试场景

### 场景 1: 查看资源配额使用情况

1. 访问 ResourceQuota 列表页
2. 查看不同命名空间的资源配额
3. 验证使用率显示正确，告警标识正确

### 场景 2: 查看限制范围配置

1. 访问 LimitRange 列表页
2. 查看 LimitRange 详情
3. 验证各种限制值显示正确

### 场景 3: 配额告警

1. 访问配额告警页面
2. 验证超过阈值的 ResourceQuota 显示正确
3. 验证告警级别和颜色正确

## 未来扩展

1. 支持创建和编辑 ResourceQuota
2. 支持创建和编辑 LimitRange
3. 支持配额使用历史趋势分析
4. 支持配额告警通知（邮件、webhook）
5. 支持配额推荐（基于历史使用情况）
