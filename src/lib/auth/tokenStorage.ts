import { getAuthStrategy } from './authConfig'
import { getMemoryAccessToken, setMemoryAccessToken } from './accessTokenMemory'

/** Legacy key from older builds; removed during clear for backward cleanup only. */
const LEGACY_STORAGE_KEY = 'token'

function clearLegacyLocalStorage(): void {
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}

/**
 * Access token cho `Authorization: Bearer …` khi strategy không phải cookie-only.
 * - `bearer_memory`: chỉ memory
 * - `cookie`: không dùng Bearer từ đây (session HttpOnly do trình duyệt gửi)
 */
export function getAccessToken(): string | null {
  const strategy = getAuthStrategy()
  if (strategy === 'cookie') return null
  return getMemoryAccessToken()
}

export function setAccessToken(token: string): void {
  const strategy = getAuthStrategy()
  if (strategy === 'bearer_memory') {
    setMemoryAccessToken(token)
    clearLegacyLocalStorage()
    return
  }
  // cookie: backend Set-Cookie; không lưu access trong client
}

export function clearAccessToken(): void {
  setMemoryAccessToken(null)
  clearLegacyLocalStorage()
}
