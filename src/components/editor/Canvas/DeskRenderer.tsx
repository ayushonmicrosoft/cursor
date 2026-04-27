import { Group, Rect, Text, Line } from 'react-konva'
import type { DeskElement, WorkstationElement, PrivateOfficeElement } from '../../../types/elements'
import { isDeskElement, isWorkstationElement } from '../../../types/elements'
import { useUIStore } from '../../../stores/uiStore'
import { useEmployeeStore } from '../../../stores/employeeStore'
import { useSeatDragStore } from '../../../stores/seatDragStore'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useVisibleEmployees } from '../../../hooks/useVisibleEmployees'
import { deriveSeatStatus } from '../../../lib/seatStatus'
import type { Accommodation } from '../../../types/employee'
import type { SeatLabelStyle } from '../../../types/project'
import {
  SeatLabel,
  ID_BADGE_BAND_H,
  accommodationAnchorFor,
  type AccommodationBadgeAnchor,
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

/** Visual palette for the drop-target outline painted while the user is
 *  dragging an employee chip over the canvas. Green = open desk, amber =
 *  occupied (drop will reassign / swap). A separate colour for the
 *  currently-hovered desk gives a cursor-follow affordance. */
const DROP_OPEN_STROKE = '#10B981'   // emerald-500
const DROP_BUSY_STROKE = '#F59E0B'   // amber-500
const DROP_HOVER_STROKE = '#2563EB'  // blue-600
const SELECTED_STROKE = CANVAS_COLORS.selected
const ID_FONT_SIZE = 9

/**
 * Minimum shape needed to render a seat badge — we deliberately don't
 * require the full `Employee` record here so the (narrow) typings the
 * sub-renderers receive can extend this instead of pulling in
 * `accommodations: undefined` everywhere. If the employee lookup comes
 * up empty or the array is missing, we render nothing.
 */
interface EmployeeBadgeShape {
  accommodations?: Accommodation[]
}

/**
 * Unicode-glyph badge keyed off the employee's accommodations. We pick
 * a single representative glyph per seat (wheelchair trumps everything
 * — it's the ADA-load-bearing one), so a user glancing at the layout
 * can pick out accommodated seats without reading labels.
 *
 * Using Text + a Konva Circle was the deliberate trade vs. wiring the
 * lucide SVG paths into react-konva — the glyph set renders reliably
 * across platforms and stays small (12px) without import gymnastics.
 */
function accommodationGlyph(
  accommodations: Accommodation[] | undefined,
): string | null {
  if (!accommodations || accommodations.length === 0) return null
  if (accommodations.some((a) => a.type === 'wheelchair-access')) return '\u267F' // ♿
  const first = accommodations[0]
  switch (first.type) {
    case 'quiet-zone':
      return '\u{1F910}' // 🤐
    case 'proximity-to-exit':
      return '\u{1F6AA}' // 🚪
    case 'ergonomic-chair':
      return '\u{1FA91}' // 🪑
    case 'standing-desk':
      return '\u{1F5A5}' // 🖥
    case 'natural-light':
      return '\u2600' // ☀
    default:
      return '\u2726' // ✦
  }
}

/**
 * Render a small top-right corner badge on assignable seats when the
 * assigned employee has at least one accommodation. Non-interactive —
 * `listening={false}` so it never intercepts clicks / drags.
 */
function AccommodationBadge({
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
  anchor?: AccommodationBadgeAnchor
}) {
  const glyph = accommodationGlyph(employee?.accommodations)
  if (!glyph) return null
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
        fill="#4F46E5" /* indigo-600 */
        opacity={0.95}
        perfectDrawEnabled={false}
      />
      <Text
        text={glyph}
        x={cx - 7}
        y={cy - 7}
        width={14}
        height={14}
        align="center"
        verticalAlign="middle"
        fontSize={10}
        fill="#ffffff"
        perfectDrawEnabled={false}
      />
    </Group>
  )
}

/** Visual tweaks driven off the derived seat status — kept here so each
 *  sub-renderer reads the same source of truth and the policy lives in one
 *  place ("decommissioned = 40% opacity; reserved = orange outline"). */
const SHARP_CORNER = 1
function seatStatusVisuals(el: DeskElement | WorkstationElement | PrivateOfficeElement) {
  const status = deriveSeatStatus(el)
  return {
    status,
    opacityMul: status === 'decommissioned' ? 0.4 : 1,
  }
}

