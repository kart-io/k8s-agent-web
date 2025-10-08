<template>
  <div class="metrics-list">
    <a-row :gutter="16" class="summary-row">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="CPU 使用率"
            :value="summary.cpuUsage"
            suffix="%"
            :value-style="{ color: getCpuColor(summary.cpuUsage) }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="内存使用率"
            :value="summary.memoryUsage"
            suffix="%"
            :value-style="{ color: getMemoryColor(summary.memoryUsage) }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="磁盘使用率"
            :value="summary.diskUsage"
            suffix="%"
            :value-style="{ color: getDiskColor(summary.diskUsage) }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="网络流量"
            :value="summary.networkTraffic"
            suffix="MB/s"
          />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="charts-row">
      <a-col :span="24">
        <a-card title="CPU 使用趋势" :bordered="false">
          <template #extra>
            <a-radio-group v-model:value="timeRange" @change="loadMetricsHistory">
              <a-radio-button value="1h">1小时</a-radio-button>
              <a-radio-button value="6h">6小时</a-radio-button>
              <a-radio-button value="24h">24小时</a-radio-button>
              <a-radio-button value="7d">7天</a-radio-button>
            </a-radio-group>
          </template>
          <v-chart :option="cpuChartOption" style="height: 300px" :loading="loading" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="charts-row">
      <a-col :span="12">
        <a-card title="内存使用趋势" :bordered="false">
          <v-chart :option="memoryChartOption" style="height: 300px" :loading="loading" />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="网络流量趋势" :bordered="false">
          <v-chart :option="networkChartOption" style="height: 300px" :loading="loading" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { getMetricsSummary, getMetricsHistory } from '@/api/monitor'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const loading = ref(false)
const timeRange = ref('1h')
let refreshTimer = null

const summary = ref({
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0,
  networkTraffic: 0
})

const cpuChartOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value', max: 100 },
  series: [{
    data: [],
    type: 'line',
    smooth: true,
    itemStyle: { color: '#1890ff' },
    areaStyle: { color: 'rgba(24, 144, 255, 0.2)' }
  }]
})

const memoryChartOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value', max: 100 },
  series: [{
    data: [],
    type: 'line',
    smooth: true,
    itemStyle: { color: '#52c41a' },
    areaStyle: { color: 'rgba(82, 196, 26, 0.2)' }
  }]
})

const networkChartOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  series: [{
    name: '上行',
    data: [],
    type: 'line',
    smooth: true,
    itemStyle: { color: '#1890ff' }
  }, {
    name: '下行',
    data: [],
    type: 'line',
    smooth: true,
    itemStyle: { color: '#52c41a' }
  }]
})

const getCpuColor = (value) => {
  if (value > 80) return '#f5222d'
  if (value > 60) return '#faad14'
  return '#52c41a'
}

const getMemoryColor = (value) => {
  if (value > 85) return '#f5222d'
  if (value > 70) return '#faad14'
  return '#52c41a'
}

const getDiskColor = (value) => {
  if (value > 90) return '#f5222d'
  if (value > 80) return '#faad14'
  return '#52c41a'
}

const loadMetricsSummary = async () => {
  try {
    const res = await getMetricsSummary()
    summary.value = res
  } catch (error) {
    message.error('加载指标摘要失败')
  }
}

const loadMetricsHistory = async () => {
  loading.value = true
  try {
    const res = await getMetricsHistory({ timeRange: timeRange.value })

    const timestamps = res.timestamps || []
    const cpuData = res.cpu || []
    const memoryData = res.memory || []
    const networkUpData = res.networkUp || []
    const networkDownData = res.networkDown || []

    cpuChartOption.value.xAxis.data = timestamps
    cpuChartOption.value.series[0].data = cpuData

    memoryChartOption.value.xAxis.data = timestamps
    memoryChartOption.value.series[0].data = memoryData

    networkChartOption.value.xAxis.data = timestamps
    networkChartOption.value.series[0].data = networkUpData
    networkChartOption.value.series[1].data = networkDownData
  } catch (error) {
    message.error('加载历史指标失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMetricsSummary()
  loadMetricsHistory()

  // 每30秒自动刷新
  refreshTimer = setInterval(() => {
    loadMetricsSummary()
    loadMetricsHistory()
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped lang="scss">
.metrics-list {
  .summary-row {
    margin-bottom: 16px;
  }

  .charts-row {
    margin-bottom: 16px;
  }
}
</style>
