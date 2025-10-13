# Makefile 使用指南

## 概述

项目提供了 `Makefile` 来简化常用命令的执行。使用 `make` 命令可以更便捷地执行开发、构建、测试等任务。

## 前置要求

确保系统已安装 `make` 工具：

```bash
# 检查 make 是否已安装
make --version

# macOS (通常已预装)
# 如果未安装，可通过 Xcode Command Line Tools 安装
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential

# CentOS/RHEL
sudo yum install make

# Windows (使用 WSL 或 Git Bash)
# WSL: 按照 Linux 方式安装
# Git Bash: 通常随 Git 一起安装
```

## 快速开始

### 查看帮助

```bash
make help
# 或简单执行
make
```

这将显示所有可用命令的列表和说明。

### 常用命令

```bash
# 安装依赖
make install

# 启动开发服务器
make dev

# 构建项目
make build

# 运行测试
make test

# 代码检查
make lint
```

## 命令分类

### 1. 依赖管理

#### 安装依赖

```bash
make install
```

相当于：
```bash
pnpm install
```

#### 清理并重新安装

```bash
make install-clean
```

相当于：
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm store prune
pnpm install
```

使用场景：
- 依赖安装失败
- 切换分支后依赖冲突
- 依赖版本问题

#### 更新依赖

```bash
make update
```

相当于：
```bash
pnpm update
```

### 2. 开发服务器

#### 启动默认开发服务器

```bash
make dev
```

会提示选择要启动的应用。

#### 启动特定应用

```bash
# Ant Design 版本
make dev-antd

# Element Plus 版本
make dev-ele

# Naive UI 版本
make dev-naive

# 文档站点
make dev-docs
```

### 3. 构建

#### 构建所有应用

```bash
make build
```

#### 构建特定应用

```bash
# Ant Design 版本
make build-antd

# Element Plus 版本
make build-ele

# Naive UI 版本
make build-naive

# 文档
make build-docs
```

#### 预览构建产物

```bash
make preview
```

在本地预览生产构建的结果。

### 4. 测试

#### 运行所有测试

```bash
make test
```

#### 单元测试

```bash
# 运行单元测试
make test-unit

# 带 UI 界面的单元测试
make test-unit-ui
```

#### E2E 测试

```bash
# 运行 E2E 测试
make test-e2e

# 带 UI 界面的 E2E 测试
make test-e2e-ui
```

#### 测试覆盖率

```bash
make test-coverage
```

生成的报告位于 `coverage/` 目录。

### 5. 代码质量

#### Lint 检查

```bash
# 运行 lint
make lint

# 自动修复 lint 问题
make lint-fix
```

#### 代码格式化

```bash
# 格式化代码
make format