function LockedCornerMarker({
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

interface DeskRendererProps {
  element: DeskElement | WorkstationElement | PrivateOfficeElement
}

export function DeskRenderer({ element }: DeskRendererProps) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  // Seat labels go through `useVisibleEmployees` so viewers without PII
  // access see initials on the map, not full names. Department colour
  // remains visible — it's not PII and it's load-bearing for wayfinding.
  const employees = useVisibleEmployees()
  const getDepartmentColor = useEmployeeStore((s) => s.getDepartmentColor)
  // User-selected cosmetic style for the per-seat label. Back-filled to
  // `'pill'` in ProjectShell on load, so existing projects see the
  // legacy rendering until the user opts into something else via the
  // View menu. Reading `settings.seatLabelStyle` lets every seat on
  // screen update in lockstep when the user toggles the picker.
  const seatLabelStyle: SeatLabelStyle =
    useCanvasStore((s) => s.settings.seatLabelStyle) ?? 'pill'
  // Wave 16 — desk-id corner badge visibility. Default off so the
  // canvas reads as a glanceable plan rather than a roster table; the
  // deskId is still surfaced in the Properties panel and the hover
  // card. Toggled via View → "Show desk IDs".
  const showDeskIds: boolean =
    useCanvasStore((s) => s.settings.showDeskIds) ?? false
  const stageScale = useCanvasStore((s) => s.stageScale)
  const labelDensity = labelDensityForScale(stageScale, isSelected)
  // Drag-in-flight outline: when an employee is being dragged from
  // PeoplePanel, paint every assignable desk with an affordance outline
  // so the user can see where they can drop. `hoveredSeatId` bumps the
  // outline to a brighter colour on the desk currently under the cursor.
  const draggingEmployeeId = useSeatDragStore((s) => s.draggingEmployeeId)
  const hoveredSeatId = useSeatDragStore((s) => s.hoveredSeatId)
  const hoveredSlotIndex = useSeatDragStore((s) => s.hoveredSlotIndex)
  const isHovered = hoveredSeatId === element.id
  const dragState = draggingEmployeeId
    ? {
        isHovered,
        // Forwarded only to WorkstationRenderer — the value is null
        // for non-workstation hover targets, and ignored by the
        // single-seat renderers.
        hoveredSlotIndex: isHovered ? hoveredSlotIndex : null,
      }
    : null

  if (isDeskElement(element)) {
    return (
      <DeskElementRenderer
        element={element}
        isSelected={isSelected}
        employees={employees}
        getDepartmentColor={getDepartmentColor}
        dragState={dragState}
        seatLabelStyle={seatLabelStyle}
        showDeskIds={showDeskIds}
        labelDensity={labelDensity}
      />
    )
  }

  if (isWorkstationElement(element)) {
    return (
      <WorkstationRenderer
        element={element}
        isSelected={isSelected}
        employees={employees}
        getDepartmentColor={getDepartmentColor}
        dragState={dragState}
        seatLabelStyle={seatLabelStyle}
        showDeskIds={showDeskIds}
        labelDensity={labelDensity}
      />
    )
  }

  return (
    <PrivateOfficeRenderer
      element={element as PrivateOfficeElement}
      isSelected={isSelected}
      employees={employees}
      getDepartmentColor={getDepartmentColor}
      dragState={dragState}
      seatLabelStyle={seatLabelStyle}
      showDeskIds={showDeskIds}
      labelDensity={labelDensity}
    />
  )
}

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
function DropTargetOutline({
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
    ? DROP_HOVER_STROKE
    : isOccupied
      ? DROP_BUSY_STROKE
      : DROP_OPEN_STROKE
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

// --- Desk / Hot-Desk ---

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

function DeskElementRenderer({ element, isSelected, employees, getDepartmentColor, dragState, seatLabelStyle, showDeskIds, labelDensity }: DeskElementRendererProps) {
  const employee = element.assignedEmployeeId ? employees[element.assignedEmployeeId] : null
  const departmentColor = employee?.department ? getDepartmentColor(employee.department) : null
  const { status, opacityMul } = seatStatusVisuals(element)
  const effectiveStatus = element.type === 'hot-desk' && status === 'unassigned'
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
    <Group rotation={element.rotation} listening={!element.locked}>
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
        shadowColor="#0F172A"
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
          fill="#6B7280"
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

// --- Workstation (bench style) ---

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

function WorkstationRenderer({ element, isSelected, employees, getDepartmentColor, dragState, seatLabelStyle, showDeskIds, labelDensity }: WorkstationRendererProps) {
  const slotWidth = element.width / element.positions
  const slotTopReserve = showDeskIds ? 14 : 4
  const slotBottomReserve = 6
  const { status, opacityMul } = seatStatusVisuals(element)
  const hasAssignment = element.assignedEmployeeIds.some(Boolean)
  const fillColor = seatFillForStatus(status, hasAssignment)
  const borderColor = isSelected
    ? SELECTED_STROKE
    : element.locked
      ? CANVAS_COLORS.locked
      : seatStrokeForStatus(status, element.style.stroke)
  const isWarning = status === 'reserved'
  const deskIdText = truncateToWidth(element.deskId, Math.max(20, element.width - 8), ID_FONT_SIZE)

  return (
    <Group rotation={element.rotation} listening={!element.locked}>
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
        shadowColor="#0F172A"
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
          fill="#9CA3AF"
          listening={false}
        />
      )}

      {/* Divider lines between positions */}
      {Array.from({ length: element.positions - 1 }, (_, i) => {
        const lineX = -element.width / 2 + slotWidth * (i + 1)
        const crispLineX = Math.round(lineX) + 0.5
        return (
          <Line
            key={`divider-${i}`}
            points={[crispLineX, -element.height / 2 + slotTopReserve, crispLineX, element.height / 2 - slotBottomReserve]}
            stroke="#D1D5DB"
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
        const accommodated = element.assignedEmployeeIds
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
      {Array.from({ length: element.positions }, (_, i) => {
        const employeeId = element.assignedEmployeeIds[i] || null
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
              departmentColor={deptColor}
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
      {/* Per-slot drop affordance.
       *
       * Each slot gets its own dashed outline so the user can target a
       * SPECIFIC slot rather than the whole bench (the data model is
       * sparse-positional now — see WorkstationElement.assignedEmployeeIds).
       *
       *   - green dashed outline   → empty slot, drop will fill it
       *   - amber dashed outline   → occupied slot, drop will reassign
       *                              that slot (evicting the incumbent)
       *   - blue (thicker) outline → the slot directly under the cursor
       *
       * `dragState.hoveredSlotIndex` is null when the cursor is over a
       * different element (or over no element); in that case every slot
       * still gets the green/amber affordance so the bench reads as a
       * valid drop target overall, just without a "you are here" cue.
       */}
      {dragState && Array.from({ length: element.positions }, (_, i) => {
        const occupied = element.assignedEmployeeIds[i] != null
        const isHoveredSlot = dragState.hoveredSlotIndex === i
        const slotLeft = -element.width / 2 + slotWidth * i
        const stroke = isHoveredSlot
          ? DROP_HOVER_STROKE
          : occupied
            ? DROP_BUSY_STROKE
            : DROP_OPEN_STROKE
        // Inset by 2px so adjacent slot outlines don't visually merge,
        // and so the hovered-slot rect reads distinctly from its
        // neighbours. Listening is off — DropTargetOutline parity.
        return (
          <Rect
            key={`slot-drop-${i}`}
            x={slotLeft + 2}
            y={-element.height / 2 + 2}
            width={Math.max(0, slotWidth - 4)}
            height={Math.max(0, element.height - 4)}
            fill="transparent"
            stroke={stroke}
            strokeWidth={isHoveredSlot ? 2.5 : 1.5}
            dash={[6, 3]}
            cornerRadius={SHARP_CORNER}
            listening={false}
          />
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

// --- Private Office ---

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

function PrivateOfficeRenderer({ element, isSelected, employees, getDepartmentColor, dragState, seatLabelStyle, showDeskIds, labelDensity }: PrivateOfficeRendererProps) {
  const assignedEmployees = element.assignedEmployeeIds
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
    <Group rotation={element.rotation} listening={!element.locked}>
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
        shadowColor="#0F172A"
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
          fill="#9CA3AF"
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
              underlyingFill="#EFF6FF"
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
              employee={{
                id: emp.id,
                name: emp.name,
                department: emp.department,
                title: emp.title ?? null,
              }}
              departmentColor={deptColor}
              x={labelLeft}
              y={labelTop + i * perLabelH}
              width={labelW}
              height={perLabelH}
              containerWidth={element.width}
              underlyingFill="#EFF6FF"
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
