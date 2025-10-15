# 功能规格快速参考

## 文件位置

所有规格文档位于: `/home/hellotalk/code/web/k8s-agent-web/apps/web-k8s/.kiro/specs/`

## 功能列表

| 功能 | 优先级 | 工作量 | 需求文档 | 设计文档 | 任务列表 |
|------|--------|--------|----------|----------|----------|
| 存储管理 | 最高 | 7.5-12天 | [requirements.md](storage-management/requirements.md) | [design.md](storage-management/design.md) | [tasks.md](storage-management/tasks.md) |
| Ingress 管理 | 高 | 4-6天 | [requirements.md](ingress-management/requirements.md) | [design.md](ingress-management/design.md) | [tasks.md](ingress-management/tasks.md) |
| RBAC 权限管理 | 高 | 6.5-10天 | [requirements.md](rbac-management/requirements.md) | [design.md](rbac-management/design.md) | [tasks.md](rbac-management/tasks.md) |
| 资源配额管理 | 中高 | 5-7.5天 | [requirements.md](resource-quota-management/requirements.md) | [design.md](resource-quota-management/design.md) | [tasks.md](resource-quota-management/tasks.md) |
| 自动扩缩容管理 | 中高 | 5.5-7.5天 | [requirements.md](autoscaling-management/requirements.md) | [design.md](autoscaling-management/design.md) | [tasks.md](autoscaling-management/tasks.md) |

## 核心资源类型

### 存储管理

- `PersistentVolume`
- `PersistentVolumeClaim`
- `StorageClass`

### Ingress 管理

- `Ingress`
- `IngressClass`

### RBAC 权限管理

- `ServiceAccount`
- `Role` / `ClusterRole`
- `RoleBinding` / `ClusterRoleBinding`

### 资源配额管理

- `ResourceQuota`
- `LimitRange`

### 自动扩缩容管理

- `HorizontalPodAutoscaler`

## 关键页面路由

```text
/k8s/storage/overview                  # 存储概览
/k8s/storage/persistent-volumes        # PV 管理
/k8s/storage/persistent-volume-claims  # PVC 管理
/k8s/storage/storage-classes           # StorageClass 管理

/k8s/network/ingresses                 # Ingress 管理

/k8s/rbac/service-accounts             # ServiceAccount 管理
/k8s/rbac/roles                        # Role 管理
/k8s/rbac/cluster-roles                # ClusterRole 管理
/k8s/rbac/role-bindings                # RoleBinding 管理
/k8s/rbac/cluster-role-bindings        # ClusterRoleBinding 管理

/k8s/quota/overview                    # 配额概览
/k8s/quota/resource-quotas             # ResourceQuota 管理
/k8s/quota/limit-ranges                # LimitRange 管理

/k8s/autoscaling/overview              # 扩缩容概览
/k8s/autoscaling/hpa                   # HPA 管理
```

## 主要任务阶段

### 所有功能通用阶段

1. **基础设施:** 类型定义、Mock 数据、资源配置
2. **列表页面:** ResourceList 复用，自定义插槽
3. **详情抽屉:** 多标签页展示完整信息
4. **专用组件:** 可视化组件、图表组件
5. **路由配置:** 添加路由和菜单
6. **测试优化:** 单元测试、组件测试、性能优化

## 复用组件

- `ResourceList.vue`: 通用资源列表
- `ResourceFilter.vue`: 筛选器
- `StatusTag.vue`: 状态标签
- `DetailDrawer.vue`: 详情抽屉骨架

## Mock 数据函数

所有 Mock 数据函数位于 `src/api/k8s/mock.ts`:

```typescript
// 存储管理
getMockPVList()
getMockPVCList()
getMockStorageClassList()
getMockStorageStats()

// Ingress 管理
getMockIngressList()
getMockIngressClassList()

// RBAC 管理
getMockServiceAccountList()
getMockRoleList()
getMockClusterRoleList()
getMockRoleBindingList()
getMockClusterRoleBindingList()

// 资源配额管理
getMockResourceQuotaList()
getMockLimitRangeList()

// 自动扩缩容管理
getMockHPAList()
```

## 资源配置工厂

所有资源配置工厂函数位于 `src/config/k8s-resources.ts`:

```typescript
// 存储管理
createPVConfig()
createPVCConfig()
createStorageClassConfig()

// Ingress 管理
createIngressConfig()

// RBAC 管理
createServiceAccountConfig()
createRoleConfig()
createClusterRoleConfig()
createRoleBindingConfig()
createClusterRoleBindingConfig()

// 资源配额管理
createResourceQuotaConfig()
createLimitRangeConfig()

// 自动扩缩容管理
createHPAConfig()
```

## 开发检查清单

每个功能完成时检查：

- [ ] TypeScript 类型定义完整
- [ ] Mock 数据生成函数实现
- [ ] 资源配置工厂函数实现
- [ ] 列表页面实现并复用 ResourceList
- [ ] 详情抽屉实现多标签页
- [ ] 路由配置添加
- [ ] 菜单项显示正确
- [ ] 单元测试编写
- [ ] 组件测试编写
- [ ] 验收测试通过
- [ ] 代码规范检查通过
- [ ] UI/UX 与现有页面一致

## 性能要求

- 列表加载时间 < 2 秒
- 分页支持 20-100 条/页
- 虚拟滚动支持大量数据
- 详情抽屉懒加载

## 兼容性要求

- 支持 Chrome、Firefox、Safari、Edge 最新版本
- 响应式设计，支持 1920x1080 及以上分辨率
- 与 K8s API v1 兼容

## 注意事项

1. **遵循现有架构模式**: 所有功能必须与现有 Pod、Deployment 等页面保持一致的架构
2. **组件复用优先**: 优先使用现有通用组件，避免重复造轮子
3. **类型安全**: 使用 TypeScript 严格模式，确保类型定义完整
4. **Mock 数据真实性**: Mock 数据应尽可能模拟真实场景
5. **用户体验**: 保持与现有页面一致的 UI/UX
6. **代码注释**: 关键逻辑添加注释，提高可维护性

---

**最后更新:** 2025-01-15
