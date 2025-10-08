<template>
  <div class="description" :class="{ 'description--bordered': bordered }">
    <!-- 标题 -->
    <div v-if="title || $slots.title" class="description-header">
      <slot name="title">
        <h3 class="description-title">{{ title }}</h3>
      </slot>
      <div v-if="$slots.extra" class="description-extra">
        <slot name="extra" />
      </div>
    </div>

    <!-- 内容 -->
    <div class="description-content">
      <a-row :gutter="gutter">
        <template v-for="(item, index) in schema" :key="index">
          <a-col :span="item.span || defaultSpan">
            <div class="description-item">
              <div class="description-item-label">
                {{ item.label }}
                <span v-if="item.required" class="description-item-required">*</span>
                <span v-if="item.tooltip" class="description-item-tooltip">
                  <a-tooltip :title="item.tooltip">
                    <QuestionCircleOutlined />
                  </a-tooltip>
                </span>
              </div>
              <div class="description-item-value">
                <!-- 使用插槽 -->
                <slot
                  v-if="item.slot"
                  :name="item.slot"
                  :data="data"
                  :item="item"
                />
                <!-- 使用自定义渲染函数 -->
                <component
                  v-else-if="item.render"
                  :is="item.render"
                  :data="data"
                  :item="item"
                />
                <!-- 默认显示 -->
                <span v-else>
                  {{ getFieldValue(item.field) || emptyText }}
                </span>
              </div>
            </div>
          </a-col>
        </template>
      </a-row>

      <!-- 额外内容 -->
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 数据源
  data: {
    type: Object,
    default: () => ({})
  },
  // 描述配置
  schema: {
    type: Array,
    default: () => []
  },
  // 列数（每项占据的栅格数）
  defaultSpan: {
    type: Number,
    default: 8
  },
  // 栅格间距
  gutter: {
    type: [Number, Array],
    default: 16
  },
  // 是否显示边框
  bordered: {
    type: Boolean,
    default: false
  },
  // 空值显示文本
  emptyText: {
    type: String,
    default: '-'
  }
})

// 获取字段值
const getFieldValue = (field) => {
  if (!field) return ''

  // 支持嵌套字段，如 "user.name"
  const keys = field.split('.')
  let value = props.data

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key]
    } else {
      return ''
    }
  }

  return value
}
</script>

<style scoped>
.description {
  background: #fff;
}

.description--bordered {
  border: 1px solid #f0f0f0;
  border-radius: 2px;
}

.description-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.description-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.description-extra {
  flex-shrink: 0;
}

.description-content {
  padding: 16px 24px;
}

.description-item {
  margin-bottom: 16px;
}

.description-item:last-child {
  margin-bottom: 0;
}

.description-item-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

.description-item-required {
  margin-left: 4px;
  color: #ff4d4f;
}

.description-item-tooltip {
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  cursor: help;
}

.description-item-value {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  word-break: break-all;
}

.description--bordered .description-content {
  padding: 24px;
}
</style>
