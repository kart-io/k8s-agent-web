# Vben Admin Monorepo Makefile
# 提供常用命令的快捷方式

.PHONY: help install dev build test lint clean docker deploy

# 默认目标：显示帮助信息
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  Vben Admin Monorepo - 可用命令"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "📦 依赖管理:"
	@echo "  make install        - 安装所有依赖"
	@echo "  make install-clean  - 清理后重新安装依赖"
	@echo "  make update         - 更新所有依赖"
	@echo ""
	@echo "🚀 开发服务器:"
	@echo "  make dev            - 启动开发服务器（选择应用）"
	@echo "  make dev-antd       - 启动 Ant Design 版本"
	@echo "  make dev-ele        - 启动 Element Plus 版本"
	@echo "  make dev-naive      - 启动 Naive UI 版本"
	@echo "  make dev-docs       - 启动文档站点"
	@echo ""
	@echo "🏗️  构建:"
	@echo "  make build          - 构建所有应用"
	@echo "  make build-antd     - 构建 Ant Design 版本"
	@echo "  make build-ele      - 构建 Element Plus 版本"
	@echo "  make build-naive    - 构建 Naive UI 版本"
	@echo "  make build-docs     - 构建文档"
	@echo "  make preview        - 预览构建产物"
	@echo ""
	@echo "🧪 测试:"
	@echo "  make test           - 运行所有测试"
	@echo "  make test-unit      - 运行单元测试"
	@echo "  make test-unit-ui   - 运行单元测试（UI模式）"
	@echo "  make test-e2e       - 运行 E2E 测试"
	@echo "  make test-e2e-ui    - 运行 E2E 测试（UI模式）"
	@echo "  make test-coverage  - 生成测试覆盖率报告"
	@echo ""
	@echo "🔍 代码质量:"
	@echo "  make lint           - 运行所有 lint 检查"
	@echo "  make lint-fix       - 自动修复 lint 问题"
	@echo "  make format         - 格式化代码"
	@echo "  make format-check   - 检查代码格式"
	@echo "  make type-check     - TypeScript 类型检查"
	@echo "  make quality        - 运行所有质量检查"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  make docker-build   - 构建 Docker 镜像"
	@echo "  make docker-run     - 运行 Docker 容器"
	@echo "  make docker-stop    - 停止 Docker 容器"
	@echo "  make docker-logs    - 查看 Docker 日志"
	@echo "  make docker-clean   - 清理 Docker 资源"
	@echo ""
	@echo "🧹 清理:"
	@echo "  make clean          - 清理构建产物"
	@echo "  make clean-all      - 清理所有（包括依赖）"
	@echo "  make clean-cache    - 清理缓存"
	@echo ""
	@echo "📊 分析:"
	@echo "  make analyze        - 分析 bundle 大小"
	@echo "  make stats          - 显示项目统计信息"
	@echo ""
	@echo "🚢 部署:"
	@echo "  make deploy-preview - 部署预览环境"
	@echo "  make deploy-prod    - 部署生产环境"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ==================== 依赖管理 ====================

install:
	@echo "📦 安装依赖..."
	@pnpm install

install-clean:
	@echo "🧹 清理并重新安装依赖..."
	@rm -rf node_modules pnpm-lock.yaml
	@pnpm store prune
	@pnpm install

update:
	@echo "🔄 更新依赖..."
	@pnpm update

# ==================== 开发服务器 ====================

dev:
	@echo "🚀 启动开发服务器..."
	@pnpm dev

dev-antd:
	@echo "🚀 启动 Ant Design 版本..."
	@pnpm dev:antd

dev-ele:
	@echo "🚀 启动 Element Plus 版本..."
	@pnpm dev:ele

dev-naive:
	@echo "🚀 启动 Naive UI 版本..."
	@pnpm dev:naive

dev-docs:
	@echo "📚 启动文档站点..."
	@pnpm dev:docs

# ==================== 构建 ====================

build:
	@echo "🏗️  构建所有应用..."
	@pnpm build

build-antd:
	@echo "🏗️  构建 Ant Design 版本..."
	@pnpm build:antd

build-ele:
	@echo "🏗️  构建 Element Plus 版本..."
	@pnpm build:ele

build-naive:
	@echo "🏗️  构建 Naive UI 版本..."
	@pnpm build:naive

build-docs:
	@echo "📚 构建文档..."
	@pnpm build:docs

preview:
	@echo "👀 预览构建产物..."
	@pnpm preview

# ==================== 测试 ====================

test:
	@echo "🧪 运行所有测试..."
	@pnpm test

test-unit:
	@echo "🧪 运行单元测试..."
	@pnpm test:unit

test-unit-ui:
	@echo "🧪 运行单元测试（UI模式）..."
	@pnpm test:unit --ui

test-e2e:
	@echo "🧪 运行 E2E 测试..."
	@pnpm test:e2e

test-e2e-ui:
	@echo "🧪 运行 E2E 测试（UI模式）..."
	@pnpm exec playwright test --ui

test-coverage:
	@echo "📊 生成测试覆盖率报告..."
	@pnpm test:unit --coverage
	@echo "✅ 覆盖率报告已生成在 coverage/ 目录"

# ==================== 代码质量 ====================

lint:
	@echo "🔍 运行 lint 检查..."
	@pnpm lint

lint-fix:
	@echo "🔧 自动修复 lint 问题..."
	@pnpm lint:fix

format:
	@echo "💅 格式化代码..."
	@pnpm format

format-check:
	@echo "🔍 检查代码格式..."
	@pnpm format:check

type-check:
	@echo "🔍 TypeScript 类型检查..."
	@pnpm check:type

