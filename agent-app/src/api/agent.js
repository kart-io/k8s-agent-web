import request from './request'
import { mockApi, isMockEnabled } from '@/mock'

export function getAgents(params) {
  if (isMockEnabled()) {
    return mockApi.getAgents(params)
  }

  return request({
    url: '/agents',
    method: 'get',
    params
  })
}

export function getAgentDetail(id) {
  if (isMockEnabled()) {
    return mockApi.getAgentDetail(id)
  }

  return request({
    url: `/agents/${id}`,
    method: 'get'
  })
}

export function updateAgent(id, data) {
  if (isMockEnabled()) {
    return mockApi.updateAgent(id, data)
  }

  return request({
    url: `/agents/${id}`,
    method: 'put',
    data
  })
}

export function deleteAgent(id) {
  if (isMockEnabled()) {
    return mockApi.deleteAgent(id)
  }

  return request({
    url: `/agents/${id}`,
    method: 'delete'
  })
}

export function getEvents(params) {
  if (isMockEnabled()) {
    return mockApi.getEvents(params)
  }

  return request({
    url: '/events',
    method: 'get',
    params
  })
}

export function getCommands(params) {
  if (isMockEnabled()) {
    return mockApi.getCommands(params)
  }

  return request({
    url: '/commands',
    method: 'get',
    params
  })
}

export function sendCommand(data) {
  if (isMockEnabled()) {
    return mockApi.sendCommand(data)
  }

  return request({
    url: '/commands',
    method: 'post',
    data
  })
}
