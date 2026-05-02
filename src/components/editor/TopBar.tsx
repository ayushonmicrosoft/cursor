import { useProjectStore } from '../../stores/projectStore'
import { useCanvasStore } from '../../stores/canvasStore'
import {
  WORKSPACE_PRESET_CONFIGS,
  useUIStore,
  type DockableToolbarId,
  type TopbarQuickActionId,
  type WorkspacePresetId,
} from '../../stores/uiStore'
import { useElementsStore } from '../../stores/elementsStore'
import { useEmployeeStore } from '../../stores/employeeStore'
import { useFloorStore } from '../../stores/floorStore'
import { useNeighborhoodStore } from '../../stores/neighborhoodStore'
import { useShallow } from 'zustand/react/shallow'
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Ruler,
  Grid3x3,
  Compass,
  Zap,
  Printer,
  Image as ImageIcon,
  Eye,
  Check,
  Download,
  Hash,
  SlidersHorizontal,
  Map as MapIcon,
  BarChart3,
  Settings2,
  PanelLeft,
  PanelRight,
  Maximize,
  PlaySquare,
  Menu,
  ChevronDown,
} from 'lucide-react'
import { SeatLabelStylePicker } from './TopBar/SeatLabelStylePicker'
import { FileMenu, type FileMenuGroup } from './TopBar/FileMenu'
import { buildWayfindingPdf, buildFileName } from '../../lib/pdfExport'
import { exportFloorAsPng } from '../../lib/pngExport'
import { buildExportFilename } from '../../lib/exportFilename'
import { getActiveStage } from '../../lib/stageRegistry'
import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import { useCan } from '../../hooks/useCan'
import { TeamSwitcher } from '../team/TeamSwitcher'
import { ScaleSettingsPopover } from './ScaleSettingsPopover'
import { PlanHealthPill } from './PlanHealthPill'
import { UserMenu } from '../team/UserMenu'

const TOOLBAR_MENU_ITEMS: Array<{
  id: DockableToolbarId
  label: string
  adminOnly?: boolean
  icon?: React.ElementType
}> = [
  { id: 'canvas-actions', label: 'Canvas controls', icon: Settings2 },
  { id: 'left-tools', label: 'Left tools rail', icon: PanelLeft },
  { id: 'right-inspector', label: 'Right inspector', icon: PanelRight },
  { id: 'minimap', label: 'Minimap', icon: MapIcon },
  { id: 'admin-stats', label: 'Admin operations', adminOnly: true, icon: BarChart3 },
]

const WORKSPACE_PRESET_IDS: WorkspacePresetId[] = ['design', 'admin', 'review']

const primaryViewLinkClass = 'topbar-nav-link'
const secondaryMenuButtonClass = 'topbar-btn'
const secondaryMenuItemClass =
  'flex min-w-0 items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-800/50 dark:focus:bg-gray-800/50'

const dividerClass = 'topbar-divider'
const iconActionButtonClass = 'topbar-btn-icon'

