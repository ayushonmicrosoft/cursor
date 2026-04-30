import { useProjectStore } from '../../stores/projectStore'
import { useCanvasStore } from '../../stores/canvasStore'
import {
  WORKSPACE_PRESET_CONFIGS,
  useUIStore,
  type DockableToolbarId,
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
} from 'lucide-react'
import { SeatLabelStylePicker } from './TopBar/SeatLabelStylePicker'
import { FileMenu, type FileMenuGroup } from './TopBar/FileMenu'
import { buildWayfindingPdf, buildFileName } from '../../lib/pdfExport'
import { exportFloorAsPng } from '../../lib/pngExport'
import { buildExportFilename } from '../../lib/exportFilename'
import { getActiveStage } from '../../lib/stageRegistry'
import { useState, useRef, useEffect } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useCan } from '../../hooks/useCan'
import { TeamSwitcher } from '../team/TeamSwitcher'
import { ScaleSettingsPopover } from './ScaleSettingsPopover'
import { PlanHealthPill } from './PlanHealthPill'
import { UserMenu } from '../team/UserMenu'

const TOOLBAR_MENU_ITEMS: Array<{
  id: DockableToolbarId
  label: string
  adminOnly?: boolean
}> = [
  { id: 'canvas-actions', label: 'Canvas controls' },
  { id: 'align-distribute', label: 'Arrange toolbar' },
  { id: 'color-palette', label: 'Color palette' },
  { id: 'left-tools', label: 'Left tools rail' },
  { id: 'right-inspector', label: 'Right inspector' },
  { id: 'admin-stats', label: 'Admin operations', adminOnly: true },
]

const WORKSPACE_PRESET_IDS: WorkspacePresetId[] = ['design', 'admin', 'review']

const primaryViewLinkClass =
  'inline-flex h-8 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'

const secondaryMenuButtonClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'

const toolbarMenuButtonClass =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'

const secondaryMenuItemClass =
  'flex min-w-0 items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-800/50 dark:focus:bg-gray-800/50'

