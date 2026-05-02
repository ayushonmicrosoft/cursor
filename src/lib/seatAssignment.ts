import { useEmployeeStore } from '../stores/employeeStore'
import { useElementsStore } from '../stores/elementsStore'
import { useFloorStore } from '../stores/floorStore'
import { useProjectStore } from '../stores/projectStore'
import {
  useSeatHistoryStore,
  withHistoryRecording,
  isOuterRecordingFrame,
} from '../stores/seatHistoryStore'
import type { CanvasElement, DoorElement, WindowElement } from '../types/elements'
import {
  isDeskElement,
  isWorkstationElement,
  isPrivateOfficeElement,
  isAssignableElement,
  isTableElement,
  isWallElement,
} from '../types/elements'
import type { SeatHistoryAction } from '../types/seatHistory'

/**
 * Log a single history entry, tagged with the current session actor. Safe
 * to call with only `employeeId` (assign), only `previousEmployeeId`
 * (unassign), or both (reassign) — the action is inferred. Gated on
 * `isOuterRecordingFrame` so nested helpers (e.g. `clearEmployeeFromElement`
 * invoked from within `assignEmployee`) don't double-log.
 */
function recordHistory(args: {
  elementId: string
  seatId?: string
  employeeId: string | null
  previousEmployeeId: string | null
}): void {
  if (!isOuterRecordingFrame()) return
  const { elementId, employeeId, previousEmployeeId } = args
  const seatId = args.seatId ?? elementId

  // Derive the action from before/after. An unassign (`employeeId === null`
  // and there was a predecessor) is distinct from a reassign (both sides
  // non-null AND different) and from a plain assign (no predecessor).
  let action: SeatHistoryAction
  if (employeeId === null && previousEmployeeId !== null) {
    action = 'unassign'
  } else if (
    employeeId !== null &&
    previousEmployeeId !== null &&
    employeeId !== previousEmployeeId
  ) {
    action = 'reassign'
  } else {
    action = 'assign'
  }

  const actorUserId = useProjectStore.getState().currentUserId
  useSeatHistoryStore.getState().recordAssignment({
    seatId,
    elementId,
    employeeId,
    previousEmployeeId,
    action,
    timestamp: new Date().toISOString(),
    actorUserId,
    note: null,
  })
}

/**
 * Assign an employee to a desk/workstation/private-office element.
 * Atomically updates BOTH stores. If the employee was previously seated,
 * clears the old seat. If the target desk already has an occupant (and is
 * single-capacity), evicts them.
 */
export function assignEmployee(
  employeeId: string,
  targetElementId: string,
  floorId: string,
  slotIndex?: number,
): void {
  withHistoryRecording(() => doAssignEmployee(employeeId, targetElementId, floorId, slotIndex))
}

