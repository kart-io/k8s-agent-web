.PHONY: help install dev stop kill clean build lint dev-main dev-dashboard dev-agent dev-cluster dev-monitor dev-system dev-image-build

# 默认目标
help:
	@echo "K8s Agent Web - 可用命令:"
	@echo ""
	@echo "  make install          - 安装所有应用的依赖"
	@echo "  make dev              - 启动所有应用 (后台运行)"
	@echo "  make stop             - 停止所有应用"
	@echo "  make kill             - 强制杀死所有应用进程"
	@echo "  make restart          - 重启所有应用（前台）⚡"
	@echo "  make restart-bg       - 重启所有应用（后台）"
	@echo "  make status           - 查看所有应用的运行状态"
	@echo "  make logs             - 查看所有应用的日志"
	@echo "  make build            - 构建所有应用"
	@echo "  make clean            - 清理所有构建产物和依赖"
	@echo "  make lint             - 运行所有应用的代码检查"
	@echo ""
	@echo "单独启动应用:"
	@echo "  make dev-main         - 启动主应用 (port 3000)"
	@echo "  make dev-dashboard    - 启动仪表盘 (port 3001)"
	@echo "  make dev-agent        - 启动 Agent 管理 (port 3002)"
	@echo "  make dev-cluster      - 启动集群管理 (port 3003)"
	@echo "  make dev-monitor      - 启动监控管理 (port 3004)"
	@echo "  make dev-system       - 启动系统管理 (port 3005)"
	@echo "  make dev-image-build  - 启动镜像构建 (port 3006)"
	@echo ""

# 安装依赖
install:
	@echo "📦 安装所有应用的依赖..."
	@pnpm run install:all
	@echo "✅ 依赖安装完成"

# 启动所有应用（前台，自动处理代理问题）
dev:
	@echo "🚀 启动所有应用..."
	@./dev.sh

# 启动所有应用（后台）
dev-bg:
	@echo "🚀 在后台启动所有应用..."
	@mkdir -p .pids logs
	@nohup bash -c 'unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY && export no_proxy=localhost,127.0.0.1 && export NO_PROXY=localhost,127.0.0.1 && pnpm dev' > logs/all-apps.log 2>&1 & echo $$! > .pids/all.pid
	@echo "✅ 所有应用已在后台启动"
	@echo "📝 日志文件: logs/all-apps.log"
	@echo "💡 使用 'make logs' 查看日志"
	@echo "💡 使用 'make stop' 停止服务"

# 单独启动各个应用
dev-main:
	@echo "🚀 启动主应用 (port 3000)..."
	@cd main-app && pnpm dev

dev-dashboard:
	@echo "🚀 启动仪表盘 (port 3001)..."
	@cd dashboard-app && pnpm dev

dev-agent:
	@echo "🚀 启动 Agent 管理 (port 3002)..."
	@cd agent-app && pnpm dev

dev-cluster:
	@echo "🚀 启动集群管理 (port 3003)..."
	@cd cluster-app && pnpm dev

dev-monitor:
	@echo "🚀 启动监控管理 (port 3004)..."
	@cd monitor-app && pnpm dev

dev-system:
	@echo "🚀 启动系统管理 (port 3005)..."
	@cd system-app && pnpm dev

dev-image-build:
	@echo "🚀 启动镜像构建 (port 3006)..."
	@cd image-build-app && pnpm dev

# 停止所有应用（通过PID文件）
stop:
	@echo "🛑 停止所有应用..."
	@if [ -f .pids/all.pid ]; then \
		kill $$(cat .pids/all.pid) 2>/dev/null && echo "✅ 应用已停止" || echo "⚠️  未找到运行的进程"; \
		rm -f .pids/all.pid; \
	else \
		echo "⚠️  没有找到 PID 文件，尝试通过端口停止..."; \
		$(MAKE) kill; \
	fi

