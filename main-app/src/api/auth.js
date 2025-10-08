import request from './request'
import { mockApi, isMockEnabled } from '@/mock'

export function login(username, password) {
  // 如果启用 Mock，使用 Mock 数据
  if (isMockEnabled()) {
    return mockApi.login(username, password)
  }

  return request({
    url: '/auth/login',
    method: 'post',
    data: { username, password }
  })
}

export function logout() {
  // Mock 模式下不需要调用接口
  if (isMockEnabled()) {
    return Promise.resolve({ message: 'Logout success' })
  }

  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

export function getUserInfo() {
  // 如果启用 Mock，使用 Mock 数据
  if (isMockEnabled()) {
    const token = localStorage.getItem('token')
    return mockApi.getUserInfo(token)
  }

  return request({
    url: '/auth/me',
    method: 'get'
  })
}

export function getUserMenus() {
  // 如果启用 Mock，使用 Mock 数据
  if (isMockEnabled()) {
    const token = localStorage.getItem('token')
    return mockApi.getUserMenus(token)
  }

  return request({
    url: '/auth/menus',
    method: 'get'
  })
}
