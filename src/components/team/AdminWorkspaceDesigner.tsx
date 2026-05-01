import { useMemo, useState } from 'react'
import {
  DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS,
  WORKSPACE_PRESET_CONFIGS,
  useUIStore,
  type DockableToolbarId,
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

type WorkspacePayload = {
  layouts: Record<DockableToolbarId, { mode: 'docked' | 'floating'; position: { x: number; y: number } }>
  visibility: Record<DockableToolbarId, boolean>
}

export function AdminWorkspaceDesigner() {
  const layouts = useUIStore((s) => s.dockableToolbarLayouts)
  const visibility = useUIStore((s) => s.dockableToolbarVisibility)
  const activePreset = useUIStore((s) => s.activeWorkspacePreset)
  const setMode = useUIStore((s) => s.setDockableToolbarMode)
  const setPosition = useUIStore((s) => s.setDockableToolbarPosition)
  const setVisible = useUIStore((s) => s.setDockableToolbarVisible)
  const resetLayout = useUIStore((s) => s.resetDockableToolbarLayout)
  const resetWorkspace = useUIStore((s) => s.resetDockableWorkspace)
  const applyPreset = useUIStore((s) => s.applyWorkspacePreset)
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
    }),
    [layouts, visibility],
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

      setJsonError(null)
    } catch {
      setJsonError('Invalid JSON payload. Use Export first, then edit.')
    }
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
          This panel gives admins full control over editor toolbar visibility, placement, docking mode, and presets.
          Use JSON export/import for bulk edits and repeatable workspace templates.
        </p>
      </div>
    </section>
  )
}
