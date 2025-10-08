import request from './request'
import { mockApi, isMockEnabled } from '@/mock'

// 用户管理
export function getUsers(params) {
  if (isMockEnabled()) {
    console.log('[System API] getUsers called, mockApi:', mockApi)
    console.log('[System API] mockApi.getUsers:', mockApi.getUsers)
    return mockApi.getUsers(params)
  }

  return request({
    url: '/users',
    method: 'get',
    params
  })
}

export function createUser(data) {
  if (isMockEnabled()) {
    return mockApi.createUser(data)
  }

  return request({
    url: '/users',
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  if (isMockEnabled()) {
    return mockApi.updateUser(id, data)
  }

  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  if (isMockEnabled()) {
    return mockApi.deleteUser(id)
  }

  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

// 角色管理
export function getRoles(params) {
  if (isMockEnabled()) {
    console.log('[System API] getRoles called, mockApi:', mockApi)
    console.log('[System API] mockApi.getRoles:', mockApi.getRoles)
    return mockApi.getRoles(params)
  }

  return request({
    url: '/roles',
    method: 'get',
    params
  })
}

export function createRole(data) {
  if (isMockEnabled()) {
    return Promise.resolve({ id: Date.now(), ...data })
  }

  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  if (isMockEnabled()) {
    return Promise.resolve({ id, ...data })
  }

  return request({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  if (isMockEnabled()) {
    return Promise.resolve({ message: 'Role deleted successfully' })
  }

  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

// 权限管理
export function getPermissions(params) {
  if (isMockEnabled()) {
    console.log('[System API] getPermissions called, mockApi:', mockApi)
    console.log('[System API] mockApi.getPermissions:', mockApi.getPermissions)
    return mockApi.getPermissions(params)
  }

  return request({
    url: '/permissions',
    method: 'get',
    params
  })
}

export function createPermission(data) {
  if (isMockEnabled()) {
    return Promise.resolve({ id: Date.now(), ...data })
  }

  return request({
    url: '/permissions',
    method: 'post',
    data
  })
}

export function updatePermission(id, data) {
  if (isMockEnabled()) {
    return Promise.resolve({ id, ...data })
  }

  return request({
    url: `/permissions/${id}`,
    method: 'put',
    data
  })
}

export function deletePermission(id) {
  if (isMockEnabled()) {
    return Promise.resolve({ message: 'Permission deleted successfully' })
  }

  return request({
    url: `/permissions/${id}`,
    method: 'delete'
  })
}
