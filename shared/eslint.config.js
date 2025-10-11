import js from '@eslint/js'

export default [
  // ESLint 推荐配置
  js.configs.recommended,

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
