import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Plus,
  Upload,
  Search,
  Sparkles,
  Layers3,
  Users,
  Grid3x3,
  X,
} from 'lucide-react'
import { useSession } from '../../lib/auth/session'
import { supabase } from '../../lib/supabase'
import {
  listOffices,
  createOffice,
  deleteOffice,
  saveOffice,
  type OfficeListItem,
} from '../../lib/offices/officeRepository'
import { buildDemoOfficePayload } from '../../lib/demo/createDemoOffice'
import { ConfirmDialog } from '../editor/ConfirmDialog'
import { OfficeCard } from './OfficeCard'
import { Button, Input, Modal, ModalBody, ModalFooter } from '../ui'
import type { ThumbnailElement } from './OfficeThumbnail'
import type { Team } from '../../types/team'
import { getRecents } from '../../lib/recentOffices'
import { useToastStore } from '../../stores/toastStore'

/**
 * Wave 14A: refresh the post-login dashboard to match the JSON-Crack /
 * Linear chrome the rest of the app moved to. The page was a bare grid
 * of office cards; it now has:
 *
 *  - A full-width gradient background matching LandingPage, with a
 *    max-w-7xl content container so things stop sprawling on wide
 *    monitors.
 *  - A team-identity header (name + optional logo) with role-gated
 *    "+ New office" button, plus a live-updating subtitle showing
 *    "X offices · Y employees · Z floors".
 *  - A stat strip (same idiom as Wave 13C ReportsPage): uppercase
 *    label + large tabular-nums value across six cards.
 *  - A "Recent" row above the office grid, sourced from
 *    `floocraft.recentOffices` in localStorage.
 *  - Search (auto-focuses on `/`), sort dropdown, and a "has
 *    unassigned / empty / all" filter dropdown.
 *  - A friendly first-run empty state when the team has zero
 *    offices, distinct from the "no search matches" state.
 */

/** Narrow `unknown` to a defensive team-with-optional-logo shape. */
interface TeamWithOptionalLogo extends Team {
  logo_url?: string | null
}

// ------------------------------------------------------------------
// Payload walkers — extract thumbnails + per-office stats from the
// Supabase payload. Shape-defensive throughout: a malformed or
// partial payload collapses to the zero values rather than throwing.
// ------------------------------------------------------------------

/**
 * Pull a flat list of thumbnail-ready rects from an office payload. Uses
 * only the FIRST floor's elements — the team-home page shows one
 * thumbnail per office, and iterating every floor would bloat the DOM
 * on teams with dozens of multi-floor offices for minimal visual
 * payoff. Returns `[]` for any malformed / empty payload; the thumbnail
 * component handles the empty case with a placeholder.
 */
function extractThumbnailElements(
  payload: Record<string, unknown> | null | undefined,
): ThumbnailElement[] {
  if (!payload) return []
  const floors = (payload.floors ?? []) as Array<{
    elements?: Record<string, { x?: number; y?: number; width?: number; height?: number; type?: string }>
  }>
  if (!Array.isArray(floors) || floors.length === 0) return []
  const first = floors[0]
  const elementMap = (first.elements ?? {}) as Record<
    string,
    { x?: number; y?: number; width?: number; height?: number; type?: string }
  >
  const out: ThumbnailElement[] = []
  for (const el of Object.values(elementMap)) {
    if (
      typeof el.x !== 'number' ||
      typeof el.y !== 'number' ||
      typeof el.width !== 'number' ||
      typeof el.height !== 'number'
    )
      continue
    out.push({
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      type: typeof el.type === 'string' ? el.type : 'unknown',
    })
  }
  return out
}

/**
 * Per-office derived stats used by the card metadata row, the
 * team-wide stat strip, and the sort/filter logic. Walks every floor
 * (not just the first like the thumbnail does) so counts are accurate
 * for multi-floor offices.
 */
interface OfficeStats {
  floors: number
  desks: number
  assigned: number
  employees: number
  occupancyPct: number
}

