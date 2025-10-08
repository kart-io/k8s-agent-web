import request from './request'
import { mockApi, isMockEnabled } from '@/mock'

/**
 * 获取统计数据
 */
export function getStats() {
  if (isMockEnabled()) {
    return mockApi.getStats()
  }

  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

/**
 * 获取近期事件
 */
export function getRecentEvents(limit = 10) {
  if (isMockEnabled()) {
    return mockApi.getRecentEvents(limit)
  }

  return request({
    url: '/dashboard/events',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取集群状态
 */
export function getClusterStatus() {
  if (isMockEnabled()) {
    return mockApi.getClusterStatus()
  }

  return request({
    url: '/dashboard/clusters',
    method: 'get'
  })
}

/**
 * 获取资源使用趋势
 */
export function getResourceTrends(type = 'cpu', hours = 24) {
  if (isMockEnabled()) {
    return mockApi.getResourceTrends(type, hours)
  }

  return request({
    url: '/dashboard/trends',
    method: 'get',
    params: { type, hours }
  })
}
