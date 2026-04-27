import { useCallback, useMemo, useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { useEmployeeStore } from '../../../stores/employeeStore'
import { useFloorStore } from '../../../stores/floorStore'
import { useElementsStore } from '../../../stores/elementsStore'
import { useCan } from '../../../hooks/useCan'
import { computeUtilizationMetrics } from '../../../lib/utilizationMetrics'
import type { CanvasElement } from '../../../types/elements'
import type { Employee } from '../../../types/employee'
import {
  UNASSIGNED_DEPARTMENT,
  type ScenarioBaseSnapshot,
} from '../../../lib/scenarios'
import { useScenariosStore } from '../../../stores/scenariosStore'
import { ScenarioDetailPane } from './ScenarioDetailPane'
import { ScenarioCompareView } from './ScenarioCompareView'

/**
 * Top-level "Capacity scenarios" page. A space planner opens this page,
 * spawns a new scenario (snapshot of current office counts), then models
 * adjustments in the detail pane. The page deliberately never reads
 * employee *names* — the scenario model deals in counts only, so there's
 * no PII surface area regardless of the viewer's role.
 *
 * Layout: left sidebar lists scenarios; right side is a tabbed detail
 * (Edit | Compare). View-only roles see the sidebar + detail pane but
 * every input is disabled.
 */
export function ScenariosPage() {
  const canView = useCan('viewReports')
  const canEdit = useCan('editRoster')
  const { teamSlug, officeSlug } = useParams<{ teamSlug: string; officeSlug: string }>()

  const scenarios = useScenariosStore((s) => s.scenarios)
  const activeId = useScenariosStore((s) => s.activeScenarioId)
  const compareId = useScenariosStore((s) => s.compareScenarioId)
  const createScenario = useScenariosStore((s) => s.createScenario)
  const cloneScenario = useScenariosStore((s) => s.cloneScenario)
  const removeScenario = useScenariosStore((s) => s.removeScenario)
  const setActiveScenario = useScenariosStore((s) => s.setActiveScenario)

  // Compute a base snapshot from the live stores. Cheap to do on every
  // render — `computeUtilizationMetrics` is pure and the only aggregation
  // runs across elements+employees, both of which are already
  // memoisation-friendly via their stores.
  const allFloorsElements = useFloorStore((s) => s.floors)
  const activeFloorId = useFloorStore((s) => s.activeFloorId)
  const activeElements = useElementsStore((s) => s.elements)
  const employees = useEmployeeStore((s) => s.employees)

  const liveElements = useMemo(() => {
    const merged: Record<string, CanvasElement> = {}
    for (const floor of allFloorsElements) {
      const src = floor.id === activeFloorId ? activeElements : floor.elements
      Object.assign(merged, src)
    }
    return merged
  }, [allFloorsElements, activeFloorId, activeElements])

  const currentSnapshot = useMemo<ScenarioBaseSnapshot>(() => {
    const metrics = computeUtilizationMetrics(liveElements, employees)
    const byDept = countByDepartment(employees)
    return {
      activeEmployees: metrics.activeEmployees,
      employeesByDepartment: byDept,
      totalSeats: metrics.totalSeats,
      assignedSeats: metrics.assignedSeats,
    }
  }, [liveElements, employees])

  const [tab, setTab] = useState<'edit' | 'compare'>('edit')

  const active = useMemo(
    () => scenarios.find((s) => s.id === activeId) ?? null,
    [scenarios, activeId],
  )
  const other = useMemo(
    () => scenarios.find((s) => s.id === compareId) ?? null,
    [scenarios, compareId],
  )

  const handleCreate = useCallback(() => {
    createScenario(currentSnapshot)
  }, [createScenario, currentSnapshot])

  const handleClone = useCallback(() => {
    if (active) cloneScenario(active.id)
  }, [active, cloneScenario])

  const handleRemove = useCallback(() => {
    if (active) removeScenario(active.id)
  }, [active, removeScenario])

  const reportsHref =
    teamSlug && officeSlug ? `/t/${teamSlug}/o/${officeSlug}/reports` : null

  if (!canView) {
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300">Not authorized to view scenarios.</div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {reportsHref && (
              <Link
                to={reportsHref}
                className="mb-3 inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/50"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Back to reports
              </Link>
            )}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Reports
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Capacity scenarios
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Model headcount and seat changes before committing changes to the live office plan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadScenariosCsv(scenarios)}
            disabled={scenarios.length === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/50"
          >
            <Download size={14} aria-hidden="true" />
            Download CSV
          </button>
        </header>
    <div className="flex min-h-[600px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:flex-row">
      {/* Sidebar — list of scenarios. */}
      <aside className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50 lg:w-64 lg:border-b-0 lg:border-r flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Scenarios
          </h2>
          {canEdit && (
            <button
              type="button"
              onClick={handleCreate}
              className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="New scenario"
            >
              + New
            </button>
          )}
        </div>
        {scenarios.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No scenarios yet. {canEdit ? 'Create one to start planning.' : ''}
          </p>
        ) : (
          <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto lg:max-h-none">
            {scenarios.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveScenario(s.id)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded ${
                    s.id === activeId
                      ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="truncate">{s.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {s.adjustments.length} adjustment
                    {s.adjustments.length === 1 ? '' : 's'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Snapshot footer — reassures the planner about what "today"
            means in the projection. */}
        <div className="mt-auto text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-3">
          <div className="font-semibold text-gray-600 dark:text-gray-300">Today</div>
          <div className="tabular-nums">
            {currentSnapshot.activeEmployees} active · {currentSnapshot.totalSeats} seats
          </div>
        </div>
      </aside>

      {/* Main area — tabs for edit vs. compare. */}
      <div className="flex-1 flex flex-col min-w-0">
        {active ? (
          <Tabs.Root
            value={tab}
            onValueChange={(v) => setTab(v as 'edit' | 'compare')}
            className="flex-1 flex flex-col"
          >
            <Tabs.List className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 px-6 pt-4">
              <Tabs.Trigger
                value="edit"
                className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 -mb-px"
              >
                Edit
              </Tabs.Trigger>
              <Tabs.Trigger
                value="compare"
                className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 -mb-px"
              >
                Compare
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="edit" className="flex-1 flex flex-col">
              <ScenarioDetailPane
                scenario={active}
                editable={canEdit}
                onClone={handleClone}
                onRemove={handleRemove}
              />
            </Tabs.Content>
            <Tabs.Content value="compare" className="flex-1 flex flex-col">
              <ScenarioCompareView
                primary={active}
                other={other}
                allScenarios={scenarios}
              />
            </Tabs.Content>
          </Tabs.Root>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            {canEdit
              ? 'Create a scenario to start modelling.'
              : 'No scenarios to view.'}
          </div>
        )}
      </div>
    </div>
      </div>
    </div>
  )
}

/**
 * Count active employees (status !== 'departed') bucketed by department.
 * Null / empty department values land in the `UNASSIGNED_DEPARTMENT`
 * bucket so the UI can show an entry for them without conditional logic.
 * Employees' names are never inspected — this is pure aggregate math,
 * which is why the scenario feature doesn't need a redaction-aware hook.
 */
function countByDepartment(employees: Record<string, Employee>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const e of Object.values(employees)) {
    if (e.status === 'departed') continue
    const key = e.department && e.department.length > 0 ? e.department : UNASSIGNED_DEPARTMENT
    out[key] = (out[key] ?? 0) + 1
  }
  return out
}

function downloadScenariosCsv(scenarios: readonly { name: string; adjustments: readonly unknown[]; baseSnapshot: ScenarioBaseSnapshot }[]) {
  const rows = [
    ['scenario', 'active_employees', 'total_seats', 'assigned_seats', 'adjustments'],
    ...scenarios.map((s) => [
      s.name,
      String(s.baseSnapshot.activeEmployees),
      String(s.baseSnapshot.totalSeats),
      String(s.baseSnapshot.assignedSeats),
      String(s.adjustments.length),
    ]),
  ]
  const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'capacity-scenarios.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
