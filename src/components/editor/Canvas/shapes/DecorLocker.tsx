import { Group, Rect, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorLocker({ element }: { element: DecorElement }) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const w = element.width, h = element.height
  const stroke = isSelected ? CANVAS_COLORS.selected : (element.locked ? CANVAS_COLORS.locked : element.style.stroke)
  const strokeWidth = interactionStrokeWidth(isSelected)
  const detailWidth = Math.max(0.75, strokeWidth * 0.6)

  const lockerCount = Math.max(2, Math.floor(w / 30))
  const lines = []
  for (let i = 1; i < lockerCount; i++) {
    const x = (w / lockerCount) * i
    lines.push(
      <Group key={i} x={x} y={0}>
        <Line points={[0, 0, 0, h]} stroke={stroke} strokeWidth={detailWidth} opacity={0.4} />
        {/* Vent hint */}
        <Line points={[-4, h * 0.2, 4, h * 0.2]} stroke={stroke} strokeWidth={detailWidth * 0.5} opacity={0.3} />
        <Line points={[-4, h * 0.25, 4, h * 0.25]} stroke={stroke} strokeWidth={detailWidth * 0.5} opacity={0.3} />
      </Group>
    )
  }

  return (
    <Group opacity={element.style.opacity}>
      <Rect x={0} y={0} width={w} height={h} cornerRadius={1}
        fill={element.style.fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {lines}
    </Group>
  )
}
