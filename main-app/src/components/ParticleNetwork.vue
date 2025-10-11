<template>
  <div
    ref="containerRef"
    class="particle-network"
  >
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
    />
    <div class="particles">
      <div
        v-for="(particle, index) in particles"
        :key="index"
        class="particle"
        :style="getParticleStyle(particle)"
      >
        <span class="particle-text">{{ particle.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const containerRef = ref()
const canvasRef = ref()
const canvasWidth = ref(1200)
const canvasHeight = ref(800)
const particles = ref([])

// 粒子文本内容 - Kubernetes 相关技术词汇
const particleTexts = [
  'kubernetes', 'docker', 'devops', 'microservices', 'containers',
  'helm', 'kubectl', 'ingress', 'pods', 'services', 'deployments',
  'namespaces', 'configmap', 'secrets', 'volumes', 'nodes',
  'clusters', 'monitoring', 'logging', 'prometheus', 'grafana',
  'jenkins', 'ci/cd', 'pipeline', 'automation', 'orchestration',
  'scaling', 'load balancing', 'service mesh', 'istio', 'envoy',
  'redis', 'mysql', 'mongodb', 'elasticsearch', 'kafka',
  'nginx', 'apache', 'traefik', 'api gateway', 'security',
  'rbac', 'network policies', 'storage', 'persistent volumes',
  'operators', 'custom resources', 'webhooks', 'controllers',"ai","log"
]

let animationId
let ctx = null

const createParticles = () => {
  const particleCount = 35
  particles.value = []

  for (let i = 0; i < particleCount; i++) {
    particles.value.push({
      id: i,
      x: Math.random() * canvasWidth.value,
      y: Math.random() * canvasHeight.value,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      text: particleTexts[Math.floor(Math.random() * particleTexts.length)],
      size: Math.random() * 3 + 8,
      opacity: Math.random() * 0.6 + 0.4,
      connections: []
    })
  }
}

const updateParticles = () => {
  particles.value.forEach(particle => {
    // 更新位置
    particle.x += particle.vx
    particle.y += particle.vy

    // 边界反弹
    if (particle.x <= 0 || particle.x >= canvasWidth.value) {
      particle.vx *= -1
    }
    if (particle.y <= 0 || particle.y >= canvasHeight.value) {
      particle.vy *= -1
    }

    // 保持在边界内
    particle.x = Math.max(0, Math.min(canvasWidth.value, particle.x))
    particle.y = Math.max(0, Math.min(canvasHeight.value, particle.y))
  })
}

const drawConnections = () => {
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  particles.value.forEach((particle, i) => {
    particle.connections = []

    particles.value.forEach((otherParticle, j) => {
      if (i !== j) {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // 增加连接距离到 220px，让更多粒子连接
        if (distance < 220) {
          // 增加连线透明度，使其更明显
          const opacity = (220 - distance) / 220 * 0.6

          // 使用项目主题色渐变让连线更漂亮
          const gradient = ctx.createLinearGradient(
            particle.x, particle.y,
            otherParticle.x, otherParticle.y
          )
          gradient.addColorStop(0, `rgba(24, 144, 255, ${opacity})`) // Ant Design 蓝色 #1890ff
          gradient.addColorStop(0.5, `rgba(64, 169, 255, ${opacity})`) // 亮蓝色 #40a9ff
          gradient.addColorStop(1, `rgba(105, 192, 255, ${opacity})`) // 更亮的蓝色 #69c0ff

          ctx.globalAlpha = 1
          ctx.strokeStyle = gradient
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.stroke()

          if (!particle.connections.includes(j)) {
            particle.connections.push(j)
          }
        }
      }
    })
  })

  ctx.globalAlpha = 1
}

const getParticleStyle = (particle) => {
  return {
    left: `${particle.x}px`,
    top: `${particle.y}px`,
    opacity: particle.opacity,
    fontSize: `${particle.size}px`,
    transform: `translate(-50%, -50%)`
  }
}

const animate = () => {
  updateParticles()
  drawConnections()
  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (containerRef.value) {
    canvasWidth.value = containerRef.value.offsetWidth
    canvasHeight.value = containerRef.value.offsetHeight

    if (canvasRef.value) {
      canvasRef.value.width = canvasWidth.value
      canvasRef.value.height = canvasHeight.value
    }

    createParticles()
  }
}

onMounted(async () => {
  await nextTick()

  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
  }

  handleResize()
  createParticles()
  animate()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.particle-network {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #001529 0%, #002140 50%, #001529 100%);
  z-index: 1;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.particles {
  position: relative;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  pointer-events: none;
  user-select: none;
  transition: opacity 0.3s ease;

  /* 添加发光圆点 - 使用项目主题蓝色 */
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(24, 144, 255, 0.9) 0%, rgba(64, 169, 255, 0.5) 100%);
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.7), 0 0 4px rgba(64, 169, 255, 0.5);
  }
}

.particle-text {
  position: relative;
  display: inline-block;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
  text-shadow: 0 0 10px rgba(100, 116, 139, 0.4);
  white-space: nowrap;
  opacity: 0.85;
  transition: all 0.3s ease;
  padding-left: 10px;
  line-height: 1;
}

.particle:hover {
  pointer-events: auto;

  &::before {
    width: 8px;
    height: 8px;
    background: radial-gradient(circle, rgba(24, 144, 255, 1) 0%, rgba(64, 169, 255, 0.7) 100%);
    box-shadow: 0 0 15px rgba(24, 144, 255, 1), 0 0 8px rgba(64, 169, 255, 0.7);
  }

  .particle-text {
    color: #1890ff;
    opacity: 1;
    text-shadow: 0 0 15px rgba(24, 144, 255, 0.7);
    transform: scale(1.05);
    font-weight: 600;
  }
}

/* 添加闪烁效果 */
@keyframes twinkle {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.particle:nth-child(3n) .particle-text {
  animation: twinkle 3s infinite;
}

.particle:nth-child(5n) .particle-text {
  animation: twinkle 4s infinite;
  animation-delay: 1s;
}

.particle:nth-child(7n) .particle-text {
  animation: twinkle 5s infinite;
  animation-delay: 2s;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .particle-text {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .particle-text {
    font-size: 8px;
  }
}
</style>
