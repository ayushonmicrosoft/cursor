import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cpu, PanelLeft, PanelLeftClose } from 'lucide-react'
import { PixiActionDock } from './Canvas/PixiActionDock'
import { ColorPaletteToolbar } from './Canvas/ColorPaletteToolbar'
import { AlignDistributeToolbar } from './Canvas/AlignDistributeToolbar'
import { PixiStage, type PixiStageHandle, type PixiViewportState } from './Canvas/PixiStage'
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
import { MIN_EDITOR_LAYOUT_WIDTH_PX } from './NarrowScreenBanner'
import { ToolbarTogglePill } from './ToolbarTogglePill'
import { DockableToolbar } from './DockableToolbar'

const PIXI_INSPECTION_MIN_WIDTH_PX = 375

function readViewportWidth(): number {
  if (typeof window === 'undefined') return MIN_EDITOR_LAYOUT_WIDTH_PX
  return window.innerWidth
}

export function PixiPreviewPage() {
  const navigate = useNavigate()
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen)
  const setRightSidebarOpen = useUIStore((s) => s.setRightSidebarOpen)
  const dockableToolbarLayouts = useUIStore((s) => s.dockableToolbarLayouts)
  const dockableToolbarVisibility = useUIStore((s) => s.dockableToolbarVisibility)
  const pixiStageRef = useRef<PixiStageHandle | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [error, setError] = useState<string | null>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [viewportWidth, setViewportWidth] = useState(() => readViewportWidth())
  const [viewport, setViewport] = useState<PixiViewportState>({ scale: 1, x: 0, y: 0 })
  const compactCollapseRef = useRef(false)
  const isCompactEditor = viewportWidth < MIN_EDITOR_LAYOUT_WIDTH_PX
  const leftToolsFloating = dockableToolbarLayouts['left-tools'].mode === 'floating'
  const rightInspectorFloating = dockableToolbarLayouts['right-inspector'].mode === 'floating'
  const leftToolsVisible = dockableToolbarVisibility['left-tools'] !== false
  const rightInspectorVisible = dockableToolbarVisibility['right-inspector'] !== false

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

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (isCompactEditor && rightSidebarOpen && !compactCollapseRef.current) {
      compactCollapseRef.current = true
      setRightSidebarOpen(false)
    } else if (!isCompactEditor && compactCollapseRef.current) {
      compactCollapseRef.current = false
      setRightSidebarOpen(true)
    }
  }, [isCompactEditor, rightSidebarOpen, setRightSidebarOpen])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden" data-testid="pixi-editor-page">
      {!isCompactEditor && leftToolsVisible && !leftToolsFloating && (
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
      )}

      <div
        ref={containerRef}
        className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-slate-100 dark:bg-gray-950"
        style={{ minWidth: `${PIXI_INSPECTION_MIN_WIDTH_PX}px` }}
        data-canvas-toolbar-host
        data-editor-min-width={PIXI_INSPECTION_MIN_WIDTH_PX}
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
            onError={setError}
            onViewportChange={setViewport}
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
        <PixiActionDock
          stageRef={pixiStageRef as RefObject<PixiStageHandle | null>}
          viewport={viewport}
        />
        <ColorPaletteToolbar />
        <AdminStatsToolbar />
        <ToolbarTogglePill />
        <PixiStatusBar
          stageRef={pixiStageRef as RefObject<PixiStageHandle | null>}
          onBackToMap={() => navigate('../map', { replace: true })}
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

      {rightSidebarOpen && rightInspectorVisible && !rightInspectorFloating && !isCompactEditor && (
        <div className="w-[320px] flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white transition-[width] duration-200 dark:border-gray-800 dark:bg-gray-950">
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
