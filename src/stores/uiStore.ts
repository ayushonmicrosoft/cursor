import { create } from 'zustand'
import type { ImportIssue } from '../lib/employeeCsv'
import type { AlignmentGuide } from '../lib/geometry'
import {
  recordSelectionFailure,
  recordToolbarLayoutAnomaly,
} from '../lib/interactionTelemetry'
import { useElementsStore } from './elementsStore'

export interface CSVImportSummary {
  importedCount: number
  skipped: ImportIssue[]
  warnings: ImportIssue[]
}

export type DockableToolbarId =
  | 'canvas-actions'
  | 'align-distribute'
  | 'admin-stats'
  | 'left-tools'
  | 'right-inspector'
  | 'minimap'
  | 'color-palette'
  | 'pixi-minimap'

export interface DockableToolbarLayout {
  mode: 'docked' | 'floating'
  position: { x: number; y: number }
}

export type WorkspacePresetId = 'design' | 'admin' | 'review'
export type RenderEngineId = 'konva' | 'pixi'
export type TopbarControlId =
  | 'file-menu'
  | 'save-indicator'
  | 'history'
  | 'quick-actions'
  | 'view-menu'
  | 'layout-menu'
  | 'view-mode-switch'
  | 'health-pill'

export type TopbarQuickActionId = 'grid' | 'minimap' | 'presentation'

export const DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS: Record<DockableToolbarId, DockableToolbarLayout> = {
  'canvas-actions': { mode: 'docked', position: { x: 0, y: 0 } },
  'align-distribute': { mode: 'docked', position: { x: 0, y: 0 } },
  'admin-stats': { mode: 'docked', position: { x: 0, y: 0 } },
  'left-tools': { mode: 'docked', position: { x: 0, y: 0 } },
  'right-inspector': { mode: 'docked', position: { x: 0, y: 0 } },
  'minimap': { mode: 'docked', position: { x: 0, y: 0 } },
  'color-palette': { mode: 'docked', position: { x: 0, y: 0 } },
  'pixi-minimap': { mode: 'docked', position: { x: 0, y: 0 } },
}

export const DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY: Record<DockableToolbarId, boolean> = {
  'canvas-actions': true,
  'align-distribute': true,
  'admin-stats': true,
  'left-tools': true,
  'right-inspector': true,
  'minimap': true,
  'color-palette': true,
  'pixi-minimap': true,
}

export const DEFAULT_TOPBAR_CONTROL_VISIBILITY: Record<TopbarControlId, boolean> = {
  'file-menu': true,
  'save-indicator': true,
  history: true,
  'quick-actions': true,
  'view-menu': true,
  'layout-menu': true,
  'view-mode-switch': true,
  'health-pill': true,
}

export const DEFAULT_TOPBAR_QUICK_ACTION_ORDER: TopbarQuickActionId[] = [
  'grid',
  'minimap',
  'presentation',
]

export const DEFAULT_TOPBAR_QUICK_ACTION_VISIBILITY: Record<TopbarQuickActionId, boolean> = {
  grid: true,
  minimap: true,
  presentation: true,
}

export const WORKSPACE_PRESET_CONFIGS: Record<
  WorkspacePresetId,
  {
    label: string
    description: string
    layouts: Record<DockableToolbarId, DockableToolbarLayout>
    visibility: Record<DockableToolbarId, boolean>
  }
> = {
  design: {
    label: 'Design',
    description: 'Layout tools up front for daily plan editing.',
    layouts: {
      'canvas-actions': { mode: 'docked', position: { x: 0, y: 0 } },
      'align-distribute': { mode: 'docked', position: { x: 0, y: 0 } },
      'admin-stats': { mode: 'docked', position: { x: 0, y: 0 } },
      'left-tools': { mode: 'docked', position: { x: 0, y: 0 } },
      'right-inspector': { mode: 'docked', position: { x: 0, y: 0 } },
      'minimap': { mode: 'docked', position: { x: 0, y: 0 } },
      'color-palette': { mode: 'docked', position: { x: 0, y: 0 } },
      'pixi-minimap': { mode: 'docked', position: { x: 0, y: 0 } },
    },
    visibility: {
      'canvas-actions': true,
      'align-distribute': true,
      'admin-stats': false,
      'left-tools': true,
      'right-inspector': true,
      'minimap': true,
      'color-palette': true,
      'pixi-minimap': true,
    },
  },
  admin: {
    label: 'Admin',
    description: 'Keep reporting tools visible for operational checks.',
    layouts: {
      'canvas-actions': { mode: 'docked', position: { x: 0, y: 0 } },
      'align-distribute': { mode: 'docked', position: { x: 0, y: 0 } },
      'admin-stats': { mode: 'docked', position: { x: 0, y: 0 } },
      'left-tools': { mode: 'docked', position: { x: 0, y: 0 } },
      'right-inspector': { mode: 'docked', position: { x: 0, y: 0 } },
      'minimap': { mode: 'docked', position: { x: 0, y: 0 } },
      'color-palette': { mode: 'docked', position: { x: 0, y: 0 } },
      'pixi-minimap': { mode: 'docked', position: { x: 0, y: 0 } },
    },
    visibility: {
      'canvas-actions': true,
      'align-distribute': true,
      'admin-stats': true,
      'left-tools': true,
      'right-inspector': true,
      'minimap': true,
      'color-palette': true,
      'pixi-minimap': true,
    },
  },
  review: {
    label: 'Review',
    description: 'A quiet canvas with only core controls visible.',
    layouts: {
      'canvas-actions': { mode: 'docked', position: { x: 0, y: 0 } },
      'align-distribute': { mode: 'docked', position: { x: 0, y: 0 } },
      'admin-stats': { mode: 'docked', position: { x: 0, y: 0 } },
      'left-tools': { mode: 'docked', position: { x: 0, y: 0 } },
      'right-inspector': { mode: 'docked', position: { x: 0, y: 0 } },
      'minimap': { mode: 'docked', position: { x: 0, y: 0 } },
      'color-palette': { mode: 'docked', position: { x: 0, y: 0 } },
      'pixi-minimap': { mode: 'docked', position: { x: 0, y: 0 } },
    },
    visibility: {
      'canvas-actions': true,
      'align-distribute': false,
      'admin-stats': false,
      'left-tools': true,
      'right-inspector': true,
      'minimap': true,
      'color-palette': false,
      'pixi-minimap': true,
    },
  },
}

