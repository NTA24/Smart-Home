/**
 * `cookie` — Session via HttpOnly (+ Secure / SameSite do backend set). Client sends `credentials`;
 *   không gắn Bearer từ JS.
 * `bearer_memory` — Access token chỉ trong memory; refresh cookie qua `VITE_AUTH_REFRESH_PATH` (POST + credentials).
 */
export type AuthStrategy = 'cookie' | 'bearer_memory'

export function getAuthStrategy(): AuthStrategy {
  const v = import.meta.env.VITE_AUTH_STRATEGY as string | undefined
  if (v === 'cookie' || v === 'bearer_memory') return v
  // Secure default: never fall back to localStorage strategy.
  return 'bearer_memory'
}

/** Gửi cookie (SameSite session / refresh) với request same-site hoặc CORS đã cấu hình credentials. */
export function shouldSendCredentials(): boolean {
  if (import.meta.env.VITE_API_WITH_CREDENTIALS === 'true') return true
  const s = getAuthStrategy()
  return s === 'cookie' || s === 'bearer_memory'
}

/** POST path (relative to `VITE_API_URL`) để đổi refresh cookie lấy access token mới (chỉ `bearer_memory`). */
export function getAuthRefreshPath(): string | null {
  const p = (import.meta.env.VITE_AUTH_REFRESH_PATH as string | undefined)?.trim()
  if (p) return p.replace(/^\//, '')
  // Safe default for common backend convention.
  return getAuthStrategy() === 'bearer_memory' ? 'auth/refresh' : null
}

/** POST path (relative to `VITE_API_URL`) to invalidate refresh/session cookie on logout. */
export function getAuthLogoutPath(): string | null {
  const p = (import.meta.env.VITE_AUTH_LOGOUT_PATH as string | undefined)?.trim()
  if (p) return p.replace(/^\//, '')
  return 'auth/logout'
}

export function shouldAttachBearerHeader(): boolean {
  const s = getAuthStrategy()
  return s === 'bearer_memory'
}
