# K8s 资源管理功能规格说明 - 总览

本文档汇总了为 K8s 资源管理 Web 应用开发的 5 个高优先级功能的完整规格说明。

## 项目信息

- **项目路径:** `/home/hellotalk/code/web/k8s-agent-web/apps/web-k8s`
- **技术栈:** Vue 3 + TypeScript + Ant Design Vue + VxeGrid
- **规格位置:** `.kiro/specs/`

## 功能概览

### 1. 存储管理（Storage Management）

**优先级:** 最高

**功能范围:**

- PersistentVolume (PV) 管理
- PersistentVolumeClaim (PVC) 管理
- StorageClass 管理
- PV/PVC 绑定关系可视化
- 容量使用统计

**规格文档:**

- 需求文档: `.kiro/specs/storage-management/requirements.md`
- 设计文档: `.kiro/specs/storage-management/design.md`
- 任务列表: `.kiro/specs/storage-management/tasks.md`

**预估工作量:** 7.5-12 天

**关键特性:**

- 存储概览页，显示总容量、已用容量、使用率统计
- 按存储类和命名空间的容量分布图表
- PV/PVC 绑定关系展示和跳转
- 容量使用率告警（80% 警告，90% 错误）
- 支持多种存储后端（NFS、hostPath、CSI）

### 2. Ingress 管理（Ingress Management）

**优先级:** 高

**功能范围:**

- Ingress 资源列表和详情
- Ingress 规则配置查看
- TLS 证书管理
- 后端服务映射可视化
- 路由规则编辑准备

**规格文档:**

- 需求文档: `.kiro/specs/ingress-management/requirements.md`
- 设计文档: `.kiro/specs/ingress-management/design.md`
- 任务列表: `.kiro/specs/ingress-management/tasks.md`

**预估工作量:** 4-6 天

**关键特性:**

- 路由规则表格，按主机分组显示路径和后端服务
- TLS 配置展示，支持跳转到 Secret 详情
- 后端服务映射树形结构（Host -> Path -> Service）
- 路径类型可视化（Prefix/Exact）
- 负载均衡器地址和状态监控

### 3. RBAC 权限管理（RBAC Management）

**优先级:** 高

**功能范围:**

- ServiceAccount 管理
- Role / ClusterRole 管理
- RoleBinding / ClusterRoleBinding 管理
- 权限策略查看
- 角色绑定关系可视化

**规格文档:**

- 需求文档: `.kiro/specs/rbac-management/requirements.md`
- 设计文档: `.kiro/specs/rbac-management/design.md`
- 任务列表: `.kiro/specs/rbac-management/tasks.md`

**预估工作量:** 6.5-10 天

**关键特性:**

- 权限规则表格，清晰展示 API 组、资源、动作（verbs）
- 高危权限标识（*, delete, cluster-admin）
- ServiceAccount 使用的 Pod 列表
- 角色绑定关系图（Role -> RoleBinding -> Subject）
- 主体类型区分（User、Group、ServiceAccount）

### 4. 资源配额管理（Resource Quota Management）

**优先级:** 中高

**功能范围:**

- ResourceQuota 管理
- LimitRange 管理
- 资源使用统计和可视化
- 配额告警

**规格文档:**

- 需求文档: `.kiro/specs/resource-quota-management/requirements.md`
- 设计文档: `.kiro/specs/resource-quota-management/design.md`
- 任务列表: `.kiro/specs/resource-quota-management/tasks.md`

**预估工作量:** 5-7.5 天

**关键特性:**

- 资源使用率进度条和颜色分级（<80% 绿色，80-90% 黄色，>90% 红色）
- 配额概览页，显示告警列表和使用率统计
- LimitRange 限制表格（Container、Pod、PVC）
- 按命名空间的资源使用统计
- 配额使用率告警

### 5. 自动扩缩容管理（Autoscaling Management）

**优先级:** 中高

