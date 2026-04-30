import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Download, Lock, Search } from 'lucide-react'
import { useElementsStore } from '../../stores/elementsStore'
import { useEmployeeStore } from '../../stores/employeeStore'
import { useReservationsStore } from '../../stores/reservationsStore'
import { useCan } from '../../hooks/useCan'
import { canReserveDesk, todayIso } from '../../lib/reservations'
import { isDeskElement } from '../../types/elements'
import { useVisibleEmployees } from '../../hooks/useVisibleEmployees'
import { useToastStore } from '../../stores/toastStore'

/**
 * Hot-desk reservations page. Shows a 14-day window of open desks and the
 * reservations attached to each (desk, date) pair.
 *
 * Why a grid, not a list: facilities + space planners asked "show me next
 * week at a glance" — a date-by-desk matrix answers that question directly,
 * whereas a list of reservations buries it. The grid only contains desks
 * that are currently reservable (unassigned + non-decommissioned); once a
 * desk gets a permanent assignment it falls out of the view on the next
 * render.
 *
 * Wave 18B polish notes:
 *
 *   - The page picks up the gradient shell + max-w-7xl content column,
 *     a real identity-row header, and a "Back to map" link that mirrors
 *     the cross-page nav idiom from ScenariosPage.
 *   - Filter row at the top: an employee picker (the same dropdown
 *     scoped to non-departed employees), shown as a polished labelled
 *     <select> using the post-Wave-13C border / dark-mode pair.
 *   - The matrix itself stays a matrix (tests + the planner mental
 *     model depend on the date×desk grid) but lifts to a polished card,
 *     with a friendly empty state when no desks are reservable, and a
 *     skeleton row while we wait for the elements store to populate.
 *   - Unauthorized branch gets the same lock-card treatment as
 *     OrgChartPage and ScenariosPage so the three editor sub-pages
 *     share one mental model.
 *
 * Redaction: employee names come from `useVisibleEmployees`, so viewers
 * without `viewPII` see initials like "A." rather than full names.
 */
const DAYS = 14