export function TopBar() {
  const project = useProjectStore((s) => s.currentProject)
  const saveState = useProjectStore((s) => s.saveState)
  const lastSavedAt = useProjectStore((s) => s.lastSavedAt)
  const { teamSlug, officeSlug } = useParams<{
    teamSlug: string
    officeSlug: string
  }>()

  const {
    stageScale,
    zoomIn,
    zoomOut,
    resetZoom,
    settings,
    setSettings,
    toggleGrid,
    toggleDimensions,
    toggleNorthArrow,
    toggleDeskIds,
  } = useCanvasStore(
    useShallow((s) => ({
      stageScale: s.stageScale,
      zoomIn: s.zoomIn,
      zoomOut: s.zoomOut,
      resetZoom: s.resetZoom,
      settings: s.settings,
      setSettings: s.setSettings,
      toggleGrid: s.toggleGrid,
      toggleDimensions: s.toggleDimensions,
      toggleNorthArrow: s.toggleNorthArrow,
      toggleDeskIds: s.toggleDeskIds,
    })),
  )

  const {
    setExportDialogOpen,
    viewMode,
    setViewMode,
    presentationMode,
    setPresentationMode,
    dockableToolbarLayouts,
    dockableToolbarVisibility,
    activeWorkspacePreset,
    topbarControlVisibility,
    topbarQuickActionOrder,
    topbarQuickActionVisibility,
    setDockableToolbarMode,
    setDockableToolbarVisible,
    applyWorkspacePreset,
    resetDockableWorkspace,
  } = useUIStore(
    useShallow((s) => ({
      setExportDialogOpen: s.setExportDialogOpen,
      viewMode: s.viewMode,
      setViewMode: s.setViewMode,
      presentationMode: s.presentationMode,
      setPresentationMode: s.setPresentationMode,
      dockableToolbarLayouts: s.dockableToolbarLayouts,
      dockableToolbarVisibility: s.dockableToolbarVisibility,
      activeWorkspacePreset: s.activeWorkspacePreset,
      topbarControlVisibility: s.topbarControlVisibility,
      topbarQuickActionOrder: s.topbarQuickActionOrder,
      topbarQuickActionVisibility: s.topbarQuickActionVisibility,
      setDockableToolbarMode: s.setDockableToolbarMode,
      setDockableToolbarVisible: s.setDockableToolbarVisible,
      applyWorkspacePreset: s.applyWorkspacePreset,
      resetDockableWorkspace: s.resetDockableWorkspace,
    })),
  )

  const undo = () => {
    useElementsStore.temporal?.getState().undo()
    useNeighborhoodStore.temporal?.getState().undo()
  }
  const redo = () => {
    useElementsStore.temporal?.getState().redo()
    useNeighborhoodStore.temporal?.getState().redo()
  }
  const temporalState = useElementsStore.temporal?.getState()
  const canUndo = (temporalState?.pastStates.length ?? 0) > 0
  const canRedo = (temporalState?.futureStates.length ?? 0) > 0
  const canEditMap = useCan('editMap')
  const canManageWorkspace = useCan('manageWorkspace')
  const canViewReports = useCan('viewReports')

  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const viewMenuRef = useRef<HTMLDivElement>(null)
  const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false)
  const toolbarMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (
        viewMenuRef.current &&
        !viewMenuRef.current.contains(e.target as Node)
      ) {
        setViewMenuOpen(false)
      }
      if (
        toolbarMenuRef.current &&
        !toolbarMenuRef.current.contains(e.target as Node)
      ) {
        setToolbarMenuOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setViewMenuOpen(false)
        setToolbarMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [compactMenuOpen, setCompactMenuOpen] = useState(false)
  const compactMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onResize = () => {
      setIsNarrow(window.innerWidth < 768)
      if (window.innerWidth >= 768) setCompactMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (compactMenuRef.current && !compactMenuRef.current.contains(e.target as Node)) {
        setCompactMenuOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setCompactMenuOpen(false)
    }
    if (compactMenuOpen) {
      document.addEventListener('mousedown', onPointer)
      document.addEventListener('keydown', onKey)
      return () => {
        document.removeEventListener('mousedown', onPointer)
        document.removeEventListener('keydown', onKey)
      }
    }
  }, [compactMenuOpen])

  const compactMenu = isNarrow && (
    <div className="relative" ref={compactMenuRef}>
      <button
        type="button"
        onClick={() => setCompactMenuOpen(!compactMenuOpen)}
        className={`${iconActionButtonClass} ${compactMenuOpen ? 'topbar-btn-active' : ''}`}
        aria-label="More actions"
        aria-expanded={compactMenuOpen}
      >
        <Menu size={18} />
      </button>
      {compactMenuOpen && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-xl min-w-[200px] py-1">
          {teamSlug && officeSlug && (
            <div className="px-2 py-1 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1">
                <NavLink
                  to={`/t/${teamSlug}/o/${officeSlug}/map`}
                  onClick={() => { setViewMode('2d'); setCompactMenuOpen(false) }}
                  className={({ isActive }) => `flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <MapIcon size={12} /> Map
                </NavLink>
                <NavLink
                  to={`/t/${teamSlug}/o/${officeSlug}/roster`}
                  onClick={() => setCompactMenuOpen(false)}
                  className={({ isActive }) => `flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <BarChart3 size={12} /> Roster
                </NavLink>
              </div>
            </div>
          )}
          <div className="px-2 py-1 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1">History</p>
            <button
              type="button"
              onClick={() => { undo(); setCompactMenuOpen(false) }}
              disabled={!canUndo}
              className="w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 disabled:opacity-40"
            >
              <Undo2 size={14} /> Undo
            </button>
            <button
              type="button"
              onClick={() => { redo(); setCompactMenuOpen(false) }}
              disabled={!canRedo}
              className="w-full px-2 py-1.5 text-xs text-left rounded flex items-center gap-2 disabled:opacity-40"
            >
              <Redo2 size={14} /> Redo
            </button>
          </div>
          <div className="px-2 py-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1">Zoom {Math.round(stageScale * 100)}%</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { zoomOut(); setCompactMenuOpen(false) }}
                className="flex-1 px-2 py-1.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ZoomOut size={14} className="mx-auto" />
              </button>
              <button
                type="button"
                onClick={() => { zoomIn(); setCompactMenuOpen(false) }}
                className="flex-1 px-2 py-1.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ZoomIn size={14} className="mx-auto" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const resolveActiveFloor = () => {
    const floorState = useFloorStore.getState()
    return (
      floorState.floors.find((candidate) => candidate.id === floorState.activeFloorId) ??
      floorState.floor ??
      floorState.floors[0] ??
      null
    )
  }

  const [, forceTick] = useState(0)
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (id !== null) return
      id = setInterval(() => forceTick((n) => n + 1), 10_000)
    }
    const stop = () => {
      if (id !== null) {
        clearInterval(id)
        id = null
      }
    }
    const onVisibility = () => {
      if (document.hidden) {
        stop()
      } else {
        forceTick((n) => n + 1)
        start()
      }
    }
    if (!document.hidden) start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const handleExportPng = () => {
    const stage = getActiveStage()
    const floor = resolveActiveFloor()
    if (!stage || !project || !floor) return
    const settings = useCanvasStore.getState().settings
    const allNeighborhoods = useNeighborhoodStore.getState().neighborhoods
    const neighborhoods = Object.values(allNeighborhoods)
      .filter((n) => n.floorId === floor.id)
      .map((n) => ({ id: n.id, name: n.name, color: n.color }))
    const pxPerUnit =
      settings.scaleUnit === 'px' || settings.scale <= 0
        ? null
        : 1 / settings.scale
    const stageWidth = typeof stage.width === 'function' ? stage.width() : 0
    const stageHeight = typeof stage.height === 'function' ? stage.height() : 0
    void exportFloorAsPng(stage, {
      filename: buildExportFilename(project.name, floor.name, 'png'),
      chrome: {
        officeName: project.name,
        floorName: floor.name,
        generatedAt: new Date(),
        pxPerUnit,
        scaleUnit: settings.scaleUnit,
        neighborhoods,
        canvasWidth: stageWidth,
        canvasHeight: stageHeight,
      },
    })
  }

  const handleExportWayfindingPdf = () => {
    const stage = getActiveStage()
    const floor = resolveActiveFloor()
    if (!stage || !project || !floor) return
    const elements = Object.values(useElementsStore.getState().elements)
    const employees = Object.values(useEmployeeStore.getState().employees)
    const settings = useCanvasStore.getState().settings
    const blob = buildWayfindingPdf({
      stage,
      projectName: project.name,
      floor,
      elements,
      employees,
      canvasSettings: settings,
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = buildFileName(project.name, floor.name)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const fileMenuGroups: FileMenuGroup[] = [
    {
      heading: 'Export',
      items: [
        ...(canViewReports
          ? [
              {
                id: 'export-pdf',
                label: 'Export PDF (wayfinding)',
                icon: Printer,
                onSelect: () => handleExportWayfindingPdf(),
              },
              {
                id: 'export-png',
                label: 'Export PNG',
                icon: ImageIcon,
                onSelect: () => handleExportPng(),
              },
            ]
          : []),
        {
          id: 'export-more',
          label: 'More formats…',
          icon: Download,
          onSelect: () => setExportDialogOpen(true),
        },
      ],
    },
  ]

  function renderQuickActionButton(id: TopbarQuickActionId) {
    if (id === 'grid') {
      return (
        <button
          key="grid"
          type="button"
          onClick={() => toggleGrid()}
          className={`${iconActionButtonClass} ${settings.showGrid ? 'topbar-btn-active' : ''}`}
          title={settings.showGrid ? 'Hide grid (G)' : 'Show grid (G)'}
          aria-label="Toggle grid"
          aria-pressed={settings.showGrid}
          data-testid="topbar-quick-action-grid"
        >
          <Grid3x3 size={16} aria-hidden="true" />
        </button>
      )
    }

    if (id === 'minimap') {
      const minimapVisible = dockableToolbarVisibility.minimap ?? true
      return (
        <button
          key="minimap"
          type="button"
          onClick={() => setDockableToolbarVisible('minimap', !minimapVisible)}
          className={`${iconActionButtonClass} ${minimapVisible ? 'topbar-btn-active' : ''}`}
          title={minimapVisible ? 'Hide minimap' : 'Show minimap'}
          aria-label="Toggle minimap"
          aria-pressed={minimapVisible}
          data-testid="topbar-quick-action-minimap"
        >
          <MapIcon size={16} aria-hidden="true" />
        </button>
      )
    }

    return (
      <button
        key="presentation"
        type="button"
        onClick={() => setPresentationMode(!presentationMode)}
        className={`${iconActionButtonClass} ${presentationMode ? 'topbar-btn-active-violet' : ''}`}
        title={presentationMode ? 'Exit presentation mode' : 'Enter presentation mode'}
        aria-label="Toggle presentation mode"
        aria-pressed={presentationMode}
        data-testid="topbar-quick-action-presentation"
      >
        <PlaySquare size={16} aria-hidden="true" />
      </button>
    )
  }

  return (
    <div
      className="relative z-[60] flex h-12 max-h-12 w-full min-w-0 flex-shrink-0 flex-nowrap items-center border-b border-gray-200/80 bg-white/95 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/95"
      data-fixed-toolbar="top-bar"
      data-fixed-toolbar-reason="Top bar owns team switching, file actions, save state, undo/redo, view menu, route links, and user identity outside the canvas dock host."
    >
      <div
        className="flex h-full min-w-0 w-full flex-nowrap items-center gap-1 touch-none px-2 pr-3 sm:gap-1.5 sm:px-3 sm:pr-4"
        data-testid="topbar-layout-row"
      >
        <TeamSwitcher currentSlug={teamSlug} />

        {compactMenu}

        {!isNarrow && teamSlug && officeSlug && (
          <nav
            aria-label="Primary office views"
            className="flex min-w-0 flex-none items-center gap-1  border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900"
          >
            <NavLink
              to={`/t/${teamSlug}/o/${officeSlug}/map`}
              title="Map"
              className={({ isActive }) =>
                `${primaryViewLinkClass} ${
                  isActive ? 'topbar-nav-link-active' : 'topbar-nav-link-inactive'
                }`
              }
            >
              <MapIcon size={16} aria-hidden="true" />
              <span className="hidden truncate lg:inline">Map</span>
            </NavLink>
            {canViewReports && (
              <NavLink
                to={`/t/${teamSlug}/o/${officeSlug}/reports`}
                title="Reports"
                className={({ isActive }) =>
                  `${primaryViewLinkClass} ${
                    isActive ? 'topbar-nav-link-active' : 'topbar-nav-link-inactive'
                  }`
                }
              >
                <BarChart3 size={16} aria-hidden="true" />
                <span className="hidden truncate sm:inline">Reports</span>
              </NavLink>
            )}
          </nav>
        )}

        {topbarControlVisibility['file-menu'] && (
          <FileMenu groups={fileMenuGroups} />
        )}

        <div className={dividerClass} />

        {topbarControlVisibility['save-indicator'] && (
          <SaveIndicator saveState={saveState} lastSavedAt={lastSavedAt} />
        )}

        {topbarControlVisibility.history && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => undo()}
              disabled={!canUndo}
              className={iconActionButtonClass}
              title={canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo'}
              aria-label={canUndo ? 'Undo' : 'Nothing to undo'}
            >
              <Undo2 size={16} aria-hidden="true" />
            </button>
            <button
              onClick={() => redo()}
              disabled={!canRedo}
              className={iconActionButtonClass}
              title={canRedo ? 'Redo (Ctrl+Shift+Z)' : 'Nothing to redo'}
              aria-label={canRedo ? 'Redo' : 'Nothing to redo'}
            >
              <Redo2 size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        <div className={dividerClass} />

        {/* Quick-access toolbar toggles */}
        {topbarControlVisibility['quick-actions'] && (
          <div className="flex items-center gap-0.5" data-testid="topbar-quick-actions">
            {topbarQuickActionOrder
              .filter((id) => topbarQuickActionVisibility[id] !== false)
              .map((id) => renderQuickActionButton(id))}
          </div>
        )}

        <div className={dividerClass} />

        {topbarControlVisibility['view-menu'] && (
          <div className="relative" ref={viewMenuRef}>
          <button
            onClick={() => setViewMenuOpen((o) => !o)}
            className="topbar-btn"
            aria-haspopup="menu"
            aria-expanded={viewMenuOpen}
            title="View options"
            aria-label="View options"
          >
            <Eye size={16} aria-hidden="true" />
            <span>View</span>
          </button>
          {viewMenuOpen && (
            <div
              role="menu"
              className="absolute left-0 z-[100] mt-1 w-64  border border-gray-200 bg-white py-1 shadow dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setViewMenuOpen(false)
                  zoomIn()
                }}
                className={secondaryMenuItemClass}
              >
                <ZoomIn size={14} aria-hidden="true" />
                Zoom in
                <kbd className="ml-auto font-mono text-[10px] text-gray-400 dark:text-gray-500">
                  +
                </kbd>
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setViewMenuOpen(false)
                  zoomOut()
                }}
                className={secondaryMenuItemClass}
              >
                <ZoomOut size={14} aria-hidden="true" />
                Zoom out
                <kbd className="ml-auto font-mono text-[10px] text-gray-400 dark:text-gray-500">
                  −
                </kbd>
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setViewMenuOpen(false)
                  resetZoom()
                }}
                className={secondaryMenuItemClass}
              >
                <span className="inline-block w-[14px] text-center font-mono text-xs">
                  {Math.round(stageScale * 100)}
                </span>
                Reset zoom
                <kbd className="ml-auto font-mono text-[10px] text-gray-400 dark:text-gray-500">
                  0
                </kbd>
              </button>
              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
              <button
                role="menuitem"
                onClick={() => {
                  setViewMenuOpen(false)
                  toggleGrid()
                }}
                className={secondaryMenuItemClass}
              >
                {settings.showGrid ? (
                  <Check size={14} aria-hidden="true" />
                ) : (
                  <span className="inline-block w-[14px]" />
                )}
                <Grid3x3 size={14} aria-hidden="true" />
                Toggle grid
                <kbd className="ml-auto font-mono text-[10px] text-gray-400 dark:text-gray-500">
                  G
                </kbd>
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setViewMenuOpen(false)
                  toggleDimensions()
                }}
                className={secondaryMenuItemClass}
              >
                {settings.showDimensions ? (
                  <Check size={14} aria-hidden="true" />
                ) : (
                  <span className="inline-block w-[14px]" />
                )}
                <Ruler size={14} aria-hidden="true" />
                Toggle dimensions
                <kbd className="ml-auto font-mono text-[10px] text-gray-400 dark:text-gray-500">
                  D
                </kbd>
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setViewMenuOpen(false)
                  toggleNorthArrow()
                }}
                className={secondaryMenuItemClass}
              >
                {(settings.showNorthArrow ?? true) ? (
                  <Check size={14} aria-hidden="true" />
                ) : (
                  <span className="inline-block w-[14px]" />
                )}
                <Compass size={14} aria-hidden="true" />
                Toggle compass
                <kbd className="ml-auto font-mono text-[10px] text-gray-400 dark:text-gray-500">
                  N
                </kbd>
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setViewMenuOpen(false)
                  toggleDeskIds()
                }}
                className={secondaryMenuItemClass}
              >
                {(settings.showDeskIds ?? false) ? (
                  <Check size={14} aria-hidden="true" />
                ) : (
                  <span className="inline-block w-[14px]" />
                )}
                <Hash size={14} aria-hidden="true" />
                Show desk IDs
              </button>
              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
              <SeatLabelStylePicker
                value={settings.seatLabelStyle ?? 'pill'}
                onChange={(next) => setSettings({ seatLabelStyle: next })}
              />
              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
              <div className="px-3 py-2">
                <label
                  htmlFor="topbar-grid-size"
                  className="mb-1 block text-[10px] font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500"
                >
                  Grid size
                </label>
                <input
                  id="topbar-grid-size"
                  type="number"
                  min={4}
                  max={200}
                  step={2}
                  value={settings.gridSize}
                  onChange={(e) =>
                    setSettings({ gridSize: Number(e.target.value) })
                  }
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div className="px-3 pb-2">
                <div className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
                  Scale
                </div>
                <ScaleSettingsPopover />
              </div>
            </div>
          )}
          </div>
        )}

        {canEditMap && (
          <div className="flex items-center gap-1">
            <div className={dividerClass} />

            {topbarControlVisibility['layout-menu'] && (
              <div className="relative" ref={toolbarMenuRef}>
                <button
                  type="button"
                  onClick={() => setToolbarMenuOpen((o) => !o)}
                  className="topbar-btn"
                  title="Workspace layout settings"
                  aria-label="Workspace layout settings"
                  aria-haspopup="menu"
                  aria-expanded={toolbarMenuOpen}
                >
                  <SlidersHorizontal size={16} aria-hidden="true" />
                  <span>Layout</span>
                </button>
                {toolbarMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-[100] mt-1 w-72 border border-black/[0.06] bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-white/[0.06] dark:bg-gray-950/95"
                  >
                    <div className="mb-3 px-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                        Visibility
                      </p>
                      <div className="mt-1.5 space-y-1">
                        {TOOLBAR_MENU_ITEMS.filter(
                          (item) => !item.adminOnly || canManageWorkspace,
                        ).map((item) => {
                          const visible = dockableToolbarVisibility[item.id] ?? true
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setDockableToolbarVisible(item.id, !visible)}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]"
                            >
                              <div className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${visible ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                {visible && <Check size={10} />}
                              </div>
                              <span className="flex-1 font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="my-2 h-px bg-black/[0.05] dark:bg-white/[0.05]" />

                    <div className="mb-3 px-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                        Presets
                      </p>
                      <div className="mt-1.5 flex gap-1">
                        {WORKSPACE_PRESET_IDS.map((presetId) => {
                          const preset = WORKSPACE_PRESET_CONFIGS[presetId]
                          const active = activeWorkspacePreset === presetId
                          return (
                            <button
                              key={presetId}
                              type="button"
                              onClick={() => { applyWorkspacePreset(presetId); setToolbarMenuOpen(false) }}
                              className={`flex-1 px-2 py-1.5 text-[11px] font-semibold transition-all ${active ? 'bg-[#1f3653] text-white dark:bg-[#d6c2a6] dark:text-gray-950' : 'bg-black/[0.04] text-gray-600 hover:bg-black/[0.07] dark:bg-white/[0.04] dark:text-gray-300'}`}
                            >
                              {preset.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="my-2 h-px bg-black/[0.05] dark:bg-white/[0.05]" />

                    <div className="px-1 space-y-1">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                        Configuration
                      </p>
                      {TOOLBAR_MENU_ITEMS.filter(
                        (item) => !item.adminOnly || canManageWorkspace,
                      ).map((item) => {
                        const mode = dockableToolbarLayouts[item.id]?.mode ?? 'docked'
                        const visible = dockableToolbarVisibility[item.id] ?? true
                        if (!visible) return null
                        return (
                          <div key={item.id} className="flex items-center gap-2 px-1 py-1">
                            <span className="min-w-0 flex-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 truncate">{item.label}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setDockableToolbarMode(item.id, 'docked')}
                                className={`px-1.5 py-0.5 text-[10px] font-semibold transition-all ${mode === 'docked' ? 'bg-[#1f3653] text-white dark:bg-[#d6c2a6] dark:text-gray-950' : 'text-gray-500 hover:bg-black/[0.05]'}`}
                              >Dock</button>
                              <button
                                type="button"
                                onClick={() => setDockableToolbarMode(item.id, 'floating')}
                                className={`px-1.5 py-0.5 text-[10px] font-semibold transition-all ${mode === 'floating' ? 'bg-[#1f3653] text-white dark:bg-[#d6c2a6] dark:text-gray-950' : 'text-gray-500 hover:bg-black/[0.05]'}`}
                              >Float</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="my-2 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
                    <button
                      type="button"
                      onClick={() => { resetDockableWorkspace(); setToolbarMenuOpen(false) }}
                      className="w-full px-2 py-1.5 text-[11px] font-medium text-gray-500 hover:bg-black/[0.04] hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Reset defaults
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className={dividerClass} />
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`${secondaryMenuButtonClass} ${isFullscreen ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}`}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <Maximize size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        {topbarControlVisibility['view-mode-switch'] && (
          <div className="flex flex-none items-center border border-gray-200 bg-gray-50 p-0.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {teamSlug && officeSlug ? (
              <>
                <NavLink
                  to={`/t/${teamSlug}/o/${officeSlug}/map`}
                  onClick={() => setViewMode('2d')}
                  role="button"
                  aria-label="Switch to 2D view"
                  className={({ isActive }) =>
                    `inline-flex h-8 min-w-[58px] items-center justify-center gap-1.5  px-2.5 text-sm font-semibold transition ${
                      isActive && viewMode === '2d'
                        ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-800 dark:text-white'
                        : 'text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70'
                    }`
                  }
                >
                  <MapIcon size={14} />
                  2D
                </NavLink>
                <NavLink
                  to={`/t/${teamSlug}/o/${officeSlug}/map`}
                  onClick={() => setViewMode('2.5d')}
                  role="button"
                  aria-label="Switch to 2.5D view"
                  className={`inline-flex h-8 min-w-[70px] items-center justify-center gap-1.5  px-2.5 text-sm font-semibold transition ${
                    viewMode === '2.5d'
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-gray-950'
                      : 'text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70'
                  }`}
                >
                  <Maximize2 size={14} />
                  2.5D
                </NavLink>
                <NavLink
                  to={`/t/${teamSlug}/o/${officeSlug}/pixi`}
                  role="button"
                  aria-label="Open Pixi editor"
                  className={({ isActive }) =>
                    `inline-flex h-8 min-w-[68px] items-center justify-center gap-1.5  px-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70'
                    }`
                  }
                >
                  <Zap size={14} />
                  Pixi
                </NavLink>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setViewMode('2d')}
                  aria-pressed={viewMode === '2d'}
                  className={`inline-flex h-8 min-w-[58px] items-center justify-center gap-1.5  px-2.5 text-sm font-semibold transition ${viewMode === '2d' ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70'}`}
                >
                  <MapIcon size={14} />
                  2D
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('2.5d')}
                  aria-pressed={viewMode === '2.5d'}
                  className={`inline-flex h-8 min-w-[70px] items-center justify-center gap-1.5  px-2.5 text-sm font-semibold transition ${viewMode === '2.5d' ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-gray-950' : 'text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70'}`}
                >
                  <Maximize2 size={14} />
                  2.5D
                </button>
              </>
            )}
          </div>
        )}

        <div className="ml-auto flex min-w-0 flex-none items-center gap-2 border-l border-gray-200 bg-white/95 pl-2 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
          {topbarControlVisibility['health-pill'] && <PlanHealthPill />}
          <UserMenu />
        </div>
      </div>
    </div>
  )
}

function SaveIndicator({
  saveState,
  lastSavedAt,
}: {
  saveState: string
  lastSavedAt: string | null
}) {
  return (
    <div className="hidden items-center gap-2 px-2 text-xs text-gray-500 md:flex dark:text-gray-400">
      {saveState === 'saving' ? (
        <>
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          <span>Saving...</span>
        </>
      ) : saveState === 'error' ? (
        <>
          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="text-red-500">Save failed</span>
        </>
      ) : (
        <>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Saved {lastSavedAt ? 'just now' : '—'}</span>
        </>
      )}
    </div>
  )
}
