import { Group, Rect, Line, Circle } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorCredenza({ element }: { element: DecorElement }) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const w = element.width, h = element.height
  const stroke = isSelected ? CANVAS_COLORS.selected : (element.locked ? CANVAS_COLORS.locked : element.style.stroke)
  const strokeWidth = interactionStrokeWidth(isSelected)
  const detailWidth = Math.max(0.75, strokeWidth * 0.6)

  return (
    <Group opacity={element.style.opacity}>
      <Rect x={0} y={0} width={w} height={h} cornerRadius={1}
        fill={element.style.fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Drawer split line */}
      <Line points={[w / 2, 0, w / 2, h]} stroke={stroke} strokeWidth={detailWidth} opacity={0.4} listening={false} />
      {/* Handles */}
      <Circle x={w * 0.25} y={h * 0.5} radius={1.5} fill={stroke} opacity={0.3} listening={false} />
      <Circle x={w * 0.75} y={h * 0.5} radius={1.5} fill={stroke} opacity={0.3} listening={false} />
    </Group>
  )
}
