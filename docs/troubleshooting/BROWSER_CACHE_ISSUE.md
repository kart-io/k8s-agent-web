# 浏览器缓存问题

## 问题确认

✅ **服务端代码已正确修复**（通过 `./verify-fix.sh` 验证）
✅ **服务已重启**
❌ **浏览器仍显示旧错误**

**结论**: 这是浏览器缓存问题！

## 为什么会有缓存问题？

浏览器会缓存 JavaScript 文件以提高性能。当你修改代码时：
- ✅ 服务器已返回新代码
- ❌ 浏览器仍在使用缓存的旧代码

qiankun 加载的子应用 JavaScript 文件特别容易被缓存。

## 立即解决方案

### 方案 1: 硬刷新（最简单）⭐

**操作步骤**:
1. 打开 http://localhost:3000
2. 按快捷键强制刷新：
   - **macOS**: `Cmd + Shift + R`
   - **Windows/Linux**: `Ctrl + Shift + R`
3. 等待页面重新加载
4. 检查浏览器控制台是否还有错误

### 方案 2: 清除所有缓存

#### Chrome 浏览器

1. 按 `F12` 打开开发者工具
2. 转到 **Application** 标签
3. 左侧找到 **Storage** 部分
4. 点击 **Clear storage**
5. 点击 **Clear site data** 按钮
6. 关闭并重新打开浏览器
7. 访问 http://localhost:3000

或者使用快捷方式：
1. 按 `Cmd/Ctrl + Shift + Delete`
2. 选择 **缓存的图像和文件**
3. 时间范围选择 **全部**
4. 点击 **清除数据**

#### Firefox 浏览器

1. 按 `F12` 打开开发者工具
2. 转到 **网络** 标签
3. 右键点击任意请求
4. 选择 **清除浏览器缓存**
5. 刷新页面

### 方案 3: 使用隐私/无痕模式（推荐测试用）⭐

隐私模式不会使用缓存，适合快速测试：

1. 打开隐私模式窗口：
   - **Chrome**: `Cmd/Ctrl + Shift + N`
   - **Firefox**: `Cmd/Ctrl + Shift + P`
   - **Safari**: `Cmd + Shift + N`

2. 访问 http://localhost:3000

3. 如果隐私模式下没有错误，说明确实是缓存问题

### 方案 4: 开发者工具中禁用缓存（开发推荐）⭐⭐⭐

**一次设置，永久生效**（开发时）：

1. 按 `F12` 打开开发者工具
2. 转到 **Network（网络）** 标签
3. 勾选 **Disable cache（禁用缓存）**
4. **保持开发者工具打开**

**重要**: 只有开发者工具打开时，缓存才会被禁用！

### 方案 5: 检查网络请求

验证浏览器是否真的加载了新代码：

1. 按 `F12` 打开开发者工具
2. 转到 **Network（网络）** 标签
3. 勾选 **Disable cache**
4. 刷新页面
5. 查找 `main.js` 请求（可能有多个，对应不同子应用）
6. 点击查看响应内容
7. 搜索 `async bootstrap`，应该能找到

如果找不到 `async bootstrap`，说明浏览器还在使用缓存。

## 验证修复

按上述方案操作后，检查：

### ✅ 成功的标志

浏览器控制台应该显示：

```
[monitor-app] bootstrap
[cluster-app] bootstrap
[system-app] bootstrap
[dashboard-app] mount
```

**不应该有**:
- ❌ `bootstrap timeout`
- ❌ `single-spa minified message #31`
- ❌ `application died`

### ❌ 仍有问题

如果清除缓存后仍有问题：

1. 确认所有服务都在运行：
   ```bash
   make status
   ```

2. 确认代码已修复：
   ```bash
   ./verify-fix.sh
   ```

3. 检查是否有 JavaScript 错误（不是缓存问题）

4. 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 预防措施

### 开发时的最佳实践

1. **始终保持开发者工具打开**
2. **勾选 "Disable cache"**
3. **使用硬刷新而不是普通刷新**

### 为什么在开发环境也会有缓存？

即使是开发模式（`npm run dev`），浏览器仍会缓存资源。Vite 的 HMR 只能更新已加载的模块，无法强制浏览器丢弃缓存。

## 技术细节

### qiankun 的缓存问题

qiankun 通过以下方式加载子应用：

```javascript
// 主应用加载子应用
fetch('http://localhost:3001/')  // 获取 HTML
  .then(html => {
    // 解析 HTML，找到 <script src="/src/main.js">
    fetch('http://localhost:3001/src/main.js')  // ⚠️ 可能被缓存
  })
```

如果 `main.js` 被缓存，qiankun 会执行旧代码，导致 bootstrap 函数仍是旧版本。

### 缓存策略

浏览器根据以下规则缓存：

- **有 `Cache-Control` header**: 遵循 header 指定的时间
- **无 `Cache-Control` header**: 启发式缓存（通常几分钟到几小时）
- **开发模式**: Vite 通常设置 `no-cache`，但浏览器可能忽略

### 为什么硬刷新有效？

- **普通刷新**: 允许使用缓存
- **硬刷新**: 绕过缓存，直接从服务器获取

## 快速命令参考

```bash
# 验证代码已修复
./verify-fix.sh

# 检查服务状态
make status

# 重启服务（如果需要）
make restart
```

然后在浏览器中：
- **硬刷新**: `Cmd/Ctrl + Shift + R`
- **隐私模式**: `Cmd/Ctrl + Shift + N`
- **开发者工具**: `F12` -> Network -> Disable cache

## 总结

✅ **代码已修复**
✅ **服务已重启**
⚠️ **浏览器需要清除缓存**

**最快解决方案**:
1. 打开开发者工具（F12）
2. Network 标签 -> 勾选 Disable cache
3. 硬刷新（Cmd/Ctrl + Shift + R）

问题应该就解决了！🎉
