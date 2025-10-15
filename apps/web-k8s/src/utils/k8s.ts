/**
 * K8s 相关的工具函数
 */

/**
 * 格式化时间为相对时间
 * @param dateString ISO 8601 时间字符串
 * @returns 相对时间字符串（如：5分钟前、2小时前、3天前）
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  if (seconds > 10) return `${seconds}秒前`;
  return '刚刚';
}

/**
 * 格式化完整时间
 * @param dateString ISO 8601 时间字符串
 * @returns 格式化的日期时间字符串
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * 格式化字节大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化的大小字符串（如：1.5 GB）
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * 格式化存储容量（K8s 格式）
 * @param capacity K8s 容量字符串（如：10Gi、500Mi、1Ti）
 * @returns 格式化的容量字符串
 */
export function formatK8sCapacity(capacity: string): string {
  const match = capacity.match(/^(\d+(?:\.\d+)?)(Ki|Mi|Gi|Ti|Pi|Ei)?$/);
  if (!match) return capacity;

  const [, value, unit] = match;
  const num = Number.parseFloat(value);

  const units: Record<string, number> = {
    Ki: 1024,
    Mi: 1024 * 1024,
    Gi: 1024 * 1024 * 1024,
    Ti: 1024 * 1024 * 1024 * 1024,
    Pi: 1024 * 1024 * 1024 * 1024 * 1024,
    Ei: 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
  };

  if (unit && units[unit]) {
    return formatBytes(num * units[unit]);
  }

  return capacity;
}

/**
 * 格式化 CPU 资源
 * @param cpu CPU 值（如：500m、2、0.5）
 * @returns 格式化的 CPU 字符串
 */
export function formatCpu(cpu: string | number): string {
  if (typeof cpu === 'number') {
    return `${cpu} Core${cpu > 1 ? 's' : ''}`;
  }

  if (cpu.endsWith('m')) {
    const value = Number.parseInt(cpu);
    return `${value}m (${(value / 1000).toFixed(2)} Cores)`;
  }

  return `${cpu} Core${Number(cpu) > 1 ? 's' : ''}`;
}

/**
 * 获取 Pod 状态颜色
 * @param status Pod 状态
 * @returns Ant Design 颜色值
 */
export function getPodStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    Running: 'success',
    Succeeded: 'success',
    Pending: 'warning',
    Failed: 'error',
    Unknown: 'default',
    Terminating: 'processing',
    CrashLoopBackOff: 'error',
    ImagePullBackOff: 'warning',
    CreateContainerError: 'error',
  };

  return statusMap[status] || 'default';
}

/**
 * 获取节点状态颜色
 * @param status 节点状态
 * @returns Ant Design 颜色值
 */
export function getNodeStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    Ready: 'success',
    NotReady: 'error',
    Unknown: 'default',
    SchedulingDisabled: 'warning',
  };

  return statusMap[status] || 'default';
}

/**
 * 检查资源名称是否有效
 * @param name 资源名称
 * @returns 是否有效
 */
export function isValidK8sName(name: string): boolean {
  // K8s 资源名称规则：小写字母、数字、- 和 .，不能以 - 或 . 开头或结尾
  const regex = /^[a-z0-9]([a-z0-9-.])*[a-z0-9]$/;
  return regex.test(name) && name.length <= 253;
}

/**
 * 检查标签键是否有效
 * @param key 标签键
 * @returns 是否有效
 */
export function isValidLabelKey(key: string): boolean {
  // 标签键可以包含前缀（如：kubernetes.io/name）
  const parts = key.split('/');
  if (parts.length > 2) return false;

  if (parts.length === 2) {
    // 前缀部分
    const prefix = parts[0];
    if (prefix.length > 253) return false;
    if (!/^[a-z0-9]([-a-z0-9.]*[a-z0-9])?$/.test(prefix)) return false;
  }

  // 名称部分
  const name = parts[parts.length - 1];
  if (name.length === 0 || name.length > 63) return false;
  return /^[a-z0-9A-Z]([-a-z0-9A-Z_.]*[a-z0-9A-Z])?$/.test(name);
}

/**
 * 检查标签值是否有效
 * @param value 标签值
 * @returns 是否有效
 */
export function isValidLabelValue(value: string): boolean {
  if (value.length === 0) return true; // 空值是允许的
  if (value.length > 63) return false;
  return /^[a-z0-9A-Z]([-a-z0-9A-Z_.]*[a-z0-9A-Z])?$/.test(value);
}

/**
 * 解析资源请求/限制字符串
 * @param resources 资源对象
 * @returns 格式化的资源字符串
 */
export function formatResources(resources?: {
  cpu?: string;
  memory?: string;
  [key: string]: string | undefined;
}): string {
  if (!resources) return '-';

  const parts: string[] = [];

  if (resources.cpu) {
    parts.push(`CPU: ${formatCpu(resources.cpu)}`);
  }

  if (resources.memory) {
    parts.push(`Memory: ${formatK8sCapacity(resources.memory)}`);
  }

  return parts.length > 0 ? parts.join(', ') : '-';
}

/**
 * 计算资源使用百分比
 * @param used 已使用量
 * @param total 总量
 * @returns 百分比（0-100）
 */
export function calculatePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
}

/**
 * 生成随机颜色（用于图表）
 * @param index 索引
 * @returns 十六进制颜色值
 */
export function getChartColor(index: number): string {
  const colors = [
    '#1890ff', // 蓝色
    '#52c41a', // 绿色
    '#faad14', // 橙色
    '#f5222d', // 红色
    '#722ed1', // 紫色
    '#13c2c2', // 青色
    '#eb2f96', // 粉色
    '#fa8c16', // 橙红色
    '#a0d911', // 黄绿色
    '#2f54eb', // 靛蓝色
  ];

  return colors[index % colors.length];
}

/**
 * 截断长文本
 * @param text 文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * 将对象转换为 YAML 字符串（简化版）
 * @param obj 对象
 * @param indent 缩进级别
 * @returns YAML 字符串
 */
export function toYaml(obj: any, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  let result = '';

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        result += `${spaces}- ${toYaml(item, indent + 1).trim()}\n`;
      } else {
        result += `${spaces}- ${item}\n`;
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result += `${spaces}${key}:\n${toYaml(value, indent + 1)}`;
      } else {
        result += `${spaces}${key}: ${value}\n`;
      }
    }
  } else {
    return `${obj}`;
  }

  return result;
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * 下载文本文件
 * @param content 文件内容
 * @param filename 文件名
 * @param mimeType MIME 类型
 */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain',
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 延迟执行
 * @param ms 毫秒数
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number = 300,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param wait 等待时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number = 300,
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
