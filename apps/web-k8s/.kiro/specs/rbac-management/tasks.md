# RBAC 权限管理 - 实施任务列表（精简版）

## 阶段 1: 基础设施（1-2 天）

- [ ] 1. 定义 RBAC 资源类型（ServiceAccount, Role, ClusterRole, RoleBinding, ClusterRoleBinding）
- [ ] 2. 实现 Mock 数据生成函数
- [ ] 3. 创建资源配置工厂函数

## 阶段 2: ServiceAccount 管理（1-1.5 天）

- [ ] 4. 创建 ServiceAccount 列表页
- [ ] 5. 创建 ServiceAccount 详情抽屉
  - [ ] 5.1 基本信息标签页
  - [ ] 5.2 Secret 列表标签页
  - [ ] 5.3 使用的 Pod 标签页
  - [ ] 5.4 拥有的角色标签页
  - [ ] 5.5 YAML 配置标签页

## 阶段 3: Role 管理（1.5-2 天）

- [ ] 6. 创建 Role 列表页
- [ ] 7. 创建 Role 详情抽屉
  - [ ] 7.1 基本信息标签页
  - [ ] 7.2 权限规则表格标签页（包含高危权限标识）
  - [ ] 7.3 RoleBinding 列表标签页
  - [ ] 7.4 YAML 配置标签页
- [ ] 8. 创建 ClusterRole 列表页和详情抽屉（复用 Role 组件）

## 阶段 4: RoleBinding 管理（1.5-2 天）

- [ ] 9. 创建 RoleBinding 列表页
- [ ] 10. 创建 RoleBinding 详情抽屉
  - [ ] 10.1 基本信息标签页
  - [ ] 10.2 绑定的 Role 标签页
  - [ ] 10.3 主体列表标签页
  - [ ] 10.4 绑定关系图标签页
  - [ ] 10.5 YAML 配置标签页
- [ ] 11. 创建 ClusterRoleBinding 列表页和详情抽屉（复用 RoleBinding 组件）

## 阶段 5: 共享组件（1 天）

- [ ] 12. 创建权限规则表格组件（PolicyRulesTable.vue）
- [ ] 13. 创建主体列表组件（SubjectsList.vue）
- [ ] 14. 创建绑定关系图组件（BindingGraph.vue）

## 阶段 6: 路由和安全（0.5 天）

- [ ] 15. 添加 RBAC 路由配置
- [ ] 16. 实现删除操作的安全检查

## 阶段 7: 测试和优化（1-1.5 天）

- [ ] 17. 编写单元测试
- [ ] 18. 编写组件测试
- [ ] 19. 性能优化
- [ ] 20. 最终验收测试

## 总结

总任务数: 20 个主任务
预估工作量: 6.5-10 天
