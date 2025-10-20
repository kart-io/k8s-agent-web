import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      build: {
        // 优化代码分割
        rollupOptions: {
          output: {
            // 手动分块，将大型依赖分离
            manualChunks(id) {
              // Ant Design Vue 单独打包
              if (id.includes('node_modules/ant-design-vue')) {
                return 'ant-design-vue';
              }
              // VXE Table 单独打包（这是最大的依赖）
              if (id.includes('node_modules/vxe-table')) {
                return 'vxe-table';
              }
              // ECharts 单独打包
              if (id.includes('node_modules/echarts')) {
                return 'echarts';
              }
              // Vue 核心库单独打包
              if (id.includes('node_modules/vue')) {
                return 'vue';
              }
              // K8s 相关组件分组
              if (id.includes('/views/k8s/')) {
                // Dashboard 组件
                if (id.includes('/views/k8s/dashboard/')) {
                  return 'k8s-dashboard';
                }
                // DetailDrawer 组件单独打包
                if (id.includes('DetailDrawer.vue')) {
                  return 'k8s-detail-drawers';
                }
                // 搜索页面
                if (id.includes('/views/k8s/search/')) {
                  return 'k8s-search';
                }
                // 其他 K8s 视图
                return 'k8s-views';
              }
              // 其他 node_modules
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            },
          },
        },
        // 启用压缩
        minify: 'terser',
        terserOptions: {
          compress: {
            // 生产环境删除 console
            drop_console: true,
            drop_debugger: true,
          },
        },
        // 分块大小警告阈值
        chunkSizeWarningLimit: 1000,
      },
      server: {
        proxy: {
          // K8s API 代理到 cluster-service 后端
          // 注意: 必须放在 /api 之前,优先匹配
          '/api/k8s': {
            changeOrigin: true,
            // cluster-service 后端地址 (真实 K8s API 服务)
            target: 'http://localhost:8082',
            ws: true,
          },
          // 认证和授权 API 代理到 auth-service
          // 包括: /api/v1/auth, /api/v1/users, /api/v1/roles, /api/v1/permissions
          '/api/v1': {
            changeOrigin: true,
            // auth-service 后端地址
            target: 'http://localhost:8090',
            ws: true,
          },
          // 其他 API (兼容旧接口) 继续使用 mock
          '/api': {
            changeOrigin: true,
            // mock代理目标地址
            target: 'http://localhost:5320',
            ws: true,
          },
        },
      },
    },
  };
});
