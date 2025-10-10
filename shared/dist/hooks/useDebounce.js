import { ref, watch } from 'vue';

/**
 * 防抖钩子
 * 用于延迟执行函数，避免频繁触发
 */
function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value);
  let timeout;

  watch(
    () => value,
    (newValue) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        debouncedValue.value = newValue;
      }, delay);
    },
    { immediate: true }
  );

  return debouncedValue
}

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay = 300) {
  let timeout;

  return function (...args) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }
}

export { debounce, useDebounce };
//# sourceMappingURL=useDebounce.js.map
