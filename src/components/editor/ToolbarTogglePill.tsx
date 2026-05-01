import { LayoutGrid } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'

/**
 * Shared canvas affordance for showing/hiding the floating editor toolbars.
 * Used by both Konva and Pixi surfaces so the engines feel like one editor.
 */
export function ToolbarTogglePill({
  className = 'bottom-12 left-4',
}: {
  className?: string
}) {
  const visibility = useUIStore((s) => s.dockableToolbarVisibility)
  const setVisible = useUIStore((s) => s.setDockableToolbarVisible)
  const ids = [
    'canvas-actions',
    'align-distribute',
    'admin-stats',
    'color-palette',
  ] as const
  const anyVisible = ids.some((id) => visibility[id] !== false)

  const toggleAll = () => {
    const nextVisible = !anyVisible
    for (const id of ids) {
      setVisible(id, nextVisible)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleAll}
      className={`absolute z-20 flex max-w-[calc(100%-2rem)] items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-md backdrop-blur transition-all ${className} ${
        anyVisible
          ? 'border-gray-200 bg-white/90 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-gray-800'
          : 'border-blue-200 bg-blue-50/95 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-900/70'
      }`}
      title={anyVisible ? 'Hide all toolbars' : 'Show all toolbars'}
      aria-label={anyVisible ? 'Hide all toolbars' : 'Show all toolbars'}
      aria-pressed={anyVisible}
    >
      <LayoutGrid size={14} aria-hidden="true" />
      <span className="truncate">{anyVisible ? 'Hide toolbars' : 'Show toolbars'}</span>
    </button>
  )
}
