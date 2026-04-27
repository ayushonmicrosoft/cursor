import { useEffect, useState } from 'react'
import { Download, Lock, Search } from 'lucide-react'
import { useCan } from '../../hooks/useCan'
import { useProjectStore } from '../../stores/projectStore'
import { listEvents, type AuditEventRow } from '../../lib/auditRepository'

/**
 * Read-only view of `audit_events` for the current office's team. Gated
 * by `useCan('viewAuditLog')` and intentionally capped by `listEvents`.
 */
export function AuditLogPage() {
  const canView = useCan('viewAuditLog')
  const teamId = useProjectStore((s) => s.currentTeamId)
  const [events, setEvents] = useState<AuditEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actorFilter, setActorFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  useEffect(() => {
    if (!canView || !teamId) return
    let cancelled = false
    setLoading(true)
    listEvents(teamId, {
      actorId: actorFilter || undefined,
      action: actionFilter || undefined,
    })
      .then((rows) => {
        if (!cancelled) setEvents(rows)
      })
      .catch((err) => {
        console.error('[audit] listEvents failed', err)
        if (!cancelled) setEvents([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [canView, teamId, actorFilter, actionFilter])

  if (!canView) return <AuditShell><DeniedState /></AuditShell>
  if (!teamId) {
    return (
      <AuditShell>
        <EmptyState title="No team loaded" body="Open an office before reviewing its audit trail." />
      </AuditShell>
    )
  }

  const hasFilters = actorFilter.length > 0 || actionFilter.length > 0

  return (
    <AuditShell>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Admin
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Audit log
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Review recent team-level changes, who made them, and the target records affected.
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadAuditCsv(events)}
          disabled={events.length === 0}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/50"
        >
          <Download size={14} aria-hidden="true" />
          Download CSV
        </button>
      </header>

      <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
          <label className="block">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Actor ID</span>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-gray-800 dark:bg-gray-950">
              <Search size={14} className="text-gray-400" aria-hidden="true" />
              <input
                placeholder="Filter by actor id"
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Action</span>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-gray-800 dark:bg-gray-950">
              <Search size={14} className="text-gray-400" aria-hidden="true" />
              <input
                placeholder="Filter by action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
              />
            </div>
          </label>
          <button
            type="button"
            onClick={() => {
              setActorFilter('')
              setActionFilter('')
            }}
            disabled={!hasFilters}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/50"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
        >
          Loading audit events...
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching events' : 'No audit events yet'}
          body={hasFilters ? 'Adjust or clear filters to widen the audit trail.' : 'Tracked administrative changes will appear here as the team works.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {events.map((e) => (
                <tr key={e.id ?? `${e.actor_id}-${e.created_at ?? ''}`}>
                  <td className="px-3 py-2 font-mono text-xs tabular-nums text-gray-600 dark:text-gray-300">
                    {e.created_at ?? ''}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-200">{e.actor_id}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{e.action}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                    {e.target_type}/{e.target_id ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AuditShell>
  )
}

function AuditShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-10">{children}</div>
    </div>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900"
    >
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">{body}</p>
    </div>
  )
}

function DeniedState() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <Lock size={22} aria-hidden="true" />
      </div>
      <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">Not authorized</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Ask a team admin for audit log access before viewing administrative history.
      </p>
    </div>
  )
}

function downloadAuditCsv(events: AuditEventRow[]) {
  const rows = [
    ['created_at', 'actor_id', 'action', 'target_type', 'target_id'],
    ...events.map((e) => [
      e.created_at ?? '',
      e.actor_id,
      e.action,
      e.target_type,
      e.target_id ?? '',
    ]),
  ]
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'audit-log.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}
