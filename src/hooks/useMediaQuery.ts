import { useState, useEffect } from 'react'

/**
 * Match a CSS media query. Updates when window is resized.
 * @param query e.g. '(max-width: 991px)' for mobile
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const m = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(m.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** True when viewport width < 992px (sidebar collapses to drawer) */
export const MOBILE_BREAKPOINT = '(max-width: 991px)'
