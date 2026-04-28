import { useCallback, useEffect, useRef, useState } from 'react'
import {
  normalizeNorthRotation,
  useCanvasStore,
} from '../../../stores/canvasStore'
import { useUIStore } from '../../../stores/uiStore'
import { useCan } from '../../../hooks/useCan'

/**
 * Floating north-arrow compass pinned to the top-right of the canvas.
 * Drag (or arrow-key) to rotate so a floor plan can be aligned with
 * real-world cardinal directions for wayfinding.
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

  // Self-heal legacy/corrupted payload values
  useEffect(() => {
    if (northRotationRaw === undefined) return
    const normalized = normalizeNorthRotation(northRotationRaw)
    if (normalized !== northRotationRaw) {
      setSettings({ northRotation: normalized })
    }
  }, [northRotationRaw, setSettings])

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
      // Pointer capture can fail on detached nodes
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

  const degLabel = Math.round(northRotation)

  return (
    <div
      ref={ref}
      data-testid="north-arrow"
      data-compass-anchor="top-right-offset"
      className={`absolute top-14 right-4 z-20 select-none ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      onPointerDown={handlePointerDown}
      aria-label={`Compass controls. North arrow rotated ${degLabel} degrees.${canEdit ? ' Drag, use buttons, or use arrow keys to rotate.' : ''}`}
      role="group"
    >
      {/* Compass circle */}
      <div
        className="relative w-16 h-16 rounded-full shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)',
          border: '2px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Cardinal direction labels */}
        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-600 tracking-wider">N</span>
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-gray-400">S</span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-semibold text-gray-400">W</span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-semibold text-gray-400">E</span>

        {/* Needle SVG */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-150"
          style={{ transform: `rotate(${northRotation}deg)` }}
          onKeyDown={handleKeyDown}
          role={canEdit ? 'slider' : undefined}
          aria-valuenow={canEdit ? degLabel : undefined}
          aria-valuemin={canEdit ? 0 : undefined}
          aria-valuemax={canEdit ? 360 : undefined}
          tabIndex={canEdit ? 0 : -1}
          aria-label={`North arrow rotated ${degLabel} degrees`}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
            {/* North half (red) */}
            <polygon
              points="18,4 14,17 18,15 22,17"
              fill="url(#northGrad)"
            />
            {/* South half (dark) */}
            <polygon
              points="18,32 14,19 18,21 22,19"
              fill="url(#southGrad)"
            />
            {/* Center dot */}
            <circle cx="18" cy="18" r="2.5" fill="#fff" stroke="#475569" strokeWidth="1.2" />
            <defs>
              <linearGradient id="northGrad" x1="18" y1="4" x2="18" y2="17" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="southGrad" x1="18" y1="19" x2="18" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Degree readout pill */}
      <div
        className="mt-1 mx-auto w-fit rounded-full px-2 py-0.5 text-[9px] font-bold tabular-nums text-gray-600 dark:text-gray-300"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        {degLabel}°
      </div>

      {/* Quick rotation buttons */}
      {canEdit && (
        <div className="mt-1 flex items-center justify-center gap-0.5">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => rotateBy(-15)}
            className="h-5 w-7 rounded text-[9px] font-semibold text-gray-500 hover:bg-white/80 hover:text-gray-700 transition-colors"
            style={{ backdropFilter: 'blur(4px)' }}
            aria-label="Rotate compass counterclockwise"
            title="Rotate counterclockwise"
          >
            -15
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setSettings({ northRotation: 0 })}
            className="h-5 w-7 rounded text-[9px] font-bold text-gray-600 hover:bg-white/80 hover:text-gray-900 transition-colors"
            style={{ backdropFilter: 'blur(4px)' }}
            aria-label="Reset compass north"
            title="Reset north"
          >
            0
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => rotateBy(15)}
            className="h-5 w-7 rounded text-[9px] font-semibold text-gray-500 hover:bg-white/80 hover:text-gray-700 transition-colors"
            style={{ backdropFilter: 'blur(4px)' }}
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
