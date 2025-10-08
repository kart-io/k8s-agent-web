<template>
  <a-tree
    v-model:expanded-keys="expandedKeys"
    v-model:selected-keys="selectedKeys"
    v-model:checked-keys="checkedKeys"
    :tree-data="treeData"
    :checkable="checkable"
    :selectable="selectable"
    :multiple="multiple"
    :show-line="showLine"
    :show-icon="showIcon"
    :default-expand-all="defaultExpandAll"
    :load-data="loadData"
    :field-names="fieldNames"
    @select="handleSelect"
    @check="handleCheck"
    @expand="handleExpand"
  >
    <template v-if="$slots.title" #title="{ title, key, dataRef }">
      <slot name="title" :title="title" :key="key" :dataRef="dataRef" />
    </template>
    <template v-if="$slots.icon" #icon="{ selected, expanded, dataRef }">
      <slot name="icon" :selected="selected" :expanded="expanded" :dataRef="dataRef" />
    </template>
  </a-tree>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // 树数据
  treeData: {
    type: Array,
    default: () => []
  },
  // 是否可勾选
  checkable: {
    type: Boolean,
    default: false
  },
  // 是否可选择
  selectable: {
    type: Boolean,
    default: true
  },
  // 是否支持多选
  multiple: {
    type: Boolean,
    default: false
  },
  // 是否显示连接线
  showLine: {
    type: Boolean,
    default: false
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: false
  },
  // 默认展开所有
  defaultExpandAll: {
    type: Boolean,
    default: false
  },
  // 异步加载数据
  loadData: {
    type: Function
  },
  // 字段名称映射
  fieldNames: {
    type: Object,
    default: () => ({
      children: 'children',
      title: 'title',
      key: 'key'
    })
  },
  // 默认展开的节点
  defaultExpandedKeys: {
    type: Array,
    default: () => []
  },
  // 默认选中的节点
  defaultSelectedKeys: {
    type: Array,
    default: () => []
  },
  // 默认勾选的节点
  defaultCheckedKeys: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'check', 'expand', 'update:expandedKeys', 'update:selectedKeys', 'update:checkedKeys'])

const expandedKeys = ref(props.defaultExpandedKeys)
const selectedKeys = ref(props.defaultSelectedKeys)
const checkedKeys = ref(props.defaultCheckedKeys)

watch(() => props.defaultExpandedKeys, (val) => {
  expandedKeys.value = val
})

watch(() => props.defaultSelectedKeys, (val) => {
  selectedKeys.value = val
})

watch(() => props.defaultCheckedKeys, (val) => {
  checkedKeys.value = val
})

const handleSelect = (keys, event) => {
  selectedKeys.value = keys
  emit('update:selectedKeys', keys)
  emit('select', keys, event)
}

const handleCheck = (keys, event) => {
  checkedKeys.value = keys
  emit('update:checkedKeys', keys)
  emit('check', keys, event)
}

const handleExpand = (keys, event) => {
  expandedKeys.value = keys
  emit('update:expandedKeys', keys)
  emit('expand', keys, event)
}
</script>
