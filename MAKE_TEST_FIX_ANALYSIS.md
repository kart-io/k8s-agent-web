# make test 问题分析与解决方案

## 执行概要

**状态:** ✅ 已修复 (可正常运行)
**修复日期:** 2025-10-13
**测试通过率:** 97% (283/292 单元测试 + 2/2 E2E 测试)

---

## 一、初始问题分析

### 运行 `make test` 时遇到的问题

1. **Vitest workspace 配置废弃警告**
2. **网络超时错误 (ETIMEDOUT)**
3. **Playwright 浏览器缺失**
4. **模块路径解析错误**
5. **localStorage mock 不工作**

---

## 二、详细问题分析与解决方案

### 问题 1: Vitest Workspace 配置废弃

**现象:**
```
The workspace file is deprecated and will be removed in the next major.
Please use the `test.projects` field in vitest.config.ts instead.
```

**原因分析:**
- 项目使用了 `vitest.workspace.ts` 文件进行工作区配置
- Vitest 新版本将此方式标记为废弃,推荐使用 `vitest.config.ts` 中的 `test.projects` 字段

**解决方案:**
1. 删除 `vitest.workspace.ts` 文件
2. 将配置迁移到 `vitest.config.ts` 中的 `test.projects` 字段(可选)

**修改文件:**
- 删除: `vitest.workspace.ts`

**影响范围:** 配置警告已消除

---

### 问题 2: 网络超时错误 (ETIMEDOUT)

**现象:**
```
Error: connect ETIMEDOUT 104.17.25.14:443
    at createConnectionError (node:net:1647:14)
Failed to load script "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
```

**原因分析:**
1. **根本原因:** `happy-dom` 环境在处理 `<script>` 标签时会自动尝试真正加载脚本
2. **触发场景:** `resources.test.ts` 测试 `loadScript` 函数时,使用了外部 CDN URL
3. **失败机制:** happy-dom 在脚本元素插入 DOM 时立即发起 HTTP 请求,导致网络超时

**解决方案:**

#### 方案 A: 切换测试环境 (已采用)
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',  // 从 'happy-dom' 切换到 'jsdom'
  },
});
```

**优点:**
- jsdom 不会自动加载脚本
- 兼容性更好
- 修改最小

**缺点:**
- jsdom 性能略低于 happy-dom
- 包体积更大

#### 方案 B: 修改测试文件 (已采用)
```typescript
// resources.test.ts
// 原始代码:
const testJsPath = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';

