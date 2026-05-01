import { Group, Rect, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorStairs({ element }: { element: DecorElement }) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const w = element.width, h = element.height
  const stroke = isSelected ? CANVAS_COLORS.selected : (element.locked ? CANVAS_COLORS.locked : element.style.stroke)
  const strokeWidth = interactionStrokeWidth(isSelected)
  const detailWidth = Math.max(0.75, strokeWidth * 0.6)

  const steps = Math.max(3, Math.floor(h / 12))
  const stepH = h / steps
  const lines = []
  for (let i = 1; i < steps; i++) {
    lines.push(<Line key={i} points={[0, i * stepH, w, i * stepH]} stroke={stroke} strokeWidth={detailWidth} opacity={0.4} listening={false} />)
  }

  return (
    <Group opacity={element.style.opacity}>
      <Rect x={0} y={0} width={w} height={h}
        fill={element.style.fill} stroke={stroke} strokeWidth={strokeWidth} />
      {lines}
      {/* Arrow indicating direction */}
      <Line points={[w * 0.5, h * 0.8, w * 0.5, h * 0.2]} stroke={stroke} strokeWidth={detailWidth} opacity={0.3} listening={false} />
      <Line points={[w * 0.4, h * 0.3, w * 0.5, h * 0.2, w * 0.6, h * 0.3]} stroke={stroke} strokeWidth={detailWidth} opacity={0.3} listening={false} />
    </Group>
  )
}
