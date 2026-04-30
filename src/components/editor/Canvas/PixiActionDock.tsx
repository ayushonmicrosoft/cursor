import { useEffect, useState, type RefObject, type ReactNode } from 'react'
import {
  Download,
  Grid3x3,
  LocateFixed,
  Maximize,
  Maximize2,
  Minus,
  Plus,
} from 'lucide-react'
import { DockableToolbar } from '../DockableToolbar'
import { useCanvasStore } from '../../../stores/canvasStore'
import type { PixiStageHandle, PixiViewportState } from './PixiStage'

interface PixiActionDockProps {
  stageRef: RefObject<PixiStageHandle | null>
  viewport: PixiViewportState
}

export function PixiActionDock({ stageRef, viewport }: PixiActionDockProps) {
  const showGrid = useCanvasStore((s) => s.settings.showGrid)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== 'undefined' ? !!document.fullscreenElement : false,
  )

  useEffect(() => {
    if (typeof document === 'undefined') return
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

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
      title="Pixi controls"
      dockedClassName="bottom-12 right-4"
      className="w-[60px]"
    >
      <div
        data-testid="pixi-action-dock"
        role="toolbar"
        aria-label="Pixi canvas controls"
        className="flex flex-col gap-0.5 p-1"
      >
        <DockButton label="Zoom in" title="Zoom in" onClick={() => stageRef.current?.zoomIn()}>
          <Plus className="h-4 w-4" />
        </DockButton>
        <DockButton label="Zoom out" title="Zoom out" onClick={() => stageRef.current?.zoomOut()}>
          <Minus className="h-4 w-4" />
        </DockButton>
        <div
          className="mx-1 rounded border border-gray-200/80 bg-gradient-to-b from-white to-[#f4efe8] px-1.5 py-1 text-center text-[10px] font-semibold tabular-nums text-gray-600 select-none dark:border-gray-800 dark:from-gray-900 dark:to-[#1b2940] dark:text-gray-300"
          aria-live="polite"
          aria-atomic="true"
        >
          {Math.round(viewport.scale * 100)}%
        </div>

        <DockDivider />

        <DockButton label="Fit to content" title="Fit Pixi content" onClick={() => stageRef.current?.fitToContent()}>
          <Maximize2 className="h-4 w-4" />
        </DockButton>
        <DockButton label="Reset view" title="Reset Pixi view" onClick={() => stageRef.current?.resetView()}>
          <LocateFixed className="h-4 w-4" />
        </DockButton>

        <DockDivider />

        <DockButton
          label="Toggle grid"
          title="Toggle Pixi grid"
          onClick={() => useCanvasStore.getState().toggleGrid()}
          pressed={showGrid}
        >
          <Grid3x3 className="h-4 w-4" />
        </DockButton>
        <DockButton label="Export PNG" title="Export Pixi PNG" onClick={() => void stageRef.current?.exportPng()}>
          <Download className="h-4 w-4" />
        </DockButton>

        <DockDivider />

        <DockButton label="Fullscreen" title="Fullscreen" onClick={onFullscreen} pressed={isFullscreen}>
          <Maximize className="h-4 w-4" />
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
  children: ReactNode
}

function DockButton({ label, title, onClick, pressed, children }: DockButtonProps) {
  const base =
    'inline-flex h-10 w-10 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
  const idle =
    'text-gray-600 hover:bg-[#f4efe8] active:bg-[#eadfce] dark:text-gray-300 dark:hover:bg-[#16263d] dark:active:bg-[#203552]'
  const active =
    'bg-[#f4efe8] text-[#1f3653] ring-1 ring-[#e3d8cb] dark:bg-[#16263d] dark:text-[#d6c2a6] dark:ring-[#294161]'
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
      className="mx-1.5 my-1 h-px bg-gray-200 dark:bg-gray-800"
    />
  )
}