function doAssignEmployee(
  employeeId: string,
  targetElementId: string,
  floorId: string,
  slotIndex?: number,
): void {
  const employeeStore = useEmployeeStore.getState()
  const elementsStore = useElementsStore.getState()
  const floorStore = useFloorStore.getState()

  const employee = employeeStore.employees[employeeId]
  if (!employee) return

  if (employee.seatId === targetElementId && employee.floorId === floorId) {
    const isTargetOnActive = floorId === floorStore.activeFloorId
    const targetElements = isTargetOnActive
      ? elementsStore.elements
      : floorStore.getFloorElements(floorId)
    const target = targetElements[targetElementId]
    if (target && isAssignableElement(target)) {
      const agrees = isDeskElement(target)
        ? target.assignedEmployeeId === employeeId
        : isWorkstationElement(target)
          ? typeof slotIndex === 'number' && slotIndex >= 0 && slotIndex < target.assignedEmployeeIds.length
            ? target.assignedEmployeeIds[slotIndex] === employeeId
            : target.assignedEmployeeIds.includes(employeeId)
          : isPrivateOfficeElement(target)
            ? target.assignedEmployeeIds.includes(employeeId)
            : false
      if (agrees) return
    }
  }

  if (employee.seatId && employee.floorId) {
    clearEmployeeFromElement(employee.seatId, employeeId, employee.floorId)
  }

  const isTargetOnActiveFloor = floorId === floorStore.activeFloorId
  const targetElements = isTargetOnActiveFloor
    ? useElementsStore.getState().elements
    : floorStore.getFloorElements(floorId)

  const target = targetElements[targetElementId]
  if (!target || !isAssignableElement(target)) return

  let previousDeskOccupant: string | null =
    isDeskElement(target) &&
    target.assignedEmployeeId &&
    target.assignedEmployeeId !== employeeId
      ? target.assignedEmployeeId
      : null

  let workstationNextSlots: Array<string | null> | null = null
  let workstationEvicted: string | null = null
  if (isWorkstationElement(target)) {
    const next: Array<string | null> = [...target.assignedEmployeeIds]
    const existingIdx = next.findIndex((id) => id === employeeId)
    if (existingIdx !== -1) next[existingIdx] = null

    const requestedSlot =
      typeof slotIndex === 'number' &&
      Number.isFinite(slotIndex) &&
      slotIndex >= 0 &&
      slotIndex < next.length
        ? Math.floor(slotIndex)
        : -1
    const fallbackSlot = next.findIndex((id) => id === null)
    const placeAt = requestedSlot >= 0 ? requestedSlot : fallbackSlot

    if (placeAt === -1) return

    const evicted = next[placeAt]
    if (evicted && evicted !== employeeId) {
      workstationEvicted = evicted
      previousDeskOccupant = evicted
    }
    next[placeAt] = employeeId
    workstationNextSlots = next
  }

  if (previousDeskOccupant) {
    const prev = employeeStore.employees[previousDeskOccupant]
    if (prev) {
      employeeStore.updateEmployee(previousDeskOccupant, { seatId: null, floorId: null })
    }
  }
  void workstationEvicted

  const updatedElement: CanvasElement = isDeskElement(target)
    ? { ...target, assignedEmployeeId: employeeId }
    : isWorkstationElement(target) && workstationNextSlots
      ? { ...target, assignedEmployeeIds: workstationNextSlots }
      : isPrivateOfficeElement(target)
        ? { ...target, assignedEmployeeIds: Array.from(new Set([...target.assignedEmployeeIds, employeeId])) }
        : target

  if (isTargetOnActiveFloor) {
    elementsStore.updateElement(targetElementId, updatedElement)
  } else {
    const currentFloorElements = floorStore.getFloorElements(floorId)
    floorStore.setFloorElements(floorId, { ...currentFloorElements, [targetElementId]: updatedElement })
  }

  employeeStore.updateEmployee(employeeId, { seatId: targetElementId, floorId })

  const oldEmployeeSeat = employee.seatId && employee.seatId !== targetElementId
    ? employee.seatId
    : null
  if (oldEmployeeSeat) {
    recordHistory({
      elementId: oldEmployeeSeat,
      employeeId: null,
      previousEmployeeId: employeeId,
    })
  }
  recordHistory({
    elementId: targetElementId,
    employeeId,
    previousEmployeeId: previousDeskOccupant,
  })
}

export function swapEmployees(aId: string, bId: string): { aSeat: string; bSeat: string } | null {
  if (aId === bId) return null
  const employees = useEmployeeStore.getState().employees
  const a = employees[aId]
  const b = employees[bId]
  if (!a || !b) return null
  const aSeat = a.seatId
  const bSeat = b.seatId
  const aFloor = a.floorId
  const bFloor = b.floorId
  if (!aSeat || !bSeat || !aFloor || !bFloor) return null
  if (aSeat === bSeat) return null

  withHistoryRecording(() => {
    doUnassignEmployee(aId)
    doAssignEmployee(bId, aSeat, aFloor)
    doAssignEmployee(aId, bSeat, bFloor)
  })
  return { aSeat, bSeat }
}

export function unassignEmployee(employeeId: string): void {
  withHistoryRecording(() => doUnassignEmployee(employeeId))
}

