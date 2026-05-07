import { useState, useEffect } from 'react'

/**
 * Returns the current window width, updating on resize.
 * Defaults to 1024 for SSR safety.
 */
export function useWindowSize() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  )

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return { width }
}