function computeOfficeStats(payload: Record<string, unknown> | null | undefined): OfficeStats {
  if (!payload) return { floors: 0, desks: 0, assigned: 0, employees: 0, occupancyPct: 0 }
  const floors = (payload.floors ?? []) as Array<{
    elements?: Record<string, { type?: string }>
  }>
  let desks = 0
  if (Array.isArray(floors)) {
    for (const f of floors) {
      const elMap = (f.elements ?? {}) as Record<string, { type?: string }>
      for (const el of Object.values(elMap)) {
        if (el.type === 'desk' || el.type === 'hot-desk' || el.type === 'workstation') desks += 1
      }
    }
  }
  // `seats` is the source of truth for assignments — the employees
  // dictionary can contain people who haven't been seated yet. Count
  // distinct occupied seat entries.
  const seats = (payload.seats ?? {}) as Record<string, { employeeId?: string | null }>
  let assigned = 0
  for (const s of Object.values(seats)) {
    if (s && typeof s.employeeId === 'string' && s.employeeId.length > 0) assigned += 1
  }
  const employeeMap = (payload.employees ?? {}) as Record<string, unknown>
  const employees = Object.keys(employeeMap).length
  const occupancyPct = desks > 0 ? Math.round((assigned / desks) * 100) : 0
  return {
    floors: Array.isArray(floors) ? floors.length : 0,
    desks,
    assigned,
    employees,
    occupancyPct,
  }
}

// ------------------------------------------------------------------
// Card avatar helpers — unchanged from the pre-14A layout.
// ------------------------------------------------------------------

interface CardAvatar {
  id: string
  initials: string
  color: string
}

const AVATAR_COLORS = ['#2563eb', '#0891b2', '#9333ea', '#db2777', '#ea580c', '#16a34a', '#ca8a04']

function hashToColor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function extractAvatars(payload: Record<string, unknown> | null | undefined): CardAvatar[] {
  if (!payload) return []
  const employeeMap = (payload.employees ?? {}) as Record<string, { id?: string; name?: string }>
  const values = Object.values(employeeMap).filter(
    (e): e is { id: string; name: string } =>
      !!e && typeof e.id === 'string' && typeof e.name === 'string' && e.name.length > 0,
  )
  return values.slice(0, 4).map((e) => ({
    id: e.id,
    initials: initialsFor(e.name),
    color: hashToColor(e.id),
  }))
}

/**
 * Suggest the next default name for a new office.
 */
function nextOfficeName(existing: { name: string }[]): string {
  if (existing.length === 0) return 'Main office'
  let max = 0
  for (const o of existing) {
    const m = /^New office\s+(\d+)$/i.exec(o.name.trim())
    if (m) {
      const n = parseInt(m[1], 10)
      if (Number.isFinite(n) && n > max) max = n
    }
  }
  return `New office ${max + 1}`
}

// ------------------------------------------------------------------
// Sort + filter types. Strings live as discriminated unions so the
// <select> rendering stays a single source of truth and an exhaustive
// switch gives us a compile-time guarantee that every option has a
// comparator.
// ------------------------------------------------------------------

type SortMode = 'name' | 'recent' | 'employees' | 'occupancy'
type FilterMode = 'all' | 'unassigned' | 'empty'
type OfficeNameDialogMode = 'new' | 'import'

interface OfficeNameDialogState {
  mode: OfficeNameDialogMode
  suggested: string
}

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'recent', label: 'Recently opened' },
  { value: 'employees', label: 'Most employees' },
  { value: 'occupancy', label: 'Highest occupancy' },
]

const FILTER_OPTIONS: Array<{ value: FilterMode; label: string }> = [
  { value: 'all', label: 'All offices' },
  { value: 'unassigned', label: 'Has unassigned employees' },
  { value: 'empty', label: 'Empty (no employees)' },
]

// ------------------------------------------------------------------
// Presentational sub-components.
// ------------------------------------------------------------------

/** Stat card — uppercase label + large tabular-nums value. Non-interactive. */
function StatCard({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div
      className="glass-panel rounded-[1.25rem] p-3"
      // Stat cards are read-only summary chrome — keep them out of the
      // tab order entirely so keyboard users don't have to click through
      // six non-actions to reach the search input.
      aria-hidden={false}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-950 dark:text-slate-50">
        {value}
      </div>
    </div>
  )
}

/** Skeleton card used during the initial load. Purely decorative. */
function OfficeCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse"
      aria-hidden="true"
    >
      <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-20" />
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Main page.
// ------------------------------------------------------------------

