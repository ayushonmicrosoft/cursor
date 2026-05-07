import { Group, Rect, Text } from 'react-konva'
import type { PrivateOfficeElement } from '../../../types/elements'
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
import {
  DropTargetOutline,
} from './seatingHelpers'
import { seatStatusVisuals } from './seatingUtils'
import { SELECTED_STROKE, ID_FONT_SIZE, SHARP_CORNER } from './seatingConstants'

interface PrivateOfficeRendererProps {
  element: PrivateOfficeElement
  isSelected: boolean
  employees: Record<string, { id: string; name: string; department: string | null; title?: string | null; accommodations?: Accommodation[] }>
  getDepartmentColor: (department: string) => string
  dragState: { isHovered: boolean; hoveredSlotIndex: number | null } | null
  seatLabelStyle: SeatLabelStyle
  showDeskIds: boolean
  labelDensity: ReturnType<typeof labelDensityForScale>
}

export function PrivateOfficeRenderer({ element, isSelected, employees, getDepartmentColor, dragState, seatLabelStyle, showDeskIds, labelDensity }: PrivateOfficeRendererProps) {
  const assignedEmployeeIds = Array.isArray(element.assignedEmployeeIds) ? element.assignedEmployeeIds : []
  const assignedEmployees = assignedEmployeeIds
    .map((id) => employees[id])
    .filter(Boolean)
  const borderColor = isSelected ? SELECTED_STROKE : element.style.stroke
  const firstDeptColor = assignedEmployees[0]?.department
    ? getDepartmentColor(assignedEmployees[0].department)
    : null
  const { status, opacityMul } = seatStatusVisuals(element)
  const isWarning = status === 'reserved'
  const deskIdText = truncateToWidth(element.deskId, Math.max(20, element.width - 8), ID_FONT_SIZE)

  return (
    <Group rotation={element.rotation} listening={true}>
      <Rect
        x={-element.width / 2}
        y={-element.height / 2}
        width={element.width}
        height={element.height}
        fill={seatFillForStatus(status, assignedEmployees.length > 0) === CANVAS_COLORS.assignedFill ? CANVAS_COLORS.officeFill : seatFillForStatus(status, assignedEmployees.length > 0)}
        stroke={
          isSelected
            ? SELECTED_STROKE
            : element.locked
              ? CANVAS_COLORS.locked
              : seatStrokeForStatus(status, firstDeptColor || borderColor)
        }
        strokeWidth={interactionStrokeWidth(isSelected, isWarning)}
        strokeScaleEnabled={false}
        cornerRadius={SHARP_CORNER}
        dash={seatDashForStatus(status, assignedEmployees.length > 0)}
        opacity={element.style.opacity * opacityMul}
        shadowColor={CANVAS_COLORS.shadow}
        shadowBlur={4}
        shadowOpacity={0.08}
        shadowOffset={{ x: 0, y: 1 }}
      />
      {isWarning && (
        <Rect
          x={-element.width / 2 + 6}
          y={-element.height / 2 + 5}
          width={Math.max(0, element.width - 12)}
          height={2}
          fill={CANVAS_COLORS.warning}
          opacity={0.9}
          cornerRadius={1}
          listening={false}
        />
      )}

      {/* Desk ID (Wave 16: opt-in via View → "Show desk IDs"). */}
      {showDeskIds && (
        <Text
          text={deskIdText}
          x={-element.width / 2 + 4}
          y={-element.height / 2 + 4}
          width={element.width - 8}
          align="left"
          fontSize={ID_FONT_SIZE}
          fill={CANVAS_COLORS.textSubtle}
          listening={false}
        />
      )}

      {/* Private offices can seat 1-2 people, so we render one SeatLabel
       *  per occupant stacked vertically. Empty offices render a single
       *  `'open'`-state SeatLabel so the style choice still applies
       *  visually. The label area is inset 8px horizontally and leaves a
       *  14px top strip for the deskId text.
       *
       *  For the 2-capacity case each label gets half the interior
       *  height — that comfortably fits every style at the default
       *  private-office dimensions (100x72), though the `'avatar'`
       *  style may switch into its stacked narrow-layout variant if a
       *  user shrinks the office aggressively. */}
      {(() => {
        // Reserve a top band for the deskId text when it's shown; when
        // hidden (Wave 16 default) the label gets the reclaimed space.
        const topReserve = showDeskIds ? 14 : 6
        const labelTop = -element.height / 2 + topReserve
        const labelAreaH = element.height - topReserve - 6
        const labelLeft = -element.width / 2 + 8
        const labelW = element.width - 16
        if (assignedEmployees.length === 0) {
          return (
            <SeatLabel
              style={seatLabelStyle}
              employee={null}
              departmentColor={null}
              x={labelLeft}
              y={labelTop}
              width={labelW}
              height={labelAreaH}
              containerWidth={element.width}
              underlyingFill={CANVAS_COLORS.officeFill}
              attenuated={!!dragState}
              labelDensity={labelDensity}
            />
          )
        }
        const perLabelH = labelAreaH / assignedEmployees.length
        return assignedEmployees.map((emp, i) => {
          const deptColor = emp.department ? getDepartmentColor(emp.department) : null
          return (
            <SeatLabel
              key={emp.id}
              style={seatLabelStyle}
              employee={null}
              departmentColor={null}
              x={labelLeft}
              y={labelTop + i * perLabelH}
              width={labelW}
              height={perLabelH}
              containerWidth={element.width}
              underlyingFill={CANVAS_COLORS.officeFill}
              attenuated={!!dragState}
              labelDensity={labelDensity}
            />
          )
        })
      })()}
      {(() => {
        const accommodated = assignedEmployees.find(
          (e) => e?.accommodations && e.accommodations.length > 0,
        )
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
      {dragState && (
        <DropTargetOutline
          width={element.width}
          height={element.height}
          isOccupied={assignedEmployees.length > 0}
          isHovered={dragState.isHovered}
        />
      )}
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