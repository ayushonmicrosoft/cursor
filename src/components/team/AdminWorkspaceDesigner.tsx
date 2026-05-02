import { useMemo, useState } from 'react'
import {
  DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS,
  DEFAULT_TOPBAR_CONTROL_VISIBILITY,
  DEFAULT_TOPBAR_QUICK_ACTION_ORDER,
  DEFAULT_TOPBAR_QUICK_ACTION_VISIBILITY,
  useUIStore,
  type DockableToolbarId,
  type TopbarControlId,
  type TopbarQuickActionId,
} from '../../stores/uiStore'
import { Button } from '../ui'

const TOOLBAR_ORDER: DockableToolbarId[] = [
  'canvas-actions',
  'align-distribute',
  'admin-stats',
  'left-tools',
  'right-inspector',
  'minimap',
  'color-palette',
]

const TOOLBAR_LABELS: Record<DockableToolbarId, string> = {
  'canvas-actions': 'Canvas Actions',
  'align-distribute': 'Align & Distribute',
  'admin-stats': 'Admin Stats',
  'left-tools': 'Left Tools Rail',
  'right-inspector': 'Right Inspector',
  minimap: 'Minimap',
  'color-palette': 'Color Palette',
}

const TOPBAR_CONTROL_ORDER: TopbarControlId[] = [
  'file-menu',
  'save-indicator',
  'history',
  'quick-actions',
  'view-menu',
  'layout-menu',
  'view-mode-switch',
  'health-pill',
]

const TOPBAR_CONTROL_LABELS: Record<TopbarControlId, string> = {
  'file-menu': 'File menu',
  'save-indicator': 'Save indicator',
  history: 'Undo / Redo',
  'quick-actions': 'Quick actions cluster',
  'view-menu': 'View menu',
  'layout-menu': 'Layout menu',
  'view-mode-switch': '2D / 2.5D / Pixi switch',
  'health-pill': 'Plan health pill',
}

const QUICK_ACTION_LABELS: Record<TopbarQuickActionId, string> = {
  grid: 'Grid toggle',
  minimap: 'Minimap toggle',
  presentation: 'Presentation mode toggle',
}

type WorkspacePayload = {
  layouts: Record<DockableToolbarId, { mode: 'docked' | 'floating'; position: { x: number; y: number } }>
  visibility: Record<DockableToolbarId, boolean>
  topbarControls: Record<TopbarControlId, boolean>
  quickActions: {
    order: TopbarQuickActionId[]
    visibility: Record<TopbarQuickActionId, boolean>
  }
}

