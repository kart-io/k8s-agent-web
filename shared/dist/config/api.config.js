import axios from 'axios';
export { default as axios } from 'axios';

const DEFAULT_CONFIG = {
  // Base URL for API requests
  baseURL: "/api",
  // Request timeout in milliseconds
  timeout: 3e4,
  // Request headers
  headers: {
    "Content-Type": "application/json"
  },
  // Enable credentials for cross-origin requests
  withCredentials: false
};
const ENV_CONFIGS = {
  development: {
    baseURL: "/api",
    timeout: 3e4
  },
  test: {
    baseURL: "https://test-api.example.com/api",
    timeout: 2e4
  },
  production: {
    baseURL: "https://api.example.com/api",
    timeout: 15e3
  }
};
function getEnvConfig(env = "production") {
  const envConfig = ENV_CONFIGS[env] || ENV_CONFIGS.development;
  return { ...DEFAULT_CONFIG, ...envConfig };
}
function defaultRequestInterceptor(config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.method === "get") {
    config.params = {
      ...config.params,
      _t: Date.now()
    };
  }
  return config;
}
function defaultRequestErrorHandler(error) {
  console.error("[API Request Error]", error);
  return Promise.reject(error);
}
function defaultResponseInterceptor(response) {
  const res = response.data;
  if (res && typeof res === "object") {
    const successCodes = [0, 200, "0", "200"];
    if ("code" in res) {
      if (successCodes.includes(res.code)) {
        return res.data !== void 0 ? res.data : res;
      } else {
        const error = new Error(res.message || "Business logic error");
        error.code = res.code;
        error.response = response;
        return Promise.reject(error);
      }
    }
    return res;
  }
  return response.data;
}
function defaultResponseErrorHandler(error, options = {}) {
  const {
    onUnauthorized,
    onForbidden,
    onNotFound,
    onServerError,
    showMessage
  } = options;
  if (!error.response) {
    const message2 = "Network error, please check your connection";
    if (showMessage)
      showMessage(message2, "error");
    console.error("[Network Error]", error);
    return Promise.reject(error);
  }
  const { status, data } = error.response;
  let message = data?.message || data?.error || error.message || "Request failed";
  switch (status) {
    case 401:
      message = "Authentication failed, please login again";
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      break;
    case 403:
      message = "Access denied";
      if (onForbidden)
        onForbidden();
      break;
    case 404:
      message = "Resource not found";
      if (onNotFound)
        onNotFound();
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message = "Server error, please try again later";
      if (onServerError)
        onServerError();
      break;
  }
  if (showMessage)
    showMessage(message, "error");
  console.error(`[API Error ${status}]`, message, data);
  return Promise.reject(error);
}
function createApiInstance(customConfig = {}, interceptorOptions = {}) {
  const {
    requestInterceptor = defaultRequestInterceptor,
    requestErrorHandler = defaultRequestErrorHandler,
    responseInterceptor = defaultResponseInterceptor,
    responseErrorHandler = defaultResponseErrorHandler
  } = interceptorOptions;
  const config = {
    ...getEnvConfig(),
    ...customConfig
  };
  const instance = axios.create(config);
  instance.interceptors.request.use(
    requestInterceptor,
    requestErrorHandler
  );
  instance.interceptors.response.use(
    responseInterceptor,
    responseErrorHandler
  );
  return instance;
}
const api = createApiInstance();
function createUrl(url, params = {}) {
  const queryString = Object.keys(params).filter((key) => params[key] !== void 0 && params[key] !== null).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
  return queryString ? `${url}?${queryString}` : url;
}
function downloadFile(response, filename) {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
const api_config = {
  DEFAULT_CONFIG,
  ENV_CONFIGS,
  getEnvConfig,
  createApiInstance,
  createUrl,
  downloadFile,
  api,
  axios,
  // Interceptors
  defaultRequestInterceptor,
  defaultRequestErrorHandler,
  defaultResponseInterceptor,
  defaultResponseErrorHandler
};

export { DEFAULT_CONFIG, ENV_CONFIGS, api, createApiInstance, createUrl, api_config as default, defaultRequestErrorHandler, defaultRequestInterceptor, defaultResponseErrorHandler, defaultResponseInterceptor, downloadFile, getEnvConfig };
//# sourceMappingURL=api.config.js.map
