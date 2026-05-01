import { useEffect } from 'react'
import { CanvasStage } from './Canvas/CanvasStage'
import { Minimap } from './Minimap'
import { CanvasActionDock } from './Canvas/CanvasActionDock'
import { CanvasScaleBar } from './Canvas/CanvasScaleBar'
import { NorthArrow } from './Canvas/NorthArrow'
import { AlignDistributeToolbar } from './Canvas/AlignDistributeToolbar'
import { ElementHoverCard } from './Canvas/ElementHoverCard'
import { FirstRunCoach } from './FirstRunCoach'
import { AdminStatsToolbar } from './AdminStatsToolbar'
import { StatusBar } from './StatusBar'

import { useUIStore } from '../../stores/uiStore'
import { normalizeNorthArrowVisibility, useCanvasStore } from '../../stores/canvasStore'
import { useFloorStore } from '../../stores/floorStore'
import { useElementsStore } from '../../stores/elementsStore'
import { useView3DEntry } from './view3d/useView3DEntry'
import { TwoPointFiveOverlay } from './view3d/TwoPointFiveOverlay'

/**
 * Dockview Panel component for the Konva map engine only.
 * Pixi is intentionally isolated on its own route/page.
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

  const { ThreeDEntry, threeDLoadFailed, setThreeDLoadFailed } = useView3DEntry(viewMode)

  const showFirstRunCoach = firstRunCoachOpen || (selectedIds.length === 0 && !rightSidebarOpen)

  return (
    <div
      className="relative min-w-0 flex-1 overflow-hidden bg-slate-100 dark:bg-gray-950 w-full h-full"
      data-canvas-toolbar-host
    >
      {viewMode === '2.5d' && (
        <TwoPointFiveOverlay
          ThreeDEntry={ThreeDEntry}
          threeDLoadFailed={threeDLoadFailed}
          setThreeDLoadFailed={setThreeDLoadFailed}
          setViewMode={setViewMode}
          floor={activeFloor}
          elements={elements}
        />
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
