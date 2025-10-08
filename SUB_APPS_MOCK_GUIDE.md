# 子应用 Mock 数据配置指南

## 📖 概述

所有子应用（dashboard-app、agent-app、cluster-app、monitor-app、system-app）已全面支持 Mock 数据功能。

## ✅ 已支持的应用

| 应用 | Mock 数据 | 状态 |
|------|----------|------|
| main-app | ✅ 用户、菜单 | 完成 |
| dashboard-app | ✅ 统计、事件、集群状态 | 完成 |
| agent-app | ✅ Agent、事件、命令 | 完成 |
| cluster-app | ✅ 集群、节点、命名空间 | 完成 |
| monitor-app | ✅ 指标、告警、日志 | 完成 |
| system-app | ✅ 用户、角色、权限 | 完成 |

## 🔧 统一配置

所有子应用都使用相同的环境变量配置方式。

### 环境变量

每个子应用的 `.env.development` 文件：

```bash
# API 基础地址
VITE_API_BASE_URL=http://localhost:8080/api

# 是否使用 Mock 数据
VITE_USE_MOCK=true

# Mock 延迟时间（毫秒）
VITE_MOCK_DELAY=300
```

### 启用/关闭 Mock

**启用 Mock**（默认）：
```bash
# 编辑对应应用的 .env.development
VITE_USE_MOCK=true
```

**关闭 Mock**：
```bash
# 编辑对应应用的 .env.development
VITE_USE_MOCK=false
```

**重要**：修改环境变量后必须重启应用！

## 📝 各应用 Mock 数据说明

### 1. Dashboard App

**Mock 数据**：
- 统计数据（总 Agent 数、在线数、集群数等）
- 近期事件列表（Pod 创建、失败、更新等）
- 集群状态列表
- 资源使用趋势（CPU、内存）

**数据量**：
- 统计指标：8 项
- 近期事件：5 条
- 集群状态：4 个集群
- 趋势数据：12 个时间点

**文件位置**：`dashboard-app/src/mock/index.js`

### 2. Agent App

**Mock 数据**：
- Agent 列表（50 个 Agent）
- Agent 详情
- 事件列表（5 条）
- 命令列表（4 条）

**功能支持**：
- ✅ 列表筛选（状态、集群、关键字）
- ✅ 分页
- ✅ 增删改查
- ✅ 事件和命令历史

**数据特点**：
- Agent 状态：online、offline、error
- 分布在 4 个集群
- 自动生成随机 IP、版本号、资源使用率

**文件位置**：`agent-app/src/mock/index.js`

### 3. Cluster App

**Mock 数据**：
- 集群列表（4 个集群）
- 集群详情（包含标签、指标）
- 节点列表（4 个节点）
- 命名空间列表（3 个命名空间）

**功能支持**：
- ✅ 集群 CRUD
- ✅ 集群筛选（状态、地区）
- ✅ 节点查询
- ✅ 命名空间查询

**数据特点**：
- 多云支持（AWS、GCP、Azure）
- 不同地区（us-west-1、us-east-1、eu-central-1）
- 不同状态（healthy、warning）

**文件位置**：`cluster-app/src/mock/index.js`

### 4. Monitor App

**Mock 数据**：
- 监控指标时间序列（CPU、内存、网络、磁盘）
- 告警列表（4 条）
- 日志列表（4 条）

**功能支持**：
- ✅ 时间序列数据（24 小时）
- ✅ 告警筛选（级别、状态）
- ✅ 日志筛选（级别、来源）
- ✅ 分页

**数据特点**：
- 告警级别：critical、warning、info
- 告警状态：firing、resolved
- 日志级别：info、warn、error

**文件位置**：`monitor-app/src/mock/index.js`

### 5. System App

**Mock 数据**：
- 用户列表（4 个用户）
- 角色列表（4 个角色）
- 权限列表（13 个权限）
- 操作日志（3 条）

**功能支持**：
- ✅ 用户 CRUD
- ✅ 用户筛选（状态、关键字）
- ✅ 角色和权限查询
- ✅ 操作日志查询
- ✅ 分页

**数据特点**：
- 角色：admin、operator、user、guest
- 权限分组：仪表盘、Agent管理、集群管理、监控管理、系统管理
- 用户状态：active、disabled

**文件位置**：`system-app/src/mock/index.js`

## 🚀 使用示例

### 启动所有应用（Mock 模式）

```bash
# 1. 确认所有应用的 Mock 已启用（默认）
cd web/
grep VITE_USE_MOCK */. env.development

# 2. 启动所有应用
pnpm dev

# 3. 访问主应用
http://localhost:3000

# 4. 登录（使用 admin/admin123）
# 5. 切换到不同子应用查看 Mock 数据
```

### 单独测试某个子应用

```bash
# 例如：测试 Agent App
cd agent-app/

# 确认 Mock 已启用
cat .env.development

# 启动应用
pnpm dev

# 访问应用（如果是独立模式）
http://localhost:3002
```

### 切换到真实接口