const TOOLBAR_LAYOUTS_STORAGE_KEY = 'oandocraft.toolbar-layouts-v3'
const TOOLBAR_VISIBILITY_STORAGE_KEY = 'oandocraft.toolbar-visibility-v3'
const WORKSPACE_PRESET_STORAGE_KEY = 'oandocraft.workspace-preset-v3'
const RENDER_ENGINE_STORAGE_KEY = 'oandocraft.render-engine-v1'
const TOPBAR_CONTROL_VISIBILITY_STORAGE_KEY = 'oandocraft.topbar-controls-v1'
const TOPBAR_QUICK_ACTIONS_STORAGE_KEY = 'oandocraft.topbar-quick-actions-v1'

function cloneToolbarLayouts(
  layouts: Record<DockableToolbarId, DockableToolbarLayout>,
): Record<DockableToolbarId, DockableToolbarLayout> {
  return {
    'canvas-actions': {
      mode: layouts['canvas-actions']?.mode ?? 'docked',
      position: { ...(layouts['canvas-actions']?.position ?? {x:0,y:0}) },
    },
    'align-distribute': {
      mode: layouts['align-distribute']?.mode ?? 'docked',
      position: { ...(layouts['align-distribute']?.position ?? {x:0,y:0}) },
    },
    'admin-stats': {
      mode: layouts['admin-stats']?.mode ?? 'docked',
      position: { ...(layouts['admin-stats']?.position ?? {x:0,y:0}) },
    },
    'left-tools': {
      mode: layouts['left-tools']?.mode ?? 'docked',
      position: { ...(layouts['left-tools']?.position ?? {x:0,y:0}) },
    },
    'right-inspector': {
      mode: layouts['right-inspector']?.mode ?? 'docked',
      position: { ...(layouts['right-inspector']?.position ?? {x:0,y:0}) },
    },
    'minimap': {
      mode: layouts['minimap']?.mode ?? 'docked',
      position: { ...(layouts['minimap']?.position ?? {x:0,y:0}) },
    },
    'color-palette': {
      mode: layouts['color-palette']?.mode ?? 'docked',
      position: { ...(layouts['color-palette']?.position ?? {x:0,y:0}) },
    },
    'pixi-minimap': {
      mode: layouts['pixi-minimap']?.mode ?? 'docked',
      position: { ...(layouts['pixi-minimap']?.position ?? {x:0,y:0}) },
    },
  }
}

function cloneToolbarVisibility(
  visibility: Record<DockableToolbarId, boolean>,
): Record<DockableToolbarId, boolean> {
  return {
    'canvas-actions': visibility['canvas-actions'],
    'align-distribute': visibility['align-distribute'],
    'admin-stats': visibility['admin-stats'],
    'left-tools': visibility['left-tools'],
    'right-inspector': visibility['right-inspector'],
    'minimap': visibility['minimap'],
    'color-palette': visibility['color-palette'] ?? true,
    'pixi-minimap': visibility['pixi-minimap'] ?? true,
  }
}

function readStoredToolbarLayouts(): Record<DockableToolbarId, DockableToolbarLayout> {
  if (typeof window === 'undefined') {
    return cloneToolbarLayouts(DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS)
  }
  try {
    const raw = window.localStorage.getItem(TOOLBAR_LAYOUTS_STORAGE_KEY)
    if (!raw) return cloneToolbarLayouts(DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS)
    const parsed = JSON.parse(raw) as Partial<Record<DockableToolbarId, Partial<DockableToolbarLayout>>>
    return {
      'canvas-actions': sanitizeToolbarLayout('canvas-actions', 'storage-read', parsed['canvas-actions']),
      'align-distribute': sanitizeToolbarLayout('align-distribute', 'storage-read', parsed['align-distribute']),
      'admin-stats': sanitizeToolbarLayout('admin-stats', 'storage-read', parsed['admin-stats']),
      'left-tools': sanitizeToolbarLayout('left-tools', 'storage-read', parsed['left-tools']),
      'right-inspector': sanitizeToolbarLayout('right-inspector', 'storage-read', parsed['right-inspector']),
      'minimap': sanitizeToolbarLayout('minimap', 'storage-read', parsed['minimap']),
      'color-palette': sanitizeToolbarLayout('color-palette', 'storage-read', parsed['color-palette']),
      'pixi-minimap': sanitizeToolbarLayout('pixi-minimap', 'storage-read', parsed['pixi-minimap']),
    }
  } catch {
    return cloneToolbarLayouts(DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS)
  }
}

