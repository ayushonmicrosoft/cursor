import { useEffect, useRef, useState } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { prefersReducedMotion } from '../../lib/prefersReducedMotion'
import { usePresentationShortcuts } from '../../hooks/usePresentationShortcuts'

/**
 * Wave 11B: presentation-mode chrome.
 *
 * Owns three pieces of UI that only matter while `presentationMode === true`:
 *
 * 1. A bottom-right "Presentation · Esc to exit" pill — quiet (70% opacity)
 *    by default, fades to full opacity on mouse move and back after 1.5s,
 *    so the presenter has a reminder when they fidget but it doesn't
 *    distract from the floor plan during a static demo.
 *
 * 2. A top-right `×` exit button. Same fade-on-mouse-move behavior as the
 *    pill, but additionally only revealed when the cursor is near the
 *    top-right corner — so it doesn't sit on top of the canvas as
 *    permanent visual debt.
 *
 * 3. Browser fullscreen API integration: requesting fullscreen on entry,
 *    exiting fullscreen on exit, and listening for the user exiting
 *    fullscreen via Esc / browser chrome to keep our state in sync.
 *
 * Reduced-motion users get nothing decorative — the indicator and exit
 * button are hidden entirely (Esc and the standard P shortcut still work,
 * which we surface elsewhere via the toast when first entering).
 *
 * Mounted once from `MapView`, but only does anything when presentation
 * mode is on. Returns `null` outside presentation mode so the canvas
 * isn't paying for fade-timer refs while in normal editing.
 */
export function PresentationOverlay() {
  usePresentationShortcuts()

  const presentationMode = useUIStore((s) => s.presentationMode)
  const setPresentationMode = useUIStore((s) => s.setPresentationMode)

  // Fullscreen API. When entering presentation mode, request fullscreen;
  // when leaving, exit fullscreen if we're still in it.
  useEffect(() => {
    if (typeof document === 'undefined') return

    if (presentationMode) {
      try {
        const req = document.documentElement.requestFullscreen?.()
        if (req && typeof req.catch === 'function') req.catch(() => {})
      } catch {
        /* ignore */
      }
    } else if (document.fullscreenElement) {
      try {
        const exit = document.exitFullscreen?.()
        if (exit && typeof exit.catch === 'function') exit.catch(() => {})
      } catch {
        /* ignore */
      }
    }
  }, [presentationMode])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const handler = () => {
      if (!document.fullscreenElement && useUIStore.getState().presentationMode) {
        useUIStore.getState().setPresentationMode(false)
      }
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  if (!presentationMode) return null

  return <PresentationOverlayContent onExit={() => setPresentationMode(false)} />
}

function PresentationOverlayContent({ onExit }: { onExit: () => void }) {
  const reduceMotion = prefersReducedMotion()
  const [active, setActive] = useState(false)
  const [cursorNearTopRight, setCursorNearTopRight] = useState(false)
  const [showHint] = useState(() => {
    if (typeof localStorage === 'undefined') return false
    const seen = localStorage.getItem('floorcraft.presentationHintSeen') === '1'
    if (!seen) localStorage.setItem('floorcraft.presentationHintSeen', '1')
    return !seen
  })
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (reduceMotion) return
    const handler = (e: PointerEvent) => {
      setActive(true)
      const w = window.innerWidth
      setCursorNearTopRight(e.clientX > w - 200 && e.clientY < 200)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = setTimeout(() => {
        setActive(false)
        setCursorNearTopRight(false)
      }, 1500)
    }
    window.addEventListener('pointermove', handler)
    return () => {
      window.removeEventListener('pointermove', handler)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [reduceMotion])

  if (reduceMotion) {
    return (
      <div aria-live="polite" className="contents">
        <button
          onClick={onExit}
          className="fixed top-4 right-4 z-[60] sr-only focus:not-sr-only focus:px-3 focus:py-2 focus:rounded-md focus:bg-gray-900 focus:text-white focus:text-sm focus:font-medium focus:shadow-lg"
          aria-label="Exit presentation mode"
        >
          Exit presentation mode
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        role="status"
        aria-label="Presentation mode"
        className={`fixed bottom-4 right-4 z-[60] pointer-events-none px-3 py-1.5 rounded-full bg-gray-900/80 text-white text-xs font-medium shadow-lg backdrop-blur-sm transition-opacity duration-300 ${
          active ? 'opacity-100' : 'opacity-70'
        }`}
      >
        <span className="text-gray-200">Presentation</span>
        <span className="mx-1.5 text-gray-500">·</span>
        <span className="text-gray-300">Esc to exit</span>
        {showHint && (
          <span className="ml-2 text-gray-300">Use ←/→ to switch floors</span>
        )}
      </div>

      <button
        onClick={onExit}
        className={`fixed top-4 right-4 z-[60] w-9 h-9 rounded-full bg-gray-900/80 hover:bg-gray-900 text-white text-base shadow-lg backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          cursorNearTopRight || active ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Exit presentation mode"
        title="Exit presentation mode (Esc)"
      >
        <span aria-hidden="true">×</span>
      </button>
    </>
  )
}