export function TeamHomePage() {
  const { teamSlug } = useParams<{ teamSlug: string }>()
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<OfficeListItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [officeNameDialog, setOfficeNameDialog] = useState<OfficeNameDialogState | null>(null)
  const [officeNameDraft, setOfficeNameDraft] = useState('')
  const [recentSlugs] = useState<string[]>(() => getRecents())
  const searchRef = useRef<HTMLInputElement>(null)
  const session = useSession()
  const navigate = useNavigate()
  const pushToast = useToastStore((s) => s.push)

  const sessionUserId =
    session.status === 'authenticated' ? session.user.id : null
  const sessionStatus = session.status

  // ── Team ────────────────────────────────────────────────────────────────
  const { data: team, isLoading: loadingTeam } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', teamSlug)
        .single()
      if (error) throw error
      return (data as TeamWithOptionalLogo) ?? null
    },
    enabled: !!teamSlug,
  })

  // ── Offices ─────────────────────────────────────────────────────────────
  const { data: offices = [], isLoading: loadingOffices } = useQuery({
    queryKey: ['offices', team?.id],
    queryFn: () => listOffices((team as Team).id),
    enabled: !!team?.id,
  })

  // ── Membership (role + count) ────────────────────────────────────────────
  const { data: membership } = useQuery({
    queryKey: ['membership', team?.id, sessionUserId],
    queryFn: async () => {
      const [roleRes, countRes] = await Promise.all([
        supabase
          .from('team_members')
          .select('role')
          .eq('team_id', (team as Team).id)
          .eq('user_id', sessionUserId!)
          .maybeSingle(),
        supabase
          .from('team_members')
          .select('user_id', { count: 'exact', head: true })
          .eq('team_id', (team as Team).id),
      ])
      if (roleRes.error) throw roleRes.error
      if (countRes.error) throw countRes.error
      const role = (roleRes.data as { role?: string } | null)?.role
      return {
        canCreate: role === 'owner' || role === 'admin' || role === 'editor' || role === 'edit',
        memberCount: countRes.count ?? 0,
      }
    },
    enabled: !!team?.id && sessionStatus === 'authenticated' && !!sessionUserId,
  })

  const canCreateOffices = membership?.canCreate ?? false
  const memberCount = membership?.memberCount ?? 0

  // Global "/" shortcut focuses the search input. Matches the
  // Linear / GitHub pattern — a single unshifted "/" while nothing
  // else is focused jumps to search. Skip when the user is already
  // typing somewhere or a modifier is held.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== '/') return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      e.preventDefault()
      searchRef.current?.focus()
      searchRef.current?.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Precompute per-office stats once per office-list change.
  const officeStats = useMemo(() => {
    const map = new Map<string, OfficeStats>()
    for (const o of offices)
      map.set(o.id, computeOfficeStats(o.payload))
    return map
  }, [offices])

  const officeAvatars = useMemo(() => {
    const map = new Map<string, CardAvatar[]>()
    for (const o of offices) map.set(o.id, extractAvatars(o.payload))
    return map
  }, [offices])

  // Team-wide totals for the stat strip and the subtitle line.
  const totals = useMemo(() => {
    let floors = 0
    let desks = 0
    let assigned = 0
    let employees = 0
    for (const s of officeStats.values()) {
      floors += s.floors
      desks += s.desks
      assigned += s.assigned
      employees += s.employees
    }
    // Weighted average occupancy — each office contributes in
    // proportion to its desk count so a 2-desk outpost doesn't drag
    // the headline number around. `desks === 0` short-circuits to
    // zero to avoid a divide-by-zero.
    const occupancyPct = desks > 0 ? Math.round((assigned / desks) * 100) : 0
    return { floors, desks, assigned, employees, occupancyPct }
  }, [officeStats])

  function openOfficeNameDialog(mode: OfficeNameDialogMode) {
    const suggested = nextOfficeName(offices)
    setOfficeNameDialog({ mode, suggested })
    setOfficeNameDraft(suggested)
  }

  function closeOfficeNameDialog() {
    if (creating) return
    setOfficeNameDialog(null)
    setOfficeNameDraft('')
  }

  function onNew() {
    if (!team || session.status !== 'authenticated') return
    openOfficeNameDialog('new')
  }

  async function createNamedOffice(mode: OfficeNameDialogMode, suggested: string) {
    if (!team || session.status !== 'authenticated') return
    const name = officeNameDraft.trim() || suggested
    setCreating(true)
    try {
      const created = await createOffice(team.id, name)
      await queryClient.invalidateQueries({ queryKey: ['offices', team.id] })
      setOfficeNameDialog(null)
      setOfficeNameDraft('')
      navigate(
        mode === 'import'
          ? `/t/${team.slug}/o/${created.slug}/roster?import=csv`
          : `/t/${team.slug}/o/${created.slug}/engine`,
      )
    } catch (err) {
      console.warn('Create office failed', err)
      pushToast({
        tone: 'error',
        title: 'Could not create office',
        body: err instanceof Error ? err.message : 'Please retry in a moment.',
      })
    } finally {
      setCreating(false)
    }
  }

  /**
   * "Import" header action — replaces a previous placeholder alert.
   *
   * Creates a fresh empty office (named by the user, defaulting to a
   * suggestion) and navigates to its roster with `?import=csv`. The
   * RosterPage watches that query param and auto-opens the CSV import
   * dialog so the user lands directly on the import flow rather than
   * an empty office. The CSV import dialog itself was upgraded in
   * Wave 16B (drag-drop, header aliases, template, filter pills,
   * inline edit) so the experience picks up where this leaves off.
   *
   * Future work: a second branch could accept an office-payload JSON
   * (backup format) — for now a "blank office + people CSV" is the
   * common case and ships the button as a real working action.
   */
  function onImport() {
    if (!team || session.status !== 'authenticated') return
    openOfficeNameDialog('import')
  }

  async function onNewDemo() {
    if (!team || session.status !== 'authenticated') return
    setCreating(true)
    try {
      const created = await createOffice(team.id, 'Demo office')
      const payload = buildDemoOfficePayload()
      const res = await saveOffice(
        created.id,
        payload as unknown as Record<string, unknown>,
        created.updated_at,
      )
      if (!res.ok) {
        console.warn('Demo office: initial seed save failed', res)
      }
      pushToast({
        tone: 'success',
        title: 'Sample office opened',
        body: 'Loaded a three-floor sample with seats, employees, and departments ready to review.',
      })
      navigate(`/t/${team.slug}/o/${created.slug}/roster`)
      await queryClient.invalidateQueries({ queryKey: ['offices', team.id] })
    } catch (err) {
      console.warn('Create demo office failed', err)
      pushToast({
        tone: 'error',
        title: 'Could not create sample office',
        body: err instanceof Error ? err.message : 'Please retry in a moment.',
      })
    } finally {
      setCreating(false)
    }
  }

  async function performDelete(office: OfficeListItem) {
    setDeleting(true)
    try {
      await deleteOffice(office.id)
      await queryClient.invalidateQueries({ queryKey: ['offices', team?.id] })
      pushToast({
        tone: 'success',
        title: 'Office deleted',
        body: `${office.name} was removed.`,
      })
      setPendingDelete(null)
    } catch (err) {
      console.warn('Delete office failed', err)
      pushToast({
        tone: 'error',
        title: 'Could not delete office',
        body: err instanceof Error ? err.message : 'Please retry in a moment.',
      })
    } finally {
      setDeleting(false)
    }
  }

  // ----- derived view state ---------------------------------------
  // Filter → search → sort, in that order. Each step is a pure
  // transform over the prior list; the intermediate `filtered` is
  // reused to distinguish "team is empty" from "search matched
  // nothing" in the render below.
  const filteredByMode = useMemo(() => {
    if (filterMode === 'all') return offices
    return offices.filter((o) => {
      const s = officeStats.get(o.id)
      if (!s) return false
      if (filterMode === 'empty') return s.employees === 0
      if (filterMode === 'unassigned') return s.employees > 0 && s.employees > s.assigned
      return true
    })
  }, [offices, officeStats, filterMode])

  const searched = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return filteredByMode
    return filteredByMode.filter((o) => o.name.toLowerCase().includes(needle))
  }, [filteredByMode, q])

  const visible = useMemo(() => {
    const list = searched.slice()
    const recentIndex = new Map<string, number>()
    recentSlugs.forEach((slug, i) => recentIndex.set(slug, i))
    switch (sortMode) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'recent':
        // "Recently opened" = MRU (localStorage) first, then by
        // server `updated_at` for everything else so brand-new
        // offices still float near the top even if the user hasn't
        // opened them yet.
        list.sort((a, b) => {
          const ai = recentIndex.has(a.slug) ? recentIndex.get(a.slug)! : Infinity
          const bi = recentIndex.has(b.slug) ? recentIndex.get(b.slug)! : Infinity
          if (ai !== bi) return ai - bi
          return b.updated_at.localeCompare(a.updated_at)
        })
        break
      case 'employees':
        list.sort((a, b) => {
          const ae = officeStats.get(a.id)?.employees ?? 0
          const be = officeStats.get(b.id)?.employees ?? 0
          return be - ae
        })
        break
      case 'occupancy':
        list.sort((a, b) => {
          const ao = officeStats.get(a.id)?.occupancyPct ?? 0
          const bo = officeStats.get(b.id)?.occupancyPct ?? 0
          return bo - ao
        })
        break
    }
    return list
  }, [searched, sortMode, officeStats, recentSlugs])

  // Recent cards = up to 3 most-recent offices that still exist. We
  // walk `recentSlugs` in MRU order (not `offices.find` per slug,
  // which would reverse us on the filter / sort view above).
  const recentOffices = useMemo(() => {
    if (recentSlugs.length === 0) return []
    const bySlug = new Map(offices.map((o) => [o.slug, o]))
    const out: OfficeListItem[] = []
    for (const slug of recentSlugs) {
      const hit = bySlug.get(slug)
      if (hit) out.push(hit)
      if (out.length >= 3) break
    }
    return out
  }, [recentSlugs, offices])

  if (loadingTeam || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="p-6 max-w-7xl mx-auto px-6 text-sm text-gray-500 dark:text-gray-400">
          {loadingTeam ? 'Loading…' : 'Team not found.'}
        </div>
      </div>
    )
  }

  const isTeamEmpty = !loadingOffices && offices.length === 0
  const subtitleText = `${offices.length} ${offices.length === 1 ? 'office' : 'offices'} · ${totals.employees} ${totals.employees === 1 ? 'employee' : 'employees'} · ${totals.floors} ${totals.floors === 1 ? 'floor' : 'floors'}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main id="main-content" className="max-w-7xl mx-auto px-6 py-8">
        {/* Team identity header. Logo + name on the left, CTAs on
            the right. The "+ New office" button is only rendered for
            team admins / members — viewers (invited share recipients
            who happened to get a team_member row) fall through. */}
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
          <div className="flex items-center gap-3 min-w-0">
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
              {/*
                Live subtitle — refreshes as the stat memo recomputes.
                `aria-live="polite"` so a screen reader announces the
                updated count after a create / delete without fighting
                the user's next action.
              */}
              <p
                className="mt-1 text-sm text-gray-500 dark:text-gray-400 tabular-nums"
                aria-live="polite"
              >
                {subtitleText}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 max-w-full">
            {canCreateOffices && (
              <>
                <button
                  type="button"
                  onClick={onImport}
                  disabled={creating}
                  title="Create a new office and open the CSV import dialog"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Upload size={14} aria-hidden="true" />
                  Import
                </button>
                <button
                  onClick={onNew}
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                >
                  <Plus size={14} aria-hidden="true" />
                  New office
                </button>
              </>
            )}
            <Link
              to={`/t/${team.slug}/settings`}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              Settings
            </Link>
            <Link
              to="/help"
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-200"
              title="User guide and FAQ"
            >
              Help
            </Link>
          </div>
        </header>


        {/* Stat strip — matches the Wave 13C ReportsPage idiom.
            Grid collapses to 2 columns on mobile. */}
        {!loadingOffices && !isTeamEmpty && (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 mb-6"
            aria-label="Team summary"
          >
            <StatCard label="Offices" value={offices.length} />
            <StatCard label="Employees" value={totals.employees} />
            <StatCard label="Seats" value={totals.desks} />
            <StatCard label="Occupancy" value={`${totals.occupancyPct}%`} />
            <StatCard label="Members" value={memberCount} />
          </div>
        )}

        {/* Empty / loaded body. Stops here early for the first-run
            case so the welcome card isn't crowded by a search bar
            the user can't meaningfully use yet. */}
        {loadingOffices ? (
          <>
            <span className="sr-only" role="status" aria-live="polite">
              Loading offices…
            </span>
            <ul
              className="grid gap-6 mt-6"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
              aria-hidden="true"
            >
              <li>
                <OfficeCardSkeleton />
              </li>
              <li>
                <OfficeCardSkeleton />
              </li>
              <li>
                <OfficeCardSkeleton />
              </li>
            </ul>
          </>
        ) : isTeamEmpty ? (
          <EmptyTeamState
            canCreate={canCreateOffices}
            creating={creating}
            onNew={onNew}
            onNewDemo={onNewDemo}
            onImport={onImport}
          />
        ) : (
          <>
            {/* Search + sort + filter row. */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
              <div className="relative flex-1 min-w-0">
                <Search
                  size={14}
                  aria-hidden="true"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search offices…"
                  aria-label="Search offices"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="sr-only sm:not-sr-only">Sort</span>
                <select
                  aria-label="Sort offices"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="sr-only sm:not-sr-only">Filter</span>
                <select
                  aria-label="Filter offices"
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as FilterMode)}
                  className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {FILTER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Recent row. Hidden when there are no stored recents
                that resolve to live offices. Shares the same card
                component so the visual treatment is identical. */}
            {recentOffices.length > 0 && q.trim() === '' && filterMode === 'all' && (
              <section className="mb-6" aria-labelledby="recent-heading">
                <h2
                  id="recent-heading"
                  className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                >
                  Recent
                </h2>
                <ul
                  className="grid gap-6"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
                >
                  {recentOffices.map((o) => {
                    const stats = officeStats.get(o.id) ?? {
                      floors: 0,
                      desks: 0,
                      assigned: 0,
                      employees: 0,
                      occupancyPct: 0,
                    }
                    const avatars = officeAvatars.get(o.id) ?? []
                    return (
                      <li key={`recent-${o.id}`}>
                        <OfficeCard
                          office={o}
                          teamSlug={team.slug}
                          thumbnailElements={extractThumbnailElements(o.payload)}
                          stats={stats}
                          avatars={avatars}
                          onMenu={(target) => setPendingDelete(target)}
                        />
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {/* Main grid, or a "no matches" empty state. */}
            {visible.length === 0 ? (
              <NoMatchesState
                q={q}
                filterMode={filterMode}
                onReset={() => {
                  setQ('')
                  setFilterMode('all')
                }}
              />
            ) : (
              <section aria-labelledby="all-offices-heading">
                {recentOffices.length > 0 && q.trim() === '' && filterMode === 'all' && (
                  <h2
                    id="all-offices-heading"
                    className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  >
                    All offices
                  </h2>
                )}
                <ul
                  className="grid gap-6"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
                >
                  {visible.map((o) => {
                    const stats = officeStats.get(o.id) ?? {
                      floors: 0,
                      desks: 0,
                      assigned: 0,
                      employees: 0,
                      occupancyPct: 0,
                    }
                    const avatars = officeAvatars.get(o.id) ?? []
                    return (
                      <li key={o.id}>
                        <OfficeCard
                          office={o}
                          teamSlug={team.slug}
                          thumbnailElements={extractThumbnailElements(o.payload)}
                          stats={stats}
                          avatars={avatars}
                          onMenu={(target) => setPendingDelete(target)}
                        />
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {/*
              Demo-office disclosure, parked under the grid rather than
              in the header. Still one click for users who want the
              fully-seeded sample; stays out of the way for everyone else.
            */}
            {canCreateOffices && (
              <details className="mt-8 text-xs">
                <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 select-none">
                  Or start from a template
                </summary>
                <div className="mt-2 ml-2">
                  <button
                    onClick={onNewDemo}
                    disabled={creating}
                    className="text-blue-600 dark:text-blue-400 hover:underline disabled:text-gray-400 disabled:no-underline"
                    title="Pre-populated with ~18 demo employees to exercise the roster features"
                  >
                    Sample office · ~18 employees
                  </button>
                </div>
              </details>
            )}
          </>
        )}

        {pendingDelete && (
          <ConfirmDialog
            title={`Delete "${pendingDelete.name}"?`}
            body={
              <div className="space-y-2">
                <p>
                  This removes the floor plan, roster, and every saved edit
                  for this office. It cannot be undone.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Team members with a link will lose access immediately.
                </p>
              </div>
            }
            confirmLabel={deleting ? 'Deleting…' : 'Delete office'}
            cancelLabel="Cancel"
            tone="danger"
            onConfirm={() => {
              if (deleting) return
              void performDelete(pendingDelete)
            }}
            onCancel={() => {
              if (deleting) return
              setPendingDelete(null)
            }}
          />
        )}

        {officeNameDialog && (
          <OfficeNameDialog
            mode={officeNameDialog.mode}
            suggested={officeNameDialog.suggested}
            value={officeNameDraft}
            creating={creating}
            onChange={setOfficeNameDraft}
            onCancel={closeOfficeNameDialog}
            onSubmit={() =>
              void createNamedOffice(officeNameDialog.mode, officeNameDialog.suggested)
            }
          />
        )}
      </main>
    </div>
  )
}

// ------------------------------------------------------------------
// Empty state components. Split out so the two cases — "team has no
// offices yet" vs "search matched nothing" — are visually distinct
// and the main render stays skimmable.
// ------------------------------------------------------------------

function EmptyTeamState({
  canCreate,
  creating,
  onNew,
  onNewDemo,
  onImport,
}: {
  canCreate: boolean
  creating: boolean
  onNew: () => void
  onNewDemo: () => void
  onImport: () => void
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8 max-w-3xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="min-w-0">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <Building2 size={28} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Start a workspace
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-prose">
            Create an office, open a sample office with a full floor plan and roster, or import data from a file.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left sm:w-full lg:min-w-[24rem]">
          <PreviewStat icon={<Layers3 size={16} aria-hidden="true" />} label="Floors" value="3" />
          <PreviewStat icon={<Grid3x3 size={16} aria-hidden="true" />} label="Seats" value="48+" />
          <PreviewStat icon={<Users size={16} aria-hidden="true" />} label="Employees" value="45+" />
          <PreviewStat icon={<Sparkles size={16} aria-hidden="true" />} label="Departments" value="7" />
        </div>
      </div>
      {canCreate && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onNew}
            disabled={creating}
            aria-label="Create office"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
          >
            <Plus size={14} aria-hidden="true" />
            Create office
          </button>
          <button
            type="button"
            onClick={onNewDemo}
            disabled={creating}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Open a seeded office with floors, seats, employees, and departments"
          >
            Try sample office
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={creating}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Create a new office and open the CSV import dialog"
          >
            <Upload size={14} aria-hidden="true" />
            Import data
          </button>
        </div>
      )}
    </div>
  )
}

function PreviewStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 px-3 py-2">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  )
}

function OfficeNameDialog({
  mode,
  suggested,
  value,
  creating,
  onChange,
  onCancel,
  onSubmit,
}: {
  mode: OfficeNameDialogMode
  suggested: string
  value: string
  creating: boolean
  onChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
}) {
  const isImport = mode === 'import'

  return (
    <Modal
      open
      onClose={onCancel}
      title={isImport ? 'Create office for import' : 'Create office'}
      preventBackdropClose={creating}
    >
      <form
        id="office-name-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (!creating) onSubmit()
        }}
      >
        <ModalBody className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isImport
              ? 'Name the office first. After it is created, the CSV import dialog will open.'
              : 'Name the office before opening the editor.'}
          </p>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Office name
            <Input
              className="mt-1"
              value={value}
              placeholder={suggested}
              disabled={creating}
              autoFocus
              onChange={(event) => onChange(event.target.value)}
            />
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Leaving this blank uses "{suggested}".
          </p>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={creating}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={creating}>
            {creating ? 'Creating...' : isImport ? 'Create and import' : 'Create office'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

function NoMatchesState({
  q,
  filterMode,
  onReset,
}: {
  q: string
  filterMode: FilterMode
  onReset: () => void
}) {
  return (
    <div
      className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-10 text-center max-w-md mx-auto"
      role="status"
      aria-live="polite"
    >
      <Search size={28} className="mx-auto text-gray-300 dark:text-gray-600" aria-hidden="true" />
      <h2 className="mt-3 text-base font-semibold text-gray-900 dark:text-gray-100">
        No offices match
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {q.trim()
          ? `Nothing matched "${q.trim()}"${filterMode !== 'all' ? ' in this filter' : ''}.`
          : 'This filter has no matching offices.'}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Clear search & filters
      </button>
    </div>
  )
}
