import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { PanelLeft, PanelLeftClose } from 'lucide-react'
import { CanvasActionDock } from './Canvas/CanvasActionDock'
import { AlignDistributeToolbar } from './Canvas/AlignDistributeToolbar'
import { PixiStage, type PixiStageHandle } from './Canvas/PixiStage'
import { PixiStatusBar } from './Canvas/PixiStatusBar'
import { StatusBar } from './StatusBar'
import { ToolSelector } from './LeftSidebar/ToolSelector'
import { LayerVisibilityPanel } from './LeftSidebar/LayerVisibilityPanel'
import { ElementLibrary } from './LeftSidebar/ElementLibrary'
import { CollapsibleSection } from './LeftSidebar/CollapsibleSection'
import { RightSidebar } from './RightSidebar/RightSidebar'
import { SidebarToggle } from './RightSidebar/SidebarToggle'
import { AdminStatsToolbar } from './AdminStatsToolbar'
import { useUIStore } from '../../stores/uiStore'

export function PixiPreviewPage() {
  const navigate = useNavigate()
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen)
  const pixiStageRef = useRef<PixiStageHandle | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [error, setError] = useState<string | null>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect()
    resizeObserverRef.current = null
    if (!node) return

    const measure = () => {
      const { width, height } = node.getBoundingClientRect()
      setSize({
        w: Math.max(0, Math.round(width)),
        h: Math.max(0, Math.round(height)),
      })
    }

    const ro = new ResizeObserver(measure)
    ro.observe(node)
    resizeObserverRef.current = ro
    measure()
  }, [])

  useEffect(() => {
    return () => resizeObserverRef.current?.disconnect()
  }, [])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden" data-testid="pixi-editor-page">
      <div
        className={`flex flex-shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 dark:border-gray-800 dark:bg-gray-950 ${
          leftSidebarOpen ? 'w-[280px] overflow-y-auto overflow-x-hidden' : 'w-10 overflow-hidden'
        }`}
      >
        <button
          type="button"
          onClick={() => setLeftSidebarOpen((v) => !v)}
          className="flex h-9 w-full items-center justify-center gap-1.5 border-b border-gray-100 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200"
          title={leftSidebarOpen ? 'Collapse Pixi sidebar' : 'Expand Pixi sidebar'}
          aria-label={leftSidebarOpen ? 'Collapse Pixi sidebar' : 'Expand Pixi sidebar'}
        >
          {leftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          {leftSidebarOpen && <span className="text-[11px] font-medium">Collapse</span>}
        </button>
        {leftSidebarOpen && (
          <>
            <CollapsibleSection title="Pixi Tools" defaultOpen storageKey="pixi-tools">
              <ToolSelector />
            </CollapsibleSection>
            <CollapsibleSection title="Pixi Layers" defaultOpen={false} storageKey="pixi-layers">
              <LayerVisibilityPanel />
            </CollapsibleSection>
            <CollapsibleSection title="Pixi Library" defaultOpen storageKey="pixi-library">
              <ElementLibrary />
            </CollapsibleSection>
          </>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-slate-100 dark:bg-gray-950"
        data-canvas-toolbar-host
        data-testid="pixi-preview-page"
      >
        {size.w > 0 && size.h > 0 ? (
          <PixiStage
            ref={pixiStageRef}
            width={size.w}
            height={size.h}
            onError={setError}
          />
        ) : null}
        {error && (
          <div className="absolute left-1/2 top-4 z-20 max-w-md -translate-x-1/2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg dark:border-amber-900/60 dark:bg-amber-950 dark:text-amber-100">
            <div className="font-semibold">Pixi editor warning</div>
            <div className="mt-1 text-xs leading-5">{error}</div>
          </div>
        )}
        <StatusBar />
        <AlignDistributeToolbar />
        <CanvasActionDock />
        <AdminStatsToolbar />
        <PixiStatusBar
          stageRef={pixiStageRef as RefObject<PixiStageHandle | null>}
          onBackToMap={() => navigate('../map', { replace: true })}
        />
        {!rightSidebarOpen && <SidebarToggle variant="floating" />}
      </div>

      {rightSidebarOpen && (
        <div className="w-[320px] flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white transition-[width] duration-200 dark:border-gray-800 dark:bg-gray-950">
          <RightSidebar />
        </div>
      )}
    </div>
  )
}
