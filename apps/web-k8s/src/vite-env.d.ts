/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_NAMESPACE: string;
  readonly VITE_GLOB_API_URL: string;
  readonly VITE_NITRO_MOCK: string;
  readonly VITE_MAIN_APP_URL: string;
  readonly VITE_AUTH_APP_URL: string;
  readonly VITE_PORT: string;
  readonly VITE_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
