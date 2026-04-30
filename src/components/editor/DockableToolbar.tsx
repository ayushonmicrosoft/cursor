import { GripVertical, Pin, Undo2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import {
  DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS,
  useUIStore,
  type DockableToolbarId,
} from '../../stores/uiStore'

interface DockableToolbarProps {
  id: DockableToolbarId
  title: string
  dockedClassName: string
  dockedStyle?: CSSProperties
  className?: string
  children: ReactNode
}

/**
 * Shared chrome for the editor's floating toolbars. A toolbar has two
 * states:
 *
 *  - docked: the component chooses its canonical anchor point via
 *    `dockedClassName` / `dockedStyle`
 *  - floating: the user drags it around the canvas chrome area using the
 *    grip in the header
 *
 * Position persists in UI store + localStorage, so operators can arrange
 * the editor once and keep that layout on refresh.
 */

export function DockableToolbar({
  id,
  title,
  dockedClassName,
  dockedStyle,
  className = '',
  children,
}: DockableToolbarProps) {
  const layout = useUIStore((s) => s.dockableToolbarLayouts[id])
  const visible = useUIStore((s) => s.dockableToolbarVisibility[id] ?? true)
  const setMode = useUIStore((s) => s.setDockableToolbarMode)
  const setPosition = useUIStore((s) => s.setDockableToolbarPosition)
  const resetLayout = useUIStore((s) => s.resetDockableToolbarLayout)
  const setVisible = useUIStore((s) => s.setDockableToolbarVisible)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const pointerUpListenerRef = useRef<(e: PointerEvent) => void>(() => {})

  const dragStateRef = useRef<{
    pointerId: number | null
    startPointerX: number
    startPointerY: number
    startX: number
    startY: number
  }>({
    pointerId: null,
    startPointerX: 0,
    startPointerY: 0,
    startX: 0,
    startY: 0,
  })

  const clampToHost = useCallback((nextX: number, nextY: number) => {
    const root = rootRef.current
    const host = root?.closest('[data-canvas-toolbar-host]') as HTMLElement | null
    if (!root || !host) return { x: nextX, y: nextY }

    const hostRect = host.getBoundingClientRect()
    const rootRect = root.getBoundingClientRect()
    const maxX = Math.max(0, hostRect.width - rootRect.width)
    const maxY = Math.max(0, hostRect.height - rootRect.height)
    return {
      x: Math.min(Math.max(0, nextX), maxX),
      y: Math.min(Math.max(0, nextY), maxY),
    }
  }, [])

  const handleWindowPointerMove = useCallback((e: PointerEvent) => {
    const drag = dragStateRef.current
    if (drag.pointerId !== e.pointerId) return
    const deltaX = e.clientX - drag.startPointerX
    const deltaY = e.clientY - drag.startPointerY
    const next = clampToHost(drag.startX + deltaX, drag.startY + deltaY)
    setPosition(id, next)
  }, [clampToHost, id, setPosition])

  const handleWindowPointerUp = useCallback((e: PointerEvent) => {
    const drag = dragStateRef.current
    if (drag.pointerId !== e.pointerId) return
    drag.pointerId = null
    window.removeEventListener('pointermove', handleWindowPointerMove)
    window.removeEventListener('pointerup', pointerUpListenerRef.current)
  }, [handleWindowPointerMove])

  useEffect(() => {
    pointerUpListenerRef.current = handleWindowPointerUp
  }, [handleWindowPointerUp])

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
    }
  }, [handleWindowPointerMove, handleWindowPointerUp])

  const startFloatingFromCurrentPosition = () => {
    const root = rootRef.current
    const host = root?.closest('[data-canvas-toolbar-host]') as HTMLElement | null
    if (root && host) {
      const rootRect = root.getBoundingClientRect()
      const hostRect = host.getBoundingClientRect()
      const next = clampToHost(rootRect.left - hostRect.left, rootRect.top - hostRect.top)
      setPosition(id, next)
    } else {
      setPosition(id, DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS[id].position)
    }
    setMode(id, 'floating')
  }

  const handleDragStart = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (layout.mode !== 'floating') return
    dragStateRef.current = {
      pointerId: e.pointerId,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: layout.position.x,
      startY: layout.position.y,
    }
    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', pointerUpListenerRef.current)
  }

  const containerClassName =
    `absolute z-20 max-w-[calc(100%-1rem)] overflow-hidden rounded-xl border border-gray-300 bg-white/96 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/96 ${className}`.trim()

  const positioning =
    layout.mode === 'docked'
      ? { className: dockedClassName, style: dockedStyle }
      : {
          className: '',
          style: { left: layout.position.x, top: layout.position.y } as CSSProperties,
        }

  if (!visible) return null

  return (
    <motion.div
      ref={rootRef}
      className={`${containerClassName} ${positioning.className}`.trim()}
      style={positioning.style}
      data-toolbar-mode={layout.mode}
      data-toolbar-id={id}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center gap-1 border-b border-gray-200/80 dark:border-gray-800/80 bg-gray-50/90 dark:bg-gray-950/50 px-2 py-1">
        <button
          type="button"
          aria-label={
            layout.mode === 'floating'
              ? `Move ${title}`
              : `${title} is docked`
          }
          title={
            layout.mode === 'floating'
              ? `Drag to move ${title}`
              : `${title} is docked`
          }
          onPointerDown={handleDragStart}
          disabled={layout.mode !== 'floating'}
          className={`inline-flex h-6 w-6 items-center justify-center rounded ${
            layout.mode === 'floating'
              ? 'cursor-grab text-gray-500 hover:bg-gray-200/70 dark:text-gray-400 dark:hover:bg-gray-800'
              : 'cursor-default text-gray-300 dark:text-gray-700'
          }`}
        >
          <GripVertical size={14} aria-hidden="true" />
        </button>
        <span className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          {title}
        </span>
        {layout.mode === 'floating' && (
          <button
            type="button"
            onClick={() => resetLayout(id)}
            aria-label={`Reset ${title} position`}
            title="Reset floating position"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-gray-200/70 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Undo2 size={14} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            layout.mode === 'docked'
              ? startFloatingFromCurrentPosition()
              : setMode(id, 'docked')
          }
          aria-label={
            layout.mode === 'docked'
              ? `Undock ${title}`
              : `Dock ${title}`
          }
          title={layout.mode === 'docked' ? 'Undock toolbar' : 'Dock toolbar'}
          className="inline-flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-gray-200/70 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Pin size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setVisible(id, false)}
          aria-label={`Hide ${title}`}
          title={`Hide ${title}`}
          className="inline-flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-gray-200/70 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
      {children}
    </motion.div>
  )
}
