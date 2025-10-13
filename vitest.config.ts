import { join } from 'node:path';
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [Vue(), VueJsx()],
  resolve: {
    alias: {
      '@': join(__dirname, './src'),
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
  test: {
    // 测试环境
    environment: 'jsdom',

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '*.config.{js,ts,mjs,mts}',
        '**/*.d.ts',
        '**/__tests__/**',
        '**/mockData/**',
        'docs/',
        '.vitepress/',
      ],
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },

    // 全局设置
    globals: true,

    // 包含的测试文件
    include: [
      '**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    // 排除的文件
    exclude: [
      ...configDefaults.exclude,
      '**/e2e/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp,turbo,vitepress}/**',
      '**/node_modules/**',
    ],

    // 测试超时配置
    testTimeout: 20000,
    hookTimeout: 20000,

    // 测试报告器
    reporters: ['default'],

    // 设置文件
    setupFiles: ['./test/setup.ts'],

    // Mock 配置
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },
});