# 贡献指南

首先，感谢你愿意为 Vben Admin 做出贡献！我们欢迎所有形式的贡献，包括但不限于：

- 报告 Bug
- 提出新功能建议
- 提交代码修复
- 改进文档
- 参与讨论

## 行为准则

参与本项目即表示你同意遵守我们的行为准则。请保持友好、尊重和专业的态度。

## 开始之前

### 开发环境

确保你的开发环境满足以下要求：

- **Node.js**: 18.x 或更高版本
- **pnpm**: 8.x 或更高版本
- **Git**: 最新稳定版

### 熟悉技术栈

建议在贡献代码前对以下技术有基本了解：

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Tailwind CSS

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请通过 [GitHub Issues](https://github.com/vbenjs/vue-vben-admin/issues/new) 提交：

1. **搜索现有 Issues**: 确保问题尚未被报告
2. **使用模板**: 使用 Bug Report 模板
3. **提供详细信息**:
   - 清晰的问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息（OS, Node 版本, 浏览器等）
   - 截图或录屏（如果适用）
   - 相关日志

**示例：**

```markdown
### 问题描述
登录后页面白屏，无法进入系统

### 复现步骤
1. 打开登录页面
2. 输入用户名：vben，密码：123456
3. 点击登录按钮
4. 页面变为白屏

### 期望行为
登录成功后应跳转到首页

### 环境信息
- OS: Windows 11
- Node: v20.10.0
- pnpm: 9.0.0
- Browser: Chrome 120.0
- Version: 5.5.9

### 控制台错误
```
Error: Cannot read property 'routes' of undefined
  at setupRouter (router.ts:45)
```
```

### 提出新功能

如果你有新功能的想法，请：

1. **先讨论**: 在 [GitHub Discussions](https://github.com/vbenjs/vue-vben-admin/discussions) 中提出
2. **描述用例**: 说明功能的使用场景和价值
3. **考虑实现**: 简要说明可能的实现方式
4. **等待反馈**: 听取维护者和社区的意见

### 提交代码

#### 1. Fork 仓库

点击 GitHub 页面右上角的 "Fork" 按钮，将仓库 fork 到你的账号下。

#### 2. 克隆仓库

```bash
git clone https://github.com/your-username/vue-vben-admin.git
cd vue-vben-admin
```

#### 3. 添加上游仓库

```bash
git remote add upstream https://github.com/vbenjs/vue-vben-admin.git
```

#### 4. 创建分支

```bash
# 确保在最新的 main 分支
git checkout main
git pull upstream main

# 创建新分支
git checkout -b feat/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

**分支命名规范：**

- `feat/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `style/xxx` - 代码格式化
- `refactor/xxx` - 重构
- `perf/xxx` - 性能优化
- `test/xxx` - 测试相关
- `chore/xxx` - 构建/工具链更新

#### 5. 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test:unit

# 代码检查
pnpm lint

# 类型检查
pnpm check:type
```

#### 6. 提交代码

```bash
# 添加更改
git add .

# 提交（遵循 Commit Message 规范）
git commit -m "feat: add new feature"

# 推送到你的仓库
git push origin feat/your-feature-name
```

#### 7. 创建 Pull Request

1. 访问你的 GitHub 仓库
2. 点击 "Compare & pull request" 按钮
3. 填写 PR 信息（使用模板）
4. 等待 review

## 代码规范

### Commit Message 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type（必填）：**

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链更新
- `ci`: CI 配置更新
- `revert`: 回滚提交

**Scope（可选）：**

影响的范围，如：`auth`, `router`, `ui`, `layout` 等

**Subject（必填）：**

简短描述（不超过50字符）

**示例：**

```bash
# 好的提交
feat(auth): add OAuth2 login support
fix(router): resolve navigation guards not working
docs: update installation guide
refactor(layout): simplify sidebar component

# 不好的提交
update code
fix bug
修改文件
```

### 代码风格

项目使用 ESLint + Prettier 进行代码规范化：

```bash
# 运行 lint
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化代码
pnpm format
```

**关键规则：**

1. **使用 TypeScript**: 所有新代码必须使用 TypeScript
2. **组件命名**: PascalCase
3. **文件命名**: kebab-case
4. **缩进**: 2 空格
5. **引号**: 单引号
6. **分号**: 使用分号
7. **尾随逗号**: ES5 标准
8. **行宽**: 80 字符（可适当放宽）

### TypeScript 规范

```typescript
// ✅ 好的实践
interface UserInfo {
  id: number;
  name: string;
  email: string;
}

function getUserInfo(userId: number): Promise<UserInfo> {
  return api.get<UserInfo>(`/users/${userId}`);
}

// ❌ 避免
function getUserInfo(userId: any): any {
  return api.get(`/users/${userId}`);
}
```

### Vue 组件规范

```vue
<!-- ✅ 好的实践 -->
<template>
  <div :class="rootClass">
    <h1>{{ title }}</h1>
    <button @click="handleClick">
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@vben-core/shared';

interface Props {
  title: string;
  buttonText?: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Click me',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const rootClass = computed(() =>
  cn('component-root', props.className)
);

function handleClick(event: MouseEvent) {
  emit('click', event);
}
</script>

<style scoped>
.component-root {
  @apply p-4 bg-white rounded-lg;
}
</style>
```

### 测试规范

所有新功能和 Bug 修复都应该有相应的测试：

```typescript
// component.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

describe('Component', () => {
  it('renders properly', () => {
    const wrapper = mount(Component, {
      props: {
        title: 'Test Title',
      },
    });

    expect(wrapper.text()).toContain('Test Title');
  });

  it('emits click event', async () => {
    const wrapper = mount(Component);

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
```

## Pull Request 流程

### 1. PR 检查清单

提交 PR 前，请确保：

- [ ] 代码遵循项目规范
- [ ] 添加了必要的测试
- [ ] 所有测试通过
- [ ] 类型检查通过
- [ ] Lint 检查通过
- [ ] 更新了相关文档
- [ ] Commit message 符合规范
- [ ] PR 描述清晰完整

### 2. PR 描述模板

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 破坏性变更
- [ ] 文档更新

## 变更内容
简要描述这个 PR 的变更内容

## 相关 Issue
Closes #123

## 测试说明
如何测试这些变更

## 截图
（如果适用）

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 添加了测试
- [ ] 所有测试通过
- [ ] 更新了文档
```

### 3. Code Review

维护者会审查你的代码，可能会：

- 提出修改建议
- 要求补充测试
- 讨论实现方式
- 批准合并

请及时响应 review 意见，并进行相应修改。

### 4. 合并

PR 被批准后：

1. 维护者会合并你的代码
2. 你的贡献会出现在 Contributors 列表中
3. 相关 Issue 会自动关闭

## 开发工作流

### 本地开发

```bash
# 1. 更新 main 分支
git checkout main
git pull upstream main

# 2. 创建功能分支
git checkout -b feat/new-feature

# 3. 开发和测试
pnpm dev
pnpm test:unit

# 4. 提交代码
git add .
git commit -m "feat: add new feature"

# 5. 推送到远程
git push origin feat/new-feature

# 6. 创建 PR
```

### 同步上游

```bash
# 定期同步上游更新
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 解决冲突

如果 PR 有冲突：

```bash
# 1. 更新你的分支
git fetch upstream
git rebase upstream/main

# 2. 解决冲突
# 编辑冲突文件

# 3. 标记为已解决
git add .
git rebase --continue

# 4. 强制推送
git push origin feat/new-feature --force
```

## 文档贡献

文档改进也是重要的贡献！

### 文档位置

- **用户文档**: `docs/src/guide/`
- **API 文档**: 代码注释
- **README**: 项目根目录

### 文档规范

- 使用 Markdown 格式
- 遵循 MarkdownLint 规则
- 提供代码示例
- 保持简洁清晰
- 适当使用图片

## 常见问题

### 如何选择要做的工作？

1. 查看 [Good First Issue](https://github.com/vbenjs/vue-vben-admin/labels/good%20first%20issue) 标签
2. 关注 [Help Wanted](https://github.com/vbenjs/vue-vben-admin/labels/help%20wanted) 标签
3. 在 Discussions 中提出你的想法

### PR 多久会被处理？

通常在 1-3 个工作日内会有初步反馈，请耐心等待。

### 可以同时提交多个 PR 吗？

可以，但建议每个 PR 只关注一个功能或修复，便于审查和合并。

### 如何成为核心贡献者？

持续高质量的贡献会被注意到。核心贡献者会被邀请加入维护团队。

## 感谢

再次感谢你的贡献！每一个贡献都让 Vben Admin 变得更好。

## 许可

通过提交代码，你同意你的贡献将在 [MIT License](LICENSE) 下发布。

## 联系方式

- GitHub Issues: [提交问题](https://github.com/vbenjs/vue-vben-admin/issues)
- GitHub Discussions: [参与讨论](https://github.com/vbenjs/vue-vben-admin/discussions)
- 官方文档: [https://doc.vben.pro](https://doc.vben.pro)

期待你的贡献！🎉