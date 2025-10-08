/**
 * 类型判断工具函数
 */

export function is(val, type) {
  return Object.prototype.toString.call(val) === `[object ${type}]`
}

export function isDef(val) {
  return typeof val !== 'undefined'
}

export function isUnDef(val) {
  return typeof val === 'undefined'
}

export function isNull(val) {
  return val === null
}

export function isNullOrUnDef(val) {
  return isUnDef(val) || isNull(val)
}

export function isObject(val) {
  return val !== null && is(val, 'Object')
}

export function isArray(val) {
  return val && Array.isArray(val)
}

export function isString(val) {
  return is(val, 'String')
}

export function isNumber(val) {
  return is(val, 'Number')
}

export function isBoolean(val) {
  return is(val, 'Boolean')
}

export function isDate(val) {
  return is(val, 'Date')
}

export function isRegExp(val) {
  return is(val, 'RegExp')
}

export function isFunction(val) {
  return typeof val === 'function'
}

export function isPromise(val) {
  return is(val, 'Promise') && isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

export function isElement(val) {
  return isObject(val) && !!val.tagName
}

export function isWindow(val) {
  return typeof window !== 'undefined' && is(val, 'Window')
}

export function isEmpty(val) {
  if (isArray(val) || isString(val)) {
    return val.length === 0
  }

  if (val instanceof Map || val instanceof Set) {
    return val.size === 0
  }

  if (isObject(val)) {
    return Object.keys(val).length === 0
  }

  return false
}

export function isUrl(path) {
  const reg = /^(https?:|mailto:|tel:)/
  return reg.test(path)
}

export function isEmail(email) {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

export function isPhone(phone) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

export function isIdCard(idCard) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}
