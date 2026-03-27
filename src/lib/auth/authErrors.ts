import axios from 'axios'

/** Mã lỗi ổn định cho UI / logging (không phụ thuộc message tiếng Anh từ server). */
export const AuthErrorCode = {
  UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  FORBIDDEN: 'AUTH_FORBIDDEN',
  SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
} as const

export type AuthErrorCodeValue = (typeof AuthErrorCode)[keyof typeof AuthErrorCode]

export class ApiAuthError extends Error {
  readonly name = 'ApiAuthError'

  constructor(
    public readonly code: AuthErrorCodeValue,
    message: string,
    public readonly httpStatus: number,
    public readonly raw?: unknown
  ) {
    super(message)
  }
}

function readBodyCode(data: unknown): string | undefined {
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    const c = o.code ?? o.error ?? o.error_code
    return typeof c === 'string' ? c : undefined
  }
  return undefined
}

const SESSION_EXPIRED_HINTS = new Set([
  'AUTH_SESSION_EXPIRED',
  'session_expired',
  'token_expired',
  'TOKEN_EXPIRED',
])

/**
 * Chuẩn hóa 401/403 thành `ApiAuthError`. Các lỗi khác trả về nguyên `error`.
 */
export function normalizeAxiosAuthError(error: unknown): unknown {
  if (!axios.isAxiosError(error) || !error.response) return error

  const status = error.response.status
  const data = error.response.data
  const bodyCode = readBodyCode(data)
  const msg =
    (data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string'
      ? (data as { message: string }).message
      : undefined) || error.message

  if (status === 401) {
    const code =
      bodyCode && SESSION_EXPIRED_HINTS.has(bodyCode)
        ? AuthErrorCode.SESSION_EXPIRED
        : AuthErrorCode.UNAUTHORIZED
    return new ApiAuthError(code, msg || 'Unauthorized', 401, error)
  }

  if (status === 403) {
    return new ApiAuthError(AuthErrorCode.FORBIDDEN, msg || 'Forbidden', 403, error)
  }

  return error
}

export function isApiAuthError(e: unknown): e is ApiAuthError {
  return e instanceof ApiAuthError
}