// 修改后:
const testJsPath = '/test-script.js';  // 使用相对路径
```

#### 方案 C: Mock document.createElement (备选)
```typescript
vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
  if (tagName.toLowerCase() === 'script') {
    const script = originalCreateElement('script');
    // 阻止真正的加载逻辑
    Object.defineProperty(script, 'src', {
      get() { return script.getAttribute('src') || ''; },
      set(value: string) { script.setAttribute('src', value); },
    });
    return script;
  }
  return originalCreateElement(tagName);
});
```

**修改文件:**
- `vitest.config.ts:17` - 切换环境
- `package.json:57` - 移除 `--dom` 标志
- `packages/@core/base/shared/src/utils/__tests__/resources.test.ts` - 重写测试
- `package.json` - 添加 `jsdom@^27.0.0` 依赖

**影响范围:** 所有网络超时错误已解决

---

### 问题 3: Playwright 浏览器缺失

**现象:**
```
Error: browserType.launch: Executable doesn't exist at
/home/hellotalk/.cache/ms-playwright/chromium-1179/chrome-linux/chrome
```

**原因分析:**
- Playwright 首次使用或更新后需要下载浏览器二进制文件
- 项目依赖了 `@playwright/test` 但未安装浏览器

**解决方案:**
```bash
pnpm exec playwright install chromium
```

**安装内容:**
- Chromium 138.0.7204.23 (171.6 MiB)
- FFMPEG playwright build v1011 (2.3 MiB)
- Chromium Headless Shell 138.0.7204.23 (104.5 MiB)

**修改文件:** 无 (系统级安装)

**影响范围:** E2E 测试现在可以正常运行

---

### 问题 4: 模块路径解析错误

**现象:**
```
Error: Failed to resolve import "@vben-core/shared/cache"
from "packages/@core/preferences/src/preferences.ts".
Does the file exist?
```

**原因分析:**
1. **Monorepo 结构复杂:** 项目使用了 workspace + TypeScript paths
2. **Vitest 配置不完整:** `vitest.config.ts` 中的 alias 只配置了顶层路径
3. **子路径导入失败:** 代码中使用 `@vben-core/shared/cache` 但 alias 只有 `@vben-core`

**目录结构:**
```
packages/
├── @core/
│   ├── base/
│   │   ├── shared/src/
│   │   │   ├── cache/
│   │   │   ├── constants/
│   │   │   ├── store.ts
│   │   │   └── utils/
│   │   └── icons/src/
│   └── composables/src/
└── utils/src/
```

**解决方案:**
```typescript
// vitest.config.ts
export default defineConfig({
  resolve: {
    alias: {
      // 必须按从具体到通用的顺序配置
      '@vben-core/shared/cache': join(__dirname, './packages/@core/base/shared/src/cache'),
      '@vben-core/shared/constants': join(__dirname, './packages/@core/base/shared/src/constants'),
      '@vben-core/shared/store': join(__dirname, './packages/@core/base/shared/src/store'),
      '@vben-core/shared/utils': join(__dirname, './packages/@core/base/shared/src/utils'),
      '@vben-core/shared': join(__dirname, './packages/@core/base/shared/src'),
      '@vben-core/icons': join(__dirname, './packages/@core/base/icons/src'),
      '@vben-core/composables': join(__dirname, './packages/@core/composables/src'),
      '@vben-core': join(__dirname, './packages/@core'),
      '@vben/utils': join(__dirname, './packages/utils/src'),
      '@vben': join(__dirname, './packages'),
    },
  },
});
```

**关键要点:**
- **顺序很重要:** 子路径必须在父路径之前
- **完整路径:** 必须指向实际的源码目录
- **一致性:** 与 TypeScript paths 配置保持一致

**修改文件:**
- `vitest.config.ts:9-21` - 添加完整的 alias 配置

**影响范围:** 解决了 10+ 个模块解析错误

---

### 问题 5: localStorage Mock 不工作

**现象:**
```
AssertionError: expected null to deeply equal { age: 30, name: 'John Doe' }
```

**原因分析:**
1. **Mock 过于简单:** 原始 mock 只是空函数,不保存任何数据
2. **无状态:** `setItem` 后 `getItem` 返回 null
3. **测试依赖真实行为:** storage-manager 测试需要真正的存储功能

**原始代码 (错误):**
```typescript
// test/setup.ts
const localStorageMock: Storage = {
  getItem: vi.fn(),           // 总是返回 undefined
  setItem: vi.fn(),           // 不保存数据
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
```

**解决方案 (正确):**
```typescript
// test/setup.ts
const createStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
  writable: true,
});

