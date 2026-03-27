/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Required — validated in `src/lib/config/appEnv.ts` */
  readonly VITE_API_URL: string
  readonly VITE_CHAT_AI_URL: string
  readonly VITE_THINGSBOARD_URL: string
  readonly VITE_THINGSBOARD_API_KEY?: string
  readonly VITE_AUTH_STRATEGY?: string
  readonly VITE_API_WITH_CREDENTIALS?: string
  readonly VITE_AUTH_REFRESH_PATH?: string
  readonly VITE_AUTH_LOGOUT_PATH?: string
  readonly VITE_DEV_PROXY_API_TARGET?: string
  readonly VITE_DEV_PROXY_CAMERA_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
