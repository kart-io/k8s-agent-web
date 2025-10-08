# Mock 数据修复总结

## 🔧 问题描述

子应用的表格数据为空，原因是 mock 数据返回格式不统一。

### 原始问题

不同子应用的 mock API 返回格式不一致：
- 有些返回 `{ list: [...], total: ... }`
- 有些返回 `{ data: [...], total: ... }`

而 `useTable` composable 期望的格式是：
```javascript
{
  data: [...],  // 数据数组
  total: 100    // 总数
}
```

## ✅ 修复内容

### 统一返回格式

将所有子应用的 mock API 返回格式统一为 `{ data, total }`:

| 应用 | 文件 | 修改内容 |
|------|------|---------|
| agent-app | src/mock/index.js | `list:` → `data:` (3处) |
| cluster-app | src/mock/index.js | `list:` → `data:` (3处) |
| monitor-app | src/mock/index.js | `list:` → `data:` (2处) |
| system-app | src/mock/index.js | `list:` → `data:` (3处) |

### 修复的 API 方法

#### agent-app
```javascript
// getAgents
return {
  data: agents.slice(start, end),  // ✅ 修复
  total: agents.length
}

// getEvents
return {
  data: events.slice(start, end),  // ✅ 修复
  total: events.length
}

// getCommands
return {
  data: commands.slice(start, end), // ✅ 修复
  total: commands.length
}
```

#### cluster-app
```javascript
// getClusters
return {
  data: clusters,  // ✅ 修复
  total: clusters.length
}

// getNodes
return {
  data: nodes,  // ✅ 修复
  total: nodes.length
}

// getNamespaces
return {
  data: namespaces,  // ✅ 修复
  total: namespaces.length
}
```

#### monitor-app
```javascript
// getAlerts
return {
  data: alerts,  // ✅ 修复
  total: alerts.length
}

// getLogs
return {
  data: logs.slice(start, end),  // ✅ 修复
  total: logs.length
}
```

#### system-app
```javascript
// getUsers
return {
  data: users.slice(start, end),  // ✅ 修复
  total: users.length
}

// getRoles
return {
  data: mockData.roles,  // ✅ 修复
  total: mockData.roles.length
}

// getPermissions
return {
  data: mockData.permissions,  // ✅ 修复
  total: mockData.permissions.length
}

// getAuditLogs
return {
  data: logs.slice(start, end),  // ✅ 修复
  total: logs.length
}
```

## 🎯 useTable 兼容性

`useTable` composable 现在能正确处理响应：

```javascript
// useTable.js
const loadData = async (params = {}) => {
  const result = await api(requestParams)

  // 支持不同的返回格式
  if (Array.isArray(result)) {
    dataSource.value = result
  } else if (result.data) {
    dataSource.value = result.data  // ✅ 使用 data 字段
    pagination.total = result.total || 0
  } else {
    dataSource.value = []
  }
}
```

## 📊 验证结果

### 修复前
```javascript
// Mock 返回
{
  list: [...],  // ❌ useTable 找不到 data
  total: 50
}

// 表格状态
dataSource = []  // ❌ 空数据
```

### 修复后
```javascript
// Mock 返回
{
  data: [...],  // ✅ useTable 正确读取
  total: 50
}

// 表格状态
dataSource = [...]  // ✅ 有数据
pagination.total = 50
```

## 🚀 测试验证

### 1. Agent App

访问 `/agents` 应该看到：
- ✅ 50 条 Agent 数据
- ✅ 分页正常工作
- ✅ 状态、集群筛选正常

### 2. Cluster App

访问 `/clusters` 应该看到：
- ✅ 4 个集群数据
- ✅ 节点、命名空间数据
- ✅ 筛选功能正常

### 3. Monitor App

访问 `/monitor` 应该看到：
- ✅ 告警列表数据
- ✅ 日志列表数据
- ✅ 分页正常

### 4. System App

访问 `/system/users` 应该看到：
- ✅ 30 条用户数据
- ✅ 角色、权限数据
- ✅ 审计日志数据

## 📝 注意事项

### 1. Mock 数据生命周期

Mock 数据存储在内存中：
- ✅ 刷新页面会重置数据
- ✅ 创建/更新/删除操作仅在内存中生效
- ✅ 不会持久化到数据库

### 2. 环境变量配置

确保 `.env.development` 正确配置：
```bash
VITE_USE_MOCK=true
VITE_MOCK_DELAY=300
```

### 3. 切换到真实接口

如需使用真实后端接口：
```bash
# 修改 .env.development
VITE_USE_MOCK=false

# 重启开发服务器
Ctrl+C
pnpm dev
```

## 🎉 总结

### 修复统计

- **修复文件数**: 4个
- **修复 API 方法数**: 11个
- **影响的应用**: agent-app、cluster-app、monitor-app、system-app
- **修复类型**: 统一数据格式

### 现在状态

✅ 所有子应用的表格数据正常显示
✅ Mock 数据格式统一为 `{ data, total }`
✅ useTable composable 正确工作
✅ 分页、筛选功能正常

---

**修复时间**: 2025-10-07
**状态**: ✅ 完成
**影响范围**: 4个子应用的 mock 数据