**功能范围:**

- HorizontalPodAutoscaler (HPA) 管理
- 扩缩容策略配置查看
- 扩缩容历史查看
- 指标监控

**规格文档:**

- 需求文档: `.kiro/specs/autoscaling-management/requirements.md`
- 设计文档: `.kiro/specs/autoscaling-management/design.md`
- 任务列表: `.kiro/specs/autoscaling-management/tasks.md`

**预估工作量:** 5.5-7.5 天

**关键特性:**

- 扩缩容指标表格（支持 Resource、Pods、Object、External 类型）
- 当前指标 vs 目标指标对比，带进度条
- 扩缩容历史时间线（区分扩容/缩容）
- HPA 状态展示（稳定/扩缩容中/受限）
- 扩缩容条件信息（AbleToScale、ScalingActive、ScalingLimited）

## 总体工作量预估

- **总任务数:** 约 122 个主任务
- **总预估工作量:** 28.5-43 天（约 5.7-8.6 周）
- **建议并行开发:** 2-3 个功能可并行开发以缩短总周期

## 技术架构统一性

所有 5 个功能均遵循相同的架构模式：

### 目录结构

```text
src/
├── api/k8s/
│   ├── types.ts        # 类型定义
│   └── mock.ts         # Mock 数据
├── config/
│   └── k8s-resources.ts  # 资源配置工厂
├── views/k8s/
│   ├── storage/        # 存储管理
│   ├── network/ingresses/  # Ingress 管理
│   ├── rbac/           # RBAC 管理
│   ├── quota/          # 资源配额管理
│   └── autoscaling/    # 自动扩缩容管理
└── router/routes/modules/
    └── k8s.ts          # 路由配置
```

### 组件复用

所有功能均复用以下通用组件：

- `ResourceList`: 资源列表组件
- `ResourceFilter`: 筛选器组件
- `StatusTag`: 状态标签组件
- `DetailDrawer`: 详情抽屉基础结构

### 数据流

1. **类型定义** -> `src/api/k8s/types.ts`
2. **Mock 数据** -> `src/api/k8s/mock.ts`
3. **资源配置** -> `src/config/k8s-resources.ts`
4. **页面组件** -> `src/views/k8s/{category}/{resource}/index.vue`
5. **详情抽屉** -> `src/views/k8s/{category}/{resource}/DetailDrawer.vue`

## 开发顺序建议

### 阶段 1: 存储管理（Week 1-2）

原因：最高优先级，包含基础的资源管理模式

### 阶段 2: Ingress 管理（Week 3）

原因：网络相关，与现有 Service 管理配套

### 阶段 3: 资源配额管理（Week 4）

原因：中等复杂度，可与其他功能并行

### 阶段 4: RBAC 管理 + 自动扩缩容管理（Week 5-6）

原因：可并行开发，完成全部功能

## 验收标准

每个功能需通过以下验收：

1. **功能完整性:** 所有验收测试场景通过
2. **代码质量:** 遵循项目代码规范，通过 ESLint 检查
3. **类型安全:** TypeScript 无类型错误
4. **性能:** 列表加载时间 < 2 秒
5. **UI/UX:** 与现有页面保持一致的布局和样式
6. **测试覆盖:** 关键功能有单元测试和组件测试

## 文档规范

所有规格文档遵循 Markdown 规范：

- 使用清晰的标题层级（# 到 ######）
- 代码块标注语言
- 使用表格展示数据
- 使用列表清晰组织内容

## 下一步行动

1. **评审规格文档:** 与团队评审需求、设计和任务列表
2. **确认优先级:** 根据业务需求调整开发顺序
3. **分配资源:** 为每个功能分配开发人员
4. **启动开发:** 从存储管理功能开始实施

## 联系信息

如有疑问或需要修改规格，请联系项目负责人。

---

**创建日期:** 2025-01-15
**规格版本:** 1.0
**状态:** 待评审
