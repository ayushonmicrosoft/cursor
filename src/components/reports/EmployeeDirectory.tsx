import { useState, useMemo, useCallback, type KeyboardEvent } from 'react'
import { X, ArrowUpDown } from 'lucide-react'
import { useVisibleEmployees } from '../../hooks/useVisibleEmployees'
import { useFloorStore } from '../../stores/floorStore'
import { useUIStore } from '../../stores/uiStore'
import { useShallow } from 'zustand/react/shallow'
import { switchToFloor } from '../../lib/seatAssignment'
import type { Employee } from '../../types/employee'

type SortColumn =
  | 'name'
  | 'department'
  | 'team'
  | 'title'
  | 'floor'
  | 'desk'
  | 'manager'
  | 'type'
  | 'officeDays'
  | 'tags'

type SortDirection = 'asc' | 'desc'

export function EmployeeDirectory() {
  // Directory is a viewer-first surface — it's often the first page a
  // viewer-role user sees. Route through the redaction hook so names show
  // as initials and email/manager/office-days empty out.
  const employees = useVisibleEmployees()
  const floors = useFloorStore((s) => s.floors)
  const { setEmployeeDirectoryOpen, setSelectedIds, setActiveReport } =
    useUIStore(
      useShallow((s) => ({
        setEmployeeDirectoryOpen: s.setEmployeeDirectoryOpen,
        setSelectedIds: s.setSelectedIds,
        setActiveReport: s.setActiveReport,
      })),
    )
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  const allEmployees = useMemo(() => Object.values(employees), [employees])

  const floorMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const f of floors) {
      m[f.id] = f.name
    }
    return m
  }, [floors])

  const employeeMap = useMemo(() => employees, [employees])

  const filtered = useMemo(() => {
    let list = allEmployees
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.department && e.department.toLowerCase().includes(q)) ||
          (e.team && e.team.toLowerCase().includes(q)) ||
          (e.title && e.title.toLowerCase().includes(q)) ||
          (e.email && e.email.toLowerCase().includes(q)) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    return list
  }, [allEmployees, search])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    const dir = sortDir === 'asc' ? 1 : -1
    copy.sort((a, b) => {
      let av = ''
      let bv = ''
      switch (sortColumn) {
        case 'name':
          av = a.name
          bv = b.name
          break
        case 'department':
          av = a.department || ''
          bv = b.department || ''
          break
        case 'team':
          av = a.team || ''
          bv = b.team || ''
          break
        case 'title':
          av = a.title || ''
          bv = b.title || ''
          break
        case 'floor':
          av = a.floorId ? floorMap[a.floorId] || '' : ''
          bv = b.floorId ? floorMap[b.floorId] || '' : ''
          break
        case 'desk':
          av = a.seatId || ''
          bv = b.seatId || ''
          break
        case 'manager':
          av = a.managerId ? employeeMap[a.managerId]?.name || '' : ''
          bv = b.managerId ? employeeMap[b.managerId]?.name || '' : ''
          break
        case 'type':
          av = a.employmentType
          bv = b.employmentType
          break
        case 'officeDays':
          av = a.officeDays.join(',')
          bv = b.officeDays.join(',')
          break
        case 'tags':
          av = a.tags.join(',')
          bv = b.tags.join(',')
          break
      }
      return av.localeCompare(bv) * dir
    })
    return copy
  }, [filtered, sortColumn, sortDir, floorMap, employeeMap])

  const handleSort = useCallback((col: SortColumn) => {
    setSortColumn((prev) => {
      if (prev === col) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortDir('asc')
      return col
    })
  }, [])

  const handleRowClick = useCallback(
    (emp: Employee) => {
      if (emp.floorId) {
        // switchToFloor saves the outgoing floor's live elements before loading
        // the target floor, so unsaved edits on the current floor are preserved.
        switchToFloor(emp.floorId)
      }
      if (emp.seatId) {
        setSelectedIds([emp.seatId])
      }
      setEmployeeDirectoryOpen(false)
      setActiveReport(null)
    },
    [setSelectedIds, setEmployeeDirectoryOpen, setActiveReport],
  )

  const handleRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTableRowElement>, emp: Employee) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleRowClick(emp)
      }
    },
    [handleRowClick],
  )

  const handleClose = useCallback(() => {
    setEmployeeDirectoryOpen(false)
    setActiveReport(null)
  }, [setEmployeeDirectoryOpen, setActiveReport])

  const columns: { key: SortColumn; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'team', label: 'Team' },
    { key: 'title', label: 'Title' },
    { key: 'floor', label: 'Floor' },
    { key: 'desk', label: 'Desk' },
    { key: 'manager', label: 'Manager' },
    { key: 'type', label: 'Type' },
    { key: 'officeDays', label: 'Office Days' },
    { key: 'tags', label: 'Tags' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative mx-4 flex max-h-[85vh] w-full max-w-6xl min-w-0 flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Employee Directory
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-100 px-6 py-3 dark:border-gray-800">
          <input
            type="text"
            placeholder="Search by name, department, team, title, email, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-800"
            autoFocus
          />
        </div>

        {/* Table */}
        <div className="min-w-0 flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="sticky top-0 border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    aria-sort={
                      sortColumn === col.key
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    className="px-3 py-2 text-left text-xs font-medium tracking-wider whitespace-nowrap text-gray-500 uppercase select-none dark:text-gray-400"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:hover:bg-gray-800"
                    >
                      {col.label}
                      {sortColumn === col.key && (
                        <ArrowUpDown
                          size={12}
                          className="text-blue-500 dark:text-blue-400"
                        />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sorted.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => handleRowClick(emp)}
                  onKeyDown={(event) => handleRowKeyDown(event, emp)}
                  tabIndex={0}
                  aria-label={`Open ${emp.name} in map view`}
                  className="cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <td className="px-3 py-2 font-medium whitespace-nowrap text-gray-800 dark:text-gray-100">
                    {emp.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {emp.department || '—'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {emp.team || '—'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {emp.title || '—'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {emp.floorId ? floorMap[emp.floorId] || '—' : '—'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {emp.seatId || '—'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {emp.managerId
                      ? employeeMap[emp.managerId]?.name || '—'
                      : '—'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {emp.employmentType}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {emp.officeDays.length > 0
                      ? emp.officeDays.join(', ')
                      : '—'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {emp.tags.length > 0 ? emp.tags.join(', ') : '—'}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-8 text-center text-sm text-gray-400 dark:text-gray-500"
                  >
                    {search
                      ? 'No employees match your search.'
                      : 'No employees added yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {sorted.length} employee{sorted.length !== 1 ? 's' : ''} shown
        </div>
      </div>
    </div>
  )
}
