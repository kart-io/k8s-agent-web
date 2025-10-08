<template>
  <div class="test-table">
    <h2>测试 VxeTable 和 Mock 数据</h2>
    
    <div style="margin-bottom: 20px;">
      <a-button type="primary" @click="testMock">测试 Mock 数据</a-button>
      <a-button @click="testDirectData" style="margin-left: 10px;">测试直接数据</a-button>
    </div>

    <div v-if="error" style="color: red; margin-bottom: 10px;">
      错误: {{ error }}
    </div>

    <div v-if="mockStatus" style="margin-bottom: 10px;">
      Mock 状态: {{ mockStatus }}
    </div>

    <!-- 直接使用静态数据的表格 -->
    <h3>静态数据表格</h3>
    <VxeBasicTable
      title="静态测试数据"
      :grid-options="staticGridOptions"
      :data-source="staticData"
    />

    <!-- 使用 API 的表格 -->
    <h3 style="margin-top: 20px;">API 数据表格</h3>
    <VxeBasicTable
      ref="apiTableRef"
      title="API 测试数据"
      :grid-options="apiGridOptions"
      :api="loadTestData"
      @register="onTableRegister"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { VxeBasicTable } from '@k8s-agent/shared/components'
import { getUsers } from '@/api/system'
import { isMockEnabled } from '@/mock'

const error = ref('')
const mockStatus = ref('')
const apiTableRef = ref(null)
let tableApi = null

// 静态数据
const staticData = ref([
  { id: 1, name: '测试1', age: 20, email: 'test1@example.com' },
  { id: 2, name: '测试2', age: 25, email: 'test2@example.com' },
  { id: 3, name: '测试3', age: 30, email: 'test3@example.com' }
])

const staticGridOptions = {
  border: true,
  stripe: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '姓名', width: 120 },
    { field: 'age', title: '年龄', width: 100 },
    { field: 'email', title: '邮箱', minWidth: 200 }
  ]
}

const apiGridOptions = {
  border: true,
  stripe: true,
  columns: [
    { type: 'seq', width: 60, title: '序号' },
    { field: 'id', title: 'ID', width: 80 },
    { field: 'username', title: '用户名', width: 120 },
    { field: 'email', title: '邮箱', minWidth: 200 },
    { field: 'status', title: '状态', width: 100 }
  ]
}

const loadTestData = async (params) => {
  try {
    console.log('loadTestData 调用, params:', params)
    const res = await getUsers(params)
    console.log('getUsers 返回:', res)
    return {
      data: {
        list: res.data || [],
        total: res.total || 0
      }
    }
  } catch (err) {
    console.error('loadTestData 错误:', err)
    error.value = err.message
    return { data: { list: [], total: 0 } }
  }
}

const onTableRegister = (api) => {
  tableApi = api
  console.log('Table API 注册成功')
}

const testMock = async () => {
  error.value = ''
  mockStatus.value = `Mock 启用状态: ${isMockEnabled()}`
  
  try {
    const res = await getUsers({ page: 1, pageSize: 10 })
    console.log('测试 Mock 返回:', res)
    message.success(`获取到 ${res.data?.length || 0} 条数据`)
  } catch (err) {
    console.error('测试 Mock 错误:', err)
    error.value = err.message
    message.error('测试失败: ' + err.message)
  }
}

const testDirectData = () => {
  console.log('当前静态数据:', staticData.value)
  message.info(`静态数据有 ${staticData.value.length} 条`)
}
</script>

<style scoped>
.test-table {
  padding: 20px;
}
</style>
