import { useEffect, useState } from 'react'
import { NavLink, Outlet, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Building2, Settings2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSession } from '../../lib/auth/session'
import type { Team } from '../../types/team'

/**
 * Wave 17C: settings shell lifted to match the TeamHomePage chrome
 * (Wave 14A) — gradient background, max-w-5xl content column, team
 * identity header, and a styled tab nav that reads as a cohesive
 * settings surface rather than a plain sub-page. The leaf tabs
 * (General, Members) render into `<Outlet>` and keep their existing
 * props API via the bridge wrappers in App.tsx.
 */

interface TeamWithOptionalLogo extends Team {
  logo_url?: string | null
}

export function TeamSettingsPage() {
  const { teamSlug } = useParams<{ teamSlug: string }>()
  const [team, setTeam] = useState<TeamWithOptionalLogo | null>(null)
  const session = useSession()

  // Depend on a stable identity pair (user id + status), not the whole
  // session object. Zustand hands us a fresh selector result on every
  // render; using the object directly would re-trigger the load effect
  // on every keystroke elsewhere in the app.
  const sessionUserId =
    session.status === 'authenticated' ? session.user.id : null
  const sessionStatus = session.status

  useEffect(() => {
    async function load() {
      const { data: t } = await supabase.from('teams').select('*').eq('slug', teamSlug).single()
      if (!t) return
      setTeam(t as TeamWithOptionalLogo)
    }
    load()
  }, [teamSlug, sessionStatus, sessionUserId])

  if (!team) {
    return (
      <div className="surface-gradient min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-500 dark:text-slate-400">
          Loading team…
        </div>
      </div>
    )
  }

  // Active pill: white panel + shadow on light, elevated gray on dark —
  // matches the topbar MAP/ROSTER pills and the Wave 13C ReportsPage
  // tab idiom. Inactive pills are flat with a hover state.
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    [
      'group rounded-lg border px-3 py-2 text-left transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
      isActive
        ? 'border-blue-200 bg-white text-gray-900 shadow-sm dark:border-blue-900/60 dark:bg-gray-800 dark:text-gray-100'
        : 'border-transparent text-gray-600 hover:border-gray-200 hover:bg-white/60 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-800/60 dark:hover:text-gray-200',
    ].join(' ')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main id="main-content" className="max-w-5xl mx-auto px-6 py-10">
        {/* Breadcrumb back-link — small, understated, positioned above
            the identity header so it reads as "how do I leave this
            page" rather than a primary action. */}
        <div className="mb-4">
          <Link
            to={`/t/${team.slug}`}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            <ArrowLeft size={12} aria-hidden="true" />
            Back to team
          </Link>
        </div>

        {/* Team identity header — mirror TeamHomePage so the user
            doesn't feel teleported into a different app when they
            click Settings. Logo-or-placeholder chip + name + subtitle. */}
        <header className="flex items-center gap-3 mb-6 min-w-0 max-w-full">
          {team.logo_url ? (
            <img
              src={team.logo_url}
              alt=""
              aria-hidden="true"
              className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-800 shrink-0"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0"
            >
              <Building2 size={20} />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 truncate">
              {team.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Team settings and workspace controls
            </p>
          </div>
        </header>

        {/* Tab nav. Contained in a subtle pill-bar surface so the tabs
            feel grouped and the active pill reads naturally as
            elevated rather than floating in whitespace. */}
        <nav
          aria-label="Team settings navigation"
          className="mb-6 grid gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 sm:grid-cols-1 dark:border-gray-800 dark:bg-gray-900/60"
        >
          <NavLink end to="." className={tabClass}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Settings2 size={14} aria-hidden="true" />
              <span>General</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Team identity and high-impact controls
            </p>
          </NavLink>
        </nav>

        <Outlet context={{ team, isAdmin: true }} />
      </main>
    </div>
  )
}
