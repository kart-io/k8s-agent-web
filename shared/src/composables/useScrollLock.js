import { ref, watch, onUnmounted } from 'vue'

/**
 * 滚动锁定组合函数
 * 用于锁定和解锁页面滚动（常用于模态框、抽屉等）
 */
export function useScrollLock(initialLocked = false) {
  const isLocked = ref(initialLocked)
  const originalOverflow = ref('')
  const originalPaddingRight = ref('')

  /**
   * 锁定滚动
   */
  const lock = () => {
    if (isLocked.value) return

    const body = document.body
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // 保存原始样式
    originalOverflow.value = body.style.overflow
    originalPaddingRight.value = body.style.paddingRight

    // 锁定滚动
    body.style.overflow = 'hidden'

    // 补偿滚动条宽度，防止页面抖动
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    isLocked.value = true
  }

  /**
   * 解锁滚动
   */
  const unlock = () => {
    if (!isLocked.value) return

    const body = document.body

    // 恢复原始样式
    body.style.overflow = originalOverflow.value
    body.style.paddingRight = originalPaddingRight.value

    isLocked.value = false
  }

  /**
   * 切换锁定状态
   */
  const toggle = () => {
    if (isLocked.value) {
      unlock()
    } else {
      lock()
    }
  }

  // 监听锁定状态变化
  watch(isLocked, (locked) => {
    if (locked) {
      lock()
    } else {
      unlock()
    }
  })

  // 组件卸载时解锁
  onUnmounted(() => {
    if (isLocked.value) {
      unlock()
    }
  })

  return {
    isLocked,
    lock,
    unlock,
    toggle
  }
}
