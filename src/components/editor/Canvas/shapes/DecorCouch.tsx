import { Group, Rect } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'
import { useUIStore } from '../../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from '../visualStyle'

export function DecorCouch({ element }: { element: DecorElement }) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  
  const w = element.width, h = element.height
  const stroke = isSelected ? CANVAS_COLORS.selected : (element.locked ? CANVAS_COLORS.locked : element.style.stroke)
  const strokeWidth = interactionStrokeWidth(isSelected)
  const detailStroke = stroke
  const detailOpacity = element.style.opacity * 0.35
  const detailWidth = Math.max(1, strokeWidth * 0.7)

  return (
    <Group opacity={element.style.opacity}>
      {/* Base / Body */}
      <Rect 
        x={0} y={0} width={w} height={h} cornerRadius={1}
        fill={element.style.fill} 
        stroke={stroke} 
        strokeWidth={strokeWidth} 
      />
      {/* Seat Cushion */}
      <Rect 
        x={w * 0.1} y={h * 0.25} width={w * 0.8} height={h * 0.6} cornerRadius={1}
        fill={element.style.fill} 
        stroke={detailStroke} 
        strokeWidth={detailWidth} 
        opacity={0.8}
      />
      {/* Backrest hint */}
      <Rect 
        x={w * 0.1} y={h * 0.08} width={w * 0.8} height={h * 0.17} cornerRadius={1}
        fill={detailStroke} 
        opacity={detailOpacity}
        listening={false}
      />
      {/* Armrests */}
      <Rect x={0} y={h * 0.15} width={w * 0.1} height={h * 0.7} fill={detailStroke} opacity={detailOpacity} cornerRadius={1} listening={false} />
      <Rect x={w * 0.9} y={h * 0.15} width={w * 0.1} height={h * 0.7} fill={detailStroke} opacity={detailOpacity} cornerRadius={1} listening={false} />
    </Group>
  )
}
