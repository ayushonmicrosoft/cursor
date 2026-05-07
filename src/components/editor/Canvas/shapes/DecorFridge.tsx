import { Group, Rect, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorFridge({ element }: { element: DecorElement }) {
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
      {/* Top/Bottom door split */}
      <Line points={[0, h * 0.4, w, h * 0.4]} stroke={stroke} strokeWidth={detailWidth} opacity={0.4} listening={false} />
      {/* Door handle hints */}
      <Line points={[w * 0.8, h * 0.1, w * 0.8, h * 0.3]} stroke={stroke} strokeWidth={detailWidth * 1.5} opacity={0.3} listening={false} />
      <Line points={[w * 0.8, h * 0.5, w * 0.8, h * 0.8]} stroke={stroke} strokeWidth={detailWidth * 1.5} opacity={0.3} listening={false} />
    </Group>
  )
}
