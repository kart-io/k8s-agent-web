# 组件开发指南

## 概述

本指南提供了在 Vben Admin 项目中开发组件的最佳实践和规范。

## 组件架构

### 1. 组件分类

```
packages/
├── @core/
│   ├── base/            # 基础功能
│   │   ├── design/      # 设计系统
│   │   ├── icons/       # 图标系统
│   │   ├── shared/      # 共享工具
│   │   └── typings/     # 类型定义
│   ├── composables/     # 组合式函数
│   ├── preferences/     # 偏好设置
│   └── ui-kit/          # UI 组件库
│       ├── form-ui/     # 表单组件
│       ├── layout-ui/   # 布局组件
│       ├── menu-ui/     # 菜单组件
│       ├── popup-ui/    # 弹出层组件
│       ├── shadcn-ui/   # Shadcn 组件
│       └── tabs-ui/     # 标签页组件
├── @vben/
│   ├── common-ui/       # 通用业务组件
│   ├── layouts/         # 布局组件
│   └── plugins/         # Vue 插件
└── effects/             # 副作用和钩子
```

### 2. 组件层级

1. **基础组件** (`@core/ui-kit/*`) - 无业务逻辑的纯 UI 组件
2. **业务组件** (`@vben/common-ui`) - 包含业务逻辑的复合组件
3. **布局组件** (`@vben/layouts`) - 页面布局相关组件
4. **页面组件** (`apps/*/src/views`) - 具体页面实现

## 组件开发规范

### 1. 文件结构

单文件组件（推荐）：

```
component-name/
├── index.ts           # 导出入口
├── component-name.vue # 组件实现
├── types.ts           # 类型定义
└── __tests__/         # 测试文件
    └── component.test.ts
```

复杂组件结构：

```
complex-component/
├── index.ts                    # 导出入口
├── complex-component.vue       # 主组件
├── components/                 # 子组件
│   ├── sub-component-a.vue
│   └── sub-component-b.vue
├── composables/                # 组合式函数
│   └── use-complex.ts
├── types.ts                    # 类型定义
├── utils.ts                    # 工具函数
└── __tests__/                  # 测试
    └── complex.test.ts
```

### 2. 组件模板

基础组件模板：

```vue
<template>
  <div :class="rootClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@vben-core/shared';

/**
 * 组件属性接口
 */
interface Props {
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 组件变体
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'secondary';
  /**
   * 组件尺寸
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 组件事件
 */
interface Emits {
  /**
   * 点击事件
   */
  (e: 'click', value: MouseEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md'
});

const emit = defineEmits<Emits>();

// 计算根元素类名
const rootClass = computed(() =>
  cn(
    'base-component',
    props.className
  )
);

// 暴露给父组件的方法
defineExpose({
  // 公开的方法
});
</script>
```

### 3. TypeScript 类型

类型定义文件 (`types.ts`)：

```typescript
/**
 * 组件属性类型
 */
export interface ComponentProps {
  /**
   * 组件变体
   */
  variant?: 'default' | 'primary' | 'secondary';
  /**
   * 组件尺寸
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * 组件实例类型
 */
export interface ComponentInstance {
  /**
   * 重置组件状态
   */
  reset: () => void;
  /**
   * 验证组件
   */
  validate: () => Promise<boolean>;
}

/**
 * 组件事件类型
 */
export interface ComponentEmits {
  /**
   * 值改变事件
   */
  'update:modelValue': [value: any];
  /**
   * 改变事件
   */
  'change': [value: any];
  /**
   * 点击事件
   */
  'click': [event: MouseEvent];
}
```

## 组合式函数（Composables）

### 1. 基础结构

