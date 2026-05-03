import { useMemo, useState, type ComponentType } from 'react'
import {
  AlertTriangle,
  Code2,
  Database,
  Lock,
  PencilLine,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useSession } from '../../lib/auth/session'
import { useCan } from '../../hooks/useCan'
import { AdminWorkspaceDesigner } from '../team/AdminWorkspaceDesigner'
import { AuditLogPage } from './AuditLogPage'
import { Button } from '../ui'
import { useProjectStore } from '../../stores/projectStore'
import { useUIStore } from '../../stores/uiStore'
import { can, type Action, type Role } from '../../lib/permissions'

const SUPER_ADMIN_EMAIL = 'ayush@oando.co.in'

const PERMISSION_ACTIONS: Action[] = [
  'editRoster',
  'editMap',
  'manageTeam',
  'generateShareLink',
  'viewReports',
  'viewSeatHistory',
  'manageWorkspace',
  'viewMap',
  'viewPII',
  'viewAuditLog',
]

const ROLES: Role[] = ['owner', 'admin', 'editor', 'hr-editor', 'space-planner', 'viewer']

export function AdminPage() {
  const session = useSession()
  const email = session.status === 'authenticated' ? session.user.email.toLowerCase() : ''
  const isSuperAdmin = email === SUPER_ADMIN_EMAIL
  const canManageWorkspace = useCan('manageWorkspace')
  const [draft, setDraft] = useState('')
  const [draftError, setDraftError] = useState<string | null>(null)
  const teamId = useProjectStore((s) => s.currentTeamId)
  const officeId = useProjectStore((s) => s.officeId)
  const preset = useUIStore((s) => s.activeWorkspacePreset)

  const matrix = useMemo(
    () =>
      ROLES.map((role) => ({
        role,
        permissions: PERMISSION_ACTIONS.map((action) => ({ action, allowed: can(role, action) })),
      })),
    [],
  )

  if (session.status === 'loading') {
    return <AdminShell><LoadingState /></AdminShell>
  }

  if (!isSuperAdmin) {
    return <Navigate to="/account" replace />
  }

  return (
    <AdminShell>
      <header className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ShieldCheck size={12} aria-hidden="true" />
            Super admin
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
            Admin control center
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            This page is reserved for {SUPER_ADMIN_EMAIL}. Use it to reshape the app, tune permissions,
            inspect audit history, and keep the website flexible enough to be changed through code.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
              Current preset: <b>{preset ?? 'custom'}</b>
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
              Team: <b>{teamId ?? 'none'}</b>
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
              Office: <b>{officeId ?? 'none'}</b>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            Signed in as <span className="font-semibold">{email}</span>
          </div>
          <Link
            to="/account"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <PencilLine size={14} aria-hidden="true" />
            Account
          </Link>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
          <SectionHeading
            icon={Code2}
            title="Code cockpit"
            body="Ship configuration changes through code-like JSON, then wire them into the app state."
          />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ActionCard
              icon={WandSparkles}
              title="Workspace presets"
              body="Switch editor layouts, toolbar visibility, and top-bar controls."
            />
            <ActionCard
              icon={Database}
              title="Supabase-backed data"
              body="Pull permissions, logs, and app state from the database where appropriate."
            />
            <ActionCard
              icon={Sparkles}
              title="Website-wide polish"
              body="Use the same admin surface to direct UI, routes, and content changes."
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Admin code payload
            </label>
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                if (draftError) setDraftError(null)
              }}
              placeholder='Paste JSON here, e.g. { "theme": "dark", "layout": "admin" }'
              className="mt-2 min-h-40 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
            {draftError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{draftError}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(draft) as Record<string, unknown>
                    setDraft(JSON.stringify(parsed, null, 2))
                    setDraftError(null)
                  } catch {
                    setDraftError('This editor expects valid JSON.')
                  }
                }}
              >
                Validate JSON
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDraft(JSON.stringify({ preset: preset ?? 'custom', canManageWorkspace }, null, 2))}
              >
                Insert state snapshot
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
            <SectionHeading
              icon={Lock}
              title="Access lock"
              body="Only the approved email can open this page. Everyone else is redirected away."
            />
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              Super-admin access is hard-gated to {SUPER_ADMIN_EMAIL}. For extra safety, the rest of the
              application still uses Supabase-authenticated permissions and RLS rules.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
            <SectionHeading
              icon={AlertTriangle}
              title="Operational surface"
              body="This page is intentionally powerful. Keep destructive changes behind code review."
            />
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>• Change editor layout and visibility with the workspace designer.</li>
              <li>• Review audit history for admin actions.</li>
              <li>• Extend the app by wiring new routes and controls here first.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
        <SectionHeading
          icon={ShieldCheck}
          title="Permission matrix"
          body="Full visibility into what each role can do. Use this when changing role logic or Supabase claims."
        />
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Role</th>
                {PERMISSION_ACTIONS.map((action) => (
                  <th key={action} className="px-4 py-3">{action}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
              {matrix.map((row) => (
                <tr key={row.role}>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{row.role}</td>
                  {row.permissions.map((permission) => (
                    <td key={permission.action} className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {permission.allowed ? 'Yes' : 'No'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
          <SectionHeading
            icon={Sparkles}
            title="Workspace designer"
            body="Make the site feel editable by code, not by guesswork."
          />
          <div className="mt-4">
            <AdminWorkspaceDesigner />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
          <SectionHeading
            icon={Database}
            title="Audit trail"
            body="Keep an eye on the administrative history of the app."
          />
          <div className="mt-4">
            <AuditLogPage />
          </div>
        </div>
      </section>
    </AdminShell>
  )
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_38%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ size?: number }>
  title: string
  body: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
      </div>
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ size?: number }>
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <Icon size={18} aria-hidden="true" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      Loading admin access…
    </div>
  )
}
