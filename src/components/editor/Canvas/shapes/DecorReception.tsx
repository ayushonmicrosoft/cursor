import { Group, Rect, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorReception({ element }: { element: DecorElement }) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const w = element.width, h = element.height
  const stroke = isSelected ? CANVAS_COLORS.selected : (element.locked ? CANVAS_COLORS.locked : element.style.stroke)
  const strokeWidth = interactionStrokeWidth(isSelected)
  const detailWidth = Math.max(0.75, strokeWidth * 0.6)

  return (
    <Group opacity={element.style.opacity}>
      <Rect x={0} y={0} width={w} height={h} cornerRadius={1}
        fill={element.style.fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Front counter ledge */}
      <Rect x={0} y={h * 0.7} width={w} height={h * 0.3} fill={stroke} opacity={0.15} cornerRadius={1} listening={false} />
      {/* Transaction surface line */}
      <Line points={[w * 0.1, h * 0.7, w * 0.9, h * 0.7]} stroke={stroke} strokeWidth={detailWidth} opacity={0.3} listening={false} />
    </Group>
  )
}
