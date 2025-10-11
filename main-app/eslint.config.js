import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  // ESLint 推荐配置
  js.configs.recommended,

  // Vue 3 推荐配置
  ...pluginVue.configs['flat/recommended'],

  // 全局配置
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js 环境
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',

        // 浏览器环境
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',

        // ES2021
        Promise: 'readonly',
        Symbol: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Proxy: 'readonly',
        Reflect: 'readonly'
      }
    },

    rules: {
      // Vue 规则
      'vue/multi-word-component-names': 'off',

      // 生产环境警告
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
  },

  // 忽略文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.vite/**',
      'coverage/**',
      '*.config.js'
    ]
  }
]
