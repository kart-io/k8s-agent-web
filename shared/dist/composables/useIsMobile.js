import { ref, onMounted, onUnmounted } from 'vue';

/**
 * 移动端检测组合函数
 * 检测当前设备是否为移动设备
 */
function useIsMobile(breakpoint = 768) {
  const isMobile = ref(false);

  /**
   * 检查是否为移动设备
   */
  const checkMobile = () => {
    isMobile.value = window.innerWidth < breakpoint;
  };

  /**
   * 处理窗口大小变化
   */
  const handleResize = () => {
    checkMobile();
  };

  onMounted(() => {
    checkMobile();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    isMobile
  }
}

export { useIsMobile };
//# sourceMappingURL=useIsMobile.js.map
