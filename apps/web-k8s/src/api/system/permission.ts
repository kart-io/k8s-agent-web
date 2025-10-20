import { requestClient } from '#/api/request';

export namespace PermissionApi {
  /** 权限类型 */
  export enum PermissionType {
    /** API */
    API = 'api',
    /** 按钮 */
    BUTTON = 'button',
    /** 菜单 */
    MENU = 'menu',
  }

  /** 权限状态 */
  export enum PermissionStatus {
    /** 启用 */
    ACTIVE = 1,
    /** 禁用 */
    DISABLED = 0,
  }

  /** 权限信息 */
  export interface Permission {
    id: string;
    parent_id?: string;
    name: string;
    code: string;
    type: PermissionType;
    path?: string;
    method?: string;
    component?: string;
    icon?: string;
    sort: number;
    status: PermissionStatus;
    description?: string;
    created_at: string;
    updated_at: string;
  }

  /** 权限列表查询参数 */
  export interface PermissionListParams {
    type?: PermissionType;
    status?: string;
  }

  /** 权限列表响应 */
  export interface PermissionListResponse {
    items: Permission[];
  }

  /** 权限树节点 */
  export interface PermissionNode {
    id: string;
    parent_id?: string;
    name: string;
    code: string;
    type: PermissionType;
    path?: string;
    method?: string;
    icon?: string;
    sort: number;
    children?: PermissionNode[];
  }

  /** 权限树响应 */
  export interface PermissionTreeResponse {
    tree: PermissionNode[];
  }

  /** 创建/更新权限请求 */
  export interface PermissionRequest {
    parent_id?: string;
    name: string;
    code: string;
    type: PermissionType;
    path?: string;
    method?: string;
    component?: string;
    icon?: string;
    sort?: number;
    status?: PermissionStatus;
    description?: string;
  }
}

/**
 * 获取权限列表
 */
export async function getPermissionListApi(
  params?: PermissionApi.PermissionListParams,
) {
  return requestClient.get<PermissionApi.PermissionListResponse>(
    '/v1/permissions',
    {
      params,
    },
  );
}

/**
 * 获取权限树
 */
export async function getPermissionTreeApi() {
  return requestClient.get<PermissionApi.PermissionTreeResponse>(
    '/v1/permissions/tree',
  );
}

/**
 * 获取权限详情
 */
export async function getPermissionByIdApi(id: string) {
  return requestClient.get<PermissionApi.Permission>(`/v1/permissions/${id}`);
}

/**
 * 创建权限
 */
export async function createPermissionApi(
  data: PermissionApi.PermissionRequest,
) {
  return requestClient.post<PermissionApi.Permission>('/v1/permissions', data);
}

/**
 * 更新权限
 */
export async function updatePermissionApi(
  id: string,
  data: PermissionApi.PermissionRequest,
) {
  return requestClient.put<{ message: string }>(`/v1/permissions/${id}`, data);
}

/**
 * 删除权限
 */
export async function deletePermissionApi(id: string) {
  return requestClient.delete<{ message: string }>(`/v1/permissions/${id}`);
}
