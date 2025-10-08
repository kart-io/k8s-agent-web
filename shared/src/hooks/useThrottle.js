import { ref, watch } from 'vue'

/**
 * 节流钩子
 * 用于限制函数执行频率
 */
export function useThrottle(value, delay = 300) {
  const throttledValue = ref(value)
  let lastTime = 0

  watch(
    () => value,
    (newValue) => {
      const now = Date.now()

      if (now - lastTime >= delay) {
        throttledValue.value = newValue
        lastTime = now
      }
    },
    { immediate: true }
  )

  return throttledValue
}

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, delay = 300) {
  let lastTime = 0

  return function (...args) {
    const now = Date.now()

    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}
