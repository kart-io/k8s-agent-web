<template>
  <div class="page-wrapper" :class="{ 'page-wrapper--dense': dense }">
    <!-- 页面头部 -->
    <div v-if="showHeader" class="page-header">
      <div class="page-header-content">
        <!-- 标题区域 -->
        <div class="page-title-area">
          <slot name="title">
            <h2 class="page-title">{{ title }}</h2>
          </slot>
          <div v-if="description" class="page-description">{{ description }}</div>
        </div>

        <!-- 操作区域 -->
        <div v-if="$slots.extra" class="page-extra">
          <slot name="extra" />
        </div>
      </div>

      <!-- 面包屑 -->
      <div v-if="showBreadcrumb" class="page-breadcrumb">
        <slot name="breadcrumb">
          <a-breadcrumb>
            <a-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
              <router-link v-if="item.path" :to="item.path">
                {{ item.title }}
              </router-link>
              <span v-else>{{ item.title }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </slot>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content" :class="contentClass">
      <a-spin :spinning="loading" :tip="loadingTip">
        <slot />
      </a-spin>
    </div>

    <!-- 页面底部 -->
    <div v-if="$slots.footer" class="page-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  // 页面标题
  title: {
    type: String,
    default: ''
  },
  // 页面描述
  description: {
    type: String,
    default: ''
  },
  // 是否显示头部
  showHeader: {
    type: Boolean,
    default: true
  },
  // 是否显示面包屑
  showBreadcrumb: {
    type: Boolean,
    default: false
  },
  // 面包屑列表
  breadcrumbList: {
    type: Array,
    default: () => []
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 加载提示文字
  loadingTip: {
    type: String,
    default: '加载中...'
  },
  // 紧凑模式
  dense: {
    type: Boolean,
    default: false
  },
  // 内容区域 class
  contentClass: {
    type: [String, Array, Object],
    default: ''
  }
})

const route = useRoute()

// 从路由生成面包屑
const computedBreadcrumbList = computed(() => {
  if (props.breadcrumbList.length > 0) {
    return props.breadcrumbList
  }

  // 自动从路由生成
  const matched = route.matched
  return matched
    .filter(item => item.meta && item.meta.title)
    .map(item => ({
      title: item.meta.title,
      path: item.path
    }))
})
</script>

<style scoped>
.page-wrapper {
  min-height: 100%;
  background: #fff;
}

.page-wrapper--dense .page-header {
  padding: 12px 16px;
}

.page-wrapper--dense .page-content {
  padding: 12px 16px;
}

.page-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.page-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title-area {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 32px;
  color: rgba(0, 0, 0, 0.85);
}

.page-description {
  margin-top: 4px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

.page-extra {
  flex-shrink: 0;
  margin-left: 24px;
}

.page-breadcrumb {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.page-content {
  padding: 24px;
  min-height: 400px;
}

.page-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}
</style>
