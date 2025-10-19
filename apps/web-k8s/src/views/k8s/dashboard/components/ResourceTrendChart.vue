<script lang="ts" setup>
import type { EChartsOption } from 'echarts';

/**
 * 资源使用趋势图表组件
 * 展示 CPU、内存、Pod 数量等资源的历史趋势
 */
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { Card } from 'ant-design-vue';

interface Props {
  clusterId: string;
}

defineProps<Props>();

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

/**
 * 生成模拟趋势数据
 */
function generateTrendData() {
  const now = new Date();
  const timePoints: string[] = [];
  const cpuData: number[] = [];
  const memoryData: number[] = [];
  const podData: number[] = [];

  // 生成最近 24 小时的数据点（每小时一个点）
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    timePoints.push(`${time.getHours().toString().padStart(2, '0')}:00`);

    // 生成模拟数据：基础值 + 随机波动
    const hourOfDay = time.getHours();

    // CPU 使用率 (30-80%)，工作时间较高
    const cpuBase = hourOfDay >= 9 && hourOfDay <= 18 ? 60 : 40;
    cpuData.push(cpuBase + Math.random() * 20);

    // 内存使用率 (50-85%)，逐渐上升趋势
    const memoryBase = 50 + (23 - i) * 1.2;
    memoryData.push(memoryBase + Math.random() * 10);

    // Pod 数量 (80-150)，工作时间较多
    const podBase = hourOfDay >= 9 && hourOfDay <= 18 ? 120 : 90;
    podData.push(Math.round(podBase + Math.random() * 30));
  }

  return { timePoints, cpuData, memoryData, podData };
}

/**
 * 初始化图表
 */
function initChart() {
  const { timePoints, cpuData, memoryData, podData } = generateTrendData();

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: ['CPU 使用率', '内存使用率', 'Pod 数量'],
      top: 0,
      textStyle: {
        color: 'var(--vben-text-color)',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timePoints,
      axisLabel: {
        color: 'var(--vben-text-color-secondary)',
      },
      axisLine: {
        lineStyle: {
          color: 'var(--vben-border-color)',
        },
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '使用率 (%)',
        position: 'left',
        axisLabel: {
          formatter: '{value}%',
          color: 'var(--vben-text-color-secondary)',
        },
        axisLine: {
          lineStyle: {
            color: 'var(--vben-border-color)',
          },
        },
        splitLine: {
          lineStyle: {
            color: 'var(--vben-border-color)',
            type: 'dashed',
          },
        },
      },
      {
        type: 'value',
        name: 'Pod 数量',
        position: 'right',
        axisLabel: {
          formatter: '{value}',
          color: 'var(--vben-text-color-secondary)',
        },
        axisLine: {
          lineStyle: {
            color: 'var(--vben-border-color)',
          },
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'CPU 使用率',
        type: 'line',
        smooth: true,
        data: cpuData,
        itemStyle: {
          color: '#1890ff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
      },
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        data: memoryData,
        itemStyle: {
          color: '#52c41a',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ],
          },
        },
      },
      {
        name: 'Pod 数量',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: podData,
        itemStyle: {
          color: '#fa8c16',
        },
        lineStyle: {
          type: 'dashed',
        },
      },
    ],
  };

  renderEcharts(option);
}

// 组件挂载时初始化图表
onMounted(() => {
  initChart();
});
</script>

<template>
  <Card
    class="trend-chart-card"
    title="资源使用趋势（最近 24 小时）"
    :bordered="false"
  >
    <EchartsUI ref="chartRef" class="chart-container" />
  </Card>
</template>

<style scoped>
.trend-chart-card {
  height: 100%;
  background-color: var(--vben-background-color);
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
