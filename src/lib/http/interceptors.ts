import type { AxiosInstance } from 'axios'
import {
  shouldAttachBearerHeader,
} from '@/lib/auth/authConfig'
import { logout } from '@/lib/auth/authService'
import { normalizeAxiosAuthError } from '@/lib/auth/authErrors'
import { tryRefreshAccessToken } from '@/lib/auth/refreshSession'
import { getAccessToken } from '@/lib/auth/tokenStorage'
import { HTTP_FORBIDDEN, HTTP_UNAUTHORIZED } from './errors'

export function attachAuthRequestInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    (config) => {
      if (shouldAttachBearerHeader()) {
        const token = getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => Promise.reject(error)
  )
}

/** Main app API: unwrap `response.data`; 401 → refresh (nếu cấu hình) hoặc logout + `ApiAuthError`. */
export function attachMainApiResponseInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response.data,
    async (error) => {
      const status = error.response?.status as number | undefined
      const originalRequest = error.config

      if (status === HTTP_UNAUTHORIZED && originalRequest && !originalRequest._authRetry) {
        originalRequest._authRetry = true
        const refreshed = await tryRefreshAccessToken()
        if (refreshed) {
          const token = getAccessToken()
          if (token && shouldAttachBearerHeader()) {
            originalRequest.headers = originalRequest.headers ?? {}
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return instance.request(originalRequest)
        }
        await logout()
        return Promise.reject(normalizeAxiosAuthError(error))
      }

      if (status === HTTP_UNAUTHORIZED) {
        await logout()
        return Promise.reject(normalizeAxiosAuthError(error))
      }

      if (status === HTTP_FORBIDDEN) {
        return Promise.reject(normalizeAxiosAuthError(error))
      }

      return Promise.reject(error)
    }
  )
}

/** Secondary backends: unwrap data only (no auth redirect — caller may handle errors). */
export function attachDataOnlyResponseInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
  )
}