quality: lint type-check format-check
	@echo "✅ 所有质量检查完成"

# ==================== Docker ====================

DOCKER_IMAGE_NAME = vben-admin
DOCKER_CONTAINER_NAME = vben-admin-container
DOCKER_PORT = 80

docker-build:
	@echo "🐳 构建 Docker 镜像..."
	@docker build -t $(DOCKER_IMAGE_NAME):latest .
	@echo "✅ Docker 镜像构建完成: $(DOCKER_IMAGE_NAME):latest"

docker-run:
	@echo "🐳 运行 Docker 容器..."
	@docker run -d \
		--name $(DOCKER_CONTAINER_NAME) \
		-p $(DOCKER_PORT):80 \
		$(DOCKER_IMAGE_NAME):latest
	@echo "✅ 容器已启动，访问 http://localhost:$(DOCKER_PORT)"

docker-stop:
	@echo "🛑 停止 Docker 容器..."
	@docker stop $(DOCKER_CONTAINER_NAME) || true
	@docker rm $(DOCKER_CONTAINER_NAME) || true
	@echo "✅ 容器已停止并删除"

docker-logs:
	@echo "📋 查看 Docker 日志..."
	@docker logs -f $(DOCKER_CONTAINER_NAME)

docker-clean:
	@echo "🧹 清理 Docker 资源..."
	@docker stop $(DOCKER_CONTAINER_NAME) || true
	@docker rm $(DOCKER_CONTAINER_NAME) || true
	@docker rmi $(DOCKER_IMAGE_NAME):latest || true
	@echo "✅ Docker 资源已清理"

# ==================== 清理 ====================

clean:
	@echo "🧹 清理构建产物..."
	@rm -rf apps/*/dist
	@rm -rf docs/.vitepress/dist
	@rm -rf coverage
	@rm -rf test-results
	@rm -rf playwright-report
	@rm -rf .turbo
	@echo "✅ 构建产物已清理"

clean-all: clean
	@echo "🧹 清理所有文件（包括依赖）..."
	@rm -rf node_modules
	@rm -rf apps/*/node_modules
	@rm -rf packages/*/node_modules
	@rm -rf internal/*/node_modules
	@rm -rf pnpm-lock.yaml
	@echo "✅ 所有文件已清理"

clean-cache:
	@echo "🧹 清理缓存..."
	@pnpm store prune
	@rm -rf .turbo
	@rm -rf node_modules/.cache
	@rm -rf node_modules/.vite
	@echo "✅ 缓存已清理"

# ==================== 分析 ====================

analyze:
	@echo "📊 分析 bundle 大小..."
	@VITE_ANALYZE=true pnpm build:antd
	@echo "✅ 分析报告已生成"

stats:
	@echo "📊 项目统计信息:"
	@echo ""
	@echo "文件统计:"
	@find . -name "*.ts" -o -name "*.tsx" -o -name "*.vue" | grep -v node_modules | wc -l | xargs echo "  TypeScript/Vue 文件:"
	@find . -name "*.js" -o -name "*.jsx" | grep -v node_modules | wc -l | xargs echo "  JavaScript 文件:"
	@echo ""
	@echo "代码行数:"
	@find . -name "*.ts" -o -name "*.tsx" -o -name "*.vue" | grep -v node_modules | xargs wc -l | tail -1 | awk '{print "  TypeScript/Vue: " $$1 " 行"}'
	@echo ""
	@echo "目录大小:"
	@du -sh . 2>/dev/null | awk '{print "  总大小: " $$1}'
	@du -sh node_modules 2>/dev/null | awk '{print "  node_modules: " $$1}'
	@du -sh apps 2>/dev/null | awk '{print "  apps: " $$1}'
	@du -sh packages 2>/dev/null | awk '{print "  packages: " $$1}'

# ==================== 部署 ====================

deploy-preview:
	@echo "🚢 部署到预览环境..."
	@echo "⚠️  请确保已配置 Netlify CLI 或其他部署工具"
	@pnpm build:antd
	@netlify deploy --dir=apps/web-antd/dist

deploy-prod:
	@echo "🚢 部署到生产环境..."
	@echo "⚠️  这将部署到生产环境，请确认！"
	@read -p "确认部署到生产环境? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@pnpm build:antd
	@netlify deploy --prod --dir=apps/web-antd/dist

# ==================== 实用工具 ====================

.PHONY: check-deps setup-hooks backup

check-deps:
	@echo "🔍 检查开发环境..."
	@echo ""
	@command -v node >/dev/null 2>&1 && echo "✅ Node.js: $$(node -v)" || echo "❌ Node.js 未安装"
	@command -v pnpm >/dev/null 2>&1 && echo "✅ pnpm: $$(pnpm -v)" || echo "❌ pnpm 未安装"
	@command -v git >/dev/null 2>&1 && echo "✅ Git: $$(git --version)" || echo "❌ Git 未安装"
	@command -v docker >/dev/null 2>&1 && echo "✅ Docker: $$(docker --version)" || echo "⚠️  Docker 未安装（可选）"

setup-hooks:
	@echo "🔧 设置 Git Hooks..."
	@pnpm lefthook install
	@echo "✅ Git Hooks 已设置"

backup:
	@echo "💾 创建备份..."
	@timestamp=$$(date +%Y%m%d_%H%M%S) && \
	git branch backup/manual-$$timestamp && \
	echo "✅ 备份分支已创建: backup/manual-$$timestamp"

# ==================== 快捷命令别名 ====================

.PHONY: i d b t l f c

i: install
d: dev
b: build
t: test
l: lint
f: format
c: clean