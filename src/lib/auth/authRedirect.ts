import { LOGIN_PATH } from './paths'

type NavigateFn = (to: string) => void

let registeredNavigate: NavigateFn | null = null
let redirectScheduled = false
let pendingRedirectPath: string | null = null

export function registerAuthNavigate(navigate: NavigateFn | null): void {
  registeredNavigate = navigate
  if (registeredNavigate && pendingRedirectPath) {
    const to = pendingRedirectPath
    pendingRedirectPath = null
    registeredNavigate(to)
  }
}

/**
 * Router-aware navigation to login (when `registerAuthNavigate` was called from inside the router tree).
 * If router is not mounted yet, queue redirect and flush when `registerAuthNavigate` is called.
 */
export function redirectToLogin(): void {
  if (typeof window !== 'undefined' && window.location.pathname === LOGIN_PATH) {
    return
  }
  if (redirectScheduled) return
  redirectScheduled = true
  const schedule = typeof window !== 'undefined' ? window.setTimeout : setTimeout
  schedule(() => {
    redirectScheduled = false
  }, 1500)

  if (registeredNavigate) {
    registeredNavigate(LOGIN_PATH)
  } else {
    pendingRedirectPath = LOGIN_PATH
  }
}
