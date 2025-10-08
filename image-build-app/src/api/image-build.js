import request from './request'
import { mockApi, isMockEnabled } from '@/mock'

/**
 * 获取镜像构建列表
 */
export function getImageBuilds(params) {
  if (isMockEnabled()) {
    return mockApi.getImageBuilds(params)
  }

  return request({
    url: '/image-builds',
    method: 'get',
    params
  })
}

/**
 * 获取镜像构建详情
 */
export function getImageBuildDetail(id) {
  if (isMockEnabled()) {
    return mockApi.getImageBuildDetail(id)
  }

  return request({
    url: `/image-builds/${id}`,
    method: 'get'
  })
}

/**
 * 创建镜像构建
 */
export function createImageBuild(data) {
  if (isMockEnabled()) {
    return mockApi.createImageBuild(data)
  }

  return request({
    url: '/image-builds',
    method: 'post',
    data
  })
}

/**
 * 更新镜像构建
 */
export function updateImageBuild(id, data) {
  if (isMockEnabled()) {
    return mockApi.updateImageBuild(id, data)
  }

  return request({
    url: `/image-builds/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除镜像构建
 */
export function deleteImageBuild(id) {
  if (isMockEnabled()) {
    return mockApi.deleteImageBuild(id)
  }

  return request({
    url: `/image-builds/${id}`,
    method: 'delete'
  })
}

/**
 * 重新构建镜像
 */
export function rebuildImage(id) {
  if (isMockEnabled()) {
    return mockApi.rebuildImage(id)
  }

  return request({
    url: `/image-builds/${id}/rebuild`,
    method: 'post'
  })
}

/**
 * 获取镜像列表
 */
export function getImages(params) {
  if (isMockEnabled()) {
    return mockApi.getImages(params)
  }

  return request({
    url: '/images',
    method: 'get',
    params
  })
}

/**
 * 删除镜像
 */
export function deleteImage(id) {
  if (isMockEnabled()) {
    return mockApi.deleteImage(id)
  }

  return request({
    url: `/images/${id}`,
    method: 'delete'
  })
}

/**
 * 获取构建模板列表
 */
export function getBuildTemplates(params) {
  if (isMockEnabled()) {
    return mockApi.getBuildTemplates(params)
  }

  return request({
    url: '/build-templates',
    method: 'get',
    params
  })
}

/**
 * 创建构建模板
 */
export function createBuildTemplate(data) {
  if (isMockEnabled()) {
    return mockApi.createBuildTemplate(data)
  }

  return request({
    url: '/build-templates',
    method: 'post',
    data
  })
}

/**
 * 更新构建模板
 */
export function updateBuildTemplate(id, data) {
  if (isMockEnabled()) {
    return mockApi.updateBuildTemplate(id, data)
  }

  return request({
    url: `/build-templates/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除构建模板
 */
export function deleteBuildTemplate(id) {
  if (isMockEnabled()) {
    return mockApi.deleteBuildTemplate(id)
  }

  return request({
    url: `/build-templates/${id}`,
    method: 'delete'
  })
}

/**
 * 获取构建日志
 */
export function getBuildLogs(id) {
  if (isMockEnabled()) {
    return mockApi.getBuildLogs(id)
  }

  return request({
    url: `/image-builds/${id}/logs`,
    method: 'get'
  })
}
