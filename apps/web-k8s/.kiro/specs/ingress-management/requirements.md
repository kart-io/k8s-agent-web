# Ingress 管理 - 需求文档

## 简介

为 K8s 资源管理 Web 应用添加 Ingress 资源管理功能，包括 Ingress 规则配置查看、TLS 证书管理、后端服务映射可视化和路由规则展示。

## 需求

### 需求 1: Ingress 资源列表和详情

**用户故事:** 作为集群管理员，我希望能够查看和管理所有 Ingress 资源，以便了解服务的外部访问配置。

#### 验收标准

1. WHEN 用户访问 Ingress 管理页面 THEN 系统 SHALL 显示所有 Ingress 的列表，包括名称、命名空间、Ingress 类、主机名、路径数量、TLS 状态、创建时间
2. WHEN 用户点击 Ingress 详情 THEN 系统 SHALL 显示完整信息，包括基本信息、规则配置、TLS 配置、后端服务、状态信息、YAML 配置
3. WHEN Ingress 已配置 TLS THEN 系统 SHALL 显示绿色 TLS 启用标识
4. WHEN Ingress 未配置 TLS THEN 系统 SHALL 显示灰色未启用标识
5. WHEN 用户筛选 Ingress THEN 系统 SHALL 支持按集群、命名空间、Ingress 类、主机名进行筛选
6. WHEN 用户搜索 Ingress THEN 系统 SHALL 支持按名称进行模糊搜索

### 需求 2: Ingress 规则配置展示

**用户故事:** 作为应用开发者，我希望能够清晰地查看 Ingress 的路由规则，以便验证流量转发配置是否正确。

#### 验收标准

1. WHEN 用户查看 Ingress 规则 THEN 系统 SHALL 以表格形式显示每个主机的路径规则
2. WHEN 显示路径规则 THEN 系统 SHALL 包含路径、路径类型（Prefix/Exact）、后端服务名、服务端口
3. WHEN 路径类型为 Prefix THEN 系统 SHALL 显示前缀匹配标识
4. WHEN 路径类型为 Exact THEN 系统 SHALL 显示精确匹配标识
5. WHEN Ingress 有默认后端 THEN 系统 SHALL 单独显示默认后端配置

### 需求 3: TLS 证书管理

**用户故事:** 作为安全管理员，我希望能够查看 Ingress 的 TLS 配置，以便确保 HTTPS 访问配置正确。

#### 验收标准

1. WHEN 用户查看 TLS 配置 THEN 系统 SHALL 显示每个 TLS 配置的主机列表、Secret 名称
2. WHEN 用户点击 Secret 名称 THEN 系统 SHALL 支持跳转到对应的 Secret 详情页
3. WHEN TLS 配置的 Secret 不存在 THEN 系统 SHALL 显示警告提示
4. WHEN 显示 TLS 主机列表 THEN 系统 SHALL 使用标签形式展示多个主机名

### 需求 4: 后端服务映射可视化

**用户故事:** 作为集群管理员，我希望能够查看 Ingress 到后端服务的映射关系，以便快速定位流量转发问题。

#### 验收标准

1. WHEN 用户查看后端服务映射 THEN 系统 SHALL 显示所有后端服务的列表
2. WHEN 显示后端服务 THEN 系统 SHALL 包含服务名称、命名空间、端口、健康状态
3. WHEN 用户点击服务名称 THEN 系统 SHALL 支持跳转到对应的 Service 详情页
4. WHEN 后端服务不存在 THEN 系统 SHALL 显示错误状态和警告信息
5. WHEN 显示服务映射关系 THEN 系统 SHALL 使用图形或树形结构展示 Host -> Path -> Service 的层级关系

### 需求 5: Ingress 状态监控

**用户故事:** 作为运维人员，我希望能够查看 Ingress 的运行状态，以便及时发现和解决问题。

#### 验收标准

1. WHEN 用户查看 Ingress 状态 THEN 系统 SHALL 显示负载均衡器分配的 IP 地址或主机名
2. WHEN 负载均衡器未分配地址 THEN 系统 SHALL 显示等待中状态
3. WHEN Ingress 有状态条件 THEN 系统 SHALL 显示条件类型、状态、原因、消息
4. WHEN 用户查看访问地址 THEN 系统 SHALL 将主机名和负载均衡器地址组合显示为可访问的 URL

### 需求 6: 删除和安全

**用户故事:** 作为集群管理员，我希望删除 Ingress 时能收到明确的提示，以避免误操作。

#### 验收标准

1. WHEN 用户删除 Ingress THEN 系统 SHALL 显示二次确认弹窗，列出影响的主机名和后端服务
2. WHEN Ingress 是唯一的入口规则 THEN 系统 SHALL 警告删除后服务将无法从外部访问

## 非功能性需求

### 性能要求

1. 资源列表加载时间不应超过 2 秒
2. 支持分页加载，每页显示 20-100 条记录

### 兼容性要求

1. 支持 Ingress API v1（networking.k8s.io/v1）
2. 兼容不同的 Ingress Controller（如 Nginx、Traefik、HAProxy）

### 可维护性要求

1. 遵循现有项目的代码规范和架构模式
2. 使用 TypeScript 进行类型定义
3. 组件复用率不低于 60%

## 约束条件

1. 必须使用 Vue 3 Composition API
2. 必须使用 Ant Design Vue 和 VxeGrid 组件库
3. 必须复用现有的 ResourceList、ResourceFilter、StatusTag 等通用组件
4. 必须使用 Nitro Mock Service 提供模拟数据

## 验收测试场景

### 场景 1: 查看 Ingress 配置

1. 访问 Ingress 管理页面，查看 Ingress 列表
2. 点击某个 Ingress 的详情，查看规则配置
3. 验证主机名、路径、后端服务信息正确显示
4. 查看 TLS 配置，确认 Secret 名称和主机名正确

### 场景 2: 路由规则验证

1. 查看具有多个主机和路径的 Ingress
2. 验证路径类型（Prefix/Exact）正确显示
3. 验证默认后端配置正确显示

### 场景 3: 后端服务状态检查

1. 查看 Ingress 的后端服务列表
2. 验证服务名称、端口、健康状态正确显示
3. 点击服务名称，跳转到 Service 详情页

## 未来扩展

1. 支持创建和编辑 Ingress
2. 支持 Ingress 注解（Annotations）配置
3. 支持实时流量监控
4. 支持 Ingress 健康检查配置
5. 支持 IngressClass 管理
