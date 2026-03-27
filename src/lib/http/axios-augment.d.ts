import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Set by auth interceptor to avoid infinite refresh loops */
    _authRetry?: boolean
  }
}