# 检查代码格式（不修改）
make format-check
```

#### 类型检查

```bash
make type-check
```

#### 运行所有质量检查

```bash
make quality
```

相当于依次执行：
- `make lint`
- `make type-check`
- `make format-check`

### 6. Docker

#### 构建 Docker 镜像

```bash
make docker-build
```

默认镜像名：`vben-admin:latest`

#### 运行 Docker 容器

```bash
make docker-run
```

容器将在后台运行，映射到本地 80 端口。

#### 查看 Docker 日志

```bash
make docker-logs
```

#### 停止 Docker 容器

```bash
make docker-stop
```

#### 清理 Docker 资源

```bash
make docker-clean
```

删除容器和镜像。

### 7. 清理

#### 清理构建产物

```bash
make clean
```

删除：
- `apps/*/dist`
- `docs/.vitepress/dist`
- `coverage`
- `test-results`
- `.turbo` 缓存

#### 清理所有文件

```bash
make clean-all
```

删除构建产物和所有 `node_modules`。

#### 清理缓存

```bash
make clean-cache
```

清理 pnpm 和构建缓存。

### 8. 分析

#### Bundle 分析

```bash
make analyze
```

分析构建产物的大小，生成可视化报告。

#### 项目统计

```bash
make stats
```

显示：
- 文件数量统计
- 代码行数统计
- 目录大小统计

### 9. 部署

#### 部署到预览环境

```bash
make deploy-preview
```

需要配置 Netlify CLI。

#### 部署到生产环境

```bash
make deploy-prod
```

会要求确认后才部署。

### 10. 实用工具

#### 检查开发环境

```bash
make check-deps
```

检查必需工具是否已安装：
- Node.js
- pnpm
- Git
- Docker（可选）

#### 设置 Git Hooks

```bash
make setup-hooks
```

安装 lefthook git hooks。

#### 创建备份

```bash
make backup
```

创建当前分支的备份分支。

## 快捷命令别名

为了更快速地执行常用命令，Makefile 提供了一些单字母别名：

```bash
make i    # 等同于 make install
make d    # 等同于 make dev
make b    # 等同于 make build
make t    # 等同于 make test
make l    # 等同于 make lint
make f    # 等同于 make format
make c    # 等同于 make clean
```

## 典型工作流

### 新项目设置

```bash
# 1. 检查环境
make check-deps

# 2. 安装依赖
make install

# 3. 设置 Git Hooks
make setup-hooks

# 4. 启动开发
make dev-antd
```

### 日常开发

```bash
# 1. 更新代码后安装依赖
make install

# 2. 启动开发服务器
make dev-antd

# 3. 运行测试
make test-unit

# 4. 代码检查
make quality
```

### 提交前检查

```bash
# 1. 格式化代码
make format

# 2. 运行所有质量检查
make quality

# 3. 运行测试
make test

# 4. 构建验证
make build-antd
```

### 发布流程

```bash
# 1. 清理环境
make clean-all

# 2. 重新安装依赖
make install

# 3. 运行所有测试
make test

# 4. 质量检查
make quality

# 5. 构建所有应用
make build

# 6. 创建备份
make backup

# 7. 部署到生产
make deploy-prod
```

### Docker 部署

```bash
# 1. 构建镜像
make docker-build

# 2. 运行容器
make docker-run

# 3. 查看日志
make docker-logs

# 4. 停止容器（如需要）
make docker-stop
```

## 自定义配置

### 修改 Docker 端口

编辑 `Makefile`，找到 Docker 配置部分：

```makefile
DOCKER_IMAGE_NAME = vben-admin
DOCKER_CONTAINER_NAME = vben-admin-container
DOCKER_PORT = 80    # 修改此处端口
```

### 添加自定义命令

在 `Makefile` 末尾添加：

```makefile
# 自定义命令
my-custom-command:
	@echo "执行自定义命令..."
	@# 你的命令
```

使用：

```bash
make my-custom-command
```

## 常见问题

### Make 命令找不到

**Windows 用户**：
- 使用 WSL（推荐）
- 使用 Git Bash
- 安装 Make for Windows

**macOS 用户**：
```bash
xcode-select --install
```

**Linux 用户**：
```bash
sudo apt-get install build-essential
```

### 命令执行失败

1. 检查是否在项目根目录
2. 确保 `Makefile` 文件存在
3. 检查命令拼写是否正确
4. 查看具体错误信息

### Tab 缩进错误

Makefile 要求使用 Tab 缩进，不能使用空格。如果遇到错误：

```
Makefile:xx: *** missing separator. Stop.
```

请确保使用 Tab 而不是空格。

## 性能提示

### 并行执行

某些任务可以并行执行以提高速度：

```bash
# 并行运行 lint 和类型检查
make lint & make type-check & wait
```

### 跳过某些步骤

如果确认某些步骤不需要执行，可以直接跳到目标步骤：

```bash
# 假设已经安装过依赖
make dev-antd    # 直接启动，不需要 make install
```

## 与 pnpm 命令对照

| Makefile 命令 | pnpm 命令 | 说明 |
|--------------|-----------|------|
| `make install` | `pnpm install` | 安装依赖 |
| `make dev` | `pnpm dev` | 启动开发服务器 |
| `make build` | `pnpm build` | 构建项目 |
| `make test` | `pnpm test` | 运行测试 |
| `make lint` | `pnpm lint` | 代码检查 |
| `make format` | `pnpm format` | 格式化代码 |
| `make clean` | 手动删除 dist | 清理产物 |

## 最佳实践

1. **使用 make help**：忘记命令时随时查看
2. **利用别名**：频繁使用的命令用别名更快
3. **组合命令**：根据需要组合多个命令
4. **定期清理**：定期运行 `make clean-cache`
5. **备份习惯**：重要操作前先 `make backup`

## 相关资源

- [GNU Make 文档](https://www.gnu.org/software/make/manual/)
- [Makefile 教程](https://makefiletutorial.com/)
- [项目 README](../../../README.md)

## 总结

Makefile 提供了统一、简洁的命令接口，让开发流程更加高效。建议：

- 新手：从 `make help` 开始，逐步学习常用命令
- 进阶：使用别名和组合命令提高效率
- 专家：根据需要自定义命令

记住：`make help` 是你的好朋友！