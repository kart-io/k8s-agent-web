# RBAC 权限管理 - 需求文档

## 简介

为 K8s 资源管理 Web 应用添加 RBAC（基于角色的访问控制）权限管理功能，包括 ServiceAccount、Role/ClusterRole、RoleBinding/ClusterRoleBinding 的管理界面，以及权限策略查看和角色绑定关系可视化。

## 需求

### 需求 1: ServiceAccount 管理

**用户故事:** 作为集群管理员，我希望能够查看和管理 ServiceAccount，以便为 Pod 分配适当的访问权限。

#### 验收标准

1. WHEN 用户访问 ServiceAccount 管理页面 THEN 系统 SHALL 显示所有 ServiceAccount 的列表，包括名称、命名空间、Secret 数量、创建时间
2. WHEN 用户点击 ServiceAccount 详情 THEN 系统 SHALL 显示完整信息，包括基本信息、关联的 Secret、镜像拉取 Secret、使用的 Pod、YAML 配置
3. WHEN 用户筛选 ServiceAccount THEN 系统 SHALL 支持按集群、命名空间进行筛选
4. WHEN 用户查看 ServiceAccount 使用情况 THEN 系统 SHALL 显示使用该 ServiceAccount 的 Pod 列表

### 需求 2: Role 和 ClusterRole 管理

**用户故事:** 作为安全管理员，我希望能够查看角色的权限配置，以便验证权限策略是否符合安全要求。

#### 验收标准

1. WHEN 用户访问 Role 管理页面 THEN 系统 SHALL 显示所有 Role 的列表，包括名称、命名空间、规则数量、创建时间
2. WHEN 用户访问 ClusterRole 管理页面 THEN 系统 SHALL 显示所有 ClusterRole 的列表
3. WHEN 用户点击 Role/ClusterRole 详情 THEN 系统 SHALL 显示权限规则列表，包括 API 组、资源类型、动作（verbs）
4. WHEN 显示权限规则 THEN 系统 SHALL 使用表格形式清晰展示每条规则的权限范围
5. WHEN 用户筛选 Role THEN 系统 SHALL 支持按集群、命名空间进行筛选
6. WHEN 用户查看 Role 绑定情况 THEN 系统 SHALL 显示绑定该 Role 的所有 RoleBinding

### 需求 3: RoleBinding 和 ClusterRoleBinding 管理

**用户故事:** 作为集群管理员，我希望能够查看角色绑定关系，以便了解谁拥有什么权限。

#### 验收标准

1. WHEN 用户访问 RoleBinding 管理页面 THEN 系统 SHALL 显示所有 RoleBinding 的列表，包括名称、命名空间、绑定的 Role、主体数量、创建时间
2. WHEN 用户访问 ClusterRoleBinding 管理页面 THEN 系统 SHALL 显示所有 ClusterRoleBinding 的列表
3. WHEN 用户点击 RoleBinding/ClusterRoleBinding 详情 THEN 系统 SHALL 显示主体列表（用户、组、ServiceAccount）
4. WHEN 显示主体列表 THEN 系统 SHALL 区分不同类型的主体（User、Group、ServiceAccount）
5. WHEN 用户点击 ServiceAccount 主体 THEN 系统 SHALL 支持跳转到对应的 ServiceAccount 详情

### 需求 4: 权限策略查看

**用户故事:** 作为安全审计员，我希望能够清晰地查看权限策略，以便进行安全审计。

#### 验收标准

1. WHEN 用户查看 Role 权限规则 THEN 系统 SHALL 显示 API 组、资源、资源名称、动作（get、list、create、update、delete 等）
2. WHEN 权限规则包含通配符 THEN 系统 SHALL 使用特殊标识显示（如高亮或图标）
3. WHEN 权限规则授予危险操作 THEN 系统 SHALL 显示警告提示（如 delete、*）
4. WHEN 用户查看权限摘要 THEN 系统 SHALL 显示权限级别（只读、读写、完全控制）

### 需求 5: 角色绑定关系可视化

**用户故事:** 作为集群管理员，我希望能够可视化查看角色绑定关系，以便快速理解权限分配情况。

#### 验收标准

1. WHEN 用户查看 Role 详情 THEN 系统 SHALL 显示所有绑定该 Role 的 RoleBinding 和主体
2. WHEN 用户查看 ServiceAccount 详情 THEN 系统 SHALL 显示该 ServiceAccount 拥有的所有角色和权限
3. WHEN 显示绑定关系 THEN 系统 SHALL 使用图形或树形结构展示 Role -> RoleBinding -> Subject 的层级关系
4. WHEN 用户点击绑定关系中的资源 THEN 系统 SHALL 支持跳转到对应资源的详情页

### 需求 6: 安全和审计

**用户故事:** 作为安全管理员，我希望 RBAC 管理功能遵循安全最佳实践，以便保护集群安全。

#### 验收标准

1. WHEN 用户删除 ServiceAccount THEN 系统 SHALL 显示警告，列出使用该 ServiceAccount 的 Pod
2. WHEN 用户删除 Role THEN 系统 SHALL 显示警告，列出绑定该 Role 的 RoleBinding
3. WHEN 显示权限时 THEN 系统 SHALL 对高危权限进行标注（如 cluster-admin、* verbs）
4. WHEN 系统显示 ServiceAccount Secret THEN 系统 SHALL 不显示 Token 内容，仅显示 Secret 名称

## 非功能性需求

### 性能要求

1. 资源列表加载时间不应超过 2 秒
2. 支持分页加载

### 兼容性要求

1. 支持 RBAC API v1（rbac.authorization.k8s.io/v1）
2. 支持 ServiceAccount API v1

### 可维护性要求

1. 遵循现有项目的代码规范和架构模式
2. 使用 TypeScript 进行类型定义
3. 组件复用率不低于 60%

## 验收测试场景

### 场景 1: 查看 ServiceAccount 权限

1. 访问 ServiceAccount 列表页，选择一个 ServiceAccount
2. 查看 ServiceAccount 详情，验证关联的 Secret 显示正确
3. 查看使用该 ServiceAccount 的 Pod 列表
4. 查看该 ServiceAccount 拥有的角色和权限

### 场景 2: 审计 Role 权限

1. 访问 Role 列表页，选择一个 Role
2. 查看 Role 的权限规则，验证 API 组、资源、动作显示正确
3. 检查是否有高危权限的警告提示
4. 查看绑定该 Role 的 RoleBinding 列表

### 场景 3: 理解 RoleBinding 关系

1. 访问 RoleBinding 列表页，选择一个 RoleBinding
2. 查看 RoleBinding 详情，验证主体列表显示正确
3. 点击 ServiceAccount 主体，跳转到 ServiceAccount 详情
4. 查看角色绑定关系图

## 未来扩展

1. 支持创建和编辑 ServiceAccount、Role、RoleBinding
2. 支持权限模拟（检查某个用户或 ServiceAccount 的权限）
3. 支持权限审计报告生成
4. 支持权限推荐和最佳实践检查
5. 支持 RBAC 策略导入导出
