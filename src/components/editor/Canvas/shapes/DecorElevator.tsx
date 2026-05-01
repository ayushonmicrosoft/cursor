import { Group, Rect, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorElevator({ element }: { element: DecorElement }) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const w = element.width, h = element.height
  const stroke = isSelected ? CANVAS_COLORS.selected : (element.locked ? CANVAS_COLORS.locked : element.style.stroke)
  const strokeWidth = interactionStrokeWidth(isSelected)
  const detailWidth = Math.max(1, strokeWidth * 0.8)

  return (
    <Group opacity={element.style.opacity}>
      <Rect x={0} y={0} width={w} height={h}
        fill={element.style.fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Elevator shaft 'X' marker */}
      <Line points={[w * 0.15, h * 0.15, w * 0.85, h * 0.85]} stroke={stroke} strokeWidth={detailWidth} opacity={0.4} listening={false} />
      <Line points={[w * 0.85, h * 0.15, w * 0.15, h * 0.85]} stroke={stroke} strokeWidth={detailWidth} opacity={0.4} listening={false} />
    </Group>
  )
}
