import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useUIStore } from '../../../stores/uiStore'

/**
 * Shared empty-state used across the polished right-sidebar panels.
 *
 * # Why this exists
 *
 * Every panel needs an answer to "what should I see before any data is
 * here?" Pre-Wave-17D, each panel took a different swing: AnnotationsPanel
 * had a one-liner in muted gray, InsightsPanel used an inline flex block
 * with a CheckCircle, PropertiesPanel had a fully composed tinted-icon +
 * title + body + helper copy. The PropertiesPanel treatment reads best —
 * it looks intentional rather than "we forgot to render something".
 *
 * This component standardises on that treatment:
 *
 *   ┌──────────────────────────────┐
 *   │        ◯ (tinted circle)     │
 *   │       Title line              │
 *   │     Soft body of copy         │
 *   │     [ Primary action button ] │
 *   └──────────────────────────────┘
 *
 * The tinted circle is bigger than a bare icon, which gives the first
 * eye-catch before the user reads the title. Icon colour is deliberately
 * muted (`gray-400`) — the empty state isn't an alarm, it's a nudge. If
 * a panel genuinely needs an alarm ("you've hit quota") it shouldn't use
 * this component — it should render a toast or a critical InsightCard.
 *
 * # Sizing
 *
 * Padding is generous vertically (`py-10`) so the block breathes inside a
 * flush sidebar without being so tall that the panel's other sections
 * hide below the fold. For very short sidebars (< 400px tall) the parent
 * can pass `compact` to trim vertical padding in half.
 */
export interface PanelEmptyStateProps {
  /** Lucide icon component rendered inside the tinted circle. */
  icon: LucideIcon
  /** Short, direct title — the answer to "why is this empty?". */
  title: string
  /** Supporting body copy. One sentence usually does it. */
  body?: ReactNode
  /** Optional CTA slot — typically a single `<Button />`. */
  action?: ReactNode
  /** Trim vertical padding to fit very short containers. Default `false`. */
  compact?: boolean
  /** Show a close affordance that collapses the right sidebar. */
  showSidebarMinimize?: boolean
  /** Extra classes on the outer element. */
  className?: string
}

export function PanelEmptyState({
  icon: Icon,
  title,
  body,
  action,
  compact = false,
  showSidebarMinimize = false,
  className,
}: PanelEmptyStateProps) {
  const setRightSidebarOpen = useUIStore((s) => s.setRightSidebarOpen)

  return (
    <div
      data-testid="panel-empty-state"
      className={`relative flex flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50/70 px-4 text-center dark:border-gray-800 dark:bg-gray-900/40 ${
        compact ? 'py-6' : 'py-10'
      } ${className ?? ''}`}
    >
      {showSidebarMinimize && (
        <button
          type="button"
          onClick={() => setRightSidebarOpen(false)}
          aria-label="Minimize sidebar"
          title="Minimize sidebar"
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-white hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
      <div
        aria-hidden
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-gray-200 dark:bg-gray-950 dark:text-gray-500 dark:ring-gray-800"
      >
        <Icon size={20} />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        {title}
      </p>
      {body && (
        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] leading-relaxed">
          {body}
        </div>
      )}
      {action && <div className="mt-4 flex items-center gap-2">{action}</div>}
    </div>
  )
}