function sanitizeToolbarLayout(
  id: DockableToolbarId,
  source: string,
  layout: Partial<DockableToolbarLayout> | undefined,
): DockableToolbarLayout {
  const fallback = DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS[id]
  const hasInvalidMode = Boolean(layout?.mode) && layout?.mode !== 'docked' && layout?.mode !== 'floating'
  const hasInvalidX = Boolean(layout?.position) && !Number.isFinite(layout?.position?.x)
  const hasInvalidY = Boolean(layout?.position) && !Number.isFinite(layout?.position?.y)
  const hasExtremeCoordinates =
    Number.isFinite(layout?.position?.x) &&
    Number.isFinite(layout?.position?.y) &&
    (Math.abs(Number(layout?.position?.x)) > 10000 || Math.abs(Number(layout?.position?.y)) > 10000)

  if (hasInvalidMode || hasInvalidX || hasInvalidY || hasExtremeCoordinates) {
    recordToolbarLayoutAnomaly({
      source,
      toolbarId: id,
      reason: hasExtremeCoordinates ? 'position-out-of-bounds' : 'invalid-layout-data',
      details: {
        mode: layout?.mode ?? null,
        x: layout?.position?.x ?? null,
        y: layout?.position?.y ?? null,
      },
    })
    return {
      mode: layout?.mode === 'floating' && !hasInvalidMode ? 'floating' : fallback.mode,
      position: { ...fallback.position },
    }
  }

  const x = Number.isFinite(layout?.position?.x) ? Number(layout?.position?.x) : fallback.position.x
  const y = Number.isFinite(layout?.position?.y) ? Number(layout?.position?.y) : fallback.position.y
  return {
    mode: layout?.mode === 'floating' ? 'floating' : 'docked',
    position: { x, y },
  }
}

function persistToolbarLayouts(layouts: Record<DockableToolbarId, DockableToolbarLayout>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TOOLBAR_LAYOUTS_STORAGE_KEY, JSON.stringify(layouts))
  } catch {
    // Storage can fail in private mode / quota pressure. The current
    // session still works; only persistence is skipped.
  }
}

function readStoredToolbarVisibility(): Record<DockableToolbarId, boolean> {
  if (typeof window === 'undefined') {
    return cloneToolbarVisibility(DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY)
  }
  try {
    const raw = window.localStorage.getItem(TOOLBAR_VISIBILITY_STORAGE_KEY)
    if (!raw) return cloneToolbarVisibility(DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY)
    const parsed = JSON.parse(raw) as Partial<Record<DockableToolbarId, unknown>>
    return {
      'canvas-actions':
        typeof parsed['canvas-actions'] === 'boolean'
          ? parsed['canvas-actions']
          : DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY['canvas-actions'],
      'align-distribute':
        typeof parsed['align-distribute'] === 'boolean'
          ? parsed['align-distribute']
          : DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY['align-distribute'],
      'admin-stats':
        typeof parsed['admin-stats'] === 'boolean'
          ? parsed['admin-stats']
          : DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY['admin-stats'],
      'left-tools':
        typeof parsed['left-tools'] === 'boolean'
          ? parsed['left-tools']
          : DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY['left-tools'],
      'right-inspector':
        typeof parsed['right-inspector'] === 'boolean'
          ? parsed['right-inspector']
          : DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY['right-inspector'],
      'minimap':
        typeof parsed['minimap'] === 'boolean'
          ? parsed['minimap']
          : DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY['minimap'],
      'color-palette':
        typeof parsed['color-palette'] === 'boolean'
          ? parsed['color-palette']
          : DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY['color-palette'],
      'pixi-minimap':
        typeof parsed['pixi-minimap'] === 'boolean'
          ? parsed['pixi-minimap']
          : DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY['pixi-minimap'],
    }
  } catch {
    return cloneToolbarVisibility(DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY)
  }
}

function persistToolbarVisibility(visibility: Record<DockableToolbarId, boolean>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TOOLBAR_VISIBILITY_STORAGE_KEY, JSON.stringify(visibility))
  } catch {
    // Best-effort persistence only.
  }
}

function isWorkspacePresetId(value: unknown): value is WorkspacePresetId {
  return value === 'design' || value === 'admin' || value === 'review'
}

function readStoredWorkspacePreset(): WorkspacePresetId | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(WORKSPACE_PRESET_STORAGE_KEY)
    return isWorkspacePresetId(raw) ? raw : null
  } catch {
    return null
  }
}

