import { Group, Rect, Text } from 'react-konva'
import type { DeskElement } from '../../../types/elements'
import type { Accommodation } from '../../../types/employee'
import type { SeatLabelStyle } from '../../../types/project'
import type { SeatStatus } from '../../../types/seatAssignment'
import {
  SeatLabel,
  ID_BADGE_BAND_H,
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

interface DeskElementRendererProps {
  element: DeskElement
  isSelected: boolean
  employees: Record<string, { id: string; name: string; department: string | null; title?: string | null; accommodations?: Accommodation[] }>
  getDepartmentColor: (department: string) => string
  /** Active while an employee drag is in flight — null otherwise. */
  dragState: { isHovered: boolean; hoveredSlotIndex: number | null } | null
  seatLabelStyle: SeatLabelStyle
  /** Wave 16 — when true, paint the desk-id corner badge. Default off
   *  so the canvas doesn't duplicate info the hover card and the
   *  Properties panel already carry. */
  showDeskIds: boolean
  labelDensity: ReturnType<typeof labelDensityForScale>
}

export function DeskElementRenderer({ element, isSelected, employees, getDepartmentColor, dragState, seatLabelStyle, showDeskIds, labelDensity }: DeskElementRendererProps) {
  const employee = element.assignedEmployeeId ? employees[element.assignedEmployeeId] : null
  const departmentColor = employee?.department ? getDepartmentColor(employee.department) : null
  const { status, opacityMul } = seatStatusVisuals(element)
  const effectiveStatus: SeatStatus = element.type === 'hot-desk' && status === 'unassigned'
    ? 'hot-desk'
    : status
  const fillColor = seatFillForStatus(effectiveStatus, !!employee)
  const borderColor = isSelected
    ? SELECTED_STROKE
    : element.locked
      ? CANVAS_COLORS.locked
      : seatStrokeForStatus(effectiveStatus, departmentColor)
  const borderDash = seatDashForStatus(effectiveStatus, !!employee)
  const isWarning = effectiveStatus === 'reserved'

  // Wave 16 layout contract.
  //
  // The card style paints its own white body across the full seat — it
  // owns the entire interior and its 4px top accent strip is the dept
  // signal. Every other style draws on top of the desk's own fill and
  // lives inside an interior inset 4px from each edge.
  //
  // The desk-id badge is OPT-IN (default off). When on, the label
  // reserves the top `ID_BADGE_BAND_H` band so the two text layers
  // never overlap. When off, the label uses the full inset interior.
  // Either way the deskId is also surfaced in the hover card and the
  // Properties panel — hiding the corner badge does not lose the
  // information, just the on-canvas duplication.
  const TOO_SMALL_FOR_ID = element.width < 48 || element.height < 28
  const showIdBadge = showDeskIds && !TOO_SMALL_FOR_ID && seatLabelStyle !== 'card'
  const deskIdBadgeWidth = Math.max(20, element.width / 2 - 4)
  const deskIdText = truncateToWidth(element.deskId, deskIdBadgeWidth, ID_FONT_SIZE)
  const isCard = seatLabelStyle === 'card'
  const contentTop = isCard
    ? -element.height / 2
    : showIdBadge
      ? -element.height / 2 + ID_BADGE_BAND_H
      : -element.height / 2 + 4
  const contentH = isCard
    ? element.height
    : element.height - (showIdBadge ? ID_BADGE_BAND_H : 4) - 4
  const contentLeft = isCard ? -element.width / 2 : -element.width / 2 + 4
  const contentW = isCard ? element.width : element.width - 8

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
        dash={borderDash}
        opacity={element.style.opacity * opacityMul}
        shadowColor={CANVAS_COLORS.shadow}
        shadowBlur={employee ? 3 : 1}
        shadowOpacity={employee ? 0.1 : 0.04}
        shadowOffset={{ x: 0, y: 1 }}
      />
      {departmentColor && (
        <Rect
          x={-element.width / 2 + 4}
          y={element.height / 2 - 5}
          width={Math.max(0, element.width - 8)}
          height={2}
          fill={departmentColor}
          opacity={0.9 * element.style.opacity * opacityMul}
          cornerRadius={1}
          listening={false}
        />
      )}
      {isWarning && (
        <Rect
          x={-element.width / 2 + 4}
          y={-element.height / 2 + 4}
          width={Math.max(0, element.width - 8)}
          height={2}
          fill={CANVAS_COLORS.warning}
          opacity={0.9}
          cornerRadius={1}
          listening={false}
        />
      )}

      {/* Desk-id corner badge. Wave 16: opt-in via View → "Show desk
          IDs" (default off). Hidden for the `'card'` style — its 4px
          top accent strip would clash with a 9px-tall text — and when
          the desk is too small to fit both. The deskId is also
          surfaced in the hover card and the Properties panel; the
          on-canvas badge is duplication unless the user explicitly
          turns it on. */}
      {showIdBadge && (
        <Text
          text={deskIdText}
          x={-element.width / 2 + 4}
          y={-element.height / 2 + 3}
          width={deskIdBadgeWidth}
          align="left"
          fontSize={ID_FONT_SIZE}
          fontStyle="bold"
          fill={CANVAS_COLORS.textMuted}
          listening={false}
        />
      )}

      {/* Per-seat label — one of four cosmetic styles selected from the
          canvas settings. See `SeatLabel.tsx` for the variants. The
          underlyingFill is passed so the `'card'` style can paint a
          contrasting white body over the cream desk fill. */}
      <SeatLabel
        style={seatLabelStyle}
        employee={
          employee
            ? {
                id: employee.id,
                name: employee.name,
                department: employee.department,
                title: employee.title ?? null,
              }
            : null
        }
        departmentColor={departmentColor}
        x={contentLeft}
        y={contentTop}
        width={contentW}
        height={contentH}
        containerWidth={element.width}
        underlyingFill="#FFFFFF"
        attenuated={!!dragState}
        labelDensity={labelDensity}
      />
      <AccommodationBadge
        employee={employee}
        elementWidth={element.width}
        elementHeight={element.height}
        anchor={accommodationAnchorFor(seatLabelStyle)}
      />
      {dragState && (
        <DropTargetOutline
          width={element.width}
          height={element.height}
          isOccupied={!!employee}
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