const dividerClass = 'h-6 w-px flex-none bg-gray-200 dark:bg-gray-700'
const iconActionButtonClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'

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
    dockableToolbarLayouts,
    dockableToolbarVisibility,
    activeWorkspacePreset,
    setDockableToolbarMode,
    setDockableToolbarVisible,
    applyWorkspacePreset,
    resetDockableToolbarLayout,
    resetDockableWorkspace,
  } = useUIStore(
    useShallow((s) => ({
      setExportDialogOpen: s.setExportDialogOpen,
      viewMode: s.viewMode,
      setViewMode: s.setViewMode,
      dockableToolbarLayouts: s.dockableToolbarLayouts,
      dockableToolbarVisibility: s.dockableToolbarVisibility,
      activeWorkspacePreset: s.activeWorkspacePreset,
      setDockableToolbarMode: s.setDockableToolbarMode,
      setDockableToolbarVisible: s.setDockableToolbarVisible,
      applyWorkspacePreset: s.applyWorkspacePreset,
      resetDockableToolbarLayout: s.resetDockableToolbarLayout,
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

  return (
    <div
      className="relative h-12 w-full min-w-0 flex-shrink-0 overflow-hidden border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
      data-fixed-toolbar="top-bar"
    >
      <div
        className="flex h-full min-w-0 flex-nowrap items-center gap-1 overflow-hidden px-2 pr-3 sm:gap-1.5 sm:px-3 sm:pr-4"
        data-testid="topbar-layout-row"
      >
        <TeamSwitcher currentSlug={teamSlug} />

        {teamSlug && officeSlug && (
          <nav
            aria-label="Primary office views"
            className="flex min-w-0 flex-none items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900"
          >
            <NavLink
              to={`/t/${teamSlug}/o/${officeSlug}/map`}
              title="Map"
              className={({ isActive }) =>
                `${primaryViewLinkClass} ${
                  isActive
                    ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 hover:bg-white hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
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
                    isActive
                      ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-800 dark:text-white'
                      : 'text-gray-600 hover:bg-white hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`
                }
              >
                <BarChart3 size={16} aria-hidden="true" />
                <span className="hidden truncate sm:inline">Reports</span>
              </NavLink>
            )}
          </nav>
        )}

        <FileMenu groups={fileMenuGroups} />

        <div className={dividerClass} />

        <SaveIndicator saveState={saveState} lastSavedAt={lastSavedAt} />

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

        <div className={dividerClass} />

        <div className="relative" ref={viewMenuRef}>
          <button
            onClick={() => setViewMenuOpen((o) => !o)}
            className={secondaryMenuButtonClass}
            aria-haspopup="menu"
            aria-expanded={viewMenuOpen}
            title="View options"
            aria-label="View options"
          >
            <Eye size={16} aria-hidden="true" />
          </button>
          {viewMenuOpen && (
            <div
              role="menu"
              className="absolute left-0 z-30 mt-1 w-64 rounded-md border border-gray-200 bg-white py-1 shadow dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40"
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

        {canEditMap && (
          <div className="relative" ref={toolbarMenuRef}>
            <button
              onClick={() => setToolbarMenuOpen((o) => !o)}
              className={toolbarMenuButtonClass}
              title="Workspace controls"
              aria-label="Workspace controls"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              <span className="hidden text-sm font-semibold xl:inline">Toolbars</span>
            </button>
            {toolbarMenuOpen && (
              <div className="absolute left-0 z-30 mt-1 w-80 rounded border border-gray-200 bg-white p-2 shadow dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40">
                <div className="mb-2 rounded border border-gray-200 px-2 py-2 dark:border-gray-700">
                  <p className="text-xs font-semibold tracking-[0.15em] text-gray-600 uppercase dark:text-gray-300">
                    Workspace presets
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    {WORKSPACE_PRESET_IDS.map((presetId) => {
                      const preset = WORKSPACE_PRESET_CONFIGS[presetId]
                      const active = activeWorkspacePreset === presetId
                      return (
                        <button
                          key={presetId}
                          onClick={() => applyWorkspacePreset(presetId)}
                          className={`rounded px-2 py-1 text-[11px] font-medium ${active ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {TOOLBAR_MENU_ITEMS.filter(
                  (item) => !item.adminOnly || canManageWorkspace,
                ).map((item) => {
                  const visible = dockableToolbarVisibility[item.id] ?? true
                  const mode = dockableToolbarLayouts[item.id].mode
                  return (
                    <div
                      key={item.id}
                      className="mb-2 rounded border border-gray-200 px-2 py-2 last:mb-0 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold tracking-[0.15em] text-gray-600 uppercase dark:text-gray-300">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {visible
                              ? mode === 'floating'
                                ? 'Visible · floating'
                                : 'Visible · docked'
                              : 'Hidden'}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setDockableToolbarVisible(item.id, !visible)
                          }
                          className="rounded bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
                        >
                          {visible ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="mt-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => setDockableToolbarMode(item.id, 'docked')}
                          className={`rounded px-2 py-1 text-[11px] font-medium ${
                            mode === 'docked'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          Dock
                        </button>
                        <button
                          type="button"
                          onClick={() => setDockableToolbarMode(item.id, 'floating')}
                          className={`rounded px-2 py-1 text-[11px] font-medium ${
                            mode === 'floating'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          Float
                        </button>
                        <button
                          type="button"
                          onClick={() => resetDockableToolbarLayout(item.id)}
                          className="ml-auto rounded px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )
                })}
                <button
                  onClick={() => resetDockableWorkspace()}
                  className="mt-2 w-full rounded border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200"
                >
                  Reset all toolbars
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-none items-center rounded-xl border border-gray-200 bg-gray-50 p-0.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {teamSlug && officeSlug ? (
            <>
              <NavLink
                to={`/t/${teamSlug}/o/${officeSlug}/map`}
                onClick={() => setViewMode('2d')}
                role="button"
                aria-label="Switch to 2D view"
                className={({ isActive }) =>
                  `inline-flex h-8 min-w-[58px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition ${
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
                className={`inline-flex h-8 min-w-[70px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition ${
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
                `inline-flex h-8 min-w-[68px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition ${
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
                className={`inline-flex h-8 min-w-[58px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition ${viewMode === '2d' ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70'}`}
              >
                <MapIcon size={14} />
                2D
              </button>
              <button
                type="button"
                onClick={() => setViewMode('2.5d')}
                aria-pressed={viewMode === '2.5d'}
                className={`inline-flex h-8 min-w-[70px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition ${viewMode === '2.5d' ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-gray-950' : 'text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70'}`}
              >
                <Maximize2 size={14} />
                2.5D
              </button>
            </>
          )}
        </div>

        <div className="ml-auto flex min-w-0 flex-none items-center gap-2 border-l border-gray-200 bg-white/95 pl-2 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
          <PlanHealthPill />
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
