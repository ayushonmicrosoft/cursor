import { Group, Rect, Text, Line } from 'react-konva'
import type { WorkstationElement } from '../../../types/elements'
import type { Accommodation } from '../../../types/employee'
import type { SeatLabelStyle } from '../../../types/project'
import {
  SeatLabel,
  accommodationAnchorFor,
} from './SeatLabel'
import { truncateToWidth } from '../../../lib/textTruncate'
import {
  CANVAS_COLORS,
  interactionStrokeWidth,
  labelDensityForScale,
  seatDashForStatus,
  seatFillForStatus,
  seatStrokeForStatus,
} from './visualStyle'
import {
  AccommodationBadge,
  LockedCornerMarker,
} from './seatingComponents'
import { seatStatusVisuals } from './seatingUtils'
import { SELECTED_STROKE, ID_FONT_SIZE, SHARP_CORNER } from './seatingConstants'

interface WorkstationRendererProps {
  element: WorkstationElement
  isSelected: boolean
  employees: Record<string, { id: string; name: string; department: string | null; title?: string | null; accommodations?: Accommodation[] }>
  getDepartmentColor: (department: string) => string
  dragState: { isHovered: boolean; hoveredSlotIndex: number | null } | null
  seatLabelStyle: SeatLabelStyle
  showDeskIds: boolean
  labelDensity: ReturnType<typeof labelDensityForScale>
}

export function WorkstationRenderer({ element, isSelected, employees, getDepartmentColor, dragState, seatLabelStyle, showDeskIds, labelDensity }: WorkstationRendererProps) {
  const safePositions = Number.isFinite(element.positions) && element.positions > 0 ? element.positions : 1
  const assignedEmployeeIds = Array.isArray(element.assignedEmployeeIds)
    ? element.assignedEmployeeIds
    : Array.from({ length: safePositions }, () => null)
  const slotWidth = element.width / safePositions
  const slotTopReserve = showDeskIds ? 14 : 4
  const slotBottomReserve = 6
  const { status, opacityMul } = seatStatusVisuals(element)
  const hasAssignment = assignedEmployeeIds.some(Boolean)
  const fillColor = seatFillForStatus(status, hasAssignment)
  const borderColor = isSelected
    ? SELECTED_STROKE
    : element.locked
      ? CANVAS_COLORS.locked
      : seatStrokeForStatus(status, element.style.stroke)
  const isWarning = status === 'reserved'
  const deskIdText = truncateToWidth(element.deskId, Math.max(20, element.width - 8), ID_FONT_SIZE)

  return (
    <Group rotation={element.rotation} listening={true}>
      <Rect
        x={-element.width / 2}
        y={-element.height / 2}
        width={element.width}
        height={element.height}
        fill={fillColor}
        stroke={borderColor}
        strokeWidth={interactionStrokeWidth(isSelected, isWarning)}
        strokeScaleEnabled={false}
        cornerRadius={SHARP_CORNER}
        dash={seatDashForStatus(status, hasAssignment)}
        opacity={element.style.opacity * opacityMul}
        shadowColor={CANVAS_COLORS.shadow}
        shadowBlur={hasAssignment ? 3 : 1}
        shadowOpacity={hasAssignment ? 0.1 : 0.04}
        shadowOffset={{ x: 0, y: 1 }}
      />

      {/* Desk ID (Wave 16: opt-in via View → "Show desk IDs"). */}
      {showDeskIds && (
        <Text
          text={deskIdText}
          x={-element.width / 2 + 4}
          y={-element.height / 2 + 3}
          width={element.width - 8}
          align="left"
          fontSize={ID_FONT_SIZE}
          fill={CANVAS_COLORS.textSubtle}
          listening={false}
        />
      )}

      {/* Divider lines between positions */}
      {Array.from({ length: safePositions - 1 }, (_, i) => {
        const lineX = -element.width / 2 + slotWidth * (i + 1)
        const crispLineX = Math.round(lineX) + 0.5
        return (
          <Line
            key={`divider-${i}`}
            points={[crispLineX, -element.height / 2 + slotTopReserve, crispLineX, element.height / 2 - slotBottomReserve]}
            stroke={CANVAS_COLORS.deskDivider}
            strokeWidth={1}
            strokeScaleEnabled={false}
            listening={false}
          />
        )
      })}

      {(() => {
        // A workstation holds multiple people; surface the first assignee
        // with any accommodation so the badge still functions as a "this
        // row has accommodations" cue. Wheelchair priority is handled
        // inside `accommodationGlyph`.
        const accommodated = assignedEmployeeIds
          .map((id) => (id ? employees[id] : null))
          .find((e) => e && e.accommodations && e.accommodations.length > 0)
        if (!accommodated) return null
        return (
          <AccommodationBadge
            employee={accommodated}
            elementWidth={element.width}
            elementHeight={element.height}
            anchor={accommodationAnchorFor(seatLabelStyle)}
          />
        )
      })()}

      {/* Position slots
       *
       * Each slot hosts one `<SeatLabel>`. The slot's usable area is the
       * per-position column between the divider lines, inset by 2px on
       * each side so the label can't kiss the divider. The bottom
       * department-colour indicator rail stays in place for every style
       * *except* `'banner'` (whose left stripe is the identity cue —
       * adding a second rail would be noise) and `'card'` (whose full-
       * bleed colour header already communicates the department).
       *
       * Layout note: workstation slots are typically narrow (40–60px
       * wide for a 4-position bench on a typical desk width), which
       * puts them below the `'avatar'` side-by-side threshold. The
       * avatar style automatically falls back to a stacked layout
       * there; no slot-layout adjustments needed.
       */}
      {Array.from({ length: safePositions }, (_, i) => {
        const employeeId = assignedEmployeeIds[i] || null
        const employee = employeeId ? employees[employeeId] : null
        const slotX = -element.width / 2 + slotWidth * i
        const slotLabelWidth = Math.max(0, slotWidth - 4)
        const deptColor = employee?.department ? getDepartmentColor(employee.department) : null
        const showDeptRail = deptColor && seatLabelStyle !== 'banner' && seatLabelStyle !== 'card'
        // Reserve 14px at the top for the deskId text (only when it's
        // shown) and 6px at the bottom for the divider/dept rail. When
        // the deskId is hidden — the Wave 16 default — the label gets
        // the reclaimed top band, which means the avatar chip and the
        // pill name actually fit at workstation slot heights.
        const labelTop = -element.height / 2 + slotTopReserve
        const labelH = Math.max(8, element.height - slotTopReserve - slotBottomReserve)
        return (
          <Group key={`slot-${i}`}>
            {showDeptRail && (
              <Rect
                x={slotX + 2}
                y={element.height / 2 - 5}
                width={slotLabelWidth}
                height={2}
                fill={deptColor}
                cornerRadius={1}
                listening={false}
              />
            )}
            <SeatLabel
              style={seatLabelStyle}
              employee={null}
              departmentColor={null}
              x={slotX + 2}
              y={labelTop}
              width={slotLabelWidth}
              height={labelH}
              containerWidth={slotWidth}
              underlyingFill="#FFFFFF"
              attenuated={!!dragState}
              labelDensity={labelDensity}
            />
          </Group>
        )
      })}
      {element.locked && (
        <LockedCornerMarker
          width={element.width}
          height={element.height}
          opacity={element.style.opacity * opacityMul}
        />
      )}
    </Group>
  )
}