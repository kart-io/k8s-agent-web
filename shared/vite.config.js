import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  build: {
    // Library mode configuration (T077)
    lib: {
      // Entry points (T078)
      entry: {
        index: resolve(__dirname, 'src/index.js'),
        components: resolve(__dirname, 'src/components/index.js'),
        composables: resolve(__dirname, 'src/composables/index.js'),
        hooks: resolve(__dirname, 'src/hooks/index.js'),
        utils: resolve(__dirname, 'src/utils/index.js'),
        'core/route-sync': resolve(__dirname, 'src/core/route-sync.js'),
        'utils/config-loader': resolve(__dirname, 'src/utils/config-loader.js'),
        'config/index': resolve(__dirname, 'src/config/index.js'),
        'config/vxeTable': resolve(__dirname, 'src/config/vxeTable.js')
      },
      // Output format: ESM only (T080)
      formats: ['es'],
      // Preserve module structure for better tree-shaking
      fileName: (format, entryName) => {
        // Use .js extension for ESM
        return `${entryName}.js`
      }
    },

    // Rollup options (T079)
    rollupOptions: {
      // Externalize peer dependencies to avoid bundling them
      external: [
        'vue',
        'vue-router',
        'pinia',
        'ant-design-vue',
        '@ant-design/icons-vue',
        'axios',
        'dayjs',
        'vxe-table',
        'vxe-table-plugin-antd',
        'xe-utils',
        // Also externalize any deep imports from these packages
        /^vue\//,
        /^vue-router\//,
        /^pinia\//,
        /^ant-design-vue\//,
        /^@ant-design\/icons-vue\//,
        /^axios\//,
        /^dayjs\//,
        /^vxe-table\//,
        /^xe-utils\//
      ],
      output: {
        // Preserve module structure for better tree-shaking
        preserveModules: true,
        preserveModulesRoot: 'src',
        // Export format
        exports: 'named',
        // Use absolute paths for external modules
        paths: (id) => {
          // Keep external module IDs as-is
          return id
        }
      }
    },

    // Enable CSS code splitting (T081)
    cssCodeSplit: true,

    // Target modern browsers for smaller output
    target: 'esnext',

    // Minification
    minify: false, // Don't minify library code for better debugging

    // Source maps for debugging
    sourcemap: true,

    // Output directory
    outDir: 'dist',
    emptyOutDir: true
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
