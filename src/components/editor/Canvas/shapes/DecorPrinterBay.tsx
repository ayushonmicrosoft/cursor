import { Group, Rect } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorPrinterBay({ element }: { element: DecorElement }) {
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
      {/* Internal printer body */}
      <Rect x={w * 0.15} y={h * 0.25} width={w * 0.7} height={h * 0.5} cornerRadius={1}
        fill="#FFFFFF"
        stroke={stroke}
        strokeWidth={detailWidth}
        opacity={0.6}
        listening={false}
      />
      {/* Control panel hint */}
      <Rect x={w * 0.2} y={h * 0.35} width={w * 0.15} height={h * 0.1} cornerRadius={1}
        fill={stroke}
        opacity={0.25}
        listening={false}
      />
      {/* Paper exit tray hint */}
      <Rect x={w * 0.4} y={h * 0.5} width={w * 0.4} height={h * 0.15} cornerRadius={1}
        fill={stroke}
        opacity={0.15}
        listening={false}
      />
    </Group>
  )
}
