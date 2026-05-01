import { useEffect, useRef, useState, type ComponentType } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ToolSelector } from './LeftSidebar/ToolSelector'
import { LayerVisibilityPanel } from './LeftSidebar/LayerVisibilityPanel'
import { ElementLibrary } from './LeftSidebar/ElementLibrary'
import { CollapsibleSection } from './LeftSidebar/CollapsibleSection'
import { RightSidebar } from './RightSidebar/RightSidebar'
import { SidebarToggle } from './RightSidebar/SidebarToggle'
import { StatusBar } from './StatusBar'
import { CanvasStage } from './Canvas/CanvasStage'
import { KeyboardShortcutsOverlay } from './KeyboardShortcutsOverlay'
import { PresentationOverlay } from './PresentationOverlay'
import { Minimap } from './Minimap'
import { CanvasActionDock } from './Canvas/CanvasActionDock'
import { CanvasScaleBar } from './Canvas/CanvasScaleBar'
import { NorthArrow } from './Canvas/NorthArrow'
import { AlignDistributeToolbar } from './Canvas/AlignDistributeToolbar'
import { ElementHoverCard } from './Canvas/ElementHoverCard'
import { FirstRunCoach } from './FirstRunCoach'
import { AdminStatsToolbar } from './AdminStatsToolbar'
import { MIN_EDITOR_LAYOUT_WIDTH_PX } from './NarrowScreenBanner'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { ToolbarTogglePill } from './ToolbarTogglePill'
import { DockableToolbar } from './DockableToolbar'
import { useUIStore } from '../../stores/uiStore'
import {
  normalizeNorthArrowVisibility,
  normalizeNorthRotation,
  useCanvasStore,
} from '../../stores/canvasStore'
import { useActiveFloor } from '../../stores/floorStore'
import { useElementsStore } from '../../stores/elementsStore'
import { useToastStore } from '../../stores/toastStore'

import { focusOnElement } from '../../lib/canvasFocus'
import type { CanvasElement } from '../../types/elements'
import type { Floor } from '../../types/floor'

interface ThreeDEntryProps {
  floor: Floor | null
  elements: Record<string, CanvasElement>
  onRequestFallback2D?: () => void
}

const CANVAS_INSPECTION_MIN_WIDTH_PX = 375

function readViewportWidth(): number {
  if (typeof window === 'undefined') return MIN_EDITOR_LAYOUT_WIDTH_PX
  return window.innerWidth
}

/**
 * Map (canvas) view. Rendered inside `ProjectShell`'s `<Outlet />`, so the
 * TopBar, global modals, and project bootstrap all live in the shell.
 *
 * The Cmd+K / Ctrl+K command palette (`CommandPalette.tsx` +
 * `commandPaletteActions.ts`) is mounted at the shell level so it's
 * reachable from every office route, not just the map. The shortcut is
 * wired in `useKeyboardShortcuts` — MapView itself consumes the palette's
 * outputs indirectly via `switchToFloor` + `focusOnElement`, which the
 * palette's floor/find-seat/find-element actions dispatch to.
 *
 * Presentation mode is intentionally handled here rather than in the shell:
 * it's a map-only concept (no canvas on the roster page), and rendering it
 * as a `fixed inset-0 z-50` overlay lets it cover the parent TopBar without
 * requiring the shell to know anything about it.
 */
