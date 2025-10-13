# 样式规范文档

## 概述

本文档定义了 Vben Admin 项目的样式开发规范，确保代码风格的一致性和可维护性。

## 技术栈

- **CSS 框架**: TailwindCSS 3.x
- **CSS 预处理器**: PostCSS
- **样式合并**: tailwind-merge + clsx
- **主题系统**: CSS Variables + HSL 颜色空间
- **动画库**: tailwindcss-animate
- **图标**: @iconify/tailwind

## 样式架构

### 1. 目录结构

```
packages/
├── @core/
│   ├── base/
│   │   ├── design/        # 核心设计系统
│   │   └── shared/        # 共享工具
│   └── ui-kit/            # UI 组件库
│       ├── *-ui/          # 各种UI组件
│       └── shadcn-ui/     # Shadcn UI 组件
├── styles/                # 全局样式
└── internal/
    └── tailwind-config/   # TailwindCSS 配置
```

### 2. 样式优先级

1. **TailwindCSS 工具类** - 优先使用
2. **组件样式** - 组件特定样式
3. **全局样式** - 仅用于基础重置

## TailwindCSS 使用规范

### 1. 类名组织

使用 `cn()` 工具函数组织类名：

```typescript
import { cn } from '@vben-core/shared';

// 推荐
const className = cn(
  'base-class',
  'layout-class',
  'spacing-class',
  'typography-class',
  'color-class',
  condition && 'conditional-class'
);

// 避免
const className = `base-class layout-class ${condition ? 'conditional' : ''}`;
```

### 2. 类名顺序规范

按以下顺序组织 TailwindCSS 类名：

1. **布局**: `flex`, `grid`, `block`, `inline`
2. **定位**: `relative`, `absolute`, `fixed`
3. **尺寸**: `w-*`, `h-*`, `min-*`, `max-*`
4. **间距**: `m-*`, `p-*`, `space-*`
5. **边框**: `border`, `rounded`
6. **背景**: `bg-*`
7. **文本**: `text-*`, `font-*`
8. **效果**: `shadow`, `opacity`
9. **过渡**: `transition`, `duration`
10. **交互**: `hover:*`, `focus:*`, `active:*`

示例：

```vue
<div
  :class="cn(
    // 布局
    'flex items-center justify-between',
    // 尺寸
    'w-full h-12',
    // 间距
    'px-4 py-2',
    // 边框
    'border rounded-lg',
    // 背景
    'bg-background',
    // 文本
    'text-foreground',
    // 效果
    'shadow-sm',
    // 过渡
    'transition-colors duration-200',
    // 交互
    'hover:bg-accent hover:text-accent-foreground'
  )"
>
  Content
</div>
```

## 颜色系统

### 1. 语义化颜色

使用语义化的颜色变量，而不是直接使用颜色值：

```css
/* 推荐 - 使用语义化颜色 */
.component {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}

/* 避免 - 直接使用颜色值 */
.component {
  background: #ffffff;
  color: #000000;
  border-color: #e5e7eb;
}
```

### 2. 颜色变量定义

所有颜色都通过 CSS 变量定义在 HSL 颜色空间：

```css
:root {
  /* 主题颜色 */
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;

  /* 背景颜色 */
  --background: 0 0% 100%;
  --background-deep: 0 0% 96%;

  /* 文本颜色 */
  --foreground: 240 10% 3.9%;
  --muted-foreground: 240 3.8% 46.1%;

  /* 边框颜色 */
  --border: 240 5.9% 90%;

  /* 状态颜色 */
  --success: 142 71% 45%;
  --warning: 32 95% 44%;
  --destructive: 0 84% 60%;
}
```

### 3. 颜色调色板

每个主题色都有完整的调色板（50-700）：

```typescript
// 通过 createColorsPalette 生成
primary: {
  50: 'hsl(var(--primary-50))',
  100: 'hsl(var(--primary-100))',
  200: 'hsl(var(--primary-200))',
  300: 'hsl(var(--primary-300))',
  400: 'hsl(var(--primary-400))',
  500: 'hsl(var(--primary-500))',
  600: 'hsl(var(--primary-600))',
  700: 'hsl(var(--primary-700))',
  hover: 'hsl(var(--primary-600))',
  active: 'hsl(var(--primary-700))',
  border: 'hsl(var(--primary-400))',
  'border-light': 'hsl(var(--primary-300))',
  'background-light': 'hsl(var(--primary-200))',
  'background-lighter': 'hsl(var(--primary-100))',
  'background-lightest': 'hsl(var(--primary-50))'
}
```

## 响应式设计

### 1. 断点定义

使用 TailwindCSS 默认断点：

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 2. 移动优先

始终采用移动优先的设计策略：

