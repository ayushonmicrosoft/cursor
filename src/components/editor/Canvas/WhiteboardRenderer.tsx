import { Group, Line, Rect } from 'react-konva'
import type { WhiteboardElement } from '../../../types/elements'
import { useUIStore } from '../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from './visualStyle'

interface Props {
  element: WhiteboardElement
}

/**
 * Whiteboard renderer — a light writing surface wrapped in a dark frame
 * (thicker stroke) to signal the wall-mounted flavour. The fill is forced
 * to the body colour rather than `element.style.fill` so the surface
 * always reads "whiteboard" even if the user tweaks the style.
 */
export function WhiteboardRenderer({ element }: Props) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)

  return (
    <Group rotation={element.rotation} listening={!element.locked}>
      <Rect
        x={-element.width / 2}
        y={-element.height / 2}
        width={element.width}
        height={element.height}
        fill={element.style.fill}
        stroke={isSelected ? CANVAS_COLORS.selected : element.locked ? CANVAS_COLORS.locked : element.style.stroke}
        // Dark frame — +2 over the configured stroke so it always reads
        // as "framed" against the light fill.
        strokeWidth={interactionStrokeWidth(isSelected) + 2}
        opacity={element.style.opacity}
        shadowColor="#0F172A"
        shadowBlur={2}
        shadowOpacity={0.08}
        shadowOffset={{ x: 0, y: 1 }}
      />
      <Line
        points={[-element.width * 0.42, element.height * 0.15, element.width * 0.42, element.height * 0.15]}
        stroke={element.style.stroke}
        strokeWidth={1}
        opacity={element.style.opacity * 0.45}
        listening={false}
      />
      <Line
        points={[-element.width * 0.32, 0, -element.width * 0.08, 0]}
        stroke={element.style.stroke}
        strokeWidth={1}
        opacity={element.style.opacity * 0.3}
        listening={false}
      />
    </Group>
  )
}
