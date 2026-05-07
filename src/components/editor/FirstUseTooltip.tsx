import type { ReactNode } from 'react'

/**
 * Rich, first-hover tooltip that hangs off the right edge of a ToolSelector
 * button. Kept presentational: the wrapping button owns the hover state +
 * `useFirstUseTooltip` gating and simply renders this card when both
 * conditions hold (mouse over + tool never-used). Consumers pair it with
 * `aria-describedby` on the button to keep screen-reader output in sync
 * with the visual tooltip.
 */
export interface FirstUseTooltipProps {
  /** Stable id so the triggering button can `aria-describedby` it. */
  id: string
  /** Tool display name, rendered as the tooltip heading. */
  name: string
  /** One-line description of what the tool does. */
  description: string
  /** Optional keyboard shortcut hint (e.g. "W", "⇧R"). */
  shortcut?: string
  /** Optional icon to anchor the tooltip visually. */
  icon?: ReactNode
}

export function FirstUseTooltip({
  id,
  name,
  description,
  shortcut,
  icon,
}: FirstUseTooltipProps) {
  return (
    <div
      id={id}
      role="tooltip"
      className="pointer-events-none absolute top-0 left-full z-50 ml-2 w-60"
    >
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-3 text-xs leading-snug text-white shadow-xl">
        <div className="mb-1 flex items-center gap-2">
          {icon && (
            <span className="text-blue-300" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="text-sm font-semibold">{name}</span>
          {shortcut && (
            <kbd
              className="ml-auto rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px] dark:bg-gray-900/15"
              aria-hidden="true"
            >
              {shortcut}
            </kbd>
          )}
        </div>
        <div className="text-gray-200">{description}</div>
      </div>
    </div>
  )
}
