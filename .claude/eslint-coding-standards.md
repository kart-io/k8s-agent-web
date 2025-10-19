# ESLint 编码规范与最佳实践

本文档记录了项目中使用的 ESLint 规则和编码最佳实践,**生成前端代码时必须严格遵守这些规范**。

## 目录

- [Vue 组件规范](#vue-组件规范)
- [TypeScript 规范](#typescript-规范)
- [代码质量规范](#代码质量规范)
- [常见错误与修复](#常见错误与修复)

---

## Vue 组件规范

### 1. Props 定义规范

#### 规则: `vue/no-required-prop-with-default`

**Props 如果有默认值,必须定义为可选类型**

❌ **错误示例:**

```typescript
interface Props {
  visible: boolean; // 有默认值但不是可选
  node: Node | null; // 有默认值但不是可选
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  node: null,
});
```

✅ **正确示例:**

```typescript
interface Props {
  visible?: boolean; // 可选类型
  node?: Node | null; // 可选类型
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  node: null,
});
```

### 2. HTML 格式规范

#### 规则: `vue/html-closing-bracket-newline`

**单行元素的闭合括号不应有换行**

❌ **错误示例:**

```vue
<span>{{ row.status?.readyReplicas ?? 0 }} / {{ row.spec.replicas }}</span>

<strong>{{ resourceType }}</strong>
:
```

✅ **正确示例:**

```vue
<span>{{ row.status?.readyReplicas ?? 0 }} / {{ row.spec.replicas }}</span>

<strong>{{ resourceType }}</strong>
:
```

**多属性元素的格式:**

```vue
<!-- 单行 -->
<Button type="primary" @click="handleSave">保存</Button>

<!-- 多行 - 闭合括号另起一行 -->
<ExclamationCircleOutlined
  :style="{ fontSize: '48px', color: danger ? '#ff4d4f' : '#faad14' }"
/>
```

### 3. v-html 使用规范

#### 规则: `vue/no-v-html`

**必须确保 v-html 内容是安全的,否则禁止使用**

❌ **不安全示例:**

```vue
<div v-html="userInput"></div>
<!-- 用户输入未转义 -->
```

✅ **安全示例:**

```vue
<!-- 已转义的内容 -->
<!-- eslint-disable-next-line vue/no-v-html -->
<pre v-html="escapeHtml(logContent)"></pre>
```

---

## TypeScript 规范

### 1. 未使用变量规范

#### 规则: `@typescript-eslint/no-unused-vars` / `no-unused-vars`

**未使用的变量必须以下划线开头**

❌ **错误示例:**

```typescript
const props = defineProps<Props>();     // props 未使用
const dataTransfer = { ... };           // dataTransfer 未使用
function foo(preset: string) { }        // preset 未使用
```

✅ **正确示例:**

```typescript
// 选项1: 如果不需要使用,加下划线前缀
const _props = defineProps<Props>();
const _dataTransfer = { ... };
function foo(_preset: string) { }

// 选项2: 如果实际需要使用,确保在代码中引用
const props = defineProps<Props>();
const title = props.title;  // 使用 props
```

### 2. 非空断言禁用

#### 规则: `@typescript-eslint/no-non-null-assertion`

**禁止使用 `!` 非空断言,应使用类型守卫**

❌ **错误示例:**

```typescript
const script = mockScripts.get(testJsPath)!;
```

✅ **正确示例:**

```typescript
const script = mockScripts.get(testJsPath);
if (!script) throw new Error('Script not found');
// 现在 TypeScript 知道 script 不为 null
```

### 3. 空对象类型

#### 规则: `@typescript-eslint/no-empty-object-type`

**使用 `object` 或 `unknown` 替代空对象 `{}`**

❌ **错误示例:**

```typescript
const component: DefineComponent<{}, {}, any>;
```

✅ **正确示例:**

```typescript
const component: DefineComponent<object, object, any>;
```

### 4. 动态删除属性

#### 规则: `@typescript-eslint/no-dynamic-delete`

**动态删除需要添加 eslint-disable**

✅ **正确示例:**

```typescript
removeItem: (key: string) => {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete store[key];
},
```

---

## 代码质量规范

### 1. Console 语句规范

#### 规则: `no-console`

**只允许使用 `console.warn` 和 `console.error`,开发日志需注释**

❌ **错误示例:**

```typescript
console.log('Debug info');
console.info('Information');
```

✅ **正确示例:**

```typescript
// 开发环境调试日志
// eslint-disable-next-line no-console
console.log('[Performance] Route preload stats:', stats);

// 生产环境错误和警告 (无需注释)
console.error('[ErrorBoundary] Error:', error);
console.warn('Unauthorized request');
```

### 2. 全局变量使用

#### 规则: `no-restricted-globals` / `n/prefer-global/process`

**使用 `globalThis` 替代 `global`,使用导入替代全局 `process`**

❌ **错误示例:**

```typescript
global.IntersectionObserver = vi.fn();
process.env.NODE_ENV = 'test';
```

✅ **正确示例:**

```typescript
import process from 'node:process';

globalThis.IntersectionObserver = vi.fn();
process.env.NODE_ENV = 'test';
```

### 3. 深拷贝方法

#### 规则: `unicorn/prefer-structured-clone`

**使用 `structuredClone()` 替代 JSON 方式深拷贝**

❌ **错误示例:**

```typescript
const copy = JSON.parse(JSON.stringify(original));
```

✅ **正确示例:**

```typescript
const copy = structuredClone(original);
```

### 4. 三元表达式优先

#### 规则: `unicorn/prefer-ternary`

**简单 if-else 应使用三元表达式**

❌ **错误示例:**

```typescript
let value;
if (condition) {
  value = 'yes';
} else {
  value = 'no';
}
```

✅ **正确示例:**

```typescript
const value = condition ? 'yes' : 'no';
```

### 5. 数组 reduce 限制

#### 规则: `unicorn/no-array-reduce`

**避免使用 reduce,优先使用 for 循环**

❌ **错误示例:**

```typescript
const result = labels.value.reduce(
  (acc, { key, value }) => {
    acc[key] = value;
    return acc;
  },
  {} as Record<string, string>,
);
```

✅ **正确示例:**

```typescript
const result: Record<string, string> = {};
for (const { key, value } of labels.value) {
  result[key] = value;
}
```

### 6. 数组创建

#### 规则: `unicorn/no-new-array`

**使用 `Array.from` 替代 `new Array()`**

❌ **错误示例:**

```typescript
const arr = new Array(10).fill('a');
```

✅ **正确示例:**

```typescript
const arr = Array.from({ length: 10 }, () => 'a');
```

### 7. 函数引用传递

#### 规则: `unicorn/no-array-callback-reference`

**不直接传递函数引用给数组方法**

❌ **错误示例:**

```typescript
const element = wrapper.find(selector);
```

✅ **正确示例:**

```typescript
const element = wrapper.find((el: any) => el.matches(selector));
```

### 8. 正则表达式捕获组

#### 规则: `regexp/no-unused-capturing-group`

**使用非捕获组 `(?:...)` 替代未使用的捕获组 `(...)`**

❌ **错误示例:**

```typescript
const pattern = /^[a-z0-9]([\w.-]*[a-z0-9])?$/i; // 捕获组未使用
```

✅ **正确示例:**

```typescript
const pattern = /^[a-z0-9](?:[\w.-]*[a-z0-9])?$/i; // 非捕获组
```

### 9. ES 模块路径

#### 规则: `unicorn/prefer-module`

**使用 ES 模块方式获取 `__dirname`**

❌ **错误示例:**

```typescript
const configPath = join(__dirname, './config');
```

✅ **正确示例:**

```typescript
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const configPath = join(__dirname, './config');
```

---

## 常见错误与修复

### 错误 1: Props 应该可选

```
warning  Prop "visible" should be optional  vue/no-required-prop-with-default
```

**修复:**

```diff
interface Props {
- visible: boolean;
+ visible?: boolean;
}
```

### 错误 2: HTML 闭合括号换行

```
error  Expected no line breaks before closing bracket  vue/html-closing-bracket-newline
```

**修复:**

```diff
- <span
-   >{{ value }}</span
- >
+ <span>{{ value }}</span>
```

### 错误 3: 未使用的变量

```
error  'props' is assigned a value but never used  no-unused-vars
```

**修复方案:**

```diff
# 方案1: 如果确实不需要使用
- const props = defineProps<Props>();
+ const _props = defineProps<Props>();

# 方案2: 如果需要在 template 中使用
- const props = defineProps<Props>();
+ const props = defineProps<Props>();
+ // 在 template 中使用: {{ props.title }}
```

### 错误 4: 控制台语句

```
error  Unexpected console statement  no-console
```

**修复:**

```diff
- console.log('Debug message');
+ // eslint-disable-next-line no-console
+ console.log('[Development] Debug message');

# 或使用允许的方法
+ console.error('Error message');
+ console.warn('Warning message');
```

### 错误 5: 非空断言

```
error  Forbidden non-null assertion  @typescript-eslint/no-non-null-assertion
```

**修复:**

```diff
- const value = map.get(key)!;
+ const value = map.get(key);
+ if (!value) throw new Error('Value not found');
```

---

## 代码生成检查清单

在生成 Vue 组件代码时,请检查:

- [ ] Props 有默认值的必须是可选类型 (`?`)
- [ ] 单行 HTML 元素的闭合括号无换行
- [ ] 未使用的变量加下划线前缀
- [ ] 使用 `structuredClone()` 进行深拷贝
- [ ] 使用 `Array.from()` 而非 `new Array()`
- [ ] 避免使用 `.reduce()`,使用 `for...of`
- [ ] 正则表达式使用非捕获组 `(?:...)`
- [ ] 使用 `globalThis` 而非 `global`
- [ ] 导入 `process` 而非直接使用全局变量
- [ ] 避免非空断言 `!`,使用类型守卫
- [ ] `console.log` 必须添加 `eslint-disable` 注释
- [ ] 使用 `console.warn/error` 无需注释

---

## 自动修复

大部分 ESLint 错误可以自动修复:

```bash
# 修复所有可修复的错误
pnpm lint:fix

# 或使用 Makefile
make lint-fix
```

**注意:** 某些规则(如 Props 类型)需要手动修复。

---

## 参考资料

- ESLint 配置: `eslint.config.mjs`
- Lint 配置包: `internal/lint-configs/`
- Vue 官方风格指南: https://vuejs.org/style-guide/
- TypeScript ESLint: https://typescript-eslint.io/
