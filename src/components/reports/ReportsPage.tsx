import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download, Users } from 'lucide-react'
import { useActiveFloor } from '../../stores/floorStore'
import { useVisibleEmployees } from '../../hooks/useVisibleEmployees'
import { useCan } from '../../hooks/useCan'
import { useAllFloorElements } from '../../hooks/useActiveFloorElements'
import {
  floorUtilization,
  departmentHeadcount,
  unassignedEmployees,
} from '../../lib/reports/calculations'
import { utilizationCsv, headcountCsv, unassignedCsv, downloadCsv } from '../../lib/reports/csvExport'
import { computeReportsStats } from '../../lib/reportsStats'
import { UtilizationBar } from './UtilizationBar'
import { ChurnHeatmap } from './ChurnHeatmap'
import { OccupancyDashboard } from './OccupancyDashboard'

/**
 * Wave 13C: refresh the Reports surface to match the JSON-Crack/Linear
 * chrome the rest of the editor uses.
 */

type ReportTab = 'occupancy' | 'utilization' | 'departments' | 'unassigned' | 'churn'

interface TabDef {
  id: ReportTab
  label: string
}

const TABS: TabDef[] = [
  { id: 'occupancy', label: 'Occupancy' },
  { id: 'utilization', label: 'Floor utilization' },
  { id: 'departments', label: 'Departments' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'churn', label: 'Churn heatmap' },
]