function persistWorkspacePreset(preset: WorkspacePresetId | null) {
  if (typeof window === 'undefined') return
  try {
    if (!preset) {
      window.localStorage.removeItem(WORKSPACE_PRESET_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(WORKSPACE_PRESET_STORAGE_KEY, preset)
  } catch {
    // Best-effort persistence only.
  }
}

function isRenderEngineId(value: unknown): value is RenderEngineId {
  return value === 'konva' || value === 'pixi'
}

function readStoredRenderEngine(): RenderEngineId {
  if (typeof window === 'undefined') return 'konva'
  try {
    const raw = window.localStorage.getItem(RENDER_ENGINE_STORAGE_KEY)
    return isRenderEngineId(raw) ? raw : 'konva'
  } catch {
    return 'konva'
  }
}

function readStoredTopbarControlVisibility(): Record<TopbarControlId, boolean> {
  if (typeof window === 'undefined') {
    return cloneTopbarControlVisibility(DEFAULT_TOPBAR_CONTROL_VISIBILITY)
  }
  try {
    const raw = window.localStorage.getItem(TOPBAR_CONTROL_VISIBILITY_STORAGE_KEY)
    if (!raw) return cloneTopbarControlVisibility(DEFAULT_TOPBAR_CONTROL_VISIBILITY)
    const parsed = JSON.parse(raw) as Partial<Record<TopbarControlId, unknown>>
    return {
      'file-menu':
        typeof parsed['file-menu'] === 'boolean'
          ? parsed['file-menu']
          : DEFAULT_TOPBAR_CONTROL_VISIBILITY['file-menu'],
      'save-indicator':
        typeof parsed['save-indicator'] === 'boolean'
          ? parsed['save-indicator']
          : DEFAULT_TOPBAR_CONTROL_VISIBILITY['save-indicator'],
      history:
        typeof parsed.history === 'boolean'
          ? parsed.history
          : DEFAULT_TOPBAR_CONTROL_VISIBILITY.history,
      'quick-actions':
        typeof parsed['quick-actions'] === 'boolean'
          ? parsed['quick-actions']
          : DEFAULT_TOPBAR_CONTROL_VISIBILITY['quick-actions'],
      'view-menu':
        typeof parsed['view-menu'] === 'boolean'
          ? parsed['view-menu']
          : DEFAULT_TOPBAR_CONTROL_VISIBILITY['view-menu'],
      'layout-menu':
        typeof parsed['layout-menu'] === 'boolean'
          ? parsed['layout-menu']
          : DEFAULT_TOPBAR_CONTROL_VISIBILITY['layout-menu'],
      'view-mode-switch':
        typeof parsed['view-mode-switch'] === 'boolean'
          ? parsed['view-mode-switch']
          : DEFAULT_TOPBAR_CONTROL_VISIBILITY['view-mode-switch'],
      'health-pill':
        typeof parsed['health-pill'] === 'boolean'
          ? parsed['health-pill']
          : DEFAULT_TOPBAR_CONTROL_VISIBILITY['health-pill'],
    }
  } catch {
    return cloneTopbarControlVisibility(DEFAULT_TOPBAR_CONTROL_VISIBILITY)
  }
}

function persistTopbarControlVisibility(
  visibility: Record<TopbarControlId, boolean>,
) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      TOPBAR_CONTROL_VISIBILITY_STORAGE_KEY,
      JSON.stringify(visibility),
    )
  } catch {
    // Best-effort persistence only.
  }
}

function readStoredTopbarQuickActions(): {
  order: TopbarQuickActionId[]
  visibility: Record<TopbarQuickActionId, boolean>
} {
  const fallback = {
    order: cloneTopbarQuickActionOrder(DEFAULT_TOPBAR_QUICK_ACTION_ORDER),
    visibility: cloneTopbarQuickActionVisibility(
      DEFAULT_TOPBAR_QUICK_ACTION_VISIBILITY,
    ),
  }
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(TOPBAR_QUICK_ACTIONS_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as {
      order?: unknown
      visibility?: Partial<Record<TopbarQuickActionId, unknown>>
    }
    const parsedOrder = Array.isArray(parsed.order)
      ? parsed.order.filter(
          (value): value is TopbarQuickActionId =>
            value === 'grid' || value === 'minimap' || value === 'presentation',
        )
      : DEFAULT_TOPBAR_QUICK_ACTION_ORDER
    const visibility = parsed.visibility ?? {}
    return {
      order: cloneTopbarQuickActionOrder(parsedOrder),
      visibility: {
        grid:
          typeof visibility.grid === 'boolean'
            ? visibility.grid
            : DEFAULT_TOPBAR_QUICK_ACTION_VISIBILITY.grid,
        minimap:
          typeof visibility.minimap === 'boolean'
            ? visibility.minimap
            : DEFAULT_TOPBAR_QUICK_ACTION_VISIBILITY.minimap,
        presentation:
          typeof visibility.presentation === 'boolean'
            ? visibility.presentation
            : DEFAULT_TOPBAR_QUICK_ACTION_VISIBILITY.presentation,
      },
    }
  } catch {
    return fallback
  }
}

function persistTopbarQuickActions(
  order: TopbarQuickActionId[],
  visibility: Record<TopbarQuickActionId, boolean>,
) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      TOPBAR_QUICK_ACTIONS_STORAGE_KEY,
      JSON.stringify({
        order: cloneTopbarQuickActionOrder(order),
        visibility: cloneTopbarQuickActionVisibility(visibility),
      }),
    )
  } catch {
    // Best-effort persistence only.
  }
}

