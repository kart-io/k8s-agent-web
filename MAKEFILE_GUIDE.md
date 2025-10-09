# Makefile 使用指南

本项目提供了 Makefile 来简化开发流程，支持批量启动、停止和管理所有微前端应用。

## 快速开始

```bash
# 查看所有可用命令
make help

# 首次使用：完整安装和启动
make setup
make dev
```

## 常用命令

### 服务管理

| 命令 | 说明 |
|-----|------|
| `make dev` | 前台启动所有应用（可以看到实时日志） |
| `make dev-bg` | 后台启动所有应用（日志写入 logs/all-apps.log） |
| `make stop` | 优雅停止所有应用 |
| `make kill` | 强制杀死端口 3000-3006 上的所有进程 |
| `make restart` | 重启所有应用（前台） |
| `make restart-bg` | 重启所有应用（后台） |
| `make status` | 查看所有应用的运行状态 |
| `make logs` | 实时查看日志（仅后台模式） |

### 单独启动应用

| 命令 | 应用 | 端口 |
|-----|-----|------|
| `make dev-main` | 主应用 | 3000 |
| `make dev-dashboard` | 仪表盘 | 3001 |
| `make dev-agent` | Agent 管理 | 3002 |
| `make dev-cluster` | 集群管理 | 3003 |
| `make dev-monitor` | 监控管理 | 3004 |
| `make dev-system` | 系统管理 | 3005 |
| `make dev-image-build` | 镜像构建 | 3006 |

### 开发任务

| 命令 | 说明 |
|-----|------|
| `make install` | 安装所有应用的依赖 |
| `make build` | 构建所有应用 |
| `make lint` | 运行所有应用的代码检查 |
| `make clean` | 清理所有构建产物和依赖 |
| `make clean-build` | 仅清理构建产物（保留 node_modules） |

## 使用场景

### 场景 1：日常开发（推荐前台模式）

```bash
# 启动所有应用，可以看到实时日志
make dev

# 停止（Ctrl+C 或新终端执行）
make stop
```

**优点**：
- 可以实时看到所有应用的日志
- 方便调试
- 使用 Ctrl+C 即可停止

### 场景 2：后台运行

```bash
# 后台启动所有应用
make dev-bg

# 查看运行状态
make status

# 查看日志
make logs

# 停止服务
make stop
```

**优点**：
- 释放终端，可以继续做其他事情
- 日志保存在文件中，方便回溯
- 适合长时间运行

### 场景 3：只开发某个子应用

```bash
# 只启动主应用和某个子应用
make dev-main        # 终端1
make dev-dashboard   # 终端2（或其他子应用）
```

### 场景 4：端口被占用问题

```bash
# 强制清理所有端口
make kill

# 重新启动
make dev
```

### 场景 5：完全重新开始

```bash
# 清理所有内容
make clean

# 重新安装和启动
make setup
make dev
```

## 命令详解

### `make status`

检查所有应用的运行状态，输出示例：

```
📊 应用运行状态:

  ✅ 主应用 (main-app) - 运行中 (PID: 12345, Port: 3000)
  ✅ 仪表盘 (dashboard-app) - 运行中 (PID: 12346, Port: 3001)
  ❌ Agent管理 (agent-app) - 未运行 (Port: 3002)
  ...
```

### `make kill`

强制杀死端口 3000-3006 上的所有进程，适用于：
- `make stop` 无法停止时
- 端口被其他进程占用时
- 进程卡死时

### `make logs`

查看后台运行的日志（需要使用 `make dev-bg` 启动）：
- 实时跟踪日志文件
- 按 Ctrl+C 退出查看（不会停止应用）

## 常见问题

### Q1: `make dev-bg` 后如何停止？

```bash
make stop
# 或
make kill
```

### Q2: 如何查看后台运行的日志？

```bash
# 实时查看
make logs

# 或直接查看文件
tail -f logs/all-apps.log
```

### Q3: 端口被占用怎么办？

```bash
# 强制清理端口
make kill

# 或手动清理特定端口
lsof -ti:3000 | xargs kill -9
```

### Q4: `make stop` 不起作用？

可能 PID 文件丢失或进程异常，使用 `make kill` 强制停止。

### Q5: 某个应用启动失败？

```bash
# 查看状态
make status

# 单独启动失败的应用查看详细错误
make dev-dashboard  # 替换为失败的应用
```

## 与 pnpm 命令对比

| Makefile | pnpm | 说明 |
|----------|------|------|
| `make dev` | `pnpm dev` | 启动所有应用（前台） |
| `make stop` | `Ctrl+C` | 停止应用 |
| `make install` | `pnpm run install:all` | 安装依赖 |
| `make build` | `pnpm build` | 构建所有应用 |
| `make status` | ❌ 无 | Makefile 独有 |
| `make kill` | ❌ 无 | Makefile 独有 |

**Makefile 额外功能**：
- ✅ 服务状态检查
- ✅ 强制停止服务
- ✅ 后台运行管理
- ✅ 统一的命令接口

## 技术说明

### 后台运行原理

- 使用 `nohup` 命令在后台运行
- PID 保存在 `.pids/all.pid` 文件
- 日志输出到 `logs/all-apps.log`

### 端口检测

- 使用 `lsof` 命令检测端口占用
- macOS 和 Linux 系统原生支持
- Windows 系统需要使用 WSL 或 Git Bash

### 目录结构

```
.
├── .pids/          # PID 文件目录（自动创建）
│   └── all.pid     # 所有应用的进程ID
└── logs/           # 日志目录（自动创建）
    └── all-apps.log # 后台运行日志
```

这些目录已添加到 `.gitignore`，不会被提交到版本控制。
