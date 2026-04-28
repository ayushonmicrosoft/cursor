import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { CanvasStage } from './Canvas/CanvasStage'
import { PixiStage, type PixiStageHandle } from './Canvas/PixiStage'
import { PixiStatusBar } from './Canvas/PixiStatusBar'
import { Minimap } from './Minimap'
import { CanvasActionDock } from './Canvas/CanvasActionDock'
import { CanvasScaleBar } from './Canvas/CanvasScaleBar'
import { NorthArrow } from './Canvas/NorthArrow'
import { AlignDistributeToolbar } from './Canvas/AlignDistributeToolbar'
import { ElementHoverCard } from './Canvas/ElementHoverCard'
import { FirstRunCoach } from './FirstRunCoach'
import { AdminStatsToolbar } from './AdminStatsToolbar'
import { ToolSelector } from './LeftSidebar/ToolSelector'
import { StatusBar } from './StatusBar'

import { useUIStore } from '../../stores/uiStore'
import { normalizeNorthArrowVisibility, useCanvasStore } from '../../stores/canvasStore'
import { useFloorStore } from '../../stores/floorStore'
import { useElementsStore } from '../../stores/elementsStore'
import type { CanvasElement } from '../../types/elements'
import type { Floor } from '../../types/floor'

interface ThreeDEntryProps {
  floor: Floor | null
  elements: Record<string, CanvasElement>
  onRequestFallback2D?: () => void
}

/**
 * Dockview Panel component that wraps all map/canvas view modes:
 * - 2D (Konva)
 * - 2.5D (Three.js)
 * - PixiJS (WebGL)
 */
export function CanvasPanel() {
  const viewMode = useUIStore((s) => s.viewMode)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const selectedIds = useUIStore((s) => s.selectedIds)
  const firstRunCoachOpen = useUIStore((s) => s.firstRunCoachOpen)
  const setFirstRunCoachOpen = useUIStore((s) => s.setFirstRunCoachOpen)
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen)

  const showNorthArrowRaw = useCanvasStore((s) => s.settings.showNorthArrow)
  const showNorthArrow = normalizeNorthArrowVisibility(showNorthArrowRaw)

  const activeFloorId = useFloorStore((s) => s.activeFloorId)
  const floors = useFloorStore((s) => s.floors)
  const elements = useElementsStore((s) => s.elements)

  const activeFloor = floors.find((f) => f.id === activeFloorId) ?? null

  const [ThreeDEntry, setThreeDEntry] = useState<ComponentType<ThreeDEntryProps> | null>(null)
  const [threeDLoadFailed, setThreeDLoadFailed] = useState(false)

  const pixiStageRef = useRef<PixiStageHandle | null>(null)
  const [pixiSize, setPixiSize] = useState({ w: 0, h: 0 })
  const pixiRoRef = useRef<ResizeObserver | null>(null)

  const showFirstRunCoach = firstRunCoachOpen || (selectedIds.length === 0 && !rightSidebarOpen)

  const pixiContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (pixiRoRef.current) { pixiRoRef.current.disconnect(); pixiRoRef.current = null }
    if (!node) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setPixiSize({ w: Math.round(width), h: Math.round(height) })
    })
    ro.observe(node)
    pixiRoRef.current = ro
    const { width, height } = node.getBoundingClientRect()
    if (width > 0 && height > 0) setPixiSize({ w: Math.round(width), h: Math.round(height) })
  }, [])

  useEffect(() => {
    if (viewMode !== '2.5d' || ThreeDEntry || threeDLoadFailed) return
    let active = true
    ;(async () => {
      try {
        const mod = await import(
          /* @vite-ignore */ './view3d'
        )
        const entry =
          (mod as { default?: ComponentType<ThreeDEntryProps>; View3DCanvas?: ComponentType<ThreeDEntryProps> }).default ??
          (mod as { View3DCanvas?: ComponentType<ThreeDEntryProps> }).View3DCanvas
        if (active && entry) {
          setThreeDEntry(() => entry)
          setThreeDLoadFailed(false)
        } else if (active) {
          setThreeDLoadFailed(true)
        }
      } catch {
        if (active) setThreeDLoadFailed(true)
      }
    })()
    return () => {
      active = false
    }
  }, [ThreeDEntry, threeDLoadFailed, viewMode])

  return (
    <div
      className="relative min-w-0 flex-1 overflow-hidden bg-slate-100 dark:bg-gray-950 w-full h-full"
      data-canvas-toolbar-host
    >
      {viewMode === '2.5d' && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 p-6 text-center dark:bg-gray-950/90"
          data-testid="mapview-25d-panel"
        >
          {ThreeDEntry ? (
            <ThreeDEntry
              floor={activeFloor}
              elements={elements}
              onRequestFallback2D={() => setViewMode('2d')}
            />
          ) : (
            <div
              role={threeDLoadFailed ? 'alert' : 'status'}
              aria-live={threeDLoadFailed ? 'assertive' : 'polite'}
              className="max-w-lg rounded-md border border-gray-200 bg-white p-5 text-left shadow-lg dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex items-start gap-4">
                <div
                  className="mt-0.5 grid h-12 w-12 flex-none grid-cols-2 gap-1 rounded-md bg-slate-100 p-2 dark:bg-gray-800"
                  aria-hidden="true"
                >
                  <span className="rounded-sm bg-slate-300 shadow-sm dark:bg-gray-600" />
                  <span className="rounded-sm bg-sky-300 shadow-sm dark:bg-sky-800" />
                  <span className="rounded-sm bg-emerald-300 shadow-sm dark:bg-emerald-800" />
                  <span className="animate-pulse rounded-sm bg-amber-300 shadow-sm dark:bg-amber-800" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {threeDLoadFailed ? '2.5D review is unavailable' : 'Building 2.5D review'}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-300">
                    {threeDLoadFailed
                      ? 'The 3D engine could not start in this browser context. Your plan is still editable in 2D.'
                      : 'Preparing materials, shadows, and camera presets. You can return to 2D at any time.'}
                  </p>
                </div>
              </div>
              {threeDLoadFailed && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('2d')}
                    className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    Return to 2D editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setThreeDLoadFailed(false)}
                    className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Retry 2.5D
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {viewMode === 'pixi' && (
        <div
          ref={pixiContainerRef}
          className="absolute inset-0"
          data-testid="mapview-pixi-stage"
          style={{ background: '#f1f5f9', zIndex: 0 }}
        >
          {pixiSize.w > 0 && (
            <PixiStage
              ref={pixiStageRef}
              width={pixiSize.w}
              height={pixiSize.h}
            />
          )}
          <ToolSelector />
          <StatusBar />
          <CanvasActionDock />
          <PixiStatusBar stageRef={pixiStageRef as React.RefObject<PixiStageHandle | null>} />
        </div>
      )}

      {/* Konva 2D View - Always mounted to avoid heavy unmount freezes */}
      <div className="absolute inset-0" style={{ display: viewMode === '2d' ? 'block' : 'none', zIndex: 0 }}>
        <CanvasStage />
        <StatusBar />
        <Minimap />
        <AlignDistributeToolbar />
        <ElementHoverCard />
        <CanvasActionDock />
        <AdminStatsToolbar />
        <CanvasScaleBar />
        {showNorthArrow && <NorthArrow />}
        {showFirstRunCoach && (
          <FirstRunCoach
            forceTourOpen={firstRunCoachOpen}
            onTourClosed={() => setFirstRunCoachOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
