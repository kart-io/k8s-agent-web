import {
  DashboardOutlined,
  ClusterOutlined,
  DeploymentUnitOutlined,
  MonitorOutlined,
  BuildOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  MenuOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  CodeOutlined,
  FileTextOutlined,
  BellOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'

// 图标映射表
const iconMap = {
  DashboardOutlined,
  ClusterOutlined,
  DeploymentUnitOutlined,
  MonitorOutlined,
  BuildOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  MenuOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  CodeOutlined,
  FileTextOutlined,
  BellOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
}

/**
 * 根据图标名称获取图标组件
 * @param {string} iconName - 图标名称（如: 'DashboardOutlined'）
 * @returns {Component|null} 图标组件
 */
export function getIconComponent(iconName) {
  if (!iconName) return null
  return iconMap[iconName] || null
}

/**
 * 获取所有可用的图标名称
 * @returns {string[]} 图标名称数组
 */
export function getAvailableIcons() {
  return Object.keys(iconMap)
}

export default {
  getIconComponent,
  getAvailableIcons
}
