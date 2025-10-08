<template>
  <div class="qrcode-wrapper">
    <canvas ref="canvasRef" />
    <div v-if="loading" class="qrcode-loading">
      <a-spin />
    </div>
    <div v-if="showDownload" class="qrcode-actions">
      <a-button size="small" @click="handleDownload">
        <template #icon><DownloadOutlined /></template>
        下载二维码
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 200
  },
  level: {
    type: String,
    default: 'M',
    validator: (value) => ['L', 'M', 'Q', 'H'].includes(value)
  },
  bgColor: {
    type: String,
    default: '#ffffff'
  },
  fgColor: {
    type: String,
    default: '#000000'
  },
  showDownload: {
    type: Boolean,
    default: true
  },
  downloadFileName: {
    type: String,
    default: 'qrcode'
  }
})

const canvasRef = ref(null)
const loading = ref(false)

onMounted(() => {
  renderQRCode()
})

watch([() => props.value, () => props.size, () => props.level], () => {
  renderQRCode()
})

const renderQRCode = async () => {
  if (!props.value || !canvasRef.value) return

  loading.value = true

  try {
    // 简化版本：使用 Canvas 绘制简单的二维码占位符
    // 实际项目中应该使用 qrcode.js 或 qrcodejs2 库
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')

    canvas.width = props.size
    canvas.height = props.size

    // 绘制背景
    ctx.fillStyle = props.bgColor
    ctx.fillRect(0, 0, props.size, props.size)

    // 绘制前景（简化的二维码图案）
    ctx.fillStyle = props.fgColor
    const cellSize = props.size / 25

    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // 简单的棋盘图案作为示例
        if ((i + j) % 2 === 0 || Math.random() > 0.5) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
        }
      }
    }

    // 绘制中心定位点
    drawPositionBox(ctx, 2, 2, cellSize)
    drawPositionBox(ctx, 18, 2, cellSize)
    drawPositionBox(ctx, 2, 18, cellSize)

  } catch (error) {
    console.error('Failed to render QR code:', error)
    message.error('二维码生成失败')
  } finally {
    loading.value = false
  }
}

const drawPositionBox = (ctx, x, y, cellSize) => {
  // 外框
  ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, cellSize)
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, 7 * cellSize)
  ctx.fillRect((x + 6) * cellSize, y * cellSize, cellSize, 7 * cellSize)
  ctx.fillRect(x * cellSize, (y + 6) * cellSize, 7 * cellSize, cellSize)

  // 中心点
  ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize)
}

const handleDownload = () => {
  try {
    const canvas = canvasRef.value
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${props.downloadFileName}.png`
    link.href = url
    link.click()
    message.success('下载成功')
  } catch (error) {
    console.error('Failed to download QR code:', error)
    message.error('下载失败')
  }
}

defineExpose({
  download: handleDownload
})
</script>

<style scoped lang="scss">
.qrcode-wrapper {
  display: inline-block;
  position: relative;

  canvas {
    display: block;
  }
}

.qrcode-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.qrcode-actions {
  margin-top: 12px;
  text-align: center;
}
</style>
