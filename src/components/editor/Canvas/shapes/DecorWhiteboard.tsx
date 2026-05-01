import { Group, Rect } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorWhiteboard({ element }: { element: DecorElement }) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const w = element.width, h = element.height
  const stroke = isSelected ? CANVAS_COLORS.selected : (element.locked ? CANVAS_COLORS.locked : element.style.stroke)
  const strokeWidth = interactionStrokeWidth(isSelected)
  const frameWidth = strokeWidth + 1

  return (
    <Group opacity={element.style.opacity}>
      <Rect
        x={0} y={0} width={w} height={h}
        fill={element.style.fill}
        stroke={stroke}
        strokeWidth={frameWidth}
        cornerRadius={1}
      />
      {/* Gloss/marker ledge hint */}
      <Rect x={0} y={h - 3} width={w} height={3} fill={stroke} opacity={0.1} cornerRadius={1} listening={false} />
    </Group>
  )
}
