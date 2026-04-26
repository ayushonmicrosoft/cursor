import {
  Activity,
  AlertTriangle,
  Armchair,
  Building2,
  Cloud,
  Database,
  Layers3,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { useElementsStore } from '../../stores/elementsStore'
import { useEmployeeStore } from '../../stores/employeeStore'
import { useFloorStore } from '../../stores/floorStore'
import { useInsightsStore } from '../../stores/insightsStore'
import { useProjectStore } from '../../stores/projectStore'
import { DockableToolbar } from './DockableToolbar'
import { useCan } from '../../hooks/useCan'
import { computeRosterStats } from '../../lib/rosterStats'

export function AdminStatsToolbar() {
  const canManageTeam = useCan('manageTeam')
  const elements = useElementsStore((s) => s.elements)
  const employeesById = useEmployeeStore((s) => s.employees)
  const floors = useFloorStore((s) => s.floors)
  const insights = useInsightsStore((s) => s.insights)
  const saveState = useProjectStore((s) => s.saveState)
  const employees = useMemo(() => Object.values(employeesById), [employeesById])

  const stats = useMemo(() => {
    const roster = computeRosterStats(employees, elements)
    const critical = insights.filter((i) => !i.dismissed && i.severity === 'critical').length
    const warning = insights.filter((i) => !i.dismissed && i.severity === 'warning').length
    return {
      floors: floors.length,
      people: employees.length,
      objects: Object.keys(elements).length,
      assigned: Math.max(0, employees.length - roster.unassigned),
      occupancyPct: roster.occupancyPct,
      unassigned: roster.unassigned,
      critical,
      warning,
      payloadKb: Math.round(JSON.stringify({ elements, employees, floors }).length / 1024),
    }
  }, [elements, employees, floors, insights])

  if (!canManageTeam) return null

  const healthTone =
    stats.critical > 0 ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-900/70'
    : stats.warning > 0 ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-900/70'
    : 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900/70'

  return (
    <DockableToolbar
      id="admin-stats"
      title="Admin operations"
      dockedClassName="top-4 left-4"
      className="w-[380px]"
    >
      <div className="grid grid-cols-3 gap-2 p-3">
        <StatCard icon={Building2} label="Floors" value={stats.floors} detail="Live office count" />
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
      <div className="grid grid-cols-2 gap-2 border-t border-gray-200/80 px-3 py-2 dark:border-gray-800/80">
        <div className="flex items-center justify-between rounded border border-gray-200/80 bg-gradient-to-r from-white to-[#f4efe8] px-3 py-2 text-xs dark:border-gray-800 dark:from-gray-900 dark:to-[#1b2940]">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Cloud size={14} aria-hidden="true" />
            <span className="font-medium uppercase tracking-[0.18em] text-[10px]">Save state</span>
          </div>
          <span className="font-semibold capitalize text-gray-900 dark:text-gray-100">{saveState}</span>
        </div>
        <div className="flex items-center justify-between rounded border border-gray-200/80 bg-white px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Database size={14} aria-hidden="true" />
            <span className="font-medium uppercase tracking-[0.18em] text-[10px]">Payload</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.payloadKb} KB</span>
        </div>
      </div>
      <div className="border-t border-gray-200/80 px-3 py-2 dark:border-gray-800/80">
        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <Activity size={13} aria-hidden="true" />
          <span>Admin-only HUD. Use for health checks before force-save, restore, or release sign-off.</span>
        </div>
      </div>
    </DockableToolbar>
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
    <div className={`rounded border border-gray-200/80 bg-gradient-to-br from-white to-[#f7f2ec] p-3 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:to-[#12233a] ${accentClass ?? ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <Icon size={14} aria-hidden="true" className="text-[#7f6a52]" />
      </div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{detail}</div>
    </div>
  )
}
