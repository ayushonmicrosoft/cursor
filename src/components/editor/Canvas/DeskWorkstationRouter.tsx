import { useUIStore } from '../../../stores/uiStore'
import { useEmployeeStore } from '../../../stores/employeeStore'
import { useSeatDragStore } from '../../../stores/seatDragStore'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useVisibleEmployees } from '../../../hooks/useVisibleEmployees'
import type { DeskElement, WorkstationElement, PrivateOfficeElement } from '../../../types/elements'
import { isDeskElement, isWorkstationElement } from '../../../types/elements'
import type { SeatLabelStyle } from '../../../types/project'
import {
  labelDensityForScale,
} from './visualStyle'
import { DeskElementRenderer } from './DeskElementRenderer'
import { WorkstationRenderer } from './WorkstationRenderer'
import { PrivateOfficeRenderer } from './PrivateOfficeRenderer'

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