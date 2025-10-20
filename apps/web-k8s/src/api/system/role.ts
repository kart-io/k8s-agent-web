import { requestClient } from '#/api/request';

export namespace RoleApi {
  /** 角色状态 */
  export enum RoleStatus {
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
    type: 'api' | 'button' | 'menu';
    path?: string;
    method?: string;
    component?: string;
    icon?: string;
    sort: number;
    status: number;
    description?: string;
    created_at: string;
    updated_at: string;
  }

  /** 角色信息 */
  export interface Role {
    id: string;
    name: string;
    code: string;
    description?: string;
    status: RoleStatus;
    sort: number;
    created_at: string;
    updated_at: string;
  }

  /** 角色列表响应 */
  export interface RoleListResponse {
    items: Role[];
  }

  /** 角色详情 */
  export interface RoleDetail extends Role {
    permissions?: Permission[];
  }

  /** 创建/更新角色请求 */
  export interface RoleRequest {
    name: string;
    code: string;
    description?: string;
    status?: RoleStatus;
    sort?: number;
  }

  /** 分配权限请求 */
  export interface AssignPermissionsRequest {
    permission_ids: string[];
  }

  /** 权限列表响应 */
  export interface PermissionsResponse {
    permissions: Permission[];
  }
}

/**
 * 获取角色列表
 */
export async function getRoleListApi() {
  return requestClient.get<RoleApi.RoleListResponse>('/v1/roles');
}

/**
 * 获取角色详情
 */
export async function getRoleByIdApi(id: string) {
  return requestClient.get<RoleApi.Role>(`/v1/roles/${id}`);
}

/**
 * 创建角色
 */
export async function createRoleApi(data: RoleApi.RoleRequest) {
  return requestClient.post<RoleApi.Role>('/v1/roles', data);
}

/**
 * 更新角色
 */
export async function updateRoleApi(id: string, data: RoleApi.RoleRequest) {
  return requestClient.put<{ message: string }>(`/v1/roles/${id}`, data);
}

/**
 * 删除角色
 */
export async function deleteRoleApi(id: string) {
  return requestClient.delete<{ message: string }>(`/v1/roles/${id}`);
}

/**
 * 分配权限到角色
 */
export async function assignRolePermissionsApi(
  id: string,
  data: RoleApi.AssignPermissionsRequest,
) {
  return requestClient.post<{ message: string }>(
    `/v1/roles/${id}/permissions`,
    data,
  );
}

/**
 * 获取角色的权限列表
 */
export async function getRolePermissionsApi(id: string) {
  return requestClient.get<RoleApi.PermissionsResponse>(
    `/v1/roles/${id}/permissions`,
  );
}