function cloneTopbarControlVisibility(
  visibility: Record<TopbarControlId, boolean>,
): Record<TopbarControlId, boolean> {
  return {
    'file-menu': visibility['file-menu'] !== false,
    'save-indicator': visibility['save-indicator'] !== false,
    history: visibility.history !== false,
    'quick-actions': visibility['quick-actions'] !== false,
    'view-menu': visibility['view-menu'] !== false,
    'layout-menu': visibility['layout-menu'] !== false,
    'view-mode-switch': visibility['view-mode-switch'] !== false,
    'health-pill': visibility['health-pill'] !== false,
  }
}

function cloneTopbarQuickActionOrder(
  order: TopbarQuickActionId[],
): TopbarQuickActionId[] {
  const seen = new Set<TopbarQuickActionId>()
  const next: TopbarQuickActionId[] = []
  for (const id of order) {
    if (!DEFAULT_TOPBAR_QUICK_ACTION_ORDER.includes(id) || seen.has(id)) continue
    next.push(id)
    seen.add(id)
  }
  for (const fallback of DEFAULT_TOPBAR_QUICK_ACTION_ORDER) {
    if (!seen.has(fallback)) next.push(fallback)
  }
  return next
}

function cloneTopbarQuickActionVisibility(
  visibility: Record<TopbarQuickActionId, boolean>,
): Record<TopbarQuickActionId, boolean> {
  return {
    grid: visibility.grid !== false,
    minimap: visibility.minimap !== false,
    presentation: visibility.presentation !== false,
  }
}

function persistRenderEngine(engine: RenderEngineId) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RENDER_ENGINE_STORAGE_KEY, engine)
  } catch {
    // Best-effort persistence only.
  }
}

function collectMissingSelectionIds(ids: string[]): string[] {
  if (ids.length === 0) return []
  const elements = useElementsStore.getState().elements
  return ids.filter((id) => !elements[id])
}

function reportSelectionFailure(source: string, ids: string[]) {
  const missingIds = collectMissingSelectionIds(ids)
  if (missingIds.length === 0) return
  recordSelectionFailure({
    source,
    attemptedIds: [...ids],
    missingIds,
  })
}

interface UIState {
  // Selection
  selectedIds: string[]
  hoveredId: string | null
  flashingElementId: string | null
  setFlashingElementId: (id: string | null) => void

  // Panels
  rightSidebarOpen: boolean
  rightSidebarTab: 'properties' | 'people' | 'reports' | 'insights'

  // Modals
  shareModalOpen: boolean
  exportDialogOpen: boolean
  templatePickerOpen: boolean
  shortcutsOverlayOpen: boolean
  commandPaletteOpen: boolean
  aiAssistantOpen: boolean
  firstRunCoachOpen: boolean
  csvImportOpen: boolean
  csvImportSummary: CSVImportSummary | null

  // Presentation
  presentationMode: boolean
  viewMode: '2d' | '2.5d'
  renderEngine: RenderEngineId

  // Minimap
  minimapVisible: boolean

  // Context menu
  contextMenu: { x: number; y: number; elementId: string | null } | null

  // Inline editing
  editingLabelId: string | null

  /**
   * Event-bus counter incremented when global Escape should cancel any
   * in-flight canvas drawing session (walls, future shapes). Subscribers
   * (hooks like useWallDrawing) watch this counter in a useEffect and
   * reset their session when it changes. Using a counter instead of a
   * boolean means every bump triggers the subscriber even if they
   * already handled a previous cancel.
   */
  drawingCancelTick: number

  /**
   * Reference count of open modal-like overlays (drawers, dialogs) that own
   * the Escape key and focus. Subscribers like `useKeyboardShortcuts` check
   * `> 0` before reacting to global shortcuts so pressing Escape inside a
   * drawer doesn't leak out and clear selection or reset the tool.
   *
   * Callers must pair every `registerModalOpen()` with a matching
   * `registerModalClose()` in the same lifecycle (useEffect cleanup).
   */
  modalOpenCount: number

  /**
   * Live alignment-guide overlay shown while the user is dragging a single
   * element. Populated by ElementRenderer's onDragMove handler from
   * `findAlignmentGuides`, consumed by CanvasStage's <AlignmentGuides>.
   * Cleared on drag end. Kept in the UI store rather than component state
   * so the guides can live in a dedicated Konva layer instead of being
   * redrawn in the element layer on every pointer event.
   */
  dragAlignmentGuides: AlignmentGuide[]
  setDragAlignmentGuides: (guides: AlignmentGuide[]) => void
  clearDragAlignmentGuides: () => void

  // Multi-seat assignment queue â€” ordered list of employee ids awaiting a
  // click on the map to pop into a seat. Cleared on completion or Esc.
  assignmentQueue: string[] // employee ids in order
  setAssignmentQueue: (ids: string[]) => void
  clearAssignmentQueue: () => void

