/**
 * 格式化工具函数
 */

/**
 * 格式化文件大小
 * @param {Number} size - 字节大小
 * @param {Number} decimals - 小数位数
 * @returns {String} 格式化后的大小
 */
export function formatFileSize(size, decimals = 2) {
  if (size === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(size) / Math.log(k))

  return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化数字（千分位）
 * @param {Number} num - 数字
 * @param {Number} decimals - 小数位数
 * @returns {String} 格式化后的数字
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined) return '-'

  const parts = num.toFixed(decimals).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return parts.join('.')
}

/**
 * 格式化金额
 * @param {Number} amount - 金额
 * @param {String} currency - 货币符号
 * @param {Number} decimals - 小数位数
 * @returns {String} 格式化后的金额
 */
export function formatCurrency(amount, currency = '¥', decimals = 2) {
  return currency + formatNumber(amount, decimals)
}

/**
 * 格式化百分比
 * @param {Number} value - 值
 * @param {Number} total - 总值
 * @param {Number} decimals - 小数位数
 * @returns {String} 格式化后的百分比
 */
export function formatPercent(value, total, decimals = 2) {
  if (!total || total === 0) return '0%'

  const percent = (value / total) * 100
  return percent.toFixed(decimals) + '%'
}

/**
 * 格式化手机号
 * @param {String} phone - 手机号
 * @returns {String} 格式化后的手机号
 */
export function formatPhone(phone) {
  if (!phone) return '-'

  const cleaned = ('' + phone).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)

  if (match) {
    return match[1] + ' ' + match[2] + ' ' + match[3]
  }

  return phone
}

/**
 * 隐藏手机号中间四位
 * @param {String} phone - 手机号
 * @returns {String} 隐藏后的手机号
 */
export function hidePhone(phone) {
  if (!phone) return '-'

  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 隐藏邮箱部分字符
 * @param {String} email - 邮箱
 * @returns {String} 隐藏后的邮箱
 */
export function hideEmail(email) {
  if (!email) return '-'

  const parts = email.split('@')
  if (parts.length !== 2) return email

  const name = parts[0]
  const domain = parts[1]

  const visibleLength = Math.max(1, Math.floor(name.length / 3))
  const hiddenPart = name.substring(visibleLength, name.length - visibleLength)

  return name.substring(0, visibleLength) + '*'.repeat(hiddenPart.length) + name.substring(name.length - visibleLength) + '@' + domain
}

/**
 * 隐藏身份证号部分字符
 * @param {String} idCard - 身份证号
 * @returns {String} 隐藏后的身份证号
 */
export function hideIdCard(idCard) {
  if (!idCard) return '-'

  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

/**
 * 格式化银行卡号
 * @param {String} cardNumber - 银行卡号
 * @returns {String} 格式化后的银行卡号
 */
export function formatBankCard(cardNumber) {
  if (!cardNumber) return '-'

  const cleaned = ('' + cardNumber).replace(/\D/g, '')
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/**
 * 首字母大写
 * @param {String} str - 字符串
 * @returns {String} 首字母大写的字符串
 */
export function capitalize(str) {
  if (!str) return ''

  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 驼峰转下划线
 * @param {String} str - 驼峰字符串
 * @returns {String} 下划线字符串
 */
export function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

/**
 * 下划线转驼峰
 * @param {String} str - 下划线字符串
 * @returns {String} 驼峰字符串
 */
export function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}