```bash
# 1. 修改环境变量
vim agent-app/.env.development
# 将 VITE_USE_MOCK=true 改为 false

# 2. 重启应用
# 在 web/ 目录下
Ctrl+C
pnpm dev

# 3. 确保后端服务已启动
# - Gateway Service (端口 8080)
# - 对应的微服务
```

## 🎨 扩展 Mock 数据

### 添加新的 Mock 数据

编辑对应应用的 `src/mock/index.js`：

```javascript
// 例如：为 Agent App 添加更多 Agent
const mockData = {
  agents: generateAgents(100)  // 从 50 改为 100
}
```

### 添加新的 Mock 接口

```javascript
// 在 mockApi 中添加
export const mockApi = {
  // 现有接口...

  // 新增接口
  async getAgentMetrics(id) {
    await delay(import.meta.env.VITE_MOCK_DELAY || 300)

    return {
      cpu: (Math.random() * 100).toFixed(1),
      memory: (Math.random() * 100).toFixed(1),
      disk: (Math.random() * 100).toFixed(1),
      network: (Math.random() * 1000).toFixed(2)
    }
  }
}
```

### 在 API 文件中使用

```javascript
// src/api/agent.js
import { mockApi, isMockEnabled } from '@/mock'

export function getAgentMetrics(id) {
  if (isMockEnabled()) {
    return mockApi.getAgentMetrics(id)
  }

  return request({
    url: `/agents/${id}/metrics`,
    method: 'get'
  })
}
```

## ⚠️ 注意事项

### 1. 环境变量修改后必须重启

```bash
# 修改 .env.development 后
Ctrl+C  # 停止应用
pnpm dev  # 重新启动
```

### 2. Mock 数据仅在前端

- Mock 数据完全在前端模拟
- 不会发送任何网络请求到后端
- 数据存储在内存中，刷新页面会重置

### 3. 部分接口可能不支持 Mock

某些复杂接口可能暂未实现 Mock，会继续调用真实接口：

```javascript
// cluster-app/src/api/cluster.js
export function getPods(clusterId, params) {
  // Mock 暂不支持，返回真实接口
  return request({
    url: `/clusters/${clusterId}/pods`,
    method: 'get',
    params
  })
}
```

### 4. Mock 延迟可配置

```bash
# 调整 Mock 响应延迟
VITE_MOCK_DELAY=500  # 500ms
VITE_MOCK_DELAY=0    # 无延迟（立即响应）
```

### 5. 控制台日志提示

每个应用启动时会在浏览器控制台显示 Mock 状态：

**Mock 启用**：
```
[Dashboard] Mock 数据已启用
[Agent] Mock 数据已启用
[Cluster] Mock 数据已启用
...
```

**Mock 关闭**：
```
[Dashboard] 使用真实接口
[Agent] 使用真实接口
...
```

## 🧪 测试场景

### 场景 1: 前端独立开发

```bash
# 所有应用启用 Mock
VITE_USE_MOCK=true

# 优点：
# - 无需后端服务
# - 响应速度快
# - 可模拟各种场景
# - 专注前端开发
```

### 场景 2: 前后端联调

```bash
# 主应用使用 Mock（登录、菜单）
# 子应用使用真实接口
main-app/.env.development:      VITE_USE_MOCK=true
dashboard-app/.env.development: VITE_USE_MOCK=false
agent-app/.env.development:     VITE_USE_MOCK=false
...

# 优点：
# - 快速登录测试
# - 真实数据验证
# - 接口联调
```

### 场景 3: 混合模式

```bash
# 根据需要单独配置每个应用
main-app:      VITE_USE_MOCK=true   # 使用 Mock
dashboard-app: VITE_USE_MOCK=true   # 使用 Mock
agent-app:     VITE_USE_MOCK=false  # 真实接口
cluster-app:   VITE_USE_MOCK=false  # 真实接口
monitor-app:   VITE_USE_MOCK=true   # 使用 Mock
system-app:    VITE_USE_MOCK=true   # 使用 Mock
```

## 📚 相关文档

- [主应用 Mock 指南](MOCK_GUIDE.md) - main-app Mock 配置详解
- [动态菜单指南](DYNAMIC_MENU_GUIDE.md) - 菜单配置说明
- [启动指南](START_GUIDE.md) - 应用启动说明

## ✅ 检查清单

开始使用前的检查：

- [ ] 确认所有应用都有 `.env.development` 文件
- [ ] 确认 `VITE_USE_MOCK` 配置正确
- [ ] 启动应用后查看控制台 Mock 状态
- [ ] 测试各应用的 Mock 数据是否正常加载
- [ ] 测试切换到真实接口是否正常

## 🎉 总结

**所有子应用已支持 Mock 数据**：
- ✅ 统一的配置方式
- ✅ 丰富的 Mock 数据
- ✅ 易于扩展
- ✅ 支持独立开发
- ✅ 开箱即用

**开发建议**：
1. 前端独立开发时，全部使用 Mock 模式
2. 接口联调时，按需切换到真实接口
3. 提测前，全部切换到真实接口验证

现在可以在不依赖后端的情况下，进行完整的前端开发！🚀
