# Ingress 管理 - 实施任务列表

## 阶段 1: 基础设施和类型定义

- [ ] 1. 定义 Ingress 资源类型
  - 在 `src/api/k8s/types.ts` 中添加 Ingress 接口及相关类型
  - 在 `src/api/k8s/types.ts` 中添加 IngressClass 接口
  - 添加辅助类型（IngressBackendInfo, IngressRuleDisplay）
  - 添加类型导出
  - _需求: 1.1, 1.2_

- [ ] 2. 更新资源类型常量
  - 在 `src/types/k8s-resource-base.ts` 中添加 INGRESS 资源类型常量
  - 更新 RESOURCE_TYPE_METADATA 映射
  - _需求: 1.1_

## 阶段 2: Mock 数据生成

- [ ] 3. 实现 Ingress Mock 数据
  - 在 `src/api/k8s/mock.ts` 中实现 `getMockIngressList` 函数
  - 生成多样化的 Ingress 数据（不同 Ingress 类、主机、路径、TLS 配置）
  - 实现筛选和分页逻辑
  - _需求: 1.1, 1.2_

- [ ] 4. 实现 IngressClass Mock 数据
  - 在 `src/api/k8s/mock.ts` 中实现 `getMockIngressClassList` 函数
  - 生成常见的 IngressClass 数据（Nginx、Traefik、HAProxy）
  - _需求: 1.1_

- [ ] 5. 实现后端服务健康检查辅助函数
  - 实现 `checkBackendServiceExists` 函数，检查服务是否存在
  - 实现 `getIngressBackendInfo` 函数，获取后端服务信息
  - _需求: 4.2, 4.4_

## 阶段 3: 资源配置工厂函数

- [ ] 6. 创建 Ingress 资源配置
  - 在 `src/config/k8s-resources.ts` 中实现 `createIngressConfig` 函数
  - 定义 Ingress 列表的列配置
  - 定义操作配置（查看、编辑、删除）
  - 定义筛选器配置（集群、命名空间、Ingress 类、TLS 状态）
  - _需求: 1.1, 1.5, 1.6_

## 阶段 4: Ingress 列表页面

- [ ] 7. 创建 Ingress 列表页
  - 创建 `src/views/k8s/network/ingresses/index.vue`
  - 使用 ResourceList 组件
  - 应用 Ingress 资源配置
  - 实现自定义插槽（主机名、TLS 状态）
  - _需求: 1.1, 1.3, 1.4_

## 阶段 5: Ingress 详情抽屉

- [ ] 8. 创建详情抽屉骨架
  - 创建 `src/views/k8s/network/ingresses/DetailDrawer.vue`
  - 设置抽屉基础结构和标签页
  - _需求: 1.2_

- [ ] 9. 实现基本信息标签页
  - 显示名称、命名空间、UID、Ingress 类、负载均衡器地址、创建时间
  - _需求: 1.2, 5.1, 5.4_

- [ ] 10. 创建路由规则表格组件
  - 创建 `src/views/k8s/network/ingresses/components/RulesTable.vue`
  - 按主机分组显示路由规则
  - 显示路径、路径类型、后端服务、服务端口
  - 实现路径类型的图标化显示
  - 实现默认后端的显示
  - _需求: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 11. 创建 TLS 配置组件
  - 创建 `src/views/k8s/network/ingresses/components/TLSConfig.vue`
  - 显示 TLS 配置的主机列表和 Secret 名称
  - 实现点击 Secret 名称跳转功能
  - 检查 Secret 是否存在并显示警告
  - _需求: 3.1, 3.2, 3.3, 3.4_

- [ ] 12. 创建后端服务映射组件
  - 创建 `src/views/k8s/network/ingresses/components/BackendMap.vue`
  - 显示所有后端服务的列表
  - 实现服务名称点击跳转功能
  - 使用树形结构展示 Host -> Path -> Service 映射关系
  - 显示服务健康状态
  - _需求: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 13. 实现状态信息标签页
  - 显示负载均衡器状态（IP、主机名）
  - 显示 Ingress 状态条件
  - _需求: 5.1, 5.2, 5.3_

- [ ] 14. 实现 YAML 配置标签页
  - 显示完整的 Ingress YAML 配置
  - 实现复制和下载功能
  - 复用现有的 YAML 格式化逻辑
  - _需求: 1.2_

- [ ] 15. 集成详情抽屉和子组件
  - 在详情抽屉中集成所有标签页
  - 实现打开和关闭逻辑
  - _需求: 1.2_

## 阶段 6: 删除操作和安全增强

- [ ] 16. 实现 Ingress 删除逻辑
  - 在删除操作中添加二次确认
  - 显示影响的主机名和后端服务列表
  - 添加唯一入口规则的警告
  - _需求: 6.1, 6.2_

## 阶段 7: 路由配置

- [ ] 17. 添加 Ingress 路由
  - 在 `src/router/routes/modules/k8s.ts` 中添加 Ingress 路由
  - 设置正确的图标和标题
  - _需求: 1.1_

## 阶段 8: 测试和优化

- [ ] 18. 编写单元测试
  - 为 Mock 数据生成函数编写测试
  - 为路径统计函数编写测试
  - 为 TLS 状态判断函数编写测试
  - _需求: 全部_

- [ ] 19. 编写组件测试
  - 测试路由规则表格渲染
  - 测试 TLS 配置显示
  - 测试后端服务映射显示
  - _需求: 全部_

- [ ] 20. 性能优化
  - 使用 computed 缓存路径统计
  - 懒加载详情抽屉的子组件
  - 优化大量规则的渲染性能
  - _需求: 性能要求_

- [ ] 21. UI/UX 优化
  - 确保布局和样式一致
  - 优化加载状态和空状态显示
  - _需求: 全部_

## 阶段 9: 文档和验收

- [ ] 22. 编写代码注释
  - 为所有导出的函数和组件添加 JSDoc 注释
  - _需求: 可维护性要求_

- [ ] 23. 最终验收测试
  - 执行验收测试场景 1: 查看 Ingress 配置
  - 执行验收测试场景 2: 路由规则验证
  - 执行验收测试场景 3: 后端服务状态检查
  - _需求: 全部_

## 总结

总任务数: 23 个主任务

预估工作量: 4-6 天
