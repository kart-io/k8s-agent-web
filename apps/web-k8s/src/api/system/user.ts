import { requestClient } from '#/api/request';

export namespace UserApi {
  /** 用户状态 */
  export enum UserStatus {
    /** 启用 */
    ACTIVE = 1,
    /** 禁用 */
    DISABLED = 0,
  }

  /** 用户信息 */
  export interface User {
    id: string;
    username: string;
    email: string;
    real_name?: string;
    phone?: string;
    avatar?: string;
    status: UserStatus;
    role_ids?: string[];
    created_at: string;
    updated_at: string;
  }

  /** 角色信息 */
  export interface Role {
    id: string;
    name: string;
    code: string;
    description?: string;
    status: number;
    sort: number;
    created_at: string;
    updated_at: string;
  }

  /** 用户详情 */
  export interface UserDetail extends User {
    roles?: Role[];
  }

  /** 用户列表查询参数 */
  export interface UserListParams {
    page?: number;
    page_size?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    status?: UserStatus;
  }

  /** 分页响应 */
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }

  /** 创建用户请求 */
  export interface UserCreateRequest {
    username: string;
    password: string;
    email: string;
    real_name?: string;
    phone?: string;
    avatar?: string;
    role_ids?: string[];
  }

  /** 更新用户请求 */
  export interface UserUpdateRequest {
    email?: string;
    real_name?: string;
    phone?: string;
    avatar?: string;
    status?: UserStatus;
    role_ids?: string[];
  }

  /** 分配角色请求 */
  export interface AssignRolesRequest {
    role_ids: string[];
  }
}

/**
 * 获取用户列表
 */
export async function getUserListApi(params?: UserApi.UserListParams) {
  return requestClient.get<UserApi.PaginatedResponse<UserApi.User>>(
    '/v1/users',
    {
      params,
    },
  );
}

/**
 * 获取用户详情
 */
export async function getUserByIdApi(id: string) {
  return requestClient.get<UserApi.UserDetail>(`/v1/users/${id}`);
}

/**
 * 创建用户
 */
export async function createUserApi(data: UserApi.UserCreateRequest) {
  return requestClient.post<UserApi.User>('/v1/users', data);
}

/**
 * 更新用户
 */
export async function updateUserApi(
  id: string,
  data: UserApi.UserUpdateRequest,
) {
  return requestClient.put<{ message: string }>(`/v1/users/${id}`, data);
}

/**
 * 删除用户
 */
export async function deleteUserApi(id: string) {
  return requestClient.delete<{ message: string }>(`/v1/users/${id}`);
}

/**
 * 分配角色到用户
 */
export async function assignUserRolesApi(
  id: string,
  data: UserApi.AssignRolesRequest,
) {
  return requestClient.post<{ message: string }>(`/v1/users/${id}/roles`, data);
}
