# 菜单管理快速开始

## 快速访问

### 通过主应用访问（推荐）

```bash
# 启动所有应用
make dev

# 或者
./dev.sh
```

访问：`http://localhost:3000/system/menus`

### 直接访问 system-app

```bash
# 只启动 system-app
make dev-system

# 或者
cd system-app && pnpm dev
```

访问：`http://localhost:3005/menus`

## 功能演示

### 1. 查看菜单列表

打开页面后，会自动加载所有菜单数据，以树形结构展示。

**默认数据包含**：
- 12个菜单项
- 2个目录（Agent管理、系统管理）
- 包含微应用关联信息

### 2. 搜索菜单

在搜索框中输入关键词（如"用户"或"/system"），点击搜索按钮。

### 3. 添加顶级菜单

**步骤**：
1. 点击"添加菜单"按钮
2. 填写表单：
   - 上级菜单：留空
   - 菜单类型：选择"菜单"
   - 菜单名称：`测试菜单`
   - 路由路径：`/test`
   - 图标：`DashboardOutlined`
   - 组件类型：`MicroAppPlaceholder`
   - 微应用：`dashboard-app`
   - 排序号：`99`
   - 状态：启用
   - 可见：是
3. 点击"确定"

### 4. 添加目录

**步骤**：
1. 点击"添加菜单"按钮
2. 填写表单：
   - 上级菜单：留空
   - 菜单类型：选择"目录"
   - 菜单名称：`测试目录`
   - 路由路径：`/test-dir`
   - 图标：`FolderOutlined`
3. 点击"确定"

### 5. 添加子菜单

**方式一：通过"添加子菜单"按钮**
1. 找到"系统管理"或任意目录类型菜单
2. 点击该行的"添加子菜单"按钮
3. 表单会自动设置父菜单
4. 填写其他信息
5. 点击"确定"

**方式二：手动选择父菜单**
1. 点击"添加菜单"按钮
2. 在"上级菜单"下拉框中选择父菜单
3. 填写其他信息
4. 点击"确定"

### 6. 编辑菜单

1. 点击某一行的"编辑"按钮
2. 修改需要的字段
3. 点击"确定"

### 7. 删除菜单

1. 点击某一行的"删除"按钮
2. 在确认对话框中点击"确定"

**注意**：有子菜单的菜单不能直接删除

### 8. 刷新数据

点击"刷新"按钮重新加载最新数据。

## 常见场景

### 场景1：添加新的微应用菜单

假设新增了一个 `report-app` 微应用，需要添加到菜单：

```javascript
{
  "parentId": null,
  "name": "报表中心",
  "path": "/report",
  "component": "MicroAppPlaceholder",
  "icon": "BarChartOutlined",
  "type": "menu",
  "orderNum": 7,
  "status": "enabled",
  "visible": true,
  "microApp": "report-app"
}
```

### 场景2：创建二级菜单结构

**步骤**：
1. 先创建一级目录
2. 再为该目录添加子菜单
3. 设置合适的排序号

示例：

```text
财务管理（目录）orderNum: 10
  ├─ 收入统计（菜单）orderNum: 1
  ├─ 支出统计（菜单）orderNum: 2
  └─ 财务报表（菜单）orderNum: 3
```

### 场景3：隐藏某个菜单

编辑菜单，将"是否可见"开关关闭。

### 场景4：禁用某个菜单

编辑菜单，将"状态"改为"禁用"。

### 场景5：调整菜单顺序

编辑菜单，修改"排序号"，数字越小越靠前。

## 表单字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| 上级菜单 | 否 | 留空为顶级菜单 |
| 菜单类型 | 是 | 菜单/目录/按钮 |
| 菜单名称 | 是 | 显示的菜单文本 |
| 路由路径 | 菜单/目录必填 | 必须以 `/` 开头 |
| 菜单图标 | 否 | Ant Design 图标名称 |
| 组件类型 | 菜单必填 | MicroAppPlaceholder 或 SubMenu |
| 微应用名称 | 微应用菜单必填 | 关联的微应用 |
| 排序号 | 否 | 默认999，数字越小越靠前 |
| 菜单状态 | 是 | 启用/禁用 |
| 是否可见 | 是 | 控制菜单显示/隐藏 |

## 数据验证规则

### 添加菜单

- ✅ 菜单名称不能为空
- ✅ 菜单/目录类型必须有路由路径
- ✅ 微应用菜单必须选择微应用
- ✅ 路由路径必须以 `/` 开头

### 删除菜单

- ❌ 不能删除有子菜单的菜单
- ✅ 必须先删除所有子菜单

## Mock 数据开关

菜单管理使用 Mock 数据，通过环境变量控制：

```bash
# system-app/.env.development
VITE_USE_MOCK=true
VITE_MOCK_DELAY=300
```

关闭 Mock 将使用真实后端接口。

## 调试技巧

### 1. 查看控制台日志

打开浏览器开发者工具，查看 Console：

```javascript
[System Mock] getMenus called, returning: [...]
[MenuList] loadMenusApi 调用, params: {...}
[MenuList] getMenus 返回: {...}
```

### 2. 查看网络请求

在 Network 标签页中，过滤 `/menus` 请求，查看请求和响应数据。

### 3. Vue DevTools

使用 Vue DevTools 查看组件状态和数据流。

## 故障排除

### 问题1：页面空白

**原因**：Mock 数据未正确加载

**解决**：
1. 检查 `.env.development` 中 `VITE_USE_MOCK=true`
2. 查看控制台是否有错误
3. 确认 `src/mock/index.js` 中有 `getMenus` 方法

### 问题2：树形结构不显示

**原因**：`parentId` 关联错误

**解决**：
1. 检查 Mock 数据中的 `parentId` 字段
2. 确认 `gridOptions.treeConfig` 配置正确

### 问题3：添加菜单失败

**原因**：表单验证失败

**解决**：
1. 确保必填项已填写
2. 检查路由路径格式（必须以 `/` 开头）
3. 查看控制台错误信息

### 问题4：删除菜单提示错误

**原因**：菜单有子菜单

**解决**：
1. 先删除所有子菜单
2. 再删除父菜单

## 下一步

- 阅读完整文档：`system-app/docs/MENU_MANAGEMENT.md`
- 查看用户管理示例：`system-app/src/views/UserList.vue`
- 了解 VXE Table 配置：`docs/components/VXE_TABLE.md`
- 学习微前端架构：`docs/architecture/WUJIE_MIGRATION_COMPLETE.md`
