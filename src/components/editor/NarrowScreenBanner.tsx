import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MonitorSmartphone, X } from 'lucide-react'

const DISMISS_KEY = 'narrowScreenBannerDismissed'
export const MIN_EDITOR_LAYOUT_WIDTH_PX = 1180
const NARROW_BREAKPOINT_PX = MIN_EDITOR_LAYOUT_WIDTH_PX

function readInitialDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function readInitialNarrow(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < NARROW_BREAKPOINT_PX
}

/**
 * Warns map-view users when the viewport is below the minimum supported
 * editing width. The banner makes it explicit that mobile users can still
 * inspect sample offices on the map while full editing remains desktop-first.
 * It also offers a one-click roster link plus a dismiss X that sticks
 * per-device via localStorage.
 *
 * Route-gated: the roster itself doesn't need the warning, so we only
 * render on pathnames ending in `/map`.
 */
export function NarrowScreenBanner() {
  // Function initializer avoids setState during render and keeps SSR
  // safe (window guard above). We intentionally do NOT read
  // localStorage in render, since toggling it elsewhere shouldn't
  // force a re-render of unrelated components.
  const [isNarrow, setIsNarrow] = useState<boolean>(() => readInitialNarrow())
  const [dismissed, setDismissed] = useState<boolean>(() => readInitialDismissed())
  const location = useLocation()

  useEffect(() => {
    const onResize = () => {
      setIsNarrow(window.innerWidth < NARROW_BREAKPOINT_PX)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (!location.pathname.endsWith('/map')) return null
  if (!isNarrow || dismissed) return null

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // localStorage can throw in private mode / quota full; the banner
      // still hides for this session via local state.
    }
    setDismissed(true)
  }

  return (
    <div
      className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 text-amber-900 text-sm px-4 py-2 flex items-center gap-3"
      role="status"
      data-editor-min-width={MIN_EDITOR_LAYOUT_WIDTH_PX}
    >
      <MonitorSmartphone size={16} className="flex-shrink-0" />
      <span className="flex-1 min-w-0">
        You can inspect sample offices on mobile, but full editing works best above {MIN_EDITOR_LAYOUT_WIDTH_PX}px.
      </span>
      <Link to="../roster" className="font-medium underline hover:no-underline">
        Open roster
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss narrow-screen warning"
        className="flex-shrink-0 opacity-70 hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  )
}