export function AdminWorkspaceDesigner() {
  const layouts = useUIStore((s) => s.dockableToolbarLayouts)
  const visibility = useUIStore((s) => s.dockableToolbarVisibility)
  const activePreset = useUIStore((s) => s.activeWorkspacePreset)
  const topbarControls = useUIStore((s) => s.topbarControlVisibility)
  const topbarQuickActionOrder = useUIStore((s) => s.topbarQuickActionOrder)
  const topbarQuickActionVisibility = useUIStore((s) => s.topbarQuickActionVisibility)
  const setMode = useUIStore((s) => s.setDockableToolbarMode)
  const setPosition = useUIStore((s) => s.setDockableToolbarPosition)
  const setVisible = useUIStore((s) => s.setDockableToolbarVisible)
  const resetLayout = useUIStore((s) => s.resetDockableToolbarLayout)
  const resetWorkspace = useUIStore((s) => s.resetDockableWorkspace)
  const resetTopbarWorkspace = useUIStore((s) => s.resetTopbarWorkspace)
  const applyPreset = useUIStore((s) => s.applyWorkspacePreset)
  const setTopbarControlVisible = useUIStore((s) => s.setTopbarControlVisible)
  const setTopbarQuickActionVisible = useUIStore((s) => s.setTopbarQuickActionVisible)
  const moveTopbarQuickAction = useUIStore((s) => s.moveTopbarQuickAction)
  const setTopbarQuickActionOrder = useUIStore((s) => s.setTopbarQuickActionOrder)
  const [jsonDraft, setJsonDraft] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)

  const exportPayload = useMemo<WorkspacePayload>(
    () => ({
      layouts,
      visibility: {
        'canvas-actions': visibility['canvas-actions'] !== false,
        'align-distribute': visibility['align-distribute'] !== false,
        'admin-stats': visibility['admin-stats'] !== false,
        'left-tools': visibility['left-tools'] !== false,
        'right-inspector': visibility['right-inspector'] !== false,
        minimap: visibility.minimap !== false,
        'color-palette': visibility['color-palette'] !== false,
      },
      topbarControls: {
        'file-menu': topbarControls['file-menu'] !== false,
        'save-indicator': topbarControls['save-indicator'] !== false,
        history: topbarControls.history !== false,
        'quick-actions': topbarControls['quick-actions'] !== false,
        'view-menu': topbarControls['view-menu'] !== false,
        'layout-menu': topbarControls['layout-menu'] !== false,
        'view-mode-switch': topbarControls['view-mode-switch'] !== false,
        'health-pill': topbarControls['health-pill'] !== false,
      },
      quickActions: {
        order: [...topbarQuickActionOrder],
        visibility: {
          grid: topbarQuickActionVisibility.grid !== false,
          minimap: topbarQuickActionVisibility.minimap !== false,
          presentation: topbarQuickActionVisibility.presentation !== false,
        },
      },
    }),
    [layouts, topbarControls, topbarQuickActionOrder, topbarQuickActionVisibility, visibility],
  )

  function onExport() {
    setJsonDraft(JSON.stringify(exportPayload, null, 2))
    setJsonError(null)
  }

  function onApplyJson() {
    try {
      const parsed = JSON.parse(jsonDraft) as Partial<WorkspacePayload>
      const nextLayouts: Partial<WorkspacePayload['layouts']> = parsed.layouts ?? {}
      const nextVisibility: Partial<WorkspacePayload['visibility']> = parsed.visibility ?? {}
      const nextTopbarControls: Partial<WorkspacePayload['topbarControls']> =
        parsed.topbarControls ?? {}
      const nextQuickActions: Partial<WorkspacePayload['quickActions']> =
        parsed.quickActions ?? {}
      const nextQuickActionOrder: TopbarQuickActionId[] = Array.isArray(nextQuickActions.order)
        ? nextQuickActions.order.filter(
            (id: unknown): id is TopbarQuickActionId =>
              id === 'grid' || id === 'minimap' || id === 'presentation',
          )
        : []
      const nextQuickActionVisibility: Partial<WorkspacePayload['quickActions']['visibility']> =
        nextQuickActions.visibility ?? {}

      for (const id of TOOLBAR_ORDER) {
        const visibilityOverride = nextVisibility[id]
        if (typeof visibilityOverride === 'boolean') {
          setVisible(id, visibilityOverride)
        }
        const layoutOverride = nextLayouts[id]
        if (!layoutOverride) continue
        if (layoutOverride.mode === 'docked' || layoutOverride.mode === 'floating') {
          setMode(id, layoutOverride.mode)
        }
        if (
          Number.isFinite(layoutOverride.position?.x) &&
          Number.isFinite(layoutOverride.position?.y)
        ) {
          setPosition(id, {
            x: Number(layoutOverride.position.x),
            y: Number(layoutOverride.position.y),
          })
        }
      }

      for (const id of TOPBAR_CONTROL_ORDER) {
        const visible = nextTopbarControls[id]
        if (typeof visible === 'boolean') {
          setTopbarControlVisible(id, visible)
        }
      }

      if (nextQuickActionOrder.length > 0) {
        setTopbarQuickActionOrder(nextQuickActionOrder)
      }

      for (const id of DEFAULT_TOPBAR_QUICK_ACTION_ORDER) {
        const visible = nextQuickActionVisibility[id]
        if (typeof visible === 'boolean') {
          setTopbarQuickActionVisible(id, visible)
        }
      }

      setJsonError(null)
    } catch {
      setJsonError('Invalid JSON payload. Use Export first, then edit.')
    }
  }

  function resetQuickActionOrder() {
    setTopbarQuickActionOrder(DEFAULT_TOPBAR_QUICK_ACTION_ORDER)
  }

  return (
    <section aria-labelledby="admin-workspace-heading" className="space-y-3">
      <h2
        id="admin-workspace-heading"
        className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300"
      >
        Admin workspace control
      </h2>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-700 dark:text-gray-300">
            Active preset: <b>{activePreset ?? 'custom'}</b>
          </span>
          <Button type="button" variant="secondary" onClick={() => applyPreset('design')}>
            Apply Design
          </Button>
          <Button type="button" variant="secondary" onClick={() => applyPreset('admin')}>
            Apply Admin
          </Button>
          <Button type="button" variant="secondary" onClick={() => applyPreset('review')}>
            Apply Review
          </Button>
          <Button type="button" variant="ghost" onClick={resetWorkspace}>
            Reset Workspace
          </Button>
          <Button type="button" variant="ghost" onClick={resetTopbarWorkspace}>
            Reset Top Bar
          </Button>
        </div>

        <div className="grid gap-3">
          {TOOLBAR_ORDER.map((id) => {
            const layout = layouts[id] ?? DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS[id]
            const isVisible = visibility[id] !== false
            return (
              <div key={id} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-[180px] text-sm font-medium text-gray-800 dark:text-gray-100">
                    {TOOLBAR_LABELS[id]}
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(event) => setVisible(id, event.target.checked)}
                    />
                    Visible
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    Mode
                    <select
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-950"
                      value={layout.mode}
                      onChange={(event) =>
                        setMode(id, event.target.value === 'floating' ? 'floating' : 'docked')
                      }
                    >
                      <option value="docked">Docked</option>
                      <option value="floating">Floating</option>
                    </select>
                  </label>

                  {layout.mode === 'floating' && (
                    <>
                      <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        X
                        <input
                          type="number"
                          className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-950"
                          value={layout.position.x}
                          onChange={(event) => {
                            const nextX = Number(event.target.value)
                            setPosition(id, {
                              x: Number.isFinite(nextX) ? nextX : 0,
                              y: layout.position.y,
                            })
                          }}
                        />
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        Y
                        <input
                          type="number"
                          className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-950"
                          value={layout.position.y}
                          onChange={(event) => {
                            const nextY = Number(event.target.value)
                            setPosition(id, {
                              x: layout.position.x,
                              y: Number.isFinite(nextY) ? nextY : 0,
                            })
                          }}
                        />
                      </label>
                    </>
                  )}

                  <Button type="button" variant="ghost" onClick={() => resetLayout(id)}>
                    Reset
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
            Top bar controls
          </h3>

          <div className="grid gap-2 sm:grid-cols-2">
            {TOPBAR_CONTROL_ORDER.map((id) => (
              <label
                key={id}
                className="inline-flex items-center justify-between gap-3 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
              >
                <span>{TOPBAR_CONTROL_LABELS[id]}</span>
                <input
                  type="checkbox"
                  checked={topbarControls[id] !== false}
                  onChange={(event) => setTopbarControlVisible(id, event.target.checked)}
                />
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Quick action order
              </span>
              <Button type="button" variant="ghost" onClick={resetQuickActionOrder}>
                Reset order
              </Button>
            </div>

            <div className="space-y-2">
              {topbarQuickActionOrder.map((id, index) => (
                <div
                  key={id}
                  className="flex flex-wrap items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-950"
                >
                  <span className="min-w-[160px] font-medium text-gray-700 dark:text-gray-200">
                    {QUICK_ACTION_LABELS[id]}
                  </span>
                  <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={topbarQuickActionVisibility[id] !== false}
                      onChange={(event) => setTopbarQuickActionVisible(id, event.target.checked)}
                    />
                    Visible
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => moveTopbarQuickAction(id, 'up')}
                    disabled={index === 0}
                  >
                    Move Up
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => moveTopbarQuickAction(id, 'down')}
                    disabled={index === topbarQuickActionOrder.length - 1}
                  >
                    Move Down
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={onExport}>
              Export JSON
            </Button>
            <Button type="button" variant="secondary" onClick={onApplyJson}>
              Apply JSON
            </Button>
            {jsonError && <span className="text-xs text-red-600 dark:text-red-400">{jsonError}</span>}
          </div>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white p-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-950"
            rows={8}
            value={jsonDraft}
            onChange={(event) => setJsonDraft(event.target.value)}
            placeholder="Export current config, edit, then Apply JSON."
          />
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400">
          This panel gives admins full control over editor toolbar visibility, placement, docking mode, top-bar menus,
          and quick-action order. Use JSON export/import for bulk edits and repeatable workspace templates.
        </p>
      </div>
    </section>
  )
}