export function ReportsPage() {
  const canView = useCan('viewReports')
  const { teamSlug, officeSlug } = useParams<{ teamSlug: string; officeSlug: string }>()
  
  const floor = useActiveFloor()
  const elementsByFloor = useAllFloorElements()
  const employees = useVisibleEmployees()

  const utilRows = useMemo(() => floorUtilization([floor]), [floor])
  const deptRows = useMemo(() => departmentHeadcount(employees), [employees])
  const unassignedRows = useMemo(() => unassignedEmployees(employees), [employees])
  const stats = useMemo(
    () => computeReportsStats(employees, elementsByFloor),
    [employees, elementsByFloor],
  )

  const [activeTab, setActiveTab] = useState<ReportTab>('occupancy')
  const tabRefs = useRef<Record<ReportTab, HTMLButtonElement | null>>({
    occupancy: null,
    utilization: null,
    departments: null,
    unassigned: null,
    churn: null,
  })

  if (!canView) {
    return <div className="p-6 text-gray-600 dark:text-gray-300">Not authorized to view reports.</div>
  }

  const scenariosHref =
    teamSlug && officeSlug
      ? `/t/${teamSlug}/o/${officeSlug}/reports/scenarios`
      : null

  const isEmpty = stats.totalEmployees === 0 && stats.totalSeats === 0

  if (isEmpty) {
    return <EmptyState teamSlug={teamSlug} officeSlug={officeSlug} />
  }

  const onTablistKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'Home' &&
      e.key !== 'End'
    )
      return
    e.preventDefault()
    const idx = TABS.findIndex((t) => t.id === activeTab)
    if (idx < 0) return
    let next = idx
    if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length
    else if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    const nextId = TABS[next].id
    setActiveTab(nextId)
    tabRefs.current[nextId]?.focus()
  }

  return (
    <div className="surface-gradient min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="glass-panel mb-5 flex flex-col gap-3 rounded-[1.5rem] p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Reports
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Office reports
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Track occupancy, department headcount, open seating, and seat-change activity for this office.
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv('office-summary.csv', summaryCsv(stats))}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/40 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-900/80"
        >
          <Download size={14} aria-hidden="true" />
          Download summary
        </button>
      </header>

      <StatStrip stats={stats} />

      {scenariosHref && (
        <nav aria-label="Reports navigation" className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            to={scenariosHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/70 px-3 py-1.5 text-xs text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-900/80"
          >
            Capacity scenarios →
          </Link>
        </nav>
      )}

      <div className="glass-surface sticky top-0 z-10 mt-5 mb-4 overflow-hidden rounded-[1.25rem]">
        <div
          role="tablist"
          aria-label="Reports sections"
          onKeyDown={onTablistKeyDown}
          className="flex min-w-max items-center gap-1 overflow-x-auto px-2 py-1"
        >
          {TABS.map((tab) => {
            const selected = tab.id === activeTab
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el
                }}
                type="button"
                role="tab"
                id={`reports-tab-${tab.id}`}
                aria-controls={`reports-panel-${tab.id}`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  selected
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                    : 'text-slate-500 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-slate-50'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`reports-panel-${activeTab}`}
        aria-labelledby={`reports-tab-${activeTab}`}
      >
        {activeTab === 'occupancy' && (
          <Card title="Occupancy dashboard">
            <OccupancyDashboard />
          </Card>
        )}

        {activeTab === 'utilization' && (
          <Card
            title="Floor utilization"
            onExport={() => downloadCsv('floor-utilization.csv', utilizationCsv(utilRows))}
          >
            <div className="overflow-x-auto min-w-0">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                    <th className="py-2 whitespace-nowrap">Floor</th>
                    <th className="whitespace-nowrap">Assigned</th>
                    <th className="whitespace-nowrap">Capacity</th>
                    <th className="w-1/3 whitespace-nowrap">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {utilRows.map((r) => (
                    <tr key={r.floorId} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 whitespace-nowrap">{r.floorName}</td>
                      <td className="tabular-nums whitespace-nowrap">{r.assigned}</td>
                      <td className="tabular-nums whitespace-nowrap">{r.capacity}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <UtilizationBar percent={r.percent} />
                          <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums w-12 text-right whitespace-nowrap">
                            {r.percent.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'departments' && (
          <Card
            title="Department headcount"
            onExport={() => downloadCsv('department-headcount.csv', headcountCsv(deptRows))}
          >
            <div className="overflow-x-auto min-w-0">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                    <th className="py-2 whitespace-nowrap">Department</th>
                    <th className="whitespace-nowrap">Count</th>
                    <th className="whitespace-nowrap">Assigned</th>
                    <th className="whitespace-nowrap">Assignment rate</th>
                  </tr>
                </thead>
                <tbody>
                  {deptRows.map((r) => (
                    <tr key={r.department} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 whitespace-nowrap">{r.department}</td>
                      <td className="tabular-nums whitespace-nowrap">{r.count}</td>
                      <td className="tabular-nums whitespace-nowrap">{r.assigned}</td>
                      <td className="tabular-nums whitespace-nowrap">{r.assignmentRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'unassigned' && (
          <Card
            title={`Unassigned (${unassignedRows.length})`}
            onExport={() => downloadCsv('unassigned.csv', unassignedCsv(unassignedRows))}
          >
            {unassignedRows.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Everyone active has a seat.</p>
            ) : (
              <ul className="text-sm divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
                {unassignedRows.map((r) => (
                  <li key={r.id} className="py-1.5 flex items-center justify-between">
                    <span>{r.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{r.department ?? '—'}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {activeTab === 'churn' && (
          <Card title="Seat change activity (13 weeks)">
            <ChurnHeatmap />
          </Card>
        )}
      </div>
      </div>
    </div>
  )
}

function summaryCsv(stats: ReturnType<typeof computeReportsStats>) {
  return [
    'metric,value',
    `employees,${stats.totalEmployees}`,
    `seats,${stats.totalSeats}`,
    `occupancy_percent,${stats.occupancyPct}`,
    `unassigned,${stats.unassigned}`,
    `floors,${stats.floorCount}`,
    `departments,${stats.departmentCount}`,
  ].join('\n')
}

function StatStrip({
  stats,
}: {
  stats: ReturnType<typeof computeReportsStats>
}) {
  const occupiedOfSeats =
    stats.totalSeats > 0
      ? `${Math.round((stats.occupancyPct * stats.totalSeats) / 100)} / ${stats.totalSeats} occupied`
      : 'No seats placed'
  const unassignedOfTotal =
    stats.totalEmployees > 0
      ? `${stats.totalEmployees - stats.unassigned} seated`
      : 'No employees'
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      aria-label="Reports summary"
    >
      <StatCard label="Employees" value={stats.totalEmployees} />
      <StatCard label="Seats" value={stats.totalSeats} secondary={occupiedOfSeats} />
      <StatCard
        label="Occupancy"
        value={`${stats.occupancyPct}%`}
        secondary={stats.totalSeats > 0 ? `${stats.totalSeats} seats` : undefined}
      />
      <StatCard label="Unassigned" value={stats.unassigned} secondary={unassignedOfTotal} />
      <StatCard label="Floors" value={stats.floorCount} />
      <StatCard label="Departments" value={stats.departmentCount} />
    </div>
  )
}

function StatCard({
  label,
  value,
  secondary,
}: {
  label: string
  value: string | number
  secondary?: string
}) {
  return (
    <div className="glass-panel rounded-[1.25rem] p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-950 dark:text-slate-50">
        {value}
      </div>
      {secondary ? (
        <div className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{secondary}</div>
      ) : null}
    </div>
  )
}

function EmptyState({
  teamSlug,
  officeSlug,
}: {
  teamSlug?: string
  officeSlug?: string
}) {
  const mapHref =
    teamSlug && officeSlug ? `/t/${teamSlug}/o/${officeSlug}/map` : null
  return (
    <div className="surface-gradient min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
      <div
        role="status"
        aria-live="polite"
        className="glass-panel rounded-[1.5rem] p-10 text-center"
      >
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:bg-slate-950/60 dark:text-slate-400">
          <Users size={22} aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
          Nothing to report yet
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Import your roster and lay out a floor to unlock occupancy,
          utilisation and churn metrics.
        </p>
        {mapHref && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Link
              to={mapHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/70 px-3 py-1.5 text-sm text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-900/80"
            >
              Back to map
            </Link>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

function Card({
  title,
  onExport,
  children,
}: {
  title: string
  onExport?: () => void
  children: React.ReactNode
}) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {title}
        </h2>
        {onExport ? (
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/40 bg-white/70 px-2 py-1 text-xs text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-900/80"
          >
            <Download size={13} aria-hidden="true" />
            Export CSV
          </button>
        ) : null}
      </div>
      {children}
    </section>
  )
}
