import { GripVertical, Pin, PinOff, RotateCcw, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
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
  hidePin?: boolean
}

/**
 * World-class dockable toolbar shell.
 *
 * Two states:
 *  - docked  : anchored to a canonical edge via `dockedClassName`
 *  - floating : freely draggable via the grip handle in the header
 *
 * Supports: drag-to-move, pin/unpin, hide, reset, resize (native CSS).
 * Position persists in the UI store + localStorage across reloads.
 */
export function DockableToolbar({
  id,
  title,
  dockedClassName,
  dockedStyle,
  className = '',
  children,
  hidePin,
}: DockableToolbarProps) {
  const FALLBACK_LAYOUT = { mode: 'docked' as const, position: { x: 0, y: 0 } }
  const layout = useUIStore((s) => s.dockableToolbarLayouts[id]) ?? DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS[id] ?? FALLBACK_LAYOUT
  const visible = useUIStore((s) => s.dockableToolbarVisibility[id] ?? true)
  const setMode = useUIStore((s) => s.setDockableToolbarMode)
  const setPosition = useUIStore((s) => s.setDockableToolbarPosition)
  const resetLayout = useUIStore((s) => s.resetDockableToolbarLayout)
  const setVisible = useUIStore((s) => s.setDockableToolbarVisible)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const pointerUpListenerRef = useRef<(e: PointerEvent) => void>(() => {})
  const [isDragging, setIsDragging] = useState(false)

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

  const handleWindowPointerMove = useCallback(
    (e: PointerEvent) => {
      const drag = dragStateRef.current
      if (drag.pointerId !== e.pointerId) return
      const deltaX = e.clientX - drag.startPointerX
      const deltaY = e.clientY - drag.startPointerY
      const next = clampToHost(drag.startX + deltaX, drag.startY + deltaY)
      setPosition(id, next)
    },
    [clampToHost, id, setPosition],
  )

  const handleWindowPointerUp = useCallback(
    (e: PointerEvent) => {
      const drag = dragStateRef.current
      if (drag.pointerId !== e.pointerId) return
      drag.pointerId = null
      setIsDragging(false)
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', pointerUpListenerRef.current)
    },
    [handleWindowPointerMove],
  )

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
    setIsDragging(true)
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

  const isFloating = layout.mode === 'floating'

  const positioning = isFloating
    ? {
        className: '',
        style: { left: layout.position.x, top: layout.position.y } as CSSProperties,
      }
    : { className: dockedClassName, style: dockedStyle }

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={rootRef}
        className={[
          'absolute z-20 flex flex-col',
          'min-w-[180px] max-h-[calc(100%-2.5rem)] max-w-[calc(100%-1rem)]',
          'overflow-hidden',
          // Surface — sharp edges per design spec
          'border border-gray-200 dark:border-gray-800',
          'bg-white dark:bg-gray-950',
          // Drag cursor
          isDragging ? 'cursor-grabbing select-none' : '',
          // Elevated shadow when floating
          isFloating
            ? 'shadow-[0_4px_24px_rgba(0,0,0,0.12),0_24px_64px_rgba(0,0,0,0.16)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_24px_64px_rgba(0,0,0,0.6)]'
            : 'shadow-sm',
          // Docked position classes (e.g. right-4 top-4)
          positioning.className,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={positioning.style}
        data-toolbar-mode={layout.mode}
        data-toolbar-id={id}
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
      >
        {/* ── Header ── */}
        <div
          className={[
            'flex flex-shrink-0 items-center gap-px px-1 py-0.5',
            'border-b border-gray-200 dark:border-gray-800',
            'bg-white dark:bg-gray-950',
          ].join(' ')}
        >
          {/* Drag grip */}
          <button
            type="button"
            aria-label={isFloating ? `Drag to move ${title}` : `${title} is docked`}
            title={isFloating ? `Drag to move ${title}` : `${title} is docked`}
            onPointerDown={handleDragStart}
            disabled={!isFloating}
            className={[
              'inline-flex h-5 w-5 items-center justify-center',
              'transition-colors duration-100',
              isFloating
                ? 'cursor-grab text-gray-400 hover:text-gray-700 active:cursor-grabbing dark:text-gray-500 dark:hover:text-gray-200'
                : 'cursor-default text-gray-300/50 dark:text-gray-700/50',
            ].join(' ')}
          >
            <GripVertical size={13} aria-hidden="true" strokeWidth={2} />
          </button>

          {/* Title */}
          <span className="min-w-0 flex-1 truncate px-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 select-none">
            {title}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-px">
            {/* Reset (only in floating mode) */}
            {isFloating && (
              <HeaderButton
                onClick={() => resetLayout(id)}
                label={`Reset ${title} position`}
                title="Reset to default position"
              >
                <RotateCcw size={11} strokeWidth={2.5} aria-hidden="true" />
              </HeaderButton>
            )}

            {/* Pin / Unpin */}
            {!hidePin && (
              <HeaderButton
                onClick={() =>
                  isFloating ? setMode(id, 'docked') : startFloatingFromCurrentPosition()
                }
                label={isFloating ? `Dock ${title}` : `Undock ${title}`}
                title={isFloating ? 'Dock to edge' : 'Float freely'}
                active={!isFloating}
              >
                {isFloating ? (
                  <Pin size={11} strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  <PinOff size={11} strokeWidth={2.5} aria-hidden="true" />
                )}
              </HeaderButton>
            )}

            {/* Close */}
            <HeaderButton
              onClick={() => setVisible(id, false)}
              label={`Hide ${title}`}
              title={`Hide ${title}`}
              danger
            >
              <X size={11} strokeWidth={2.5} aria-hidden="true" />
            </HeaderButton>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Header icon button ─────────────────────────────────────────────────────

interface HeaderButtonProps {
  onClick: () => void
  label: string
  title: string
  active?: boolean
  danger?: boolean
  children: ReactNode
}

function HeaderButton({ onClick, label, title, active, danger, children }: HeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title}
      className={[
        'inline-flex h-5 w-5 items-center justify-center',
        'transition-colors duration-100',
        active
          ? 'bg-[#1f3653]/10 text-[#1f3653] dark:bg-[#d6c2a6]/10 dark:text-[#d6c2a6]'
          : danger
            ? 'text-gray-400 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-500/10 dark:hover:text-red-400'
            : 'text-gray-400 hover:bg-black/[0.05] hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/[0.06] dark:hover:text-gray-200',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
