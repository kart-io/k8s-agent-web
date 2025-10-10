/**
 * 本地存储工具函数
 * 支持过期时间和命名空间
 */

const DEFAULT_PREFIX = 'k8s-agent-';
const DEFAULT_EXPIRE = 7 * 24 * 60 * 60 * 1000; // 7天

/**
 * 创建存储实例
 * @param {Object} options - 配置选项
 * @returns {Object} 存储实例
 */
function createStorage(options = {}) {
  const {
    prefix = DEFAULT_PREFIX,
    storage = localStorage,
    expire = DEFAULT_EXPIRE
  } = options;

  /**
   * 生成完整的key
   */
  const getKey = (key) => {
    return `${prefix}${key}`
  };

  /**
   * 设置存储
   */
  const set = (key, value, expireTime = expire) => {
    const fullKey = getKey(key);

    const data = {
      value,
      expire: expireTime ? Date.now() + expireTime : null
    };

    try {
      storage.setItem(fullKey, JSON.stringify(data));
      return true
    } catch (error) {
      console.error('Storage set error:', error);
      return false
    }
  };

  /**
   * 获取存储
   */
  const get = (key, defaultValue = null) => {
    const fullKey = getKey(key);

    try {
      const item = storage.getItem(fullKey);

      if (!item) {
        return defaultValue
      }

      const data = JSON.parse(item);

      // 检查是否过期
      if (data.expire && data.expire < Date.now()) {
        remove(key);
        return defaultValue
      }

      return data.value
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue
    }
  };

  /**
   * 移除存储
   */
  const remove = (key) => {
    const fullKey = getKey(key);

    try {
      storage.removeItem(fullKey);
      return true
    } catch (error) {
      console.error('Storage remove error:', error);
      return false
    }
  };

  /**
   * 清空所有存储（仅清空带前缀的）
   */
  const clear = () => {
    try {
      const keys = Object.keys(storage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          storage.removeItem(key);
        }
      });
      return true
    } catch (error) {
      console.error('Storage clear error:', error);
      return false
    }
  };

  /**
   * 获取所有存储的key
   */
  const getKeys = () => {
    try {
      const keys = Object.keys(storage);
      return keys
        .filter(key => key.startsWith(prefix))
        .map(key => key.replace(prefix, ''))
    } catch (error) {
      console.error('Storage getKeys error:', error);
      return []
    }
  };

  /**
   * 检查key是否存在
   */
  const has = (key) => {
    return get(key) !== null
  };

  return {
    set,
    get,
    remove,
    clear,
    getKeys,
    has
  }
}

// 默认的 localStorage 实例
const storage = createStorage();

// sessionStorage 实例
const sessionStorage = createStorage({
  storage: window.sessionStorage
});

export { createStorage, sessionStorage, storage };
//# sourceMappingURL=storage.js.map
