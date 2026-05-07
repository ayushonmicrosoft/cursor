import { Group, Rect, Text } from 'react-konva'
import { useNeighborhoodStore } from '../../../stores/neighborhoodStore'
import { useFloorStore } from '../../../stores/floorStore'
import { useCanvasStore } from '../../../stores/canvasStore'

/**
 * Renders translucent, labeled rectangles for every neighborhood on the
 * active floor. The group sits BELOW `ElementRenderer` so seats, walls,
 * and furniture render on top of the tint.
 *
 * `listening={false}` — neighborhood picking happens through the
 * `NeighborhoodEditOverlay` so this group stays cheap on pointer events.
 */
export function NeighborhoodLayer() {
  const neighborhoods = useNeighborhoodStore((s) => s.neighborhoods)
  const activeFloorId = useFloorStore((s) => s.activeFloorId)
  const stageScale = useCanvasStore((s) => s.stageScale)
  const showLabels = stageScale >= 0.65

  const visible = Object.values(neighborhoods).filter(
    (n) => n.floorId === activeFloorId,
  )

  if (visible.length === 0) return null

  return (
    <Group listening={false}>
      {visible.flatMap((n) => {
        const left = n.x - n.width / 2
        const top = n.y - n.height / 2
        return [
          <Rect
            key={`${n.id}-fill`}
            name={`neighborhood-${n.id}`}
            x={left}
            y={top}
            width={n.width}
            height={n.height}
            fill={`${n.color}26`}
            stroke={n.color}
            strokeWidth={1}
            dash={[6, 4]}
          />,
          showLabels ? (
            <Text
              key={`${n.id}-label`}
              name={`neighborhood-label-${n.id}`}
              x={left + 6}
              y={top + 4}
              text={n.name}
              fontSize={12}
              fontStyle="bold"
              fill={n.color}
            />
          ) : null,
        ]
      })}
    </Group>
  )
}
