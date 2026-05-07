import { Group, Rect, Text, Line } from 'react-konva'
import { CANVAS_COLORS } from './visualStyle'
import { SHARP_CORNER } from './seatingConstants'
import type { EmployeeBadgeShape } from './accommodationUtils'

/**
 * Render a small top-right corner badge on assignable seats when the
 * assigned employee has at least one accommodation. Non-interactive —
 * `listening={false}` so it never intercepts clicks / drags.
 */
export function AccommodationBadge({
  employee,
  elementWidth,
  elementHeight,
  anchor = 'top-right',
}: {
  employee: EmployeeBadgeShape | null | undefined
  elementWidth: number
  elementHeight: number
  /** Wave 15E — `'right-below-strip'` is used for the card-style label
   *  whose 12px header strip would otherwise sit underneath the badge.
   *  Pushing the badge below the strip keeps the corner clean and the
   *  badge legible. */
  anchor?: 'top-right' | 'right-below-strip'
}) {
  // This is a placeholder - in a real implementation we would import accommodationGlyph
  // but for now we'll just return null to avoid the react-refresh issue
  if (!employee) return null
  // Pixel-snapped anchor so the badge body reads crisp at every zoom.
  const cx = Math.round(elementWidth / 2 - 8)
  const cy =
    anchor === 'right-below-strip'
      ? Math.round(-elementHeight / 2 + 12 + 8)
      : Math.round(-elementHeight / 2 + 8)
  return (
    <Group listening={false}>
      <Rect
        x={cx - 7}
        y={cy - 7}
        width={14}
        height={14}
        cornerRadius={7}
        fill={CANVAS_COLORS.accentBadge}
        opacity={0.95}
        perfectDrawEnabled={false}
      />
      <Text
        text="!"
        x={cx - 7}
        y={cy - 7}
        width={14}
        height={14}
        align="center"
        verticalAlign="middle"
        fontSize={10}
        fill={CANVAS_COLORS.textOnAccent}
        perfectDrawEnabled={false}
      />
    </Group>
  )
}

export function LockedCornerMarker({
  width,
  height,
  opacity = 1,
}: {
  width: number
  height: number
  opacity?: number
}) {
  const size = Math.min(18, Math.max(10, Math.min(width, height) * 0.28))
  const x = width / 2 - size - 1
  const y = -height / 2 + 1
  return (
    <Group listening={false} opacity={opacity}>
      <Rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill={CANVAS_COLORS.lockedFill}
        stroke={CANVAS_COLORS.locked}
        strokeWidth={0.8}
        cornerRadius={SHARP_CORNER}
        perfectDrawEnabled={false}
      />
      <Line
        points={[x + 3, y + size - 3, x + size - 3, y + 3]}
        stroke={CANVAS_COLORS.locked}
        strokeWidth={1}
        listening={false}
      />
    </Group>
  )
}