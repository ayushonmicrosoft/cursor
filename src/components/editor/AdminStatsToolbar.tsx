import {
  AlertTriangle,
  Armchair,
  Cloud,
  Database,
  History,
  Layers3,
  LifeBuoy,
  ShieldCheck,
  Users,
  type LucideIcon,
  Tag,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useNavigate, useParams } from 'react-router-dom'
import { useElementsStore } from '../../stores/elementsStore'
import { useEmployeeStore } from '../../stores/employeeStore'
import { useFloorStore } from '../../stores/floorStore'
import { useInsightsStore } from '../../stores/insightsStore'
import { useProjectStore } from '../../stores/projectStore'
import { DockableToolbar } from './DockableToolbar'
import { useCan } from '../../hooks/useCan'
import { computeRosterStats } from '../../lib/rosterStats'
import { useNeighborhoodStore } from '../../stores/neighborhoodStore'
import { useOfficeSync } from '../../lib/offices/useOfficeSync'

export function AdminStatsToolbar() {
  const canManageTeam = useCan('manageTeam')
  const navigate = useNavigate()
  const { teamSlug, officeSlug } = useParams<{ teamSlug: string; officeSlug: string }>()
  
  const elements = useElementsStore((s) => s.elements)
  
  const employeesById = useEmployeeStore((s) => s.employees)
  const floor = useFloorStore((s) => s.floor)
  const neighborhoods = useNeighborhoodStore((s) => s.neighborhoods)
  const insights = useInsightsStore((s) => s.insights)
  
  const { saveState, lastSavedAt, conflict } = useProjectStore(useShallow((s) => ({
    saveState: s.saveState,
    lastSavedAt: s.lastSavedAt,
    conflict: s.conflict,
  })))

  const { overwrite } = useOfficeSync()
  const employees = useMemo(() => Object.values(employeesById), [employeesById])

  const [activeTab, setActiveTab] = useState<'stats' | 'ops'>('stats')

  const stats = useMemo(() => {
    const roster = computeRosterStats(employees, elements)
    const critical = insights.filter((i) => !i.dismissed && i.severity === 'critical').length
    const warning = insights.filter((i) => !i.dismissed && i.severity === 'warning').length
    return {
      neighborhoods: Object.keys(neighborhoods).length,
      people: employees.length,
      objects: Object.keys(elements).length,
      assigned: Math.max(0, employees.length - roster.unassigned),
      occupancyPct: roster.occupancyPct,
      unassigned: roster.unassigned,
      critical,
      warning,
      conflicts: conflict ? 1 : 0,
      payloadKb: Math.round(JSON.stringify({ elements, employees, floor }).length / 1024),
    }
  }, [conflict, elements, employees, floor, insights, neighborhoods])

  if (!canManageTeam) return null

  const healthTone =
    stats.critical > 0 ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-900/70'
    : stats.warning > 0 ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-900/70'
    : 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900/70'

  return (
    <DockableToolbar
      id="admin-stats"
      title="Admin Control Center"
      dockedClassName="top-4 left-4"
      className="w-[400px]"
    >
      <div className="flex border-b border-gray-200 dark:border-gray-800 px-1 pt-1">
        <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>Live Stats</TabButton>
        <TabButton active={activeTab === 'ops'} onClick={() => setActiveTab('ops')}>Maintenance</TabButton>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {activeTab === 'stats' && (
          <div className="grid grid-cols-3 gap-2 p-3">
            <StatCard icon={Tag} label="Areas" value={stats.neighborhoods} detail="Neighborhood count" />
            <StatCard icon={Users} label="People" value={stats.people} detail={`${stats.unassigned} unassigned`} />
            <StatCard icon={Armchair} label="Occupancy" value={`${stats.occupancyPct}%`} detail="Realtime seating load" />
            <StatCard icon={Layers3} label="Objects" value={stats.objects} detail="Canvas payload" />
            <StatCard icon={ShieldCheck} label="Assigned" value={stats.assigned} detail="People seated" />
            <StatCard
              icon={AlertTriangle}
              label="Alerts"
              value={stats.critical + stats.warning}
              detail={`${stats.critical} critical`}
              accentClass={healthTone}
            />
          </div>
        )}

        {activeTab === 'ops' && (
          <div className="p-3 space-y-3">
            <div className="space-y-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Sync & History</h3>
              <div className="grid grid-cols-2 gap-2">
                <AdminActionButton
                  icon={RefreshCw}
                  label="Force Push"
                  detail="Overwrite remote"
                  onClick={() => {
                    if (confirm('Overwrite the remote office with your local state? This cannot be undone.')) {
                      void overwrite()
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-red-400">Destructive Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <AdminActionButton
                  icon={Trash2}
                  label="Clear Canvas"
                  detail="Delete all objects"
                  accentClass="text-red-600 dark:text-red-400"
                  onClick={() => {
                    if (confirm('Permanently delete every element on this floor?')) {
                      useElementsStore.setState({ elements: {} })
                    }
                  }}
                />
                <AdminActionButton
                  icon={LifeBuoy}
                  label="Triage"
                  detail="Resolve conflicts"
                  disabled={!conflict}
                  onClick={() => {
                    // Conflict modal handles this
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-gray-200/80 px-3 py-2 dark:border-gray-800/80">
        <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300">
            <Cloud size={14} aria-hidden="true" className="flex-shrink-0" />
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em]">Save state</span>
          </div>
          <span className="flex-shrink-0 font-semibold capitalize text-gray-900 dark:text-gray-100">{saveState}</span>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300">
            <Database size={14} aria-hidden="true" className="flex-shrink-0" />
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em]">Payload</span>
          </div>
          <span className="flex-shrink-0 font-semibold text-gray-900 dark:text-gray-100">{stats.payloadKb} KB</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200/80 px-3 py-2 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>Last saved: {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : 'Never'}</span>
          <span className="uppercase tracking-widest font-bold">Admin Only</span>
        </div>
      </div>
    </DockableToolbar>
  )
}

function TabButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
        active 
          ? 'text-blue-600 border-blue-600' 
          : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

function AdminActionButton({
  icon: Icon,
  label,
  detail,
  onClick,
  disabled = false,
  accentClass = '',
}: {
  icon: LucideIcon
  label: string
  detail: string
  onClick: () => void
  disabled?: boolean
  accentClass?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group min-w-0 rounded-md border border-gray-200 bg-white px-3 py-2 text-left shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-45 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-800/70 ${accentClass}`}
    >
      <span className="flex min-w-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
        <Icon size={13} aria-hidden="true" className="flex-shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <span className="mt-1 block truncate text-[11px] opacity-70">{detail}</span>
    </button>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  accentClass,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  detail: string
  accentClass?: string
}) {
  return (
    <div className={`min-w-0 rounded-md border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${accentClass ?? ''}`}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-600 dark:text-gray-300">
          {label}
        </span>
        <Icon size={14} aria-hidden="true" className="flex-shrink-0 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="mt-2 truncate text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {value}
      </div>
      <div className="mt-1 truncate text-[11px] text-gray-500 dark:text-gray-400">{detail}</div>
    </div>
  )
}