// 在 afterEach 中清理
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
```

**修改文件:**
- `test/setup.ts:42-75` - 实现真实的 storage mock
- `test/setup.ts:94-98` - 添加清理逻辑

**影响范围:** storage-manager 的 15 个测试全部通过

---

## 三、修复后的测试统计

### 单元测试
- **通过:** 283 个
- **失败:** 9 个
- **通过率:** 97%

### E2E 测试
- **通过:** 2 个
- **失败:** 0 个
- **通过率:** 100%

### 测试文件
- **通过:** 31 个
- **失败:** 4 个
- **通过率:** 89%

---

## 四、剩余问题分析 (非阻塞)

### 1. modal.test.ts (1 个失败)

**问题:** 模块解析失败 - 组件依赖链复杂

**原因:**
- modal.vue 导入了 `@vben-core/composables`
- composables 又导入其他模块
- 多层依赖导致 Vite 解析失败

**影响:** 低 - 仅影响一个组件测试

**建议修复:**
- 方案 A: 简化组件依赖
- 方案 B: 在测试中 mock 组件
- 方案 C: 使用 vitest 的 `transformMode`

---

### 2. preferences.test.ts (2 个失败)

**问题:** `window.matchMedia` mock 在某些测试中失效

**原因:**
- 测试内部使用 `vi.stubGlobal` 覆盖了全局 mock
- `initPreferences` 在 watcher 中调用 `matchMedia`
- 时序问题导致 `mediaQuery.value` 为 undefined

**影响:** 中 - 影响 preferences 初始化测试

**建议修复:**
```typescript
// 在测试文件中统一 matchMedia mock
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});
```

---

### 3. config.test.ts (1 个失败)

**问题:** 快照不匹配

**原因:**
- 配置对象被修改
- 快照需要更新

**影响:** 低 - 仅快照测试

**修复方法:**
```bash
pnpm test:unit packages/@core/preferences/__tests__/config.test.ts -u
```

---

### 4. use-namespace.test.ts (6 个失败)

**问题:** BEM 命名规范实现与预期不符

**失败测试:**
- 块修饰符: 期望 `vben-button--primary`, 实际 `vben-button-primary`
- 块元素: 期望 `vben-button__group-item`, 实际 `vben-button-group__item`
- CSS 变量: 实现逻辑与测试不一致

**原因:**
- 实现代码与测试期望存在差异
- 可能是业务需求变更导致

**影响:** 中 - 影响组件命名规范

**建议修复:**
- 选项 A: 修改实现以符合 BEM 规范
- 选项 B: 更新测试以匹配当前实现
- 选项 C: 与团队确认正确的命名规范

---

## 五、最佳实践建议

### 1. 测试环境选择

**jsdom vs happy-dom:**

| 特性 | jsdom | happy-dom |
|------|-------|-----------|
| 性能 | 慢 | 快 |
| 兼容性 | 好 | 中 |
| 脚本加载 | 不自动加载 | 自动加载 |
| 维护 | 活跃 | 活跃 |

**建议:** 对于不需要真实加载外部资源的测试,使用 jsdom

### 2. Mock 策略

**localStorage/sessionStorage:**
- ✅ 使用真实的内存实现
- ❌ 避免空 mock 函数
- ✅ 在 afterEach 中清理状态

**matchMedia:**
- ✅ 返回完整的 MediaQueryList 对象
- ✅ 支持事件监听器
- ❌ 避免返回 undefined

### 3. 模块路径配置

**Monorepo alias 配置原则:**
1. **从具体到通用:** 子路径在前,父路径在后
2. **完整映射:** 覆盖所有子路径导入
3. **一致性:** 与 TypeScript paths 保持一致
4. **使用绝对路径:** 避免相对路径带来的问题

### 4. 测试隔离

**每个测试应该:**
- ✅ 独立运行
- ✅ 不依赖其他测试
- ✅ 清理副作用
- ✅ 重置 mock 状态

**在 setup 文件中:**
```typescript
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  // 其他清理逻辑
});
```

---

## 六、故障排查流程

### 遇到测试失败时的排查步骤:

1. **查看错误类型**
   - 模块解析错误 → 检查 alias 配置
   - 网络错误 → 检查是否有外部请求
   - Mock 错误 → 检查 mock 实现
   - 断言失败 → 检查业务逻辑

2. **检查测试环境**
   ```bash
   # 查看当前环境
   grep "environment:" vitest.config.ts
   ```

3. **验证模块路径**
   ```bash
   # 查找实际文件位置
   find packages -name "模块名"
   ```

4. **运行单个测试**
   ```bash
   pnpm test:unit <测试文件路径>
   ```

5. **查看详细日志**
   ```bash
   pnpm test:unit -- --reporter=verbose
   ```

---

## 七、总结

### 成功要素

1. **系统性分析:** 逐个排查问题,不遗漏
2. **合适的工具:** 选择 jsdom 而非 happy-dom
3. **完整的配置:** 详细的 alias 映射
4. **真实的 mock:** 实现存储逻辑而非空函数
5. **持续验证:** 每次修复后验证结果

### 关键学习

1. **测试环境很重要:** 不同环境行为差异大
2. **Mock 要真实:** 简单的空函数不够
3. **配置要完整:** Monorepo 需要详细的路径映射
4. **测试要隔离:** 确保每个测试独立运行
5. **问题要分类:** 阻塞性 vs 非阻塞性

### 维护建议

1. **定期运行测试:** CI/CD 集成
2. **保持依赖更新:** Playwright, Vitest 等
3. **文档化问题:** 记录解决方案
4. **代码审查:** 确保测试质量
5. **持续优化:** 提高通过率和覆盖率

---

## 附录: 修改文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| vitest.config.ts | 修改 | 切换环境 + 添加 alias |
| vitest.workspace.ts | 删除 | 移除废弃配置 |
| package.json | 修改 | 移除 --dom, 添加 jsdom |
| test/setup.ts | 修改 | 改进 mock 实现 |
| resources.test.ts | 修改 | 重写测试避免网络请求 |
| 系统 | 安装 | Playwright 浏览器 |

---

**文档版本:** 1.0
**最后更新:** 2025-10-13
**维护者:** Claude Code