function doUnassignEmployee(employeeId: string): void {
  const employeeStore = useEmployeeStore.getState()
  const employee = employeeStore.employees[employeeId]
  if (!employee || !employee.seatId || !employee.floorId) return

  const clearedElementId = employee.seatId
  clearEmployeeFromElement(employee.seatId, employeeId, employee.floorId)
  employeeStore.updateEmployee(employeeId, { seatId: null, floorId: null })

  recordHistory({
    elementId: clearedElementId,
    employeeId: null,
    previousEmployeeId: employeeId,
  })
}

export function deleteEmployee(employeeId: string): void {
  unassignEmployee(employeeId)

  const floorStore = useFloorStore.getState()
  const elementsStore = useElementsStore.getState()
  const activeFloorId = floorStore.activeFloorId

  for (const floor of floorStore.floors) {
    const isActive = floor.id === activeFloorId
    const elements = isActive ? elementsStore.elements : floor.elements
    for (const el of Object.values(elements)) {
      if (!isTableElement(el)) continue
      const hasStale = el.seats.some((s) => s.assignedGuestId === employeeId)
      if (!hasStale) continue
      const cleaned = {
        ...el,
        seats: el.seats.map((s) =>
          s.assignedGuestId === employeeId ? { ...s, assignedGuestId: null } : s
        ),
      }
      if (isActive) {
        elementsStore.updateElement(el.id, cleaned)
      } else {
        const current = floorStore.getFloorElements(floor.id)
        floorStore.setFloorElements(floor.id, { ...current, [el.id]: cleaned })
      }
    }
  }

  const employeeStore = useEmployeeStore.getState()
  for (const emp of Object.values(employeeStore.employees)) {
    if (emp.managerId === employeeId) {
      employeeStore.updateEmployee(emp.id, { managerId: null })
    }
  }

  useEmployeeStore.getState().removeEmployee(employeeId)
}

export function deleteFloor(floorId: string): void {
  const floorStore = useFloorStore.getState()
  const elementsStore = useElementsStore.getState()
  const employeeStore = useEmployeeStore.getState()
  const wasActive = floorStore.activeFloorId === floorId

  const floorElements = wasActive
    ? elementsStore.elements
    : floorStore.getFloorElements(floorId)

  for (const emp of Object.values(employeeStore.employees)) {
    if (emp.floorId !== floorId) continue
    if (emp.seatId && floorElements[emp.seatId]) {
      employeeStore.updateEmployee(emp.id, { seatId: null, floorId: null })
    } else if (emp.seatId === null) {
      employeeStore.updateEmployee(emp.id, { floorId: null })
    }
  }

  floorStore.removeFloor(floorId)

  if (wasActive) {
    const newActiveId = useFloorStore.getState().activeFloorId
    elementsStore.setElements(
      useFloorStore.getState().getFloorElements(newActiveId)
    )
  }
}

export function cleanupElementAssignments(
  elementId: string,
  options?: { skipElementWrite?: boolean }
): void {
  const employeeStore = useEmployeeStore.getState()
  const elementsStore = useElementsStore.getState()
  const floorStore = useFloorStore.getState()
  const skipElementWrite = options?.skipElementWrite === true

  let foundFloorId: string | null = null
  let foundElement: CanvasElement | null = null

  const activeElement = elementsStore.elements[elementId]
  if (activeElement) {
    foundFloorId = floorStore.activeFloorId
    foundElement = activeElement
  } else {
    for (const floor of floorStore.floors) {
      if (floor.id === floorStore.activeFloorId) continue
      const el = floor.elements[elementId]
      if (el) {
        foundFloorId = floor.id
        foundElement = el
        break
      }
    }
  }

  if (!skipElementWrite && foundElement && foundFloorId) {
    let cleaned: CanvasElement | null = null
    if (isDeskElement(foundElement)) {
      if (foundElement.assignedEmployeeId !== null) {
        cleaned = { ...foundElement, assignedEmployeeId: null }
      }
    } else if (isWorkstationElement(foundElement)) {
      if (foundElement.assignedEmployeeIds.some((id) => id !== null)) {
        cleaned = {
          ...foundElement,
          assignedEmployeeIds: Array.from({ length: foundElement.positions }, () => null),
        }
      }
    } else if (isPrivateOfficeElement(foundElement)) {
      if (foundElement.assignedEmployeeIds.length > 0) {
        cleaned = { ...foundElement, assignedEmployeeIds: [] }
      }
    } else if (isTableElement(foundElement)) {
      if (foundElement.seats.some((s) => s.assignedGuestId !== null)) {
        cleaned = {
          ...foundElement,
          seats: foundElement.seats.map((s) => ({ ...s, assignedGuestId: null })),
        }
      }
    }

    if (cleaned) {
      if (foundFloorId === floorStore.activeFloorId) {
        elementsStore.updateElement(elementId, cleaned)
      } else {
        const current = floorStore.getFloorElements(foundFloorId)
        floorStore.setFloorElements(foundFloorId, { ...current, [elementId]: cleaned })
      }
    }
  }

  const affected = Object.values(employeeStore.employees).filter((e) => e.seatId === elementId)
  for (const emp of affected) {
    employeeStore.updateEmployee(emp.id, { seatId: null, floorId: null })
  }
}