```vue
<div class="
  text-sm      /* 移动端 */
  sm:text-base /* 小屏幕 */
  md:text-lg   /* 中等屏幕 */
  lg:text-xl   /* 大屏幕 */
">
  响应式文本
</div>
```

## 暗色模式

### 1. 实现方式

使用 `selector` 策略，通过 `dark` 类控制：

```vue
<div class="
  bg-white text-black      /* 亮色模式 */
  dark:bg-gray-900 dark:text-white /* 暗色模式 */
">
  支持暗色模式的内容
</div>
```

### 2. 颜色变量切换

通过 CSS 变量在不同模式下切换：

```css
/* 亮色模式 */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
}

/* 暗色模式 */
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
}
```

## 动画规范

### 1. 过渡动画

统一使用预定义的过渡时间：

```vue
<button class="
  transition-all     /* 过渡所有属性 */
  duration-200       /* 200ms 持续时间 */
  ease-in-out        /* 缓动函数 */
">
  按钮
</button>
```

### 2. 预定义动画

使用 `tailwindcss-animate` 提供的动画：

```vue
<!-- 进入动画 -->
<div class="animate-in fade-in slide-in-from-top-2">
  内容
</div>

<!-- 手风琴动画 -->
<div class="data-[state=open]:animate-accordion-down">
  可折叠内容
</div>
```

## 组件样式规范

### 1. 基础组件结构

```vue
<template>
  <div :class="rootClass">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@vben-core/shared';

interface Props {
  variant?: 'default' | 'primary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md'
});

const rootClass = computed(() =>
  cn(
    // 基础样式
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    // 变体样式
    {
      'bg-background text-foreground hover:bg-accent': props.variant === 'default',
      'bg-primary text-primary-foreground hover:bg-primary-hover': props.variant === 'primary',
      'bg-destructive text-destructive-foreground hover:bg-destructive-hover': props.variant === 'destructive',
    },
    // 尺寸样式
    {
      'h-8 px-3 text-sm': props.size === 'sm',
      'h-10 px-4 text-base': props.size === 'md',
      'h-12 px-6 text-lg': props.size === 'lg',
    },
    // 自定义类名
    props.className
  )
);
</script>
```

### 2. 样式变体管理

使用 `cva` (Class Variance Authority) 管理复杂的样式变体：

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

## 性能优化

### 1. PurgeCSS 配置

确保未使用的样式被清除：

```javascript
// tailwind.config.mjs
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  // ...
};
```

### 2. 动态类名

避免动态拼接类名，使用完整的类名：

```vue
<!-- 推荐 -->
<div :class="{
  'text-red-500': isError,
  'text-green-500': isSuccess
}">

<!-- 避免 -->
<div :class="`text-${isError ? 'red' : 'green'}-500`">
```

## 工具函数

### 1. cn 函数

合并和去重类名：

```typescript
import { cn } from '@vben-core/shared';

// 基础使用
cn('px-2 py-1', 'bg-red-500');
// => 'px-2 py-1 bg-red-500'

// 条件类名
cn('px-2', condition && 'bg-red-500');
// => 'px-2' 或 'px-2 bg-red-500'

// 覆盖样式
cn('px-2', 'px-4');
// => 'px-4' (tailwind-merge 自动处理冲突)
```

### 2. 更新 CSS 变量

动态更新主题变量：

```typescript
import { updateCSSVariables } from '@vben-core/shared';

updateCSSVariables({
  '--primary': '220 90% 56%',
  '--background': '0 0% 100%',
});
```

## 最佳实践

### 1. DO's ✅

- 使用语义化的颜色变量
- 保持类名有序和可读
- 使用 `cn()` 函数管理类名
- 优先使用 TailwindCSS 工具类
- 为复杂组件创建样式变体
- 使用响应式和暗色模式类

### 2. DON'Ts ❌

- 避免内联样式
- 避免使用 `!important`
- 避免深层选择器嵌套
- 避免硬编码颜色值
- 避免动态拼接类名
- 避免过度使用自定义 CSS

## 调试技巧

### 1. 开发工具

- 使用浏览器 DevTools 检查计算样式
- 安装 Tailwind CSS IntelliSense VSCode 插件
- 使用 TailwindCSS Playground 测试类名

### 2. 常见问题

**Q: 类名没有生效？**
A: 检查是否正确配置了 content 路径，确保类名是完整的。

**Q: 暗色模式不工作？**
A: 确保 HTML 元素上有 `dark` 类，检查 darkMode 配置。

**Q: 自定义颜色不显示？**
A: 确保颜色变量已定义，使用正确的 HSL 格式。

## 相关资源

- [TailwindCSS 文档](https://tailwindcss.com/docs)
- [Shadcn UI 组件](https://ui.shadcn.com)
- [CSS Variables MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [HSL 颜色空间](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)