  // Reports & overlays
  activeReport: string | null
  orgChartOverlayEnabled: boolean
  seatMapColorMode: 'department' | 'team' | 'employment-type' | 'office-days' | null
  movePlannerActive: boolean
  employeeDirectoryOpen: boolean
  dockableToolbarLayouts: Record<DockableToolbarId, DockableToolbarLayout>
  dockableToolbarVisibility: Record<DockableToolbarId, boolean>
  activeWorkspacePreset: WorkspacePresetId | null
  topbarControlVisibility: Record<TopbarControlId, boolean>
  topbarQuickActionOrder: TopbarQuickActionId[]
  topbarQuickActionVisibility: Record<TopbarQuickActionId, boolean>

  // Actions
  setSelectedIds: (ids: string[]) => void
  addToSelection: (id: string) => void
  removeFromSelection: (id: string) => void
  toggleSelection: (id: string) => void
  clearSelection: () => void
  setHoveredId: (id: string | null) => void
  setRightSidebarOpen: (open: boolean) => void
  setRightSidebarTab: (tab: UIState['rightSidebarTab']) => void
  setShareModalOpen: (open: boolean) => void
  setExportDialogOpen: (open: boolean) => void
  setTemplatePickerOpen: (open: boolean) => void
  setShortcutsOverlayOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setAIAssistantOpen: (open: boolean) => void
  setFirstRunCoachOpen: (open: boolean) => void
  setCsvImportOpen: (open: boolean) => void
  setCsvImportSummary: (summary: CSVImportSummary | null) => void
  setPresentationMode: (mode: boolean) => void
  setViewMode: (mode: UIState['viewMode']) => void
  setRenderEngine: (engine: RenderEngineId) => void
  setMinimapVisible: (v: boolean) => void
  toggleMinimap: () => void
  setContextMenu: (menu: UIState['contextMenu']) => void
  setEditingLabelId: (id: string | null) => void
  setActiveReport: (report: string | null) => void
  setOrgChartOverlayEnabled: (enabled: boolean) => void
  setSeatMapColorMode: (mode: UIState['seatMapColorMode']) => void
  setMovePlannerActive: (active: boolean) => void
  setEmployeeDirectoryOpen: (open: boolean) => void
  setDockableToolbarMode: (id: DockableToolbarId, mode: DockableToolbarLayout['mode']) => void
  setDockableToolbarPosition: (id: DockableToolbarId, position: DockableToolbarLayout['position']) => void
  resetDockableToolbarLayout: (id: DockableToolbarId) => void
  setDockableToolbarVisible: (id: DockableToolbarId, visible: boolean) => void
  toggleDockableToolbarVisible: (id: DockableToolbarId) => void
  applyWorkspacePreset: (preset: WorkspacePresetId) => void
  resetDockableWorkspace: () => void
  setTopbarControlVisible: (id: TopbarControlId, visible: boolean) => void
  setTopbarQuickActionVisible: (id: TopbarQuickActionId, visible: boolean) => void
  setTopbarQuickActionOrder: (order: TopbarQuickActionId[]) => void
  moveTopbarQuickAction: (id: TopbarQuickActionId, direction: 'up' | 'down') => void
  resetTopbarWorkspace: () => void
  /** Bump `drawingCancelTick` to ask any active drawing session to cancel. */
  requestCancelDrawing: () => void
  /** Increment `modalOpenCount`. Call from drawer/dialog mount effect. */
  registerModalOpen: () => void
  /** Decrement `modalOpenCount`. Call from drawer/dialog unmount cleanup. */
  registerModalClose: () => void
}

// Stash the store instance on globalThis so it survives Vitest's
// `vi.resetModules()` between dynamic imports in the same test file.
// Without this, each re-import creates a brand-new zustand store and
// state set from the outer test scope is invisible to the freshly
// imported component. Module identity is not enough; globalThis is
// the only identity that persists across resets.
type UIStore = ReturnType<typeof createUIStore>

