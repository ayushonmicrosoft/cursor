import { useEffect, useState } from 'react'
import {
  Plus,
  Minus,
  Maximize2,
  LocateFixed,
  Grid3x3,
  Map,
  PlaySquare,
  Maximize,
  Paintbrush,
} from 'lucide-react'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useUIStore } from '../../../stores/uiStore'
import { useElementsStore } from '../../../stores/elementsStore'
import { isStrokeOnlyBlock } from '../../../blocks/rendering'
import { DockableToolbar } from '../DockableToolbar'

const PALETTE = [
  { color: '#111827', label: 'Black' },
  { color: '#6B7280', label: 'Gray' },
  { color: '#FFFFFF', label: 'White' },
  { color: '#F59E0B', label: 'Amber' },
  { color: '#D97706', label: 'Orange' },
  { color: '#2563EB', label: 'Blue' },
  { color: '#10B981', label: 'Green' },
  { color: '#7C3AED', label: 'Purple' },
  { color: '#EF4444', label: 'Red' },
  { color: '#06B6D4', label: 'Cyan' },
] as const

export function CanvasActionDock() {
  const presentationMode = useUIStore((s) => s.presentationMode)
  const visible = useUIStore((s) => s.dockableToolbarVisibility['canvas-actions'] ?? true)
  const minimapVisible = useUIStore((s) => s.dockableToolbarVisibility['minimap'] ?? true)
  const stageScale = useCanvasStore((s) => s.stageScale)
  const showGrid = useCanvasStore((s) => s.settings.showGrid)
  const selectedIds = useUIStore((s) => s.selectedIds)
  const elements = useElementsStore((s) => s.elements)
  const setElements = useElementsStore((s) => s.setElements)

  const hasSelection = selectedIds.some((id) => Boolean(elements[id]))

  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== 'undefined' ? !!document.fullscreenElement : false,
  )
  useEffect(() => {
    if (typeof document === 'undefined') return
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  if (presentationMode || !visible) return null

  const onZoomIn = () => useCanvasStore.getState().zoomIn()
  const onZoomOut = () => useCanvasStore.getState().zoomOut()
  const onFit = () => useCanvasStore.getState().zoomToContent()
  const onReset = () => useCanvasStore.getState().resetZoom()
  const onToggleGrid = () => useCanvasStore.getState().toggleGrid()
  const onToggleMinimap = () => useUIStore.getState().setDockableToolbarVisible('minimap', !minimapVisible)
  const onPresentation = () => useUIStore.getState().setPresentationMode(true)
  const onFullscreen = () => {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) void document.exitFullscreen?.()
    else void document.documentElement.requestFullscreen?.()
  }

  const applyColor = (color: string) => {
    let changed = false
    const nextElements = { ...elements }
    for (const id of selectedIds) {
      const el = elements[id]
      if (!el || el.locked) continue
      const style = {
        ...el.style,
        ...(isStrokeOnlyBlock(el.type) ? { stroke: color } : { fill: color }),
      }
      nextElements[id] = { ...el, style }
      changed = true
    }
    if (changed) setElements(nextElements)
  }

  return (
    <DockableToolbar
      id="canvas-actions"
      title="Canvas controls"
      dockedClassName="bottom-8 left-1/2 -translate-x-1/2"
      dockedStyle={{}}
      className="w-auto"
    >
      <div
        data-testid="canvas-action-dock"
        role="toolbar"
        aria-label="Canvas controls"
        className="flex flex-col"
      >
        {/* ── Row 1: Canvas controls ── */}
        <div className="flex items-center justify-center px-1 py-1">
          {/* Zoom */}
          <Btn label="Zoom in" title="Zoom in (+)" onClick={onZoomIn}><Plus size={13} /></Btn>
          <Btn label="Zoom out" title="Zoom out (-)" onClick={onZoomOut}><Minus size={13} /></Btn>

          {/* Zoom readout */}
          <div
            className="px-1.5 text-[10px] font-semibold tabular-nums text-gray-500 dark:text-gray-400 select-none"
            aria-live="polite"
            aria-atomic="true"
          >
            {Math.round(stageScale * 100)}%
          </div>

          <Sep />

          {/* Fit / Reset */}
          <Btn label="Fit to content" title="Fit (1)" onClick={onFit}><Maximize2 size={13} /></Btn>
          <Btn label="Reset view" title="Reset (0)" onClick={onReset}><LocateFixed size={13} /></Btn>

          <Sep />

          {/* Toggles */}
          <Btn label="Toggle grid" title="Grid (G)" onClick={onToggleGrid} pressed={showGrid}><Grid3x3 size={13} /></Btn>
          <Btn label="Toggle minimap" title="Minimap" onClick={onToggleMinimap} pressed={minimapVisible}><Map size={13} /></Btn>

          <Sep />

          {/* Present / Fullscreen */}
          <Btn label="Presentation" title="Present (P)" onClick={onPresentation}><PlaySquare size={13} /></Btn>
        </div>

        {/* ── Row 2: Color palette ── */}
        <div className="flex items-center justify-center px-1 py-1 border-t border-gray-200 dark:border-gray-800">
          <div
            className={`flex h-6 w-6 items-center justify-center flex-shrink-0 transition-colors ${hasSelection ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}
            title={hasSelection ? 'Apply color' : 'Select an element first'}
          >
            <Paintbrush size={11} />
          </div>
          {PALETTE.map(({ color, label }) => (
            <button
              key={color}
              type="button"
              aria-label={`Apply ${label}`}
              title={hasSelection ? `Apply ${label}` : 'Select an element first'}
              disabled={!hasSelection}
              onClick={() => applyColor(color)}
              className="h-4 w-4 flex-shrink-0 border border-black/10 dark:border-white/10 transition-transform duration-100 hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </DockableToolbar>
  )
}

// ── Primitives ────────────────────────────────────────────────────────────────

interface BtnProps {
  label: string
  title: string
  onClick: () => void
  pressed?: boolean
  children: React.ReactNode
}

function Btn({ label, title, onClick, pressed, children }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title}
      {...(pressed !== undefined ? { 'aria-pressed': pressed } : {})}
      className={[
        'inline-flex h-6 w-6 flex-shrink-0 items-center justify-center',
        'transition-colors duration-100',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500',
        pressed
          ? 'bg-[#1f3653]/10 text-[#1f3653] dark:bg-[#d6c2a6]/10 dark:text-[#d6c2a6]'
          : 'text-gray-500 dark:text-gray-400 hover:bg-black/[0.05] hover:text-gray-800 dark:hover:bg-white/[0.06] dark:hover:text-gray-100',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Sep() {
  return (
    <div
      role="separator"
      className="mx-0.5 h-3.5 w-px flex-shrink-0 bg-black/[0.08] dark:bg-white/[0.08]"
    />
  )
}
