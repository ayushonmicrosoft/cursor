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
} from 'lucide-react'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useUIStore } from '../../../stores/uiStore'
import { DockableToolbar } from '../DockableToolbar'

/**
 * Floating bottom-right action dock for the canvas, modeled after the
 * JSON Crack control cluster: a translucent vertical pill of icon
 * buttons that consolidates zoom, fit, grid, minimap, presentation, and
 * fullscreen toggles in one place.
 *
 * The dock is intentionally hidden in presentation mode — that mode's
 * existing Exit overlay is the only canvas-affordance we want visible
 * while presenting.
 *
 * Positioned at `bottom-12` to clear the 32px StatusBar (`h-8`,
 * `bottom-0`); `z-20` keeps it above the canvas but below modals and
 * the presentation-mode overlay.
 */
export function CanvasActionDock() {
  const presentationMode = useUIStore((s) => s.presentationMode)
  const stageScale = useCanvasStore((s) => s.stageScale)
  const showGrid = useCanvasStore((s) => s.settings.showGrid)
  const minimapVisible = useUIStore((s) => s.minimapVisible)

  // Track browser fullscreen state so the icon stays in sync if the
  // user exits via Escape (no click on our button).
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== 'undefined' ? !!document.fullscreenElement : false,
  )
  useEffect(() => {
    if (typeof document === 'undefined') return
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  if (presentationMode) return null

  const onZoomIn = () => useCanvasStore.getState().zoomIn()
  const onZoomOut = () => useCanvasStore.getState().zoomOut()
  const onFit = () => useCanvasStore.getState().zoomToContent()
  const onReset = () => useCanvasStore.getState().resetZoom()
  const onToggleGrid = () => useCanvasStore.getState().toggleGrid()
  const onToggleMinimap = () => useUIStore.getState().toggleMinimap()
  const onPresentation = () => useUIStore.getState().setPresentationMode(true)
  const onFullscreen = () => {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) {
      void document.exitFullscreen?.()
    } else {
      void document.documentElement.requestFullscreen?.()
    }
  }

  return (
    <DockableToolbar
      id="canvas-actions"
      title="Canvas controls"
      dockedClassName="bottom-12 right-4"
      className="w-[60px]"
    >
      <div
        data-testid="canvas-action-dock"
        role="toolbar"
        aria-label="Canvas controls"
        className="flex flex-col gap-0.5 p-1"
      >
      <DockButton
        label="Zoom in"
        title="Zoom in (+ or =)"
        onClick={onZoomIn}
      >
        <Plus className="w-4 h-4" />
      </DockButton>
      <DockButton
        label="Zoom out"
        title="Zoom out (-)"
        onClick={onZoomOut}
      >
        <Minus className="w-4 h-4" />
      </DockButton>
      <div
        className="mx-1 rounded border border-gray-200/80 bg-gradient-to-b from-white to-[#f4efe8] px-1.5 py-1 text-center text-[10px] font-semibold tabular-nums text-gray-600 select-none dark:border-gray-800 dark:from-gray-900 dark:to-[#1b2940] dark:text-gray-300"
        aria-live="polite"
        aria-atomic="true"
      >
        {Math.round(stageScale * 100)}%
      </div>

      <DockDivider />

      <DockButton
        label="Fit to content"
        title="Fit to content (1)"
        onClick={onFit}
      >
        <Maximize2 className="w-4 h-4" />
      </DockButton>
      <DockButton
        label="Reset view"
        title="Reset view (0)"
        onClick={onReset}
      >
        <LocateFixed className="w-4 h-4" />
      </DockButton>

      <DockDivider />

      <DockButton
        label="Toggle grid"
        title="Toggle grid (G)"
        onClick={onToggleGrid}
        pressed={showGrid}
      >
        <Grid3x3 className="w-4 h-4" />
      </DockButton>
      <DockButton
        label="Toggle minimap"
        // M is the global Map nav shortcut and Shift+M is the ruler — no
        // free keybind for minimap visibility, so the title omits a hint.
        title="Toggle minimap"
        onClick={onToggleMinimap}
        pressed={minimapVisible}
      >
        <Map className="w-4 h-4" />
      </DockButton>

      <DockDivider />

      <DockButton
        label="Presentation mode"
        title="Presentation mode (P)"
        onClick={onPresentation}
      >
        <PlaySquare className="w-4 h-4" />
      </DockButton>
      <DockButton
        label="Fullscreen"
        title="Fullscreen (F11)"
        onClick={onFullscreen}
        pressed={isFullscreen}
      >
        <Maximize className="w-4 h-4" />
      </DockButton>
      </div>
    </DockableToolbar>
  )
}

interface DockButtonProps {
  label: string
  title: string
  onClick: () => void
  pressed?: boolean
  children: React.ReactNode
}

function DockButton({ label, title, onClick, pressed, children }: DockButtonProps) {
  const base =
    'inline-flex h-10 w-10 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
  const idle =
    'text-gray-600 dark:text-gray-300 hover:bg-[#f4efe8] dark:hover:bg-[#16263d] active:bg-[#eadfce] dark:active:bg-[#203552]'
  const active =
    'bg-[#f4efe8] dark:bg-[#16263d] text-[#1f3653] dark:text-[#d6c2a6] ring-1 ring-[#e3d8cb] dark:ring-[#294161]'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title}
      {...(pressed !== undefined ? { 'aria-pressed': pressed } : {})}
      className={`${base} ${pressed ? active : idle}`}
    >
      {children}
    </button>
  )
}

function DockDivider() {
  return (
    <div
      role="separator"
      className="h-px bg-gray-200 dark:bg-gray-800 mx-1.5 my-1"
    />
  )
}