# 强制杀死所有应用进程（通过端口）
kill:
	@echo "🔪 强制停止所有应用进程..."
	@echo "正在查找并停止端口 3000-3006 上的进程..."
	@if command -v lsof > /dev/null; then \
		for port in 3000 3001 3002 3003 3004 3005 3006; do \
			pid=$$(lsof -ti:$$port 2>/dev/null); \
			if [ -n "$$pid" ]; then \
				echo "  停止端口 $$port 上的进程 (PID: $$pid)"; \
				kill -9 $$pid 2>/dev/null; \
			fi; \
		done; \
		echo "✅ 所有进程已停止"; \
	else \
		echo "❌ 未找到 lsof 命令"; \
		echo "💡 请手动停止进程或安装 lsof"; \
	fi
	@rm -f .pids/all.pid

# 查看应用状态
status:
	@echo "📊 应用运行状态:"
	@echo ""
	@for port in 3000 3001 3002 3003 3004 3005 3006; do \
		if [ $$port -eq 3000 ]; then name="主应用 (main-app)"; \
		elif [ $$port -eq 3001 ]; then name="仪表盘 (dashboard-app)"; \
		elif [ $$port -eq 3002 ]; then name="Agent管理 (agent-app)"; \
		elif [ $$port -eq 3003 ]; then name="集群管理 (cluster-app)"; \
		elif [ $$port -eq 3004 ]; then name="监控管理 (monitor-app)"; \
		elif [ $$port -eq 3005 ]; then name="系统管理 (system-app)"; \
		elif [ $$port -eq 3006 ]; then name="镜像构建 (image-build-app)"; \
		fi; \
		if lsof -ti:$$port > /dev/null 2>&1; then \
			pid=$$(lsof -ti:$$port 2>/dev/null); \
			echo "  ✅ $$name - 运行中 (PID: $$pid, Port: $$port)"; \
		else \
			echo "  ❌ $$name - 未运行 (Port: $$port)"; \
		fi; \
	done
	@echo ""

# 查看日志
logs:
	@if [ -f logs/all-apps.log ]; then \
		tail -f logs/all-apps.log; \
	else \
		echo "❌ 日志文件不存在"; \
		echo "💡 日志仅在使用 'make dev-bg' 后台启动时可用"; \
	fi

# 构建所有应用
build:
	@echo "🔨 构建所有应用..."
	@pnpm build
	@echo "✅ 构建完成"

# 清理构建产物和依赖
clean:
	@echo "🧹 清理所有构建产物和依赖..."
	@pnpm clean
	@rm -rf node_modules pnpm-lock.yaml
	@rm -rf .pids logs
	@echo "✅ 清理完成"

# 清理构建产物（保留依赖）
clean-build:
	@echo "🧹 清理构建产物..."
	@find . -type d -name "dist" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".vite" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ 构建产物已清理"

# 运行代码检查
lint:
	@echo "🔍 运行代码检查..."
	@pnpm lint
	@echo "✅ 代码检查完成"

# 创建必要的目录
init-dirs:
	@mkdir -p .pids logs
	@echo "✅ 目录初始化完成"

# 完整的启动流程（安装 + 启动）
setup:
	@echo "🎯 完整安装和启动流程..."
	@$(MAKE) init-dirs
	@$(MAKE) install
	@echo ""
	@echo "✅ 安装完成！"
	@echo ""
	@echo "现在可以运行以下命令之一:"
	@echo "  make dev       - 前台启动所有应用"
	@echo "  make dev-bg    - 后台启动所有应用"
	@echo ""

# 重启所有应用
restart:
	@echo "♻️  重启所有应用..."
	@$(MAKE) kill
	@sleep 2
	@echo "🚀 重新启动..."
	@$(MAKE) dev

# 重启（后台）
restart-bg:
	@echo "♻️  重启所有应用（后台模式）..."
	@$(MAKE) kill
	@sleep 2
	@$(MAKE) dev-bg