```typescript
import { ref, computed, watch, onMounted } from 'vue';
import type { Ref, ComputedRef } from 'vue';

export interface UseComponentOptions {
  /**
   * 初始值
   */
  initialValue?: string;
  /**
   * 是否立即执行
   */
  immediate?: boolean;
}

export interface UseComponentReturn {
  /**
   * 当前值
   */
  value: Ref<string>;
  /**
   * 计算属性
   */
  computedValue: ComputedRef<string>;
  /**
   * 更新值
   */
  updateValue: (val: string) => void;
  /**
   * 重置
   */
  reset: () => void;
}

/**
 * 组件逻辑组合式函数
 * @param options 配置选项
 * @returns 组合式函数返回值
 */
export function useComponent(
  options: UseComponentOptions = {}
): UseComponentReturn {
  const { initialValue = '', immediate = false } = options;

  // 状态
  const value = ref(initialValue);

  // 计算属性
  const computedValue = computed(() => {
    return value.value.toUpperCase();
  });

  // 方法
  const updateValue = (val: string) => {
    value.value = val;
  };

  const reset = () => {
    value.value = initialValue;
  };

  // 生命周期
  onMounted(() => {
    if (immediate) {
      // 初始化逻辑
    }
  });

  // 监听器
  watch(value, (newVal) => {
    console.log('Value changed:', newVal);
  });

  return {
    value,
    computedValue,
    updateValue,
    reset
  };
}
```

### 2. 常用组合式函数

```typescript
// 使用命名空间
import { useNamespace } from '@vben-core/composables';

const ns = useNamespace('button');
ns.b(); // 'vben-button'
ns.e('icon'); // 'vben-button__icon'
ns.m('primary'); // 'vben-button--primary'

// 使用前进属性
import { useForwardProps } from '@vben-core/composables';

const forwardedProps = useForwardProps(props);

// 使用前进暴露
import { useForwardExpose } from '@vben-core/composables';

const forward = useForwardExpose();
```

## 表单组件开发

### 1. 表单输入组件

```vue
<template>
  <div :class="wrapperClass">
    <label v-if="label" :class="labelClass">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    <input
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClass"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
    />
    <span v-if="error" class="text-red-500 text-sm mt-1">
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@vben-core/shared';

interface Props {
  /**
   * 绑定值
   */
  modelValue?: string | number;
  /**
   * 标签
   */
  label?: string;
  /**
   * 占位符
   */
  placeholder?: string;
  /**
   * 输入类型
   */
  type?: 'text' | 'number' | 'password' | 'email';
  /**
   * 是否必填
   */
  required?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 错误信息
   */
  error?: string;
  /**
   * 自定义类名
   */
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'input': [value: string | number];
  'change': [value: string | number];
  'blur': [event: FocusEvent];
}>();

const modelValue = computed({
  get: () => props.modelValue ?? '',
  set: (val) => emit('update:modelValue', val)
});

const wrapperClass = computed(() =>
  cn('flex flex-col', props.className)
);

const labelClass = computed(() =>
  cn('text-sm font-medium mb-1')
);

const inputClass = computed(() =>
  cn(
    'px-3 py-2 border rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-primary',
    {
      'border-red-500': props.error,
      'border-gray-300': !props.error,
      'opacity-50 cursor-not-allowed': props.disabled
    }
  )
);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('input', target.value);
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('change', target.value);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};
</script>
```

### 2. 表单验证

```typescript
import { ref, watch } from 'vue';
import type { Ref } from 'vue';

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string | Promise<boolean | string>;
  message?: string;
}

export function useValidation(
  value: Ref<any>,
  rules: ValidationRule[] = []
) {
  const error = ref<string>('');
  const isValidating = ref(false);

  const validate = async (): Promise<boolean> => {
    isValidating.value = true;
    error.value = '';

    try {
      for (const rule of rules) {
        // 必填验证
        if (rule.required && !value.value) {
          error.value = rule.message || '此项为必填项';
          return false;
        }

        // 最小长度验证
        if (rule.min && value.value.length < rule.min) {
          error.value = rule.message || `最少输入 ${rule.min} 个字符`;
          return false;
        }

        // 最大长度验证
        if (rule.max && value.value.length > rule.max) {
          error.value = rule.message || `最多输入 ${rule.max} 个字符`;
          return false;
        }

        // 正则验证
        if (rule.pattern && !rule.pattern.test(value.value)) {
          error.value = rule.message || '格式不正确';
          return false;
        }

        // 自定义验证
        if (rule.validator) {
          const result = await rule.validator(value.value);
          if (result !== true) {
            error.value = typeof result === 'string' ? result : rule.message || '验证失败';
            return false;
          }
        }
      }

      return true;
    } finally {
      isValidating.value = false;
    }
  };

  // 值变化时清除错误
  watch(value, () => {
    if (error.value) {
      error.value = '';
    }
  });

  return {
    error,
    isValidating,
    validate
  };
}
```

## 弹出层组件开发

### 1. Modal 组件 API

