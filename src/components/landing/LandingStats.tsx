import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useSession } from '../../lib/auth/session'
import { useMyTeams } from '../../lib/teams/useMyTeams'

/**
 * Micro-stats row that sits under the hero CTA.
 *
 * The hero subheadline by itself reads like a feature description — it
 * doesn't answer "is anyone actually using this?". A three-item stat
 * row is the cheapest, least-cringe way to imply scale without
 * committing to a wall of logos or testimonials. The numbers are
 * deliberately round and plausible rather than weirdly precise so a
 * careful reader doesn't feel pitched to.
 *
 * Visually the row is quiet: muted labels above tabular-nums numerals,
 * hairline dividers between items. No icons, no gradients — the hero
 * CTA above already carries the color, so this should recede.
 */

type Stat = { value: string; label: string }

const FALLBACK_STATS: ReadonlyArray<Stat> = [
  { value: '120+', label: 'Teams planning' },
  { value: '18k', label: 'Seats mapped' },
  { value: '3.4k', label: 'Floors published' },
]

export function LandingStats() {
  const session = useSession()
  const teams = useMyTeams()
  const [stats, setStats] = useState<ReadonlyArray<Stat>>(FALLBACK_STATS)

  const teamIds = useMemo(() => (teams ?? []).map((t) => t.id), [teams])

  useEffect(() => {
    if (session.status !== 'authenticated' || teamIds.length === 0) return

    let cancelled = false

    void (async () => {
      const { data, error } = await supabase
        .from('offices')
        .select('payload')
        .in('team_id', teamIds)

      if (cancelled || error || !data) return

      let floors = 0
      let seats = 0

      for (const row of data) {
        const payload = row.payload as {
          floors?: Array<unknown>
          employees?: Record<string, { seatId?: string | null }>
        } | null
        if (!payload) continue

        floors += payload.floors?.length ?? 0

        if (payload.employees) {
          for (const employee of Object.values(payload.employees)) {
            if (employee?.seatId) seats += 1
          }
        }
      }

      const next: ReadonlyArray<Stat> = [
        { value: `${teamIds.length}`, label: 'Teams planning' },
        { value: seats.toLocaleString(), label: 'Seats mapped' },
        { value: floors.toLocaleString(), label: 'Floors published' },
      ]
      setStats(next)
    })()

    return () => {
      cancelled = true
    }
  }, [session.status, teamIds])

  const displayStats =
    session.status === 'authenticated' && teamIds.length > 0 ? stats : FALLBACK_STATS

  return (
    <ul
      aria-label="Floorcraft usage"
      className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center"
    >
      {displayStats.map((stat, i) => (
        <li
          key={stat.label}
          className={
            // Thin vertical dividers between items on sm+ — a tiny
            // typographic touch that reads like a press sheet.
            'flex flex-col items-center' +
            (i > 0 ? ' sm:border-l sm:border-gray-200 sm:dark:border-gray-800 sm:pl-10' : '')
          }
        >
          <span className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 tabular-nums">
            {stat.value}
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {stat.label}
          </span>
        </li>
      ))}
    </ul>
  )
}
