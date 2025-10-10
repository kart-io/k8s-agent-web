/**
 * 类型判断工具函数
 */

function is(val, type) {
  return Object.prototype.toString.call(val) === `[object ${type}]`
}

function isDef(val) {
  return typeof val !== 'undefined'
}

function isUnDef(val) {
  return typeof val === 'undefined'
}

function isNull(val) {
  return val === null
}

function isNullOrUnDef(val) {
  return isUnDef(val) || isNull(val)
}

function isObject(val) {
  return val !== null && is(val, 'Object')
}

function isArray(val) {
  return val && Array.isArray(val)
}

function isString(val) {
  return is(val, 'String')
}

function isNumber(val) {
  return is(val, 'Number')
}

function isBoolean(val) {
  return is(val, 'Boolean')
}

function isDate(val) {
  return is(val, 'Date')
}

function isRegExp(val) {
  return is(val, 'RegExp')
}

function isFunction(val) {
  return typeof val === 'function'
}

function isPromise(val) {
  return is(val, 'Promise') && isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

function isElement(val) {
  return isObject(val) && !!val.tagName
}

function isWindow(val) {
  return typeof window !== 'undefined' && is(val, 'Window')
}

function isEmpty(val) {
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

function isUrl(path) {
  const reg = /^(https?:|mailto:|tel:)/;
  return reg.test(path)
}

function isEmail(email) {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return reg.test(email)
}

function isPhone(phone) {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone)
}

function isIdCard(idCard) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return reg.test(idCard)
}

function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export { is, isArray, isBoolean, isDate, isDef, isElement, isEmail, isEmpty, isExternal, isFunction, isIdCard, isNull, isNullOrUnDef, isNumber, isObject, isPhone, isPromise, isRegExp, isString, isUnDef, isUrl, isWindow };
//# sourceMappingURL=is.js.map
