import { useCallback, useEffect, useRef, type ComponentType } from 'react'
import type Konva from 'konva'
import { CanvasStage } from '../Canvas/CanvasStage'
import { StatusBar } from '../StatusBar'
import { Minimap } from '../Minimap'
import { AlignDistributeToolbar } from '../Canvas/AlignDistributeToolbar'
import { ElementHoverCard } from '../Canvas/ElementHoverCard'
import { AdminStatsToolbar } from '../AdminStatsToolbar'
import { CanvasScaleBar } from '../Canvas/CanvasScaleBar'
import { NorthArrow } from '../Canvas/NorthArrow'
import { FirstRunCoach } from '../FirstRunCoach'
import { CanvasActionDock } from '../Canvas/CanvasActionDock'
import { ColorPaletteToolbar } from '../Canvas/ColorPaletteToolbar'
import type { CanvasElement } from '../../../types/elements'
import type { Floor } from '../../../types/floor'
import { KonvaAdapter } from '../../../lib/konva/KonvaAdapter'
import { applyEngineIntent } from '../../../lib/core/engineIntentBridge'
import { TwoPointFiveOverlay } from '../view3d/TwoPointFiveOverlay'
import type { ThreeDEntryProps } from '../view3d/types'

export type KonvaThreeDEntryProps = ThreeDEntryProps

interface KonvaViewportProps {
  viewMode: '2d' | '2.5d'
  ThreeDEntry: ComponentType<KonvaThreeDEntryProps> | null
  threeDLoadFailed: boolean
  activeFloor: Floor | null
  elements: Record<string, CanvasElement>
  showNorthArrow: boolean
  showFirstRunCoach: boolean
  firstRunCoachOpen: boolean
  setFirstRunCoachOpen: (open: boolean) => void
  setViewMode: (mode: '2d' | '2.5d') => void
  setThreeDLoadFailed: (failed: boolean) => void
}

export function KonvaViewport({
  viewMode,
  ThreeDEntry,
  threeDLoadFailed,
  activeFloor,
  elements,
  showNorthArrow,
  showFirstRunCoach,
  firstRunCoachOpen,
  setFirstRunCoachOpen,
  setViewMode,
  setThreeDLoadFailed,
}: KonvaViewportProps) {
  const adapterRef = useRef<KonvaAdapter | null>(null)

  useEffect(() => {
    const adapter = new KonvaAdapter()
    adapter.init({
      host: document.createElement('div'),
      emitIntent: (intent) => applyEngineIntent(intent),
      emitEvent: () => undefined,
    })
    adapterRef.current = adapter
    return () => {
      adapter.dispose()
      adapterRef.current = null
    }
  }, [])

  const handleStageReady = useCallback((stage: Konva.Stage | null) => {
    const adapter = adapterRef.current
    if (!adapter) return
    if (!stage) {
      adapter.unbindStage()
      return
    }
    adapter.bindStage(stage)
  }, [])

  return (
    <div
      className="relative min-w-0 flex-1 overflow-hidden bg-[#f0f0f0] dark:bg-gray-900"
      data-canvas-toolbar-host
    >
      {viewMode === '2.5d' ? (
        <TwoPointFiveOverlay
          ThreeDEntry={ThreeDEntry}
          threeDLoadFailed={threeDLoadFailed}
          setThreeDLoadFailed={setThreeDLoadFailed}
          setViewMode={setViewMode}
          floor={activeFloor}
          elements={elements}
        />
      ) : (
        <>
          <div className="absolute inset-0">
            <CanvasStage onStageReady={handleStageReady} />
            <StatusBar />
            <Minimap />
            <AlignDistributeToolbar />
            <ElementHoverCard />
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
          <CanvasActionDock />
          <ColorPaletteToolbar />
        </>
      )}
    </div>
  )
}