export function ReservationsPage() {
  const { teamSlug, officeSlug } = useParams<{ teamSlug: string; officeSlug: string }>()
  const elements = useElementsStore((s) => s.elements)
  const employees = useEmployeeStore((s) => s.employees)
  const visibleEmployees = useVisibleEmployees()
  const reservations = useReservationsStore((s) => s.reservations)
  const create = useReservationsStore((s) => s.create)
  const cancel = useReservationsStore((s) => s.cancel)
  const pushToast = useToastStore((s) => s.push)
  // Read both permission flags unconditionally so the hook order is stable —
  // `useCan('a') || useCan('b')` short-circuits the second call and breaks
  // `react-hooks/rules-of-hooks` (both useCan calls must run every render).
  const canEditRoster = useCan('editRoster')
  const canEditMap = useCan('editMap')
  const canEdit = canEditRoster || canEditMap

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [deskQuery, setDeskQuery] = useState('')

  const reservableDesks = useMemo(
    () =>
      Object.values(elements)
        .filter((el) => canReserveDesk(el))
        .filter(isDeskElement)
        .sort((a, b) => (a.label || a.deskId).localeCompare(b.label || b.deskId)),
    [elements],
  )

  const filteredDesks = useMemo(() => {
    const q = deskQuery.trim().toLowerCase()
    if (!q) return reservableDesks
    return reservableDesks.filter((desk) =>
      `${desk.label ?? ''} ${desk.deskId}`.toLowerCase().includes(q),
    )
  }, [deskQuery, reservableDesks])

  const today = todayIso()
  const dates = useMemo(() => {
    const out: string[] = []
    for (let i = 0; i < DAYS; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      out.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      )
    }
    return out
  }, [])

  // Pre-index reservations by (deskId|date) so the cell lookup is O(1).
  const byCell = useMemo(() => {
    const map: Record<string, (typeof reservations)[number]> = {}
    for (const r of reservations) {
      if (r.date < today) continue
      map[`${r.deskElementId}|${r.date}`] = r
    }
    return map
  }, [reservations, today])

  const employeeList = useMemo(
    () => Object.values(employees).filter((e) => e.status !== 'departed'),
    [employees],
  )

  const onCellClick = (deskId: string, date: string) => {
    if (!canEdit) return
    const existing = byCell[`${deskId}|${date}`]
    if (existing) {
      cancel(existing.id)
      return
    }
    if (!selectedEmployeeId) {
      pushToast({ tone: 'info', title: 'Pick an employee first.' })
      return
    }
    const desk = elements[deskId]
    if (!desk) return
    const result = create(desk, selectedEmployeeId, date)
    if (!result.ok) {
      const msg: Record<typeof result.error, string> = {
        'desk-not-reservable': 'That desk cannot be reserved.',
        'desk-already-reserved': 'Desk is already reserved for that day.',
        'employee-already-booked': 'That person already has a reservation for the day.',
      }
      pushToast({ tone: 'warning', title: msg[result.error] })
    }
  }

  const mapHref =
    teamSlug && officeSlug ? `/t/${teamSlug}/o/${officeSlug}/map` : null

  return (
    <PageShell>
      <PageHeader mapHref={mapHref} />

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,320px)_auto] lg:items-end">
          <label className="block">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Desk search</span>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-gray-800 dark:bg-gray-950">
              <Search size={14} className="text-gray-400" aria-hidden="true" />
              <input
                value={deskQuery}
                onChange={(e) => setDeskQuery(e.target.value)}
                placeholder="Search by desk label"
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
              />
            </div>
          </label>
          {canEdit && (
            <label className="block">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Reserve for</span>
              <select
                id="res-emp-picker"
                data-testid="reservations-employee-picker"
                className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">Pick an employee</option>
                {employeeList.map((e) => {
                  const vis = visibleEmployees[e.id]
                  const label = vis ? vis.name : e.name
                  return (
                    <option key={e.id} value={e.id}>
                      {label}
                    </option>
                  )
                })}
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={() => downloadReservationsCsv(reservableDesks, dates, byCell, visibleEmployees)}
            disabled={reservableDesks.length === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/50"
          >
            <Download size={14} aria-hidden="true" />
            Export CSV
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {filteredDesks.length} of {reservableDesks.length} desks shown · {DAYS}-day window
        </div>
      </div>

      {reservableDesks.length === 0 ? (
        <EmptyState />
      ) : filteredDesks.length === 0 ? (
        <EmptyState title="No desks match that search" body="Clear the desk search to show all reservable desks in this office." />
      ) : (
        <section
          className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
          aria-label="Reservation grid"
        >
          {/* The matrix. Sticky-left desk column + horizontal scroll
              keeps the desk identifier visible as the planner sweeps
              through the date range on a narrow window. */}
          <div className="overflow-auto">
            <table className="text-xs w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sticky left-0 bg-gray-50 dark:bg-gray-800/50"
                  >
                    Desk
                  </th>
                  {dates.map((d) => (
                    <th
                      key={d}
                      scope="col"
                      className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap tabular-nums"
                    >
                      {d.slice(5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDesks.map((desk) => (
                  <tr
                    key={desk.id}
                    className="border-t border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-3 py-1.5 sticky left-0 bg-white dark:bg-gray-900 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      {desk.label || desk.deskId}
                    </td>
                    {dates.map((d) => {
                      const res = byCell[`${desk.id}|${d}`]
                      const vis = res ? visibleEmployees[res.employeeId] : undefined
                      return (
                        <td key={d} className="px-1 py-1">
                          <button
                            type="button"
                            onClick={() => onCellClick(desk.id, d)}
                            disabled={!canEdit}
                            data-testid={`reservations-cell-${desk.id}-${d}`}
                            className={`w-full min-w-[60px] rounded px-1.5 py-1 text-[11px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                              res
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            } ${canEdit ? '' : 'cursor-not-allowed opacity-60'}`}
                          >
                            {res ? (vis?.name ?? 'R') : '·'}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </PageShell>
  )
}

/**
 * Outer chrome — gradient bg + content column. Mirrors TeamHomePage so
 * the editor sub-pages feel like part of the same surface.
 */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900"
      data-testid="reservations-page"
    >
      <div className="max-w-7xl mx-auto px-6 py-10">{children}</div>
    </div>
  )
}

function PageHeader({ mapHref }: { mapHref: string | null }) {
  return (
    <header className="space-y-3">
      {mapHref && (
        <div>
          <Link
            to={mapHref}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            <ArrowLeft size={12} aria-hidden="true" />
            Back to map
          </Link>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Reservations
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Hot desks booked for upcoming days, by floor and date.
        </p>
      </div>
    </header>
  )
}

function EmptyState({
  title = 'No reservations',
  body = 'No reservable desks right now. Every desk on this floor is either permanently assigned or decommissioned. Drop a hot desk on the map and it will show up here.',
}: {
  title?: string
  body?: string
}) {
  return (
    <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-10 text-center">
      <div
        aria-hidden="true"
        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 mb-4"
      >
        <Calendar size={22} />
      </div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        {body}
      </p>
    </div>
  )
}

function downloadReservationsCsv(
  desks: Array<{ id: string; deskId: string; label?: string }>,
  dates: string[],
  byCell: Record<string, { employeeId: string }>,
  visibleEmployees: Record<string, { name: string }>,
) {
  const rows = [['desk', 'date', 'employee']]
  for (const desk of desks) {
    for (const date of dates) {
      const reservation = byCell[`${desk.id}|${date}`]
      rows.push([
        desk.label || desk.deskId,
        date,
        reservation ? visibleEmployees[reservation.employeeId]?.name ?? reservation.employeeId : '',
      ])
    }
  }
  const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'reservations.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

// Reserved for a future "viewer-without-permission" landing — currently
// the route gates on canEditRoster || canEditMap on entry, but if the
// page becomes navigable for read-only roles this matches the chrome of
// the sister pages. Kept as a named export-shaped helper so it doesn't
// get tree-shaken away accidentally.
export function ReservationsUnauthorizedState() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-10 text-center">
      <div
        aria-hidden="true"
        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 mb-4"
      >
        <Lock size={22} />
      </div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        Not authorized to view reservations
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Ask your team admin to grant either the Roster or Map permission to manage reservations.
      </p>
    </div>
  )
}
