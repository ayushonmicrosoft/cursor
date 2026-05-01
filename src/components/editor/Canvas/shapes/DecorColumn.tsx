import { Group, Rect, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorColumn({ element }: { element: DecorElement }) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const w = element.width, h = element.height
  const stroke = isSelected ? CANVAS_COLORS.selected : (element.locked ? CANVAS_COLORS.locked : element.style.stroke)
  const strokeWidth = interactionStrokeWidth(isSelected)

  return (
    <Group opacity={element.style.opacity}>
      <Rect
        x={0} y={0} width={w} height={h}
        fill={element.style.fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={1}
      />
      {/* Structural X-hatch hint */}
      <Line points={[0, 0, w, h]} stroke={stroke} strokeWidth={strokeWidth * 0.5} opacity={0.15} listening={false} />
      <Line points={[w, 0, 0, h]} stroke={stroke} strokeWidth={strokeWidth * 0.5} opacity={0.15} listening={false} />
    </Group>
  )
}
