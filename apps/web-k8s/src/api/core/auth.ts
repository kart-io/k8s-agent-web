import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    username: string;
    password: string;
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

  /** 用户信息 */
  export interface UserInfo {
    id: string;
    username: string;
    email: string;
    real_name: string;
    avatar: string;
    roles: Role[];
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    token: string;
    jti: string;
    expires_at: string;
    user: UserInfo;
    // For backward compatibility, map token to accessToken
    accessToken?: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const response = await requestClient.post<AuthApi.LoginResult>(
    '/v1/auth/login',
    data,
  );
  // Map token to accessToken for backward compatibility
  if (response && response.token) {
    response.accessToken = response.token;
  }
  return response;
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>(
    '/v1/auth/refresh',
    {
      withCredentials: true,
    },
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/v1/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/v1/auth/codes');
}
