import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { OfficeThumbnail, type ThumbnailElement } from './OfficeThumbnail'
import { formatRelative } from '../../lib/time'
import type { OfficeListItem } from '../../lib/offices/officeRepository'

interface CardStats {
  floors: number
  desks: number
  assigned: number
}

interface Avatar {
  id: string
  initials: string
  color: string
}

interface Props {
  office: OfficeListItem
  teamSlug: string
  thumbnailElements: ThumbnailElement[]
  stats: CardStats
  avatars: Avatar[]
  onMenu: (office: OfficeListItem) => void
}

/**
 * Dense office card for the team home dashboard. The whole tile is a
 * `Link` to the engine chooser; the kebab menu is a sibling button so its
 * click doesn't navigate. Stats are precomputed by the parent so the
 * card stays a pure presentational component.
 */
export function OfficeCard({ office, teamSlug, thumbnailElements, stats, avatars, onMenu }: Props) {
  const rel = formatRelative(office.updated_at) ?? 'recently'
  const preciseTitle = new Date(office.updated_at).toUTCString()

  // Compact metadata line: floors / desks / updated. Dot separators.
  const metaParts: string[] = []
  if (stats.floors > 0) metaParts.push(`${stats.floors} ${stats.floors === 1 ? 'floor' : 'floors'}`)
  if (stats.desks > 0) metaParts.push(`${stats.desks} ${stats.desks === 1 ? 'desk' : 'desks'}`)
  metaParts.push(`updated ${rel}`)

  return (
    <div className="relative group">
      <Link
        to={`/t/${teamSlug}/o/${office.slug}/engine`}
        className="glass-panel block overflow-hidden rounded-[1.5rem] transition-all duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="surface-gradient h-40 w-full border-b border-white/40 bg-white/50 dark:border-white/10 dark:bg-slate-950/40">
          <OfficeThumbnail elements={thumbnailElements} width="100%" height="100%" />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{office.name}</h3>
            {/* Spacer so the kebab button (positioned absolutely) doesn't collide with the title. */}
            <span className="w-7 shrink-0" aria-hidden="true" />
          </div>
          <div
            className="mt-1 text-xs text-gray-500 dark:text-gray-400"
            title={`Last updated ${preciseTitle}`}
          >
            {metaParts.join(' · ')}
          </div>
          {office.is_private && (
            <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">Private</div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-white/40 pt-3 dark:border-white/10">
            {avatars.length > 0 ? (
              <div className="flex -space-x-2">
                {avatars.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    className="w-6 h-6 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-medium text-white"
                    style={{ backgroundColor: a.color }}
                    aria-hidden="true"
                  >
                    {a.initials}
                  </div>
                ))}
                {stats.assigned > avatars.length && (
                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-medium text-gray-600 dark:text-gray-300">
                    +{stats.assigned - avatars.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stats.assigned > 0
                  ? `${stats.assigned} ${stats.assigned === 1 ? 'person' : 'people'} assigned`
                  : 'No one assigned yet'}
              </div>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Actions for ${office.name}`}
        title="More actions"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onMenu(office)
        }}
        className="absolute right-[10px] top-[10px] rounded-full border border-white/50 bg-white/75 p-1.5 text-slate-400 opacity-0 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-px hover:bg-white/95 hover:text-slate-800 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group-hover:opacity-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-500 dark:hover:bg-slate-900/90 dark:hover:text-slate-200"
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
