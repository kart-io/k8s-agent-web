import request from './request'
import { mockApi, isMockEnabled } from '@/mock'

export function getMetricsSummary() {
  if (isMockEnabled()) {
    return mockApi.getMetrics('cpu')
  }

  return request({
    url: '/metrics/summary',
    method: 'get'
  })
}

export function getMetricsHistory(params) {
  if (isMockEnabled()) {
    return mockApi.getMetrics(params.type || 'cpu', params.range)
  }

  return request({
    url: '/metrics/history',
    method: 'get',
    params
  })
}

export function getAlerts(params) {
  if (isMockEnabled()) {
    return mockApi.getAlerts(params)
  }

  return request({
    url: '/alerts',
    method: 'get',
    params
  })
}

export function createAlert(data) {
  if (isMockEnabled()) {
    return Promise.resolve({ id: Date.now(), ...data, status: 'pending' })
  }

  return request({
    url: '/alerts',
    method: 'post',
    data
  })
}

export function updateAlert(id, data) {
  if (isMockEnabled()) {
    return Promise.resolve({ id, ...data })
  }

  return request({
    url: `/alerts/${id}`,
    method: 'put',
    data
  })
}

export function deleteAlert(id) {
  if (isMockEnabled()) {
    return Promise.resolve({ message: 'Alert deleted successfully' })
  }

  return request({
    url: `/alerts/${id}`,
    method: 'delete'
  })
}
