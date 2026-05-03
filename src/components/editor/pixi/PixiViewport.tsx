import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { Cpu } from 'lucide-react'
import { DockableToolbar } from '../DockableToolbar'
import { Minimap } from '../Minimap'
import { StatusBar } from '../StatusBar'
import { AlignDistributeToolbar } from '../Canvas/AlignDistributeToolbar'
import { PixiActionDock } from '../Canvas/PixiActionDock'
import { AdminStatsToolbar } from '../AdminStatsToolbar'
import { ToolbarTogglePill } from '../ToolbarTogglePill'
import { PixiStatusBar } from '../Canvas/PixiStatusBar'
import { SidebarToggle } from '../RightSidebar/SidebarToggle'
import { RightSidebar } from '../RightSidebar/RightSidebar'
import {
  PixiStage,
  type PixiStageError,
  type PixiStageEventBridge,
  type PixiStageHandle,
  type PixiViewportState,
} from '../Canvas/PixiStage'
import { CollapsibleSection } from '../LeftSidebar/CollapsibleSection'
import { ToolSelector } from '../LeftSidebar/ToolSelector'
import { LayerVisibilityPanel } from '../LeftSidebar/LayerVisibilityPanel'
import { ElementLibrary } from '../LeftSidebar/ElementLibrary'
import { PixiAdapter } from '../../../lib/pixi/PixiAdapter'
import { applyEngineIntent } from '../../../lib/core/engineIntentBridge'

interface PixiViewportProps {
  size: { w: number; h: number }
  containerRef: (node: HTMLDivElement | null) => void
  error: string | null
  onPixiError: (error: PixiStageError) => void
  pixiStageRef: RefObject<PixiStageHandle | null>
  viewport: PixiViewportState
  onViewportChange: (viewport: PixiViewportState) => void
  onBackToMap?: () => void
  leftToolsVisible: boolean
  leftToolsFloating: boolean
  rightSidebarOpen: boolean
  rightInspectorVisible: boolean
  rightInspectorFloating: boolean
  isCompactEditor: boolean
  minWidthPx: number
}

export function PixiViewport({
  size,
  containerRef,
  error,
  onPixiError,
  pixiStageRef,
  viewport,
  onViewportChange,
  onBackToMap,
  leftToolsVisible,
  leftToolsFloating,
  rightSidebarOpen,
  rightInspectorVisible,
  rightInspectorFloating,
  isCompactEditor,
  minWidthPx,
}: PixiViewportProps) {
  const adapterRef = useRef<PixiAdapter | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    hostRef.current = node
    containerRef(node)
  }, [containerRef])

  useEffect(() => {
    if (!hostRef.current || adapterRef.current) return
    const adapter = new PixiAdapter()
    adapter.init({
      host: hostRef.current,
      emitIntent: (intent) => applyEngineIntent(intent),
      emitEvent: () => undefined,
    })
    adapterRef.current = adapter
    return () => {
      adapter.dispose()
      adapterRef.current = null
    }
  }, [])

  const handleStageReady = useCallback((stage: PixiStageEventBridge | null) => {
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
      ref={setContainerRef}
      className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-slate-100 dark:bg-gray-950"
      style={{ minWidth: `${minWidthPx}px` }}
      data-canvas-toolbar-host
      data-editor-min-width={minWidthPx}
      data-testid="pixi-preview-page"
    >
      {!isCompactEditor && leftToolsVisible && leftToolsFloating && (
        <DockableToolbar
          id="left-tools"
          title="Pixi tools rail"
          dockedClassName="left-4 top-4"
          className="max-h-[calc(100%-2rem)] w-[280px] overflow-y-auto"
        >
          <FloatingPixiToolsRail />
        </DockableToolbar>
      )}
      <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-[calc(100%-2rem)] rounded-2xl border border-white/70 bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-100">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Cpu size={15} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="truncate">Pixi editor</div>
            <div className="truncate text-[10px] font-medium text-gray-500 dark:text-gray-400">
              Same plan data, GPU-rendered canvas
            </div>
          </div>
        </div>
      </div>
      {size.w > 0 && size.h > 0 ? (
        <PixiStage
          ref={pixiStageRef}
          width={size.w}
          height={size.h}
          onError={onPixiError}
          onViewportChange={onViewportChange}
          onStageReady={handleStageReady}
        />
      ) : null}
      {error && (
        <div className="absolute left-1/2 top-4 z-20 max-w-md -translate-x-1/2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg dark:border-amber-900/60 dark:bg-amber-950 dark:text-amber-100">
          <div className="font-semibold">Pixi editor warning</div>
          <div className="mt-1 text-xs leading-5">{error}</div>
        </div>
      )}
      <div className="pointer-events-auto absolute bottom-8 right-8 z-30">
        <Minimap />
      </div>
      <StatusBar />
      <AlignDistributeToolbar />
      <PixiActionDock
        stageRef={pixiStageRef}
        viewport={viewport}
      />
      <AdminStatsToolbar />
      <ToolbarTogglePill />
      <PixiStatusBar
        stageRef={pixiStageRef}
        onBackToMap={onBackToMap}
      />
      {!rightSidebarOpen && <SidebarToggle variant="floating" />}
      {rightSidebarOpen && rightInspectorVisible && rightInspectorFloating && (
        <DockableToolbar
          id="right-inspector"
          title="Pixi inspector"
          dockedClassName="right-4 top-4"
          className="max-h-[calc(100%-2rem)] w-[320px] overflow-y-auto"
        >
          <RightSidebar />
        </DockableToolbar>
      )}
      {rightSidebarOpen && rightInspectorVisible && !rightInspectorFloating && isCompactEditor && (
        <div className="absolute inset-y-0 right-0 z-30 w-[min(320px,85vw)] overflow-y-auto border-l border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
          <RightSidebar />
        </div>
      )}
    </div>
  )
}

function FloatingPixiToolsRail() {
  return (
    <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
      <CollapsibleSection title="Pixi Tools" defaultOpen storageKey="floating-pixi-tools">
        <ToolSelector />
      </CollapsibleSection>
      <CollapsibleSection title="Pixi Layers" defaultOpen={false} storageKey="floating-pixi-layers">
        <LayerVisibilityPanel />
      </CollapsibleSection>
      <CollapsibleSection title="Pixi Library" defaultOpen storageKey="floating-pixi-library">
        <ElementLibrary />
      </CollapsibleSection>
    </div>
  )
}
