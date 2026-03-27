import { getAuthRefreshPath, getAuthStrategy } from './authConfig'
import { refreshClient } from '@/lib/http/refreshClient'
import { setAccessToken } from './tokenStorage'

let inFlight: Promise<boolean> | null = null

/**
 * POST refresh (credentials) — backend đặt refresh token HttpOnly; trả access token JSON nếu có.
 * Hỗ trợ `access_token` | `accessToken` trong body.
 */
export async function tryRefreshAccessToken(): Promise<boolean> {
  if (getAuthStrategy() !== 'bearer_memory') return false

  const path = getAuthRefreshPath()
  if (!path) return false

  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      const { data } = await refreshClient.post<Record<string, unknown>>(`/${path}`, {})
      const raw = data as Record<string, unknown>
      const token =
        typeof raw.access_token === 'string'
          ? raw.access_token
          : typeof raw.accessToken === 'string'
            ? raw.accessToken
            : null
      if (token) {
        setAccessToken(token)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}
