import { useCallback, useEffect, useRef, useState } from 'react'
import {
  normalizeNorthRotation,
  useCanvasStore,
} from '../../../stores/canvasStore'
import { useUIStore } from '../../../stores/uiStore'
import { useCan } from '../../../hooks/useCan'

/**
 * Floating north-arrow compass pinned to the top-left of the canvas.
 * Drag (or arrow-key) to rotate so a floor plan can be aligned with
 * real-world cardinal directions for wayfinding. The rotation lives on
 * `useCanvasStore.settings.northRotation`, defaulting to 0 (N up) for
 * older projects where the field is absent.
 *
 * Hidden in presentation mode. Read-only when the viewer can't edit the
 * map (no `slider` semantics, no drag) — the compass still renders so
 * the orientation is visible, just not adjustable.
 */
export function NorthArrow() {
  const presentationMode = useUIStore((s) => s.presentationMode)
  const northRotationRaw = useCanvasStore((s) => s.settings.northRotation)
  const northRotation = normalizeNorthRotation(northRotationRaw)
  const setSettings = useCanvasStore((s) => s.setSettings)
  const canEdit = useCan('editMap')
  const ref = useRef<HTMLDivElement>(null)
  const dragPointerIdRef = useRef<number | null>(null)
  const [dragging, setDragging] = useState(false)

  const stopDragging = useCallback(() => {
    const pointerId = dragPointerIdRef.current
    dragPointerIdRef.current = null
    const el = ref.current
    if (el && pointerId !== null && el.hasPointerCapture(pointerId)) {
      try {
        el.releasePointerCapture(pointerId)
      } catch {
        // Ignore release races (already released/unmounted).
      }
    }
    setDragging(false)
  }, [])

  // Self-heal legacy/corrupted payload values so autosave persists the
  // canonical [0, 360) heading after the first map render.
  useEffect(() => {
    if (northRotationRaw === undefined) return
    const normalized = normalizeNorthRotation(northRotationRaw)
    if (normalized !== northRotationRaw) {
      setSettings({ northRotation: normalized })
    }
  }, [northRotationRaw, setSettings])

  // Drag-to-rotate. We compute the angle from the centre of the compass to
  // the cursor on every pointermove; the visible needle plus the persisted
  // setting both follow in real time. Pointer-capture isn't strictly
  // required since we listen on `window` while dragging, but it keeps the
  // browser cursor consistent across sub-pixel hovers off the element.
  useEffect(() => {
    if (!dragging) return
    const el = ref.current
    if (!el) return

    const handleMove = (e: PointerEvent) => {
      const pointerId = dragPointerIdRef.current
      if (pointerId !== null && e.pointerId !== pointerId) return

      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      // atan2 returns radians measured from +x axis. We want degrees from
      // "up" (the visible N direction at rotation 0). Up is -y, so add 90°
      // to align, then normalize to [0, 360).
      const deg = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360
      setSettings({ northRotation: deg })
    }
    const handleUp = (e: PointerEvent) => {
      const pointerId = dragPointerIdRef.current
      if (pointerId !== null && e.pointerId !== pointerId) return
      stopDragging()
    }
    const handleVisibilityChange = () => {
      if (document.hidden) stopDragging()
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
    window.addEventListener('blur', stopDragging)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
      window.removeEventListener('blur', stopDragging)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [dragging, setSettings, stopDragging])

  if (presentationMode) return null

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canEdit) return
    e.preventDefault()
    dragPointerIdRef.current = e.pointerId
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Pointer capture can fail on detached nodes; dragging still works.
    }
    setDragging(true)
  }

  const rotateBy = (delta: number) => {
    if (!canEdit) return
    const current = normalizeNorthRotation(
      useCanvasStore.getState().settings.northRotation,
    )
    setSettings({ northRotation: normalizeNorthRotation(current + delta) })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!canEdit) return
    const current = normalizeNorthRotation(
      useCanvasStore.getState().settings.northRotation,
    )
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      setSettings({ northRotation: normalizeNorthRotation(current - 5) })
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      setSettings({ northRotation: normalizeNorthRotation(current + 5) })
    } else if (e.key === 'Home') {
      e.preventDefault()
      setSettings({ northRotation: 0 })
    }
  }

  return (
    <div
      ref={ref}
      data-testid="north-arrow"
      data-compass-anchor="top-right-offset"
      className={`absolute top-14 right-4 z-20 w-20 rounded border border-gray-300 bg-white/95 shadow-md backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      onPointerDown={handlePointerDown}
      aria-label={`Compass controls. North arrow rotated ${Math.round(northRotation)} degrees.${canEdit ? ' Drag, use buttons, or use arrow keys to rotate.' : ''}`}
      role="group"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600 dark:border-gray-800 dark:text-gray-300">
        <span>N</span>
        <span className="tabular-nums">{Math.round(northRotation)}°</span>
      </div>
      <div
        className="flex h-10 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        onKeyDown={handleKeyDown}
        aria-label={`North arrow rotated ${Math.round(northRotation)} degrees`}
        role={canEdit ? 'slider' : undefined}
        aria-valuenow={canEdit ? Math.round(northRotation) : undefined}
        aria-valuemin={canEdit ? 0 : undefined}
        aria-valuemax={canEdit ? 360 : undefined}
        tabIndex={canEdit ? 0 : -1}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 32 32"
          style={{ transform: `rotate(${northRotation}deg)` }}
          className="transition-transform"
          aria-hidden
        >
          <polygon points="16,3 11,18 16,15 21,18" className="fill-red-600" />
          <polygon points="16,29 11,14 16,17 21,14" className="fill-gray-500 dark:fill-gray-500" />
          <circle cx="16" cy="16" r="2.25" className="fill-white stroke-gray-600 dark:fill-gray-900 dark:stroke-gray-300" />
        </svg>
      </div>
      {canEdit && (
        <div className="grid grid-cols-3 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => rotateBy(-15)}
            className="h-7 text-xs font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Rotate compass counterclockwise"
            title="Rotate counterclockwise"
          >
            -15
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setSettings({ northRotation: 0 })}
            className="h-7 border-x border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Reset compass north"
            title="Reset north"
          >
            0
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => rotateBy(15)}
            className="h-7 text-xs font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Rotate compass clockwise"
            title="Rotate clockwise"
          >
            +15
          </button>
        </div>
      )}
    </div>
  )
}
