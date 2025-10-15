/**
 * 错误处理工具
 * 提供统一的错误处理和用户友好的错误提示
 */

import { message as antdMessage } from 'ant-design-vue';

/**
 * 错误类型
 */
export enum ErrorType {
  /** 认证错误 */
  AUTH = 'auth',
  /** 网络错误 */
  NETWORK = 'network',
  /** 资源未找到 */
  NOT_FOUND = 'not_found',
  /** 权限错误 */
  PERMISSION = 'permission',
  /** 服务器错误 */
  SERVER = 'server',
  /** 超时错误 */
  TIMEOUT = 'timeout',
  /** 未知错误 */
  UNKNOWN = 'unknown',
  /** 验证错误 */
  VALIDATION = 'validation',
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType;
  code?: number | string;
  message: string;
  details?: any;
  originalError?: any;
}

/**
 * 错误消息映射
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: '网络连接失败，请检查网络设置',
  [ErrorType.AUTH]: '认证失败，请重新登录',
  [ErrorType.PERMISSION]: '没有权限执行此操作',
  [ErrorType.NOT_FOUND]: '请求的资源不存在',
  [ErrorType.VALIDATION]: '数据验证失败',
  [ErrorType.SERVER]: '服务器错误，请稍后重试',
  [ErrorType.TIMEOUT]: '请求超时，请稍后重试',
  [ErrorType.UNKNOWN]: '发生未知错误',
};

/**
 * 根据 HTTP 状态码判断错误类型
 */
export function getErrorTypeFromStatus(status: number): ErrorType {
  if (status === 401) return ErrorType.AUTH;
  if (status === 403) return ErrorType.PERMISSION;
  if (status === 404) return ErrorType.NOT_FOUND;
  if (status === 422) return ErrorType.VALIDATION;
  if (status >= 500) return ErrorType.SERVER;
  if (status === 408 || status === 504) return ErrorType.TIMEOUT;
  return ErrorType.UNKNOWN;
}

/**
 * 解析错误对象
 */
export function parseError(error: any): ErrorInfo {
  // 网络错误
  if (!error.response && error.request) {
    return {
      type: ErrorType.NETWORK,
      message: ERROR_MESSAGES[ErrorType.NETWORK],
      originalError: error,
    };
  }

  // HTTP 错误响应
  if (error.response) {
    const { status, data } = error.response;
    const type = getErrorTypeFromStatus(status);

    return {
      type,
      code: status,
      message: data?.message || data?.error || ERROR_MESSAGES[type],
      details: data?.details || data?.errors,
      originalError: error,
    };
  }

  // 请求超时
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: ErrorType.TIMEOUT,
      message: ERROR_MESSAGES[ErrorType.TIMEOUT],
      originalError: error,
    };
  }

  // 其他错误
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || ERROR_MESSAGES[ErrorType.UNKNOWN],
    originalError: error,
  };
}

/**
 * 显示错误提示
 */
export function showError(error: any, customMessage?: string): void {
  const errorInfo = parseError(error);

  // 使用自定义消息或默认消息
  const displayMessage = customMessage || errorInfo.message;

  // 根据错误类型选择不同的提示方式
  switch (errorInfo.type) {
    case ErrorType.AUTH: {
      antdMessage.error({
        content: displayMessage,
        duration: 5,
        key: 'auth-error', // 防止重复显示
      });
      break;
    }

    case ErrorType.NETWORK:
    // falls through
    case ErrorType.TIMEOUT: {
      antdMessage.error({
        content: displayMessage,
        duration: 5,
      });
      break;
    }

    case ErrorType.PERMISSION: {
      antdMessage.warning({
        content: displayMessage,
        duration: 4,
      });
      break;
    }
    case ErrorType.VALIDATION: {
      antdMessage.warning({
        content: displayMessage,
        duration: 3,
      });
      break;
    }

    default: {
      antdMessage.error({
        content: displayMessage,
        duration: 4,
      });
    }
  }

  // 在开发环境下输出详细错误信息
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.group('🔴 Error Details');
    console.error('Type:', errorInfo.type);
    console.error('Code:', errorInfo.code);
    console.error('Message:', errorInfo.message);
    if (errorInfo.details) {
      console.error('Details:', errorInfo.details);
    }
    console.error('Original Error:', errorInfo.originalError);
    // eslint-disable-next-line no-console
    console.groupEnd();
  }
}

/**
 * 显示成功提示
 */
export function showSuccess(message: string, duration: number = 3): void {
  antdMessage.success({
    content: message,
    duration,
  });
}

/**
 * 显示警告提示
 */
export function showWarning(message: string, duration: number = 3): void {
  antdMessage.warning({
    content: message,
    duration,
  });
}

/**
 * 显示信息提示
 */
export function showInfo(message: string, duration: number = 3): void {
  antdMessage.info({
    content: message,
    duration,
  });
}

/**
 * 处理 API 错误的装饰器
 */
export function handleApiError(customMessage?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        showError(error, customMessage);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 安全执行异步操作
 * 自动处理错误并显示提示
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options?: {
    errorMessage?: string;
    showLoading?: boolean;
    successMessage?: string;
  },
): Promise<null | T> {
  const { errorMessage, successMessage, showLoading = false } = options || {};

  let hideLoading: (() => void) | null = null;

  try {
    if (showLoading) {
      hideLoading = antdMessage.loading('加载中...', 0) as any;
    }

    const result = await fn();

    if (successMessage) {
      showSuccess(successMessage);
    }

    return result;
  } catch (error) {
    showError(error, errorMessage);
    return null;
  } finally {
    if (hideLoading) {
      hideLoading();
    }
  }
}

/**
 * 获取友好的错误消息
 */
export function getFriendlyErrorMessage(error: any): string {
  const errorInfo = parseError(error);
  return errorInfo.message;
}