function createUIStore() {
  const initialToolbarLayouts = readStoredToolbarLayouts()
  const initialToolbarVisibility = readStoredToolbarVisibility()
  const initialWorkspacePreset = readStoredWorkspacePreset()
  const initialRenderEngine = readStoredRenderEngine()
  const initialTopbarControlVisibility = readStoredTopbarControlVisibility()
  const initialTopbarQuickActions = readStoredTopbarQuickActions()
  return create<UIState>((set) => ({
  selectedIds: [],
  hoveredId: null,
  flashingElementId: null,
  setFlashingElementId: (id) => set({ flashingElementId: id }),
  rightSidebarOpen: true,
  rightSidebarTab: 'properties',
  shareModalOpen: false,
  exportDialogOpen: false,
  templatePickerOpen: false,
  shortcutsOverlayOpen: false,
  commandPaletteOpen: false,
  aiAssistantOpen: false,
  firstRunCoachOpen: false,
  csvImportOpen: false,
  csvImportSummary: null,
  presentationMode: false,
  viewMode: '2d',
  renderEngine: initialRenderEngine,
  minimapVisible: true,
  contextMenu: null,
  editingLabelId: null,
  activeReport: null,
  orgChartOverlayEnabled: false,
  seatMapColorMode: null,
  movePlannerActive: false,
  employeeDirectoryOpen: false,
  dockableToolbarLayouts: initialToolbarLayouts,
  dockableToolbarVisibility: initialToolbarVisibility,
  activeWorkspacePreset: initialWorkspacePreset,
  topbarControlVisibility: initialTopbarControlVisibility,
  topbarQuickActionOrder: initialTopbarQuickActions.order,
  topbarQuickActionVisibility: initialTopbarQuickActions.visibility,
  drawingCancelTick: 0,
  modalOpenCount: 0,
  assignmentQueue: [],
  setAssignmentQueue: (ids) => set({ assignmentQueue: ids }),
  clearAssignmentQueue: () => set({ assignmentQueue: [] }),
  dragAlignmentGuides: [],
  setDragAlignmentGuides: (guides) => set({ dragAlignmentGuides: guides }),
  clearDragAlignmentGuides: () => set({ dragAlignmentGuides: [] }),

  setSelectedIds: (ids) => {
    reportSelectionFailure('setSelectedIds', ids)
    set({ selectedIds: ids })
  },
  addToSelection: (id) => {
    reportSelectionFailure('addToSelection', [id])
    set((s) => ({ selectedIds: [...s.selectedIds, id] }))
  },
  removeFromSelection: (id) =>
    set((s) => ({ selectedIds: s.selectedIds.filter((i) => i !== id) })),
  toggleSelection: (id) =>
    set((s) => {
      if (!s.selectedIds.includes(id)) {
        reportSelectionFailure('toggleSelection', [id])
      }
      return s.selectedIds.includes(id)
        ? { selectedIds: s.selectedIds.filter((i) => i !== id) }
        : { selectedIds: [...s.selectedIds, id] }
    }),
  clearSelection: () => set({ selectedIds: [] }),
  setHoveredId: (id) => set({ hoveredId: id }),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setRightSidebarTab: (tab) => set({ rightSidebarTab: tab, rightSidebarOpen: true }),
  setShareModalOpen: (open) => set({ shareModalOpen: open }),
  setExportDialogOpen: (open) => set({ exportDialogOpen: open }),
  setTemplatePickerOpen: (open) => set({ templatePickerOpen: open }),
  setShortcutsOverlayOpen: (open) => set({ shortcutsOverlayOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setAIAssistantOpen: (open) => set({ aiAssistantOpen: open }),
  setFirstRunCoachOpen: (open) => set({ firstRunCoachOpen: open }),
  setCsvImportOpen: (open) => set({ csvImportOpen: open }),
  setCsvImportSummary: (summary) => set({ csvImportSummary: summary }),
  setPresentationMode: (mode) => set({ presentationMode: mode }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setRenderEngine: (engine) =>
    set(() => {
      persistRenderEngine(engine)
      return { renderEngine: engine }
    }),
  setMinimapVisible: (v) => set({ minimapVisible: v }),
  toggleMinimap: () => set((s) => ({ minimapVisible: !s.minimapVisible })),
  setContextMenu: (menu) => set({ contextMenu: menu }),
  setEditingLabelId: (id) => set({ editingLabelId: id }),
  setActiveReport: (report) => set({ activeReport: report }),
  setOrgChartOverlayEnabled: (enabled) => set({ orgChartOverlayEnabled: enabled }),
  setSeatMapColorMode: (mode) => set({ seatMapColorMode: mode }),
  setMovePlannerActive: (active) => set({ movePlannerActive: active }),
  setEmployeeDirectoryOpen: (open) => set({ employeeDirectoryOpen: open }),
  setDockableToolbarMode: (id, mode) =>
    set((s) => {
      const next = {
        ...s.dockableToolbarLayouts,
        [id]: { ...(s.dockableToolbarLayouts[id] ?? { mode: 'docked', position: { x: 0, y: 0 } }), mode },
      }
      persistToolbarLayouts(next)
      persistWorkspacePreset(null)
      return {
        dockableToolbarLayouts: next,
        activeWorkspacePreset: null,
      }
    }),
  setDockableToolbarPosition: (id, position) =>
    set((s) => {
      const sanitized = sanitizeToolbarLayout(
        id,
        'state-write',
        { mode: s.dockableToolbarLayouts[id]?.mode ?? 'docked', position },
      )
      const next = {
        ...s.dockableToolbarLayouts,
        [id]: sanitized,
      }
      persistToolbarLayouts(next)
      persistWorkspacePreset(null)
      return {
        dockableToolbarLayouts: next,
        activeWorkspacePreset: null,
      }
    }),
  resetDockableToolbarLayout: (id) =>
    set((s) => {
      const next = {
        ...s.dockableToolbarLayouts,
        [id]: DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS[id],
      }
      persistToolbarLayouts(next)
      persistWorkspacePreset(null)
      return {
        dockableToolbarLayouts: next,
        activeWorkspacePreset: null,
      }
    }),
  setDockableToolbarVisible: (id, visible) =>
    set((s) => {
      const next = {
        ...s.dockableToolbarVisibility,
        [id]: visible,
      }
      persistToolbarVisibility(next)
      persistWorkspacePreset(null)
      return {
        dockableToolbarVisibility: next,
        activeWorkspacePreset: null,
      }
    }),
  toggleDockableToolbarVisible: (id) =>
    set((s) => {
      const next = {
        ...s.dockableToolbarVisibility,
        [id]: !s.dockableToolbarVisibility[id],
      }
      persistToolbarVisibility(next)
      persistWorkspacePreset(null)
      return {
        dockableToolbarVisibility: next,
        activeWorkspacePreset: null,
      }
    }),
  applyWorkspacePreset: (preset) =>
    set(() => {
      const config = WORKSPACE_PRESET_CONFIGS[preset]
      const layouts = cloneToolbarLayouts(config.layouts)
      const visibility = cloneToolbarVisibility(config.visibility)
      persistToolbarLayouts(layouts)
      persistToolbarVisibility(visibility)
      persistWorkspacePreset(preset)
      return {
        dockableToolbarLayouts: layouts,
        dockableToolbarVisibility: visibility,
        activeWorkspacePreset: preset,
      }
    }),
  resetDockableWorkspace: () =>
    set(() => {
      const layouts = cloneToolbarLayouts(DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS)
      const visibility = cloneToolbarVisibility(DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY)
      const topbarControls = cloneTopbarControlVisibility(
        DEFAULT_TOPBAR_CONTROL_VISIBILITY,
      )
      const topbarQuickActionOrder = cloneTopbarQuickActionOrder(
        DEFAULT_TOPBAR_QUICK_ACTION_ORDER,
      )
      const topbarQuickActionVisibility = cloneTopbarQuickActionVisibility(
        DEFAULT_TOPBAR_QUICK_ACTION_VISIBILITY,
      )
      persistToolbarLayouts(layouts)
      persistToolbarVisibility(visibility)
      persistWorkspacePreset(null)
      persistTopbarControlVisibility(topbarControls)
      persistTopbarQuickActions(topbarQuickActionOrder, topbarQuickActionVisibility)
      return {
        dockableToolbarLayouts: layouts,
        dockableToolbarVisibility: visibility,
        activeWorkspacePreset: null,
        topbarControlVisibility: topbarControls,
        topbarQuickActionOrder,
        topbarQuickActionVisibility,
      }
    }),
  setTopbarControlVisible: (id, visible) =>
    set((s) => {
      const next = cloneTopbarControlVisibility({
        ...s.topbarControlVisibility,
        [id]: visible,
      })
      persistTopbarControlVisibility(next)
      return { topbarControlVisibility: next }
    }),
  setTopbarQuickActionVisible: (id, visible) =>
    set((s) => {
      const nextVisibility = cloneTopbarQuickActionVisibility({
        ...s.topbarQuickActionVisibility,
        [id]: visible,
      })
      persistTopbarQuickActions(s.topbarQuickActionOrder, nextVisibility)
      return { topbarQuickActionVisibility: nextVisibility }
    }),
  setTopbarQuickActionOrder: (order) =>
    set((s) => {
      const nextOrder = cloneTopbarQuickActionOrder(order)
      persistTopbarQuickActions(nextOrder, s.topbarQuickActionVisibility)
      return { topbarQuickActionOrder: nextOrder }
    }),
  moveTopbarQuickAction: (id, direction) =>
    set((s) => {
      const current = cloneTopbarQuickActionOrder(s.topbarQuickActionOrder)
      const currentIndex = current.indexOf(id)
      if (currentIndex < 0) return {}
      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (swapIndex < 0 || swapIndex >= current.length) return {}
      const nextOrder = [...current]
      const [moved] = nextOrder.splice(currentIndex, 1)
      nextOrder.splice(swapIndex, 0, moved)
      persistTopbarQuickActions(nextOrder, s.topbarQuickActionVisibility)
      return { topbarQuickActionOrder: nextOrder }
    }),
  resetTopbarWorkspace: () =>
    set(() => {
      const topbarControls = cloneTopbarControlVisibility(
        DEFAULT_TOPBAR_CONTROL_VISIBILITY,
      )
      const topbarQuickActionOrder = cloneTopbarQuickActionOrder(
        DEFAULT_TOPBAR_QUICK_ACTION_ORDER,
      )
      const topbarQuickActionVisibility = cloneTopbarQuickActionVisibility(
        DEFAULT_TOPBAR_QUICK_ACTION_VISIBILITY,
      )
      persistTopbarControlVisibility(topbarControls)
      persistTopbarQuickActions(topbarQuickActionOrder, topbarQuickActionVisibility)
      return {
        topbarControlVisibility: topbarControls,
        topbarQuickActionOrder,
        topbarQuickActionVisibility,
      }
    }),
  requestCancelDrawing: () =>
    set((s) => ({ drawingCancelTick: s.drawingCancelTick + 1 })),
  registerModalOpen: () =>
    set((s) => ({ modalOpenCount: s.modalOpenCount + 1 })),
  registerModalClose: () =>
    // Clamp at 0 so a stray unmount (e.g. StrictMode double-invoke) can't
    // drive the counter negative and silently disable global shortcuts.
    set((s) => ({ modalOpenCount: Math.max(0, s.modalOpenCount - 1) })),
  }))
}

const __UI_STORE_KEY = Symbol.for('floocraft.ui-store')
const __g = globalThis as unknown as { [k: symbol]: unknown }
export const useUIStore: UIStore =
  (__g[__UI_STORE_KEY] as UIStore | undefined) ??
  (__g[__UI_STORE_KEY] = createUIStore()) as UIStore
