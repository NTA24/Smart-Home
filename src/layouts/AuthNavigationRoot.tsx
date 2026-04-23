import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { registerAuthNavigate } from '@/lib/auth/authRedirect'
import { getAuthStrategy, tryRefreshAccessToken } from '@/lib/auth'

/**
 * Registers `navigate` for 401 handling so logout uses SPA navigation instead of a full page load.
 */
export default function AuthNavigationRoot() {
  const navigate = useNavigate()
  useEffect(() => {
    registerAuthNavigate((to) => {
      navigate(to, { replace: true })
    })
    return () => {
      registerAuthNavigate(null)
    }
  }, [navigate])

  useEffect(() => {
    // Warm token early for bearer_memory strategy to reduce first-request 401.
    if (getAuthStrategy() === 'bearer_memory') {
      void tryRefreshAccessToken()
    }
  }, [])

  return <Outlet />
}
