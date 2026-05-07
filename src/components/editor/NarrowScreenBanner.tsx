import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Smartphone, X, MonitorSmartphone } from 'lucide-react'

// Legacy key for migration - was used for dismissing at 1180px
const LEGACY_DISMISS_KEY = 'narrowScreenBannerDismissed'
// New key for mobile guidance at 480px
const MOBILE_DISMISS_KEY = 'mobileEditorBannerDismissed'

// Minimum width for full desktop editing experience
export const MIN_EDITOR_LAYOUT_WIDTH_PX = 1180
// Mobile breakpoint - below this we show compact guidance
export const MOBILE_BREAKPOINT_PX = 480
// Mobile editor range - 480px to 767px supports mobile editor mode

function readDismissed(): boolean {
  try {
    // Check both legacy and new key
    const legacy = localStorage.getItem(LEGACY_DISMISS_KEY)
    const current = localStorage.getItem(MOBILE_DISMISS_KEY)
    // If legacy was dismissed, migrate to new key
    if (legacy === '1' && current === null) {
      localStorage.setItem(MOBILE_DISMISS_KEY, '1')
    }
    return localStorage.getItem(MOBILE_DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < MOBILE_BREAKPOINT_PX
}

function isNarrowViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < MIN_EDITOR_LAYOUT_WIDTH_PX
}

/**
 * Mobile/responsive guidance banner for the map editor.
 *
 * - Below 480px: Shows compact guidance suggesting landscape/tablet mode
 * - 480px-1179px: Shows positive "Mobile editor mode" guidance (dismissible)
 * - 1180px+: No banner (full desktop experience)
 *
 * Route-gated: only renders on pathnames ending in `/map`.
 */
export function NarrowScreenBanner() {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileViewport())
  const [isNarrow, setIsNarrow] = useState<boolean>(() => isNarrowViewport())
  const [dismissed, setDismissed] = useState<boolean>(() => readDismissed())
  const location = useLocation()

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX)
      setIsNarrow(window.innerWidth < MIN_EDITOR_LAYOUT_WIDTH_PX)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (!location.pathname.endsWith('/map')) return null

  // Below 480px: Always show compact guidance (not dismissible - this is a hard limit)
  if (isMobile) {
    return (
      <div
        className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 text-amber-900 text-sm px-4 py-2 flex items-center gap-3"
        role="status"
        data-editor-mobile-breakpoint={MOBILE_BREAKPOINT_PX}
      >
        <Smartphone size={16} className="flex-shrink-0" />
        <span className="flex-1 min-w-0">
          For detailed editing, rotate to landscape or use a tablet/desktop.
        </span>
        <Link to="../roster" className="font-medium underline hover:no-underline">
          Open roster
        </Link>
      </div>
    )
  }

  // 480px-1179px: Show mobile editor mode guidance (dismissible)
  if (isNarrow && !dismissed) {
    const handleDismiss = () => {
      try {
        localStorage.setItem(MOBILE_DISMISS_KEY, '1')
        // Also clear legacy key if it exists
        localStorage.removeItem(LEGACY_DISMISS_KEY)
      } catch {
        // localStorage can throw in private mode / quota full
      }
      setDismissed(true)
    }

    return (
      <div
        className="bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 text-sm px-4 py-2 flex items-center gap-3"
        role="status"
        data-editor-mobile-breakpoint={MOBILE_BREAKPOINT_PX}
      >
        <MonitorSmartphone size={16} className="flex-shrink-0" />
        <span className="flex-1 min-w-0">
          Mobile editor mode enabled. Full editing works best above {MIN_EDITOR_LAYOUT_WIDTH_PX}px.
        </span>
        <Link to="../roster" className="font-medium underline hover:no-underline">
          Open roster
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss mobile editor banner"
          className="flex-shrink-0 opacity-70 hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return null
}
