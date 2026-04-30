import { Paintbrush } from 'lucide-react'
import { DockableToolbar } from '../DockableToolbar'
import { useElementsStore } from '../../../stores/elementsStore'
import { useUIStore } from '../../../stores/uiStore'
import { isStrokeOnlyBlock } from '../../../blocks/rendering'

const PALETTE = [
  '#111827',
  '#6B7280',
  '#FFFFFF',
  '#F59E0B',
  '#D97706',
  '#2563EB',
  '#10B981',
  '#7C3AED',
  '#EF4444',
  '#06B6D4',
] as const

export function ColorPaletteToolbar() {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const elements = useElementsStore((s) => s.elements)
  const setElements = useElementsStore((s) => s.setElements)
  const hasSelection = selectedIds.some((id) => Boolean(elements[id]))

  const applyColor = (color: string) => {
    let changed = false
    const nextElements = { ...elements }
    for (const id of selectedIds) {
      const el = elements[id]
      if (!el || el.locked) continue
      const style = {
        ...el.style,
        ...(isStrokeOnlyBlock(el.type) ? { stroke: color } : { fill: color }),
      }
      nextElements[id] = { ...el, style }
      changed = true
    }
    if (changed) {
      setElements(nextElements)
    }
  }

  return (
    <DockableToolbar
      id="color-palette"
      title="Color palette"
      dockedClassName="bottom-12 left-[92px]"
      className="w-[58px]"
    >
      <div
        role="toolbar"
        aria-label="Common colors"
        className="flex flex-col items-center gap-1 p-1.5"
      >
        <div
          className="mb-1 flex h-7 w-7 items-center justify-center rounded-md bg-gray-50 text-gray-500 dark:bg-gray-950 dark:text-gray-400"
          title={hasSelection ? 'Apply color to selection' : 'Select an element to apply color'}
        >
          <Paintbrush size={15} aria-hidden="true" />
        </div>
        {PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Apply ${color}`}
            title={hasSelection ? `Apply ${color}` : 'Select an element first'}
            disabled={!hasSelection}
            onClick={() => applyColor(color)}
            className="h-7 w-7 rounded-md border border-gray-300 shadow-sm transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </DockableToolbar>
  )
}
