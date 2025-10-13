# Makefile 快速参考

## 最常用命令 ⭐

```bash
make help          # 查看所有命令
make i             # 安装依赖 (install)
make d             # 启动开发 (dev)
make b             # 构建项目 (build)
make t             # 运行测试 (test)
make l             # 代码检查 (lint)
```

## 开发流程

### 新项目启动
```bash
make check-deps    # 1. 检查环境
make install       # 2. 安装依赖
make setup-hooks   # 3. 设置 Git Hooks
make dev-antd      # 4. 启动开发
```

### 日常开发
```bash
make dev-antd      # 启动开发服务器
make test-unit     # 运行单元测试
make quality       # 代码质量检查
```

### 提交代码前
```bash
make format        # 1. 格式化代码
make quality       # 2. 质量检查
make test          # 3. 运行测试
```

### 发布前
```bash
make clean-all     # 1. 清理环境
make install       # 2. 重装依赖
make test          # 3. 测试
make quality       # 4. 质量检查
make build         # 5. 构建
make backup        # 6. 创建备份
```

## 按类别分类

### 📦 依赖管理
```bash
make install           # 安装依赖
make install-clean     # 清理后安装
make update            # 更新依赖
```

### 🚀 开发服务器
```bash
make dev              # 启动（选择应用）
make dev-antd         # Ant Design
make dev-ele          # Element Plus
make dev-naive        # Naive UI
make dev-docs         # 文档
```

### 🏗️ 构建
```bash
make build            # 构建全部
make build-antd       # Ant Design
make build-ele        # Element Plus
make build-naive      # Naive UI
make build-docs       # 文档
make preview          # 预览构建
```

### 🧪 测试
```bash
make test             # 所有测试
make test-unit        # 单元测试
make test-unit-ui     # 单元测试(UI)
make test-e2e         # E2E测试
make test-e2e-ui      # E2E测试(UI)
make test-coverage    # 覆盖率报告
```

### 🔍 代码质量
```bash
make lint             # Lint检查
make lint-fix         # 自动修复
make format           # 格式化
make format-check     # 检查格式
make type-check       # 类型检查
make quality          # 所有检查
```

### 🐳 Docker
```bash
make docker-build     # 构建镜像
make docker-run       # 运行容器
make docker-stop      # 停止容器
make docker-logs      # 查看日志
make docker-clean     # 清理资源
```

### 🧹 清理
```bash
make clean            # 清理构建产物
make clean-all        # 清理全部
make clean-cache      # 清理缓存
```

### 📊 分析
```bash
make analyze          # Bundle分析
make stats            # 项目统计
```

### 🚢 部署
```bash
make deploy-preview   # 预览环境
make deploy-prod      # 生产环境
```

### 🛠️ 工具
```bash
make check-deps       # 检查环境
make setup-hooks      # 设置Hooks
make backup           # 创建备份
```

## 快捷别名

| 别名 | 完整命令 | 说明 |
|-----|---------|------|
| `i` | `install` | 安装依赖 |
| `d` | `dev` | 启动开发 |
| `b` | `build` | 构建项目 |
| `t` | `test` | 运行测试 |
| `l` | `lint` | 代码检查 |
| `f` | `format` | 格式化 |
| `c` | `clean` | 清理 |

## 实用技巧

### 组合命令
```bash
# 清理后重新构建
make clean && make build

# 并行运行检查
make lint & make type-check & wait

# 格式化并检查
make format && make quality
```

### 查看具体命令
```bash
# 查看 make 会执行什么
make -n dev-antd
```

### 静默执行
```bash
# 不显示命令本身
make -s stats
```

## 常见问题

### Make 找不到？
```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential

# Windows
# 使用 WSL 或 Git Bash
```

### 命令执行失败？
1. 确认在项目根目录
2. 检查拼写
3. 运行 `make check-deps` 检查环境

### Tab 缩进错误？
Makefile 必须使用 Tab，不能用空格。

## 与 pnpm 对照

| Makefile | pnpm | 说明 |
|---------|------|------|
| `make install` | `pnpm install` | 安装 |
| `make dev` | `pnpm dev` | 开发 |
| `make build` | `pnpm build` | 构建 |
| `make test` | `pnpm test` | 测试 |
| `make lint` | `pnpm lint` | 检查 |

## 记住这些就够了！

```bash
make help      # 忘记了？看帮助！
make i         # 安装
make d         # 开发
make b         # 构建
make t         # 测试
make quality   # 检查
```

---

💡 **提示**: 养成使用 `make` 的习惯，让开发更高效！