export function MapView() {
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen)
  const selectedIds = useUIStore((s) => s.selectedIds)
  const rightSidebarTab = useUIStore((s) => s.rightSidebarTab)
  const setRightSidebarOpen = useUIStore((s) => s.setRightSidebarOpen)
  const setRightSidebarTab = useUIStore((s) => s.setRightSidebarTab)
  const setDockableToolbarVisible = useUIStore((s) => s.setDockableToolbarVisible)
  const dockableToolbarLayouts = useUIStore((s) => s.dockableToolbarLayouts)
  const dockableToolbarVisibility = useUIStore((s) => s.dockableToolbarVisibility)
  const activeWorkspacePreset = useUIStore((s) => s.activeWorkspacePreset)
  const firstRunCoachOpen = useUIStore((s) => s.firstRunCoachOpen)
  const setFirstRunCoachOpen = useUIStore((s) => s.setFirstRunCoachOpen)
  const presentationMode = useUIStore((s) => s.presentationMode)
  const viewMode = useUIStore((s) => s.viewMode)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const setCanvasSettings = useCanvasStore((s) => s.setSettings)
  const northRotationRaw = useCanvasStore((s) => s.settings.northRotation)
  const showNorthArrowRaw = useCanvasStore((s) => s.settings.showNorthArrow)
  const showNorthArrow = normalizeNorthArrowVisibility(showNorthArrowRaw)
  const activeFloor = useActiveFloor()
  const elements = useElementsStore((s) => s.elements)
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewportWidth, setViewportWidth] = useState(() => readViewportWidth())
  const [ThreeDEntry, setThreeDEntry] = useState<ComponentType<ThreeDEntryProps> | null>(null)
  const [threeDLoadFailed, setThreeDLoadFailed] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const previousSelectionCountRef = useRef(selectedIds.length)
  const collapsedSidebarForCompactRef = useRef(false)
  const wasCompactEditorRef = useRef(viewportWidth < MIN_EDITOR_LAYOUT_WIDTH_PX)

  const isCompactEditor = viewportWidth < MIN_EDITOR_LAYOUT_WIDTH_PX
  const emptyPropertiesState = rightSidebarTab === 'properties' && selectedIds.length === 0
  const leftToolsFloating = dockableToolbarLayouts['left-tools']?.mode === 'floating'
  const rightInspectorFloating = dockableToolbarLayouts['right-inspector']?.mode === 'floating'
  const leftToolsVisible = dockableToolbarVisibility['left-tools'] !== false
  const rightInspectorVisible = dockableToolbarVisibility['right-inspector'] !== false

  const showFirstRunCoach =
    firstRunCoachOpen || (selectedIds.length === 0 && !rightSidebarOpen)

  useEffect(() => {
    if (selectedIds.length === 0 && rightSidebarTab === 'properties') {
      setRightSidebarOpen(false)
    }

    if (activeWorkspacePreset !== 'admin') {
      try {
        if (localStorage.getItem('oandocraft.toolbar-visibility') === null) {
          setDockableToolbarVisible('admin-stats', false)
        }
      } catch {
        setDockableToolbarVisible('admin-stats', false)
      }
    }
    // First-load calm state only. Selection changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const wasCompactEditor = wasCompactEditorRef.current

    if (isCompactEditor && rightSidebarOpen && (!wasCompactEditor || !collapsedSidebarForCompactRef.current)) {
      collapsedSidebarForCompactRef.current = true
      setRightSidebarOpen(false)
    } else if (!isCompactEditor && wasCompactEditor && collapsedSidebarForCompactRef.current) {
      collapsedSidebarForCompactRef.current = false
      setRightSidebarOpen(true)
    }

    wasCompactEditorRef.current = isCompactEditor
  }, [isCompactEditor, rightSidebarOpen, setRightSidebarOpen])

  useEffect(() => {
    const previousSelectionCount = previousSelectionCountRef.current
    previousSelectionCountRef.current = selectedIds.length

    if (previousSelectionCount === 0 && selectedIds.length > 0) {
      if (rightSidebarTab === 'properties') {
        setRightSidebarOpen(true)
      } else if (!rightSidebarOpen) {
        setRightSidebarTab('properties')
      }
    }
  }, [rightSidebarOpen, rightSidebarTab, selectedIds.length, setRightSidebarOpen, setRightSidebarTab])

  useEffect(() => {
    const next: { showNorthArrow?: boolean; northRotation?: number } = {}

    if (showNorthArrowRaw !== undefined && typeof showNorthArrowRaw !== 'boolean') {
      next.showNorthArrow = normalizeNorthArrowVisibility(showNorthArrowRaw)
    }
    if (northRotationRaw !== undefined) {
      const normalized = normalizeNorthRotation(northRotationRaw)
      if (normalized !== northRotationRaw) {
        next.northRotation = normalized
      }
    }

    if (Object.keys(next).length > 0) {
      setCanvasSettings(next)
    }
  }, [northRotationRaw, setCanvasSettings, showNorthArrowRaw])

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

  useEffect(() => {
    const seatId = searchParams.get('seat')
    const focusId = searchParams.get('focus')
    if (!seatId && !focusId) return

    // `?seat=<id>` or `?focus=<id>` — focus on a specific element.
    // Since there's only one floor, we just look up the element
    // directly in the current floor.
    if (seatId || focusId) {
      const id = seatId || focusId
      const element = elements[id!]
      if (element) {
        useUIStore.getState().setSelectedIds([id!])
        focusOnElement(
          { x: element.x, y: element.y, width: element.width, height: element.height },
          id!,
        )
      }
    }

    const next = new URLSearchParams(searchParams)
    next.delete('floor')
    next.delete('seat')
    next.delete('focus')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // First-run onboarding toast for presentation mode: the Esc/P exit
  // shortcut isn't documented in the mode itself beyond the small
  // "Exit" button, so surface it once per device the first time the
  // operator enters presentation. Localstorage key gates subsequent
  // entries; wrapped in try/catch so a private-mode / disabled-storage
  // browser just skips the hint rather than crashing.
  useEffect(() => {
    if (!presentationMode) return
    try {
      if (localStorage.getItem('presentationModeHintSeen') === '1') return
      localStorage.setItem('presentationModeHintSeen', '1')
    } catch {
      return
    }
    useToastStore.getState().push({
      tone: 'info',
      title: 'Press Esc or P to exit presentation mode.',
    })
  }, [presentationMode])

  if (presentationMode) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen bg-white dark:bg-gray-900">
        <CanvasStage />
        <KeyboardShortcutsOverlay />
        <PresentationOverlay />
        {/* Always-visible exit affordance — Escape/P alone is undiscoverable */}
        <button
          onClick={() => useUIStore.getState().setPresentationMode(false)}
          className="absolute top-4 right-4 z-50 px-3 py-2 rounded-md bg-gray-900/80 hover:bg-gray-900 text-white text-sm font-medium shadow-lg backdrop-blur-sm flex items-center gap-2 transition-colors"
          title="Exit presentation mode (Esc or P)"
          aria-label="Exit presentation mode"
        >
          <span>Exit</span>
          <kbd className="text-[10px] font-mono bg-white/20 dark:bg-gray-900/20 px-1.5 py-0.5 rounded">Esc</kbd>
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 min-w-0 overflow-hidden">
        <div
          className="flex min-w-0 flex-1 overflow-hidden"
          style={{ minWidth: `${CANVAS_INSPECTION_MIN_WIDTH_PX}px` }}
          data-editor-min-width={CANVAS_INSPECTION_MIN_WIDTH_PX}
        >
        {/* ── Left sidebar ────────────────────────────────────── */}
        {leftToolsVisible && (
          <div className="flex w-[280px] flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-30">
            <div className="flex h-8 shrink-0 items-center border-b border-gray-200 dark:border-gray-800 px-3 bg-white dark:bg-gray-950">
              <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">Tools Rail</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FloatingToolsRail />
            </div>
          </div>
        )}

        {/* ── Center Canvas Host ──────────────────────────────── */}
        <div
          className="relative min-w-0 flex-1 overflow-hidden bg-[#f0f0f0] dark:bg-gray-900"
          data-canvas-toolbar-host
        >
          {viewMode === '2.5d' ? (
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
          ) : (
            <>
              <div className="absolute inset-0">
                <CanvasStage />
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
              {/* Canvas action dock lives at host level so bottom/right are
                  relative to the host, not the inset-0 canvas overlay */}
              <CanvasActionDock />
            </>
          )}
        </div>

        {/* ── Right sidebar ────────────────────────────────────── */}
        {!rightSidebarOpen && <SidebarToggle variant="docked" />}
        {rightSidebarOpen && rightInspectorVisible && (
          <div className="flex w-[320px] flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-30">
            <div className="flex h-8 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-3 bg-white dark:bg-gray-950">
              <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">Inspector</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <RightSidebar />
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  )
}

function FloatingToolsRail() {
  return (
    <div className="flex flex-col">
      <CollapsibleSection title="Tools" defaultOpen storageKey="floating-tools">
        <ToolSelector />
      </CollapsibleSection>
      <CollapsibleSection title="Layers" defaultOpen={false} storageKey="floating-layers">
        <LayerVisibilityPanel />
      </CollapsibleSection>
      <CollapsibleSection title="Library" defaultOpen storageKey="floating-library">
        <ElementLibrary />
      </CollapsibleSection>
    </div>
  )
}

