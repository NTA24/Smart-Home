import axios from 'axios'
import { isApiAuthError } from '@/lib/auth/authErrors'

/** Ant Design Form.validateFields() rejects với object có `errorFields`. */
export function isAntdFormValidationError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'errorFields' in e &&
    Array.isArray((e as { errorFields?: unknown }).errorFields)
  )
}

export function errorMessageFromUnknown(err: unknown): string {
  if (isApiAuthError(err)) {
    return `${err.message} (${err.code})`
  }
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined
    if (data?.message && typeof data.message === 'string') return data.message
    if (err.response?.status) return err.response.statusText || `HTTP ${err.response.status}`
    return err.message
  }
  if (err instanceof Error) return err.message
  return String(err)
}
