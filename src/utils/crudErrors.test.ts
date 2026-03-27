import { AxiosError, AxiosHeaders } from 'axios'
import { ApiAuthError, AuthErrorCode } from '@/lib/auth/authErrors'
import { errorMessageFromUnknown, isAntdFormValidationError } from './crudErrors'

// ---------------------------------------------------------------------------
// errorMessageFromUnknown
// ---------------------------------------------------------------------------

describe('errorMessageFromUnknown', () => {
  it('returns formatted message for ApiAuthError', () => {
    const err = new ApiAuthError(AuthErrorCode.UNAUTHORIZED, 'Bad token', 401)
    expect(errorMessageFromUnknown(err)).toBe('Bad token (AUTH_UNAUTHORIZED)')
  })

  it('extracts message from AxiosError response body', () => {
    const err = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 422,
      statusText: 'Unprocessable Entity',
      data: { message: 'Tên đã tồn tại' },
      headers: {},
      config: { headers: new AxiosHeaders() },
    })
    expect(errorMessageFromUnknown(err)).toBe('Tên đã tồn tại')
  })

  it('falls back to statusText when body has no message', () => {
    const err = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 500,
      statusText: 'Internal Server Error',
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    })
    expect(errorMessageFromUnknown(err)).toBe('Internal Server Error')
  })

  it('falls back to HTTP status code when statusText is empty', () => {
    const err = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 504,
      statusText: '',
      data: null,
      headers: {},
      config: { headers: new AxiosHeaders() },
    })
    expect(errorMessageFromUnknown(err)).toBe('HTTP 504')
  })

  it('uses AxiosError.message for network errors (no response)', () => {
    const err = new AxiosError('Network Error', 'ERR_NETWORK')
    expect(errorMessageFromUnknown(err)).toBe('Network Error')
  })

  it('returns Error.message for plain Error', () => {
    expect(errorMessageFromUnknown(new Error('something broke'))).toBe('something broke')
  })

  it('stringifies non-Error values', () => {
    expect(errorMessageFromUnknown('string error')).toBe('string error')
    expect(errorMessageFromUnknown(42)).toBe('42')
    expect(errorMessageFromUnknown(null)).toBe('null')
  })

  it('prioritises ApiAuthError over AxiosError check', () => {
    const err = new ApiAuthError(AuthErrorCode.SESSION_EXPIRED, 'Session expired', 401)
    // ApiAuthError is also an Error, ensure branch order is correct
    expect(errorMessageFromUnknown(err)).toBe('Session expired (AUTH_SESSION_EXPIRED)')
  })
})

// ---------------------------------------------------------------------------
// isAntdFormValidationError
// ---------------------------------------------------------------------------

describe('isAntdFormValidationError', () => {
  it('returns true for objects with errorFields array', () => {
    expect(isAntdFormValidationError({ errorFields: [{ name: ['x'], errors: ['req'] }] })).toBe(true)
  })

  it('returns false for plain Error', () => {
    expect(isAntdFormValidationError(new Error('fail'))).toBe(false)
  })

  it('returns false for null / undefined / primitives', () => {
    expect(isAntdFormValidationError(null)).toBe(false)
    expect(isAntdFormValidationError(undefined)).toBe(false)
    expect(isAntdFormValidationError('string')).toBe(false)
  })

  it('returns false when errorFields is not an array', () => {
    expect(isAntdFormValidationError({ errorFields: 'not-array' })).toBe(false)
  })
})
