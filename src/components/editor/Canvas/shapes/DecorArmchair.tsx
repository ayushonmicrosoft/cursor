import { Group, Rect } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorArmchair({ element }: { element: DecorElement }) {
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
      <Rect x={w * 0.15} y={h * 0.25} width={w * 0.7} height={h * 0.55} cornerRadius={1}
        fill={element.style.fill} stroke={stroke} strokeWidth={detailWidth} opacity={0.6} />
      {/* Armrests */}
      <Rect x={0} y={h * 0.2} width={w * 0.15} height={h * 0.6} fill={stroke} opacity={0.2} cornerRadius={1} listening={false} />
      <Rect x={w * 0.85} y={h * 0.2} width={w * 0.15} height={h * 0.6} fill={stroke} opacity={0.2} cornerRadius={1} listening={false} />
    </Group>
  )
}
