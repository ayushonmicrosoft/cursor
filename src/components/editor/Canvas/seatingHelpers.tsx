import { Rect } from 'react-konva'
import { CANVAS_COLORS } from './visualStyle'
import { SHARP_CORNER } from './seatingConstants'

/**
 * Shared drop-target outline painted on top of the seat's existing border
 * while an employee drag is in progress. Colour keys off whether the seat
 * is currently occupied and whether it's the one under the cursor:
 *
 *   - hovered               → bright blue (primary affordance)
 *   - occupied (not hover)  → amber      ("will reassign / swap")
 *   - open (not hover)      → green      ("drop to assign")
 *
 * Rendered as an outline-only rect slightly outside the element so it
 * reads as an overlay rather than competing with the seat's own stroke.
 * `listening={false}` so it never swallows the drop event.
 */
export function DropTargetOutline({
  width,
  height,
  isOccupied,
  isHovered,
}: {
  width: number
  height: number
  isOccupied: boolean
  isHovered: boolean
}) {
  const stroke = isHovered
    ? CANVAS_COLORS.dropHover
    : isOccupied
      ? CANVAS_COLORS.dropBusy
      : CANVAS_COLORS.dropOpen
  // Pull the outline 3 px outside the seat bounds so it doesn't collide
  // with the main body stroke. A dashed stroke reads as "drop here"
  // — solid would look like a selected state.
  return (
    <Rect
      x={-width / 2 - 3}
      y={-height / 2 - 3}
      width={width + 6}
      height={height + 6}
      fill="transparent"
      stroke={stroke}
      strokeWidth={isHovered ? 2.5 : 1.5}
      dash={[6, 3]}
      cornerRadius={SHARP_CORNER}
      listening={false}
    />
  )
}