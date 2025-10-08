/**
 * 下载工具函数
 */

/**
 * 下载文件
 * @param {Blob|String} data - 文件数据或URL
 * @param {String} filename - 文件名
 * @param {String} mime - MIME类型
 */
export function downloadFile(data, filename, mime) {
  let blob

  if (data instanceof Blob) {
    blob = data
  } else if (typeof data === 'string') {
    // 如果是URL，通过fetch下载
    if (data.startsWith('http://') || data.startsWith('https://')) {
      downloadByUrl(data, filename)
      return
    }

    // 如果是base64或其他字符串
    blob = new Blob([data], { type: mime || 'text/plain' })
  } else {
    console.error('Invalid data type for download')
    return
  }

  // 创建下载链接
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'download'
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  // 清理
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 通过URL下载文件
 * @param {String} url - 文件URL
 * @param {String} filename - 文件名
 */
export function downloadByUrl(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || url.split('/').pop()
  link.target = '_blank'
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
}

/**
 * 下载Base64文件
 * @param {String} base64 - Base64字符串
 * @param {String} filename - 文件名
 * @param {String} mime - MIME类型
 */
export function downloadBase64(base64, filename, mime = 'application/octet-stream') {
  const byteString = atob(base64.split(',')[1] || base64)
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const intArray = new Uint8Array(arrayBuffer)

  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i)
  }

  const blob = new Blob([intArray], { type: mime })
  downloadFile(blob, filename)
}

/**
 * 下载JSON文件
 * @param {Object} data - JSON数据
 * @param {String} filename - 文件名
 */
export function downloadJSON(data, filename = 'data.json') {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadFile(blob, filename)
}

/**
 * 下载CSV文件
 * @param {Array} data - 数据数组
 * @param {String} filename - 文件名
 * @param {Array} headers - 表头
 */
export function downloadCSV(data, filename = 'data.csv', headers = null) {
  let csv = ''

  // 添加表头
  if (headers && headers.length > 0) {
    csv += headers.join(',') + '\n'
  } else if (data.length > 0) {
    csv += Object.keys(data[0]).join(',') + '\n'
  }

  // 添加数据行
  data.forEach(row => {
    const values = Object.values(row).map(val => {
      // 处理包含逗号或引号的值
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    })
    csv += values.join(',') + '\n'
  })

  // 添加BOM，解决中文乱码
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  downloadFile(blob, filename)
}

/**
 * 下载文本文件
 * @param {String} text - 文本内容
 * @param {String} filename - 文件名
 */
export function downloadText(text, filename = 'text.txt') {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  downloadFile(blob, filename)
}

/**
 * 下载Excel文件（需要配合xlsx库）
 * @param {Array} data - 数据数组
 * @param {String} filename - 文件名
 * @param {String} sheetName - Sheet名称
 */
export function downloadExcel(data, filename = 'data.xlsx', sheetName = 'Sheet1') {
  // 这里需要安装 xlsx 库：pnpm add xlsx
  // import * as XLSX from 'xlsx'

  console.warn('downloadExcel requires xlsx library. Please install it first: pnpm add xlsx')

  // 示例代码（需要先安装xlsx）:
  /*
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
  */
}
