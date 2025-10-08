/**
 * 表单验证规则工具函数
 * 参考 vue-vben-admin 实现
 */

/**
 * 必填验证
 */
export function createRequiredRule(message = '此项为必填项') {
  return {
    required: true,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 字符串长度验证
 */
export function createLengthRule(min, max, message) {
  const defaultMessage = max
    ? `长度在 ${min} 到 ${max} 个字符`
    : `长度不能小于 ${min} 个字符`

  return {
    min,
    max,
    message: message || defaultMessage,
    trigger: ['change', 'blur']
  }
}

/**
 * 邮箱验证
 */
export function createEmailRule(message = '请输入正确的邮箱地址') {
  return {
    type: 'email',
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 手机号验证
 */
export function createPhoneRule(message = '请输入正确的手机号') {
  return {
    pattern: /^1[3-9]\d{9}$/,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 身份证验证
 */
export function createIdCardRule(message = '请输入正确的身份证号') {
  return {
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * URL验证
 */
export function createUrlRule(message = '请输入正确的URL地址') {
  return {
    type: 'url',
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 数字验证
 */
export function createNumberRule(message = '请输入数字') {
  return {
    type: 'number',
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 数字范围验证
 */
export function createNumberRangeRule(min, max, message) {
  const defaultMessage = `请输入 ${min} 到 ${max} 之间的数字`

  return {
    type: 'number',
    min,
    max,
    message: message || defaultMessage,
    trigger: ['change', 'blur']
  }
}

/**
 * 整数验证
 */
export function createIntegerRule(message = '请输入整数') {
  return {
    pattern: /^-?\d+$/,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 正整数验证
 */
export function createPositiveIntegerRule(message = '请输入正整数') {
  return {
    pattern: /^[1-9]\d*$/,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * IP地址验证
 */
export function createIpRule(message = '请输入正确的IP地址') {
  return {
    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 端口号验证
 */
export function createPortRule(message = '请输入正确的端口号(1-65535)') {
  return {
    validator: (rule, value) => {
      if (value === '' || value === null || value === undefined) {
        return Promise.resolve()
      }
      const port = Number(value)
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        return Promise.reject(message)
      }
      return Promise.resolve()
    },
    trigger: ['change', 'blur']
  }
}

/**
 * 用户名验证（字母、数字、下划线）
 */
export function createUsernameRule(message = '用户名只能包含字母、数字和下划线') {
  return {
    pattern: /^[a-zA-Z0-9_]+$/,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 密码强度验证
 * @param {number} level 1: 弱(6位以上) 2: 中(包含字母和数字) 3: 强(包含字母、数字和特殊字符)
 */
export function createPasswordRule(level = 2, message) {
  const patterns = {
    1: /^.{6,}$/,
    2: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    3: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
  }

  const messages = {
    1: '密码至少6位',
    2: '密码至少8位，包含字母和数字',
    3: '密码至少8位，包含字母、数字和特殊字符'
  }

  return {
    pattern: patterns[level] || patterns[2],
    message: message || messages[level] || messages[2],
    trigger: ['change', 'blur']
  }
}

/**
 * 确认密码验证
 */
export function createPasswordConfirmRule(passwordField, message = '两次输入密码不一致') {
  return {
    validator: (rule, value, callback, source) => {
      if (value === '' || value === null || value === undefined) {
        return Promise.resolve()
      }
      if (value !== source[passwordField]) {
        return Promise.reject(message)
      }
      return Promise.resolve()
    },
    trigger: ['change', 'blur']
  }
}

/**
 * 自定义正则验证
 */
export function createPatternRule(pattern, message = '格式不正确') {
  return {
    pattern,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 自定义验证函数
 */
export function createCustomRule(validator, trigger = ['change', 'blur']) {
  return {
    validator,
    trigger
  }
}

/**
 * 数组非空验证
 */
export function createArrayRequiredRule(message = '至少选择一项') {
  return {
    type: 'array',
    required: true,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 日期验证
 */
export function createDateRule(message = '请选择日期') {
  return {
    type: 'date',
    required: true,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 日期范围验证
 */
export function createDateRangeRule(message = '请选择日期范围') {
  return {
    type: 'array',
    required: true,
    message,
    trigger: ['change', 'blur']
  }
}

/**
 * 组合多个验证规则
 */
export function combineRules(...rules) {
  return rules.flat()
}

/**
 * 创建动态验证规则
 * @param {Object} options 验证配置
 * @returns {Array} 验证规则数组
 */
export function createRules(options = {}) {
  const {
    required = false,
    requiredMessage,
    type,
    min,
    max,
    pattern,
    patternMessage,
    validator,
    trigger = ['change', 'blur']
  } = options

  const rules = []

  // 必填验证
  if (required) {
    rules.push(createRequiredRule(requiredMessage))
  }

  // 类型验证
  if (type) {
    switch (type) {
      case 'email':
        rules.push(createEmailRule())
        break
      case 'phone':
        rules.push(createPhoneRule())
        break
      case 'url':
        rules.push(createUrlRule())
        break
      case 'number':
        rules.push(createNumberRule())
        break
      case 'integer':
        rules.push(createIntegerRule())
        break
      case 'ip':
        rules.push(createIpRule())
        break
    }
  }

  // 长度验证
  if (min !== undefined || max !== undefined) {
    rules.push(createLengthRule(min, max))
  }

  // 正则验证
  if (pattern) {
    rules.push(createPatternRule(pattern, patternMessage))
  }

  // 自定义验证
  if (validator) {
    rules.push(createCustomRule(validator, trigger))
  }

  return rules
}

// 导出所有验证规则
export default {
  createRequiredRule,
  createLengthRule,
  createEmailRule,
  createPhoneRule,
  createIdCardRule,
  createUrlRule,
  createNumberRule,
  createNumberRangeRule,
  createIntegerRule,
  createPositiveIntegerRule,
  createIpRule,
  createPortRule,
  createUsernameRule,
  createPasswordRule,
  createPasswordConfirmRule,
  createPatternRule,
  createCustomRule,
  createArrayRequiredRule,
  createDateRule,
  createDateRangeRule,
  combineRules,
  createRules
}
