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
  if (isMockEnabled()) {
    return mockApi.getPods(clusterId, params)
  }

  return request({
    url: `/clusters/${clusterId}/pods`,
    method: 'get',
    params
  })
}

export function getServices(clusterId, params) {
  if (isMockEnabled()) {
    return mockApi.getServices(clusterId, params)
  }

  return request({
    url: `/clusters/${clusterId}/services`,
    method: 'get',
    params
  })
}

export function getDeployments(clusterId, params) {
  if (isMockEnabled()) {
    return mockApi.getDeployments(clusterId, params)
  }

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

export function getNodes(clusterId, params) {
  if (isMockEnabled()) {
    return mockApi.getNodes({ clusterId, ...params })
  }

  return request({
    url: `/clusters/${clusterId}/nodes`,
    method: 'get',
    params
  })
}

export function getPodLogs(clusterId, namespace, podName, params) {
  if (isMockEnabled()) {
    return mockApi.getPodLogs({ clusterId, namespace, podName, ...params })
  }

  return request({
    url: `/clusters/${clusterId}/namespaces/${namespace}/pods/${podName}/logs`,
    method: 'get',
    params
  })
}

export function getPodContainers(clusterId, namespace, podName) {
  if (isMockEnabled()) {
    return mockApi.getPodContainers({ clusterId, namespace, podName })
  }

  return request({
    url: `/clusters/${clusterId}/namespaces/${namespace}/pods/${podName}/containers`,
    method: 'get'
  })
}

export function getPodDetail(clusterId, namespace, podName) {
  if (isMockEnabled()) {
    return mockApi.getPodDetail({ clusterId, namespace, podName })
  }

  return request({
    url: `/clusters/${clusterId}/namespaces/${namespace}/pods/${podName}`,
    method: 'get'
  })
}
