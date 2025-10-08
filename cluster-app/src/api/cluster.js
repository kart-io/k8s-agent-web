import request from './request'
import { mockApi, isMockEnabled } from '@/mock'

export function getClusters(params) {
  if (isMockEnabled()) {
    return mockApi.getClusters(params)
  }

  return request({
    url: '/clusters',
    method: 'get',
    params
  })
}

export function getClusterDetail(id) {
  if (isMockEnabled()) {
    return mockApi.getClusterDetail(id)
  }

  return request({
    url: `/clusters/${id}`,
    method: 'get'
  })
}

export function createCluster(data) {
  if (isMockEnabled()) {
    return mockApi.createCluster(data)
  }

  return request({
    url: '/clusters',
    method: 'post',
    data
  })
}

export function updateCluster(id, data) {
  if (isMockEnabled()) {
    return mockApi.updateCluster(id, data)
  }

  return request({
    url: `/clusters/${id}`,
    method: 'put',
    data
  })
}

export function deleteCluster(id) {
  if (isMockEnabled()) {
    return mockApi.deleteCluster(id)
  }

  return request({
    url: `/clusters/${id}`,
    method: 'delete'
  })
}

export function getPods(clusterId, params) {
  // Mock 暂不支持，返回真实接口
  return request({
    url: `/clusters/${clusterId}/pods`,
    method: 'get',
    params
  })
}

export function getServices(clusterId, params) {
  // Mock 暂不支持，返回真实接口
  return request({
    url: `/clusters/${clusterId}/services`,
    method: 'get',
    params
  })
}

export function getDeployments(clusterId, params) {
  // Mock 暂不支持，返回真实接口
  return request({
    url: `/clusters/${clusterId}/deployments`,
    method: 'get',
    params
  })
}

export function getNamespaces(clusterId) {
  if (isMockEnabled()) {
    return mockApi.getNamespaces({ clusterId })
  }

  return request({
    url: `/clusters/${clusterId}/namespaces`,
    method: 'get'
  })
}