```typescript
import { VbenModal, useVbenModal } from '@vben-core/popup-ui';

// 使用组合式 API
const [Modal, modalApi] = useVbenModal({
  title: '弹窗标题',
  onConfirm: async () => {
    // 确认逻辑
    console.log('Confirmed');
  },
  onCancel: () => {
    // 取消逻辑
    console.log('Cancelled');
  }
});

// API 方法
modalApi.open();  // 打开
modalApi.close(); // 关闭
modalApi.setData({ title: '新标题' }); // 更新数据
```

### 2. Drawer 组件 API

```typescript
import { useVbenDrawer } from '@vben-core/popup-ui';

const [Drawer, drawerApi] = useVbenDrawer({
  title: '抽屉标题',
  placement: 'right',
  width: 400
});

// 打开并传递数据
drawerApi.open({
  data: { id: 1, name: 'Item' }
});
```

## 状态管理

### 1. 组件内部状态

```vue
<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

// 简单状态
const count = ref(0);

// 复杂状态
const state = reactive({
  user: {
    name: '',
    email: ''
  },
  settings: {
    theme: 'light',
    language: 'zh-CN'
  }
});

// 计算状态
const isValid = computed(() => {
  return state.user.name && state.user.email;
});
</script>
```

### 2. 跨组件状态

```typescript
// stores/user.ts
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    async login(credentials) {
      // 登录逻辑
    },
    logout() {
      this.userInfo = null;
      this.token = '';
    }
  }
});
```

## 性能优化

### 1. 组件懒加载

```typescript
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
);
```

### 2. 虚拟滚动

```vue
<template>
  <VirtualList
    :items="items"
    :item-height="50"
    :visible-count="10"
  >
    <template #default="{ item }">
      <div class="list-item">{{ item.name }}</div>
    </template>
  </VirtualList>
</template>
```

### 3. 防抖和节流

```typescript
import { debounce, throttle } from '@vben-core/shared';

// 防抖
const debouncedSearch = debounce((query: string) => {
  // 搜索逻辑
}, 300);

// 节流
const throttledScroll = throttle(() => {
  // 滚动逻辑
}, 100);
```

## 测试指南

### 1. 单元测试

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Component from './Component.vue';

describe('Component', () => {
  it('renders properly', () => {
    const wrapper = mount(Component, {
      props: {
        title: 'Test Title'
      }
    });

    expect(wrapper.text()).toContain('Test Title');
  });

  it('emits event on click', async () => {
    const wrapper = mount(Component);

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted()).toHaveProperty('click');
  });
});
```

### 2. 组合式函数测试

```typescript
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('increments count', () => {
    const { count, increment } = useCounter();

    expect(count.value).toBe(0);
    increment();
    expect(count.value).toBe(1);
  });
});
```

## 文档规范

### 1. 组件文档

```markdown
# ComponentName

## 概述

组件的简要描述和用途。

## 基础用法

\`\`\`vue
<template>
  <ComponentName />
</template>
\`\`\`

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| variant | 组件变体 | `'default' \| 'primary'` | `'default'` |
| size | 组件尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击时触发 | `(event: MouseEvent) => void` |

### Slots

| 插槽名 | 说明 | 作用域插槽 |
|--------|------|------------|
| default | 默认内容 | - |
| header | 头部内容 | `{ title: string }` |

### Expose

| 方法名 | 说明 | 类型 |
|--------|------|------|
| reset | 重置组件 | `() => void` |
| validate | 验证组件 | `() => Promise<boolean>` |
```

## 最佳实践

### DO's ✅

1. 保持组件单一职责
2. 使用 TypeScript 类型定义
3. 提供完整的 Props 验证
4. 编写单元测试
5. 添加注释和文档
6. 使用组合式 API
7. 遵循命名规范
8. 处理边界情况

### DON'Ts ❌

1. 避免组件过度复杂
2. 避免直接修改 props
3. 避免在模板中使用复杂逻辑
4. 避免过度使用全局状态
5. 避免忽视无障碍访问
6. 避免忽视性能问题

## 相关资源

- [Vue 3 文档](https://vuejs.org)
- [组合式 API](https://vuejs.org/api/composition-api-setup.html)
- [TypeScript 支持](https://vuejs.org/guide/typescript/overview.html)
- [Vue Test Utils](https://test-utils.vuejs.org)
- [Pinia 状态管理](https://pinia.vuejs.org)