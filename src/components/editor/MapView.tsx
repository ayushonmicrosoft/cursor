import { useEffect, useState, type ComponentType } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FloorSwitcher } from './FloorSwitcher'
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
import { useUIStore } from '../../stores/uiStore'
import {
  normalizeNorthArrowVisibility,
  normalizeNorthRotation,
  useCanvasStore,
} from '../../stores/canvasStore'
import { useFloorStore } from '../../stores/floorStore'
import { useElementsStore } from '../../stores/elementsStore'
import { useNeighborhoodStore } from '../../stores/neighborhoodStore'
import { useToastStore } from '../../stores/toastStore'
import { switchToFloor } from '../../lib/seatAssignment'
import { focusOnElement } from '../../lib/canvasFocus'
import type { CanvasElement } from '../../types/elements'
import type { Floor } from '../../types/floor'

interface ThreeDEntryProps {
  floor: Floor | null
  elements: Record<string, CanvasElement>
  onRequestFallback2D?: () => void
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
  const presentationMode = useUIStore((s) => s.presentationMode)
  const viewMode = useUIStore((s) => s.viewMode)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const setCanvasSettings = useCanvasStore((s) => s.setSettings)
  const northRotationRaw = useCanvasStore((s) => s.settings.northRotation)
  const showNorthArrowRaw = useCanvasStore((s) => s.settings.showNorthArrow)
  // The north-arrow compass renders by default but the user can hide
  // it via View → "Toggle compass" or the `N` hotkey when the floor
  // plan has no real-world cardinal alignment. Legacy projects (no
  // field set) keep the historical behaviour by treating undefined
  // as `true`.
  const showNorthArrow = normalizeNorthArrowVisibility(showNorthArrowRaw)
  const activeFloorId = useFloorStore((s) => s.activeFloorId)
  const floors = useFloorStore((s) => s.floors)
  const elements = useElementsStore((s) => s.elements)
  const [searchParams, setSearchParams] = useSearchParams()
  const [ThreeDEntry, setThreeDEntry] = useState<ComponentType<ThreeDEntryProps> | null>(null)
  const [threeDLoadFailed, setThreeDLoadFailed] = useState(false)
  const activeFloor = floors.find((f) => f.id === activeFloorId) ?? null

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
    const floorId = searchParams.get('floor')
    const seatId = searchParams.get('seat')
    const focusId = searchParams.get('focus')
    if (!floorId && !seatId && !focusId) return

    if (floorId) {
      switchToFloor(floorId)
    }

    if (seatId) {
      const floors = useFloorStore.getState().floors
      const target = floors.find(
        (f) => f.id === (floorId ?? useFloorStore.getState().activeFloorId),
      )
      const element = target?.elements[seatId]
      if (element) {
        useUIStore.getState().setSelectedIds([seatId])
        focusOnElement(
          { x: element.x, y: element.y, width: element.width, height: element.height },
          seatId,
        )
      }
    }

    // `?focus=<id>` — cross-office search landing. Walk every floor for
    // an element or a neighborhood with this id; whichever hits first
    // wins. We switch to the owning floor and pan/zoom to it so the
    // operator doesn't have to hunt. Done in a single effect after the
    // store-hydration in ProjectShell has completed (the palette
    // navigates to this route, and by the time the effect fires the
    // stores have rehydrated the destination office).
    if (focusId) {
      const floors = useFloorStore.getState().floors
      let foundOn: string | null = null
      let bounds: { x: number; y: number; width: number; height: number } | null = null
      for (const f of floors) {
        const el = f.elements[focusId]
        if (el) {
          foundOn = f.id
          bounds = { x: el.x, y: el.y, width: el.width, height: el.height }
          break
        }
      }
      if (!bounds) {
        const neighborhoods = useNeighborhoodStore.getState().neighborhoods
        const n = neighborhoods[focusId]
        if (n) {
          foundOn = n.floorId
          bounds = { x: n.x, y: n.y, width: n.width, height: n.height }
        }
      }
      if (foundOn && bounds) {
        switchToFloor(foundOn)
        useUIStore.getState().setSelectedIds([focusId])
        focusOnElement(bounds, focusId)
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
      <FloorSwitcher />
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/*
          The sidebar scrolls as a single unit. ToolSelector +
          LayerVisibilityPanel + ElementLibrary stack at their natural
          heights and the whole column owns the scrollbar — so when the
          top panels grow (filters open, more layers, etc.) they can't
          squeeze ElementLibrary's tiles off the bottom. Previously the
          library owned its own `overflow-y-auto` inside a `min-h-0`
          column, which clipped tiles when its siblings took more space.
        */}
        <div className="w-[260px] flex-shrink-0 bg-gradient-to-b from-white to-[#f8f3ed] dark:from-gray-950 dark:to-[#0f1e32] border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-y-auto">
          <CollapsibleSection title="Tools" defaultOpen storageKey="tools">
            <ToolSelector />
          </CollapsibleSection>
          <CollapsibleSection title="Layers" defaultOpen storageKey="layers">
            <LayerVisibilityPanel />
          </CollapsibleSection>
          <CollapsibleSection title="Library" defaultOpen storageKey="library">
            <ElementLibrary />
          </CollapsibleSection>
        </div>
        <div
          className="flex-1 min-w-0 relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(244,239,232,0.9)_40%,_rgba(226,232,240,0.82)_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(20,31,50,0.98),_rgba(11,22,40,0.96)_45%,_rgba(3,7,18,0.98)_100%)]"
          data-canvas-toolbar-host
        >
          {viewMode === '2.5d' ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center bg-white/85 dark:bg-gray-950/85"
              data-testid="mapview-25d-panel"
            >
              {ThreeDEntry ? (
                <ThreeDEntry
                  floor={activeFloor}
                  elements={elements}
                  onRequestFallback2D={() => setViewMode('2d')}
                />
              ) : (
                <div className="max-w-lg rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/80 p-5 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    2.5D preview is starting
                  </p>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                    {threeDLoadFailed
                      ? '3D engine module is unavailable right now. Staying in safe fallback mode.'
                      : 'Waiting for the 2.5D engine module to load. 2D editing stays available.'}
                  </p>
                  {threeDLoadFailed && (
                    <button
                      type="button"
                      onClick={() => setViewMode('2d')}
                      className="mt-3 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      Return to 2D editor
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <CanvasStage />
              <StatusBar />
              <Minimap />
              <AlignDistributeToolbar />
              <ElementHoverCard />
              <CanvasActionDock />
              <AdminStatsToolbar />
              <CanvasScaleBar />
              {showNorthArrow && <NorthArrow />}
              <FirstRunCoach />
            </>
          )}
          {/* Closed-state pull-tab to expand the right sidebar.
              Replaces the toggle that used to live in the TopBar so
              the control belongs to the panel it controls. Only
              renders when the panel is hidden. */}
          {!rightSidebarOpen && <SidebarToggle variant="floating" />}
        </div>
        {rightSidebarOpen && (
          <div className="w-[320px] flex-shrink-0 bg-gradient-to-b from-white to-[#f8f3ed] dark:from-gray-950 dark:to-[#0f1e32] border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
            <RightSidebar />
          </div>
        )}
      </div>
    </>
  )
}
