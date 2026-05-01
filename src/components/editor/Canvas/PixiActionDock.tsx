import { useEffect, useState, type RefObject, type ReactNode } from 'react'
import {
  Download,
  Grid3x3,
  LocateFixed,
  Maximize,
  Maximize2,
  Minus,
  Plus,
  Paintbrush,
  MapIcon,
  PlaySquare
} from 'lucide-react'
import { DockableToolbar } from '../DockableToolbar'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useElementsStore } from '../../../stores/elementsStore'
import { useUIStore } from '../../../stores/uiStore'
import { isStrokeOnlyBlock } from '../../../blocks/rendering'
import type { PixiStageHandle, PixiViewportState } from './PixiStage'

const PALETTE = [
  '#111827',
  '#6B7280',
  '#FFFFFF',
  '#F59E0B',
  '#D97706',
  '#2563EB',
  '#10B981',
  '#7C3AED',
  '#EF4444',
  '#06B6D4',
] as const

interface PixiActionDockProps {
  stageRef: RefObject<PixiStageHandle | null>
  viewport: PixiViewportState
}

export function PixiActionDock({ stageRef, viewport }: PixiActionDockProps) {
  const showGrid = useCanvasStore((s) => s.settings.showGrid)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== 'undefined' ? !!document.fullscreenElement : false,
  )

  const selectedIds = useUIStore((s) => s.selectedIds)
  const presentationMode = useUIStore((s) => s.presentationMode)
  const setPresentationMode = useUIStore((s) => s.setPresentationMode)
  const elements = useElementsStore((s) => s.elements)
  const setElements = useElementsStore((s) => s.setElements)
  const hasSelection = selectedIds.some((id) => Boolean(elements[id]))

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
    if (changed) {
      setElements(nextElements)
    }
  }

  return (
    <DockableToolbar
      id="canvas-actions"
      title="Canvas controls"
      dockedClassName="bottom-12 right-[50%] translate-x-1/2"
    >
      <div
        data-testid="pixi-action-dock"
        role="toolbar"
        aria-label="Pixi canvas controls"
        className="flex flex-col gap-0 w-[380px]"
      >
        {/* Top Row: View Controls */}
        <div className="flex items-center justify-center gap-0.5 p-1 border-b border-gray-100 dark:border-gray-800">
          <DockButton label="Zoom in" title="Zoom in" onClick={() => stageRef.current?.zoomIn()}>
            <Plus className="h-4 w-4" />
          </DockButton>
          <DockButton label="Zoom out" title="Zoom out" onClick={() => stageRef.current?.zoomOut()}>
            <Minus className="h-4 w-4" />
          </DockButton>
          <div
            className="mx-1 flex h-8 min-w-[48px] items-center justify-center rounded border border-gray-200/80 bg-gradient-to-b from-white to-[#f4efe8] px-1.5 text-center text-[10px] font-semibold tabular-nums text-gray-600 select-none dark:border-gray-800 dark:from-gray-900 dark:to-[#1b2940] dark:text-gray-300"
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
          <DockButton 
            label="Toggle presentation" 
            title="Toggle presentation mode" 
            onClick={() => setPresentationMode(!presentationMode)} 
            pressed={presentationMode}
          >
            <PlaySquare className="h-4 w-4" />
          </DockButton>

          <DockDivider />

          <DockButton label="Fullscreen" title="Fullscreen" onClick={onFullscreen} pressed={isFullscreen}>
            <Maximize className="h-4 w-4" />
          </DockButton>
        </div>

        {/* Bottom Row: Color Palette */}
        <div className="flex items-center justify-center gap-1 p-1.5 px-2">
          <div
            className="mr-1 flex h-6 w-6 items-center justify-center rounded-md bg-gray-50 text-gray-500 dark:bg-gray-950 dark:text-gray-400"
            title={hasSelection ? 'Apply color to selection' : 'Select an element to apply color'}
          >
            <Paintbrush size={14} aria-hidden="true" />
          </div>
          {PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Apply ${color}`}
              title={hasSelection ? `Apply ${color}` : 'Select an element first'}
              disabled={!hasSelection}
              onClick={() => applyColor(color)}
              className="h-6 w-6 rounded-md border border-gray-300 shadow-sm transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
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
    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
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
      className="mx-0.5 h-5 w-px bg-gray-200 dark:bg-gray-800"
    />
  )
}
