// 基础组件
export * from './basic'

// 表单组件
export * from './form'

// 表格组件
export * from './table'

// 模态框组件
export * from './modal'

// 布局组件
export * from './layout'

// 上传组件
export * from './upload'

// 树形组件
export * from './tree'

// 抽屉组件
export * from './drawer'

// 结果页组件
export * from './result'

// VXE Table 组件
export * from './vxe-table'

// 默认导出
import * as BasicComponents from './basic'
import * as FormComponents from './form'
import * as TableComponents from './table'
import * as ModalComponents from './modal'
import * as LayoutComponents from './layout'
import * as UploadComponents from './upload'
import * as TreeComponents from './tree'
import * as DrawerComponents from './drawer'
import * as ResultComponents from './result'
import * as VxeTableComponents from './vxe-table'

export default {
  ...BasicComponents,
  ...FormComponents,
  ...TableComponents,
  ...ModalComponents,
  ...LayoutComponents,
  ...UploadComponents,
  ...TreeComponents,
  ...DrawerComponents,
  ...ResultComponents,
  ...VxeTableComponents
}
