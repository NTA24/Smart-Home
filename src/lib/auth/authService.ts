import { redirectToLogin } from './authRedirect'
import { clearAccessToken } from './tokenStorage'
import { refreshClient } from '@/lib/http/refreshClient'
import { getAuthLogoutPath } from './authConfig'

/**
 * Đăng xuất: gọi `POST` logout phía server (nếu `VITE_AUTH_LOGOUT_PATH` có) để xóa cookie HttpOnly,
 * sau đó xóa state client và điều hướng SPA tới `/login` (không dùng `window.location.href` khi router đã đăng ký).
 */
export async function logout(): Promise<void> {
  const path = getAuthLogoutPath()
  if (path) {
    try {
      await refreshClient.post(`/${path}`, {})
    } catch {
      // Vẫn xóa client state dù server lỗi mạng
    }
  }
  clearAccessToken()
  redirectToLogin()
}
