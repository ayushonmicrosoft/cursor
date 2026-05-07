import { Group, Rect, Circle, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorKitchenCounter({ element }: { element: DecorElement }) {
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
      {/* Sink area */}
      <Rect x={w * 0.1} y={h * 0.2} width={w * 0.3} height={h * 0.6} cornerRadius={1}
        fill="#FFFFFF" stroke={stroke} strokeWidth={detailWidth} opacity={0.6} listening={false} />
      {/* Faucet/drain hint */}
      <Circle x={w * 0.25} y={h * 0.5} radius={Math.min(w, h) * 0.05} fill="transparent" stroke={stroke} strokeWidth={detailWidth} opacity={0.5} listening={false} />
      {/* Countertop sections */}
      <Line points={[w * 0.5, h * 0.1, w * 0.5, h * 0.9]} stroke={stroke} strokeWidth={detailWidth} opacity={0.4} listening={false} />
      {/* Drawer/appliance lines */}
      <Line points={[w * 0.6, h * 0.3, w * 0.9, h * 0.3]} stroke={stroke} strokeWidth={detailWidth} opacity={0.3} listening={false} />
      <Line points={[w * 0.6, h * 0.5, w * 0.9, h * 0.5]} stroke={stroke} strokeWidth={detailWidth} opacity={0.3} listening={false} />
      <Line points={[w * 0.6, h * 0.7, w * 0.9, h * 0.7]} stroke={stroke} strokeWidth={detailWidth} opacity={0.3} listening={false} />
    </Group>
  )
}