function clearEmployeeFromElement(elementId: string, employeeId: string, floorId: string): void {
  const elementsStore = useElementsStore.getState()
  const floorStore = useFloorStore.getState()
  const isOnActiveFloor = floorId === floorStore.activeFloorId

  const elements = isOnActiveFloor ? elementsStore.elements : floorStore.getFloorElements(floorId)
  const el = elements[elementId]
  if (!el) return

  let updated: CanvasElement | null = null
  if (isDeskElement(el) && el.assignedEmployeeId === employeeId) {
    updated = { ...el, assignedEmployeeId: null }
  } else if (isWorkstationElement(el)) {
    if (el.assignedEmployeeIds.some((id) => id === employeeId)) {
      updated = {
        ...el,
        assignedEmployeeIds: el.assignedEmployeeIds.map((id) => (id === employeeId ? null : id)),
      }
    }
  } else if (isPrivateOfficeElement(el)) {
    updated = { ...el, assignedEmployeeIds: el.assignedEmployeeIds.filter((id) => id !== employeeId) }
  }
  if (!updated) return

  if (isOnActiveFloor) {
    elementsStore.updateElement(elementId, updated)
  } else {
    floorStore.setFloorElements(floorId, { ...elements, [elementId]: updated })
  }
}

export function deleteElements(elementIds: string[]): void {
  const elementsState = useElementsStore.getState().elements
  const employeesState = useEmployeeStore.getState().employees

  const validIds = elementIds.filter((id) => {
    const el = elementsState[id]
    return !!el && !el.locked
  })
  if (validIds.length === 0) return

  const toDelete = new Set<string>(validIds)
  for (const id of validIds) {
    const el = elementsState[id]
    if (!el) continue
    if (isWallElement(el)) {
      for (const [childId, child] of Object.entries(elementsState)) {
        if (
          (child.type === 'door' || child.type === 'window') &&
          (child as DoorElement | WindowElement).parentWallId === id
        ) {
          toDelete.add(childId)
        }
      }
    }
  }

  const employeesToUnassign: string[] = []
  for (const id of toDelete) {
    const el = elementsState[id]
    if (!el) continue
    if (isAssignableElement(el)) {
      for (const emp of Object.values(employeesState)) {
        if (emp.seatId === id) employeesToUnassign.push(emp.id)
      }
    }
  }

  const nextElements = { ...elementsState }
  for (const id of toDelete) delete nextElements[id]

  const nextEmployees = { ...employeesState }
  for (const empId of employeesToUnassign) {
    const cur = nextEmployees[empId]
    if (cur) {
      nextEmployees[empId] = { ...cur, seatId: null, floorId: null }
    }
  }

  useElementsStore.setState({ elements: nextElements })
  useEmployeeStore.setState({ employees: nextEmployees })
}

export function switchToFloor(newFloorId: string): void {
  const floorStore = useFloorStore.getState()
  const elementsStore = useElementsStore.getState()
  const currentFloorId = floorStore.activeFloorId
  if (newFloorId === currentFloorId) return

  floorStore.setFloorElements(currentFloorId, elementsStore.elements)
  floorStore.setActiveFloor(newFloorId)
  elementsStore.setElements(floorStore.getFloorElements(newFloorId))
}
