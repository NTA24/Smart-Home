/**
 * Fail-fast env: không bundle URL production làm default.
 * Thiếu biến → throw khi module load (rõ ràng trước khi render).
 */
function mustSet(name: keyof ImportMetaEnv): string {
  const v = import.meta.env[name]
  if (typeof v !== 'string' || v.trim() === '') {
    throw new Error(
      `[config] Missing ${String(name)}. Copy .env.example to .env.local (or .env.development.local) and set values for your environment. Production URLs must not be implicit defaults in source.`
    )
  }
  return v.trim()
}

/** Base URL cho Axios app API (vd. https://api.example.com/api hoặc /api khi dev + proxy). */
export const APP_API_BASE_URL = mustSet('VITE_API_URL')

/** Host campus IoT / chat / parking (không có slash cuối). */
export const CAMPUS_IOT_BASE_URL = mustSet('VITE_CHAT_AI_URL').replace(/\/$/, '')

/** ThingsBoard REST origin (không có slash cuối). */
export const THINGSBOARD_BASE_URL = mustSet('VITE_THINGSBOARD_URL').replace(/\/$/, '')
