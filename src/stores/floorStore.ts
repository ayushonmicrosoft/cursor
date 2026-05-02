import { create } from 'zustand'
import type { Floor } from '../types/floor'
import type { CanvasElement, DeskElement, PrivateOfficeElement, WorkstationElement } from '../types/elements'

/**
 * Single-floor store.
 *
 * Replaces the legacy multi-floor system. All projects now have exactly one
 * floor context, identified by 'default'.
 */

export const DEFAULT_FLOOR_ID = 'default'

interface FloorState {
  floor: Floor
  floors: Floor[]
  activeFloorId: string

  setFloor: (floor: Floor) => void
  setActiveFloor: (floorId: string) => void
  removeFloor: (floorId: string) => void
  reorderFloors: (
    floorId: string,
    nextIndex: number,
  ) => { fromIndex: number; toIndex: number } | null
  duplicateFloor: (
    floorId: string,
    sourceElements?: Record<string, CanvasElement>,
  ) => { newId: string } | null
  renameFloor: (name: string) => void
  getFloorElements: (floorId?: string) => Record<string, CanvasElement>
  setFloorElements: (
    floorIdOrElements: string | Record<string, CanvasElement>,
    maybeElements?: Record<string, CanvasElement>,
  ) => void
}

function toSingleFloor(next: Floor): Floor {
  return {
    ...next,
    elements: { ...(next.elements ?? {}) },
  }
}

function cloneAndResetElement(source: CanvasElement, id: string): CanvasElement {
  const cloned = structuredClone(source) as CanvasElement
  cloned.id = id
  if (cloned.type === 'desk') {
    ;(cloned as DeskElement).assignedEmployeeId = null
  } else if (cloned.type === 'workstation') {
    const workstation = cloned as WorkstationElement
    const positions = Number.isFinite(workstation.positions)
      ? Math.max(0, Math.floor(workstation.positions))
      : workstation.assignedEmployeeIds.length
    workstation.assignedEmployeeIds = Array.from({ length: positions }, () => null)
  } else if (cloned.type === 'private-office') {
    ;(cloned as PrivateOfficeElement).assignedEmployeeIds = []
  }
  return cloned
}

function clampIndex(index: number, max: number): number {
  if (index < 0) return 0
  if (index > max) return max
  return index
}

export const useFloorStore = create<FloorState>((set, get) => ({
  floor: toSingleFloor({
    id: DEFAULT_FLOOR_ID,
    name: 'Main Floor',
    order: 0,
    elements: {},
  }),
  floors: [
    toSingleFloor({
      id: DEFAULT_FLOOR_ID,
      name: 'Main Floor',
      order: 0,
      elements: {},
    }),
  ],
  activeFloorId: DEFAULT_FLOOR_ID,

  setFloor: (floor) => {
    const normalized = toSingleFloor(floor)
    set({
      floor: normalized,
      floors: [normalized],
      activeFloorId: normalized.id,
    })
  },

  setActiveFloor: (floorId) =>
    set((state) => {
      const nextFloor = state.floors.find((f) => f.id === floorId)
      if (!nextFloor) return state
      return {
        floor: nextFloor,
        activeFloorId: nextFloor.id,
      }
    }),

  removeFloor: (floorId) =>
    set((state) => {
      const filtered = state.floors.filter((f) => f.id !== floorId)
      if (filtered.length === 0) return state
      const nextFloors = filtered.map((f, index) => ({ ...f, order: index }))
      const nextActive =
        state.activeFloorId === floorId
          ? nextFloors[0].id
          : state.activeFloorId
      const nextFloor =
        nextFloors.find((f) => f.id === nextActive) ?? nextFloors[0]
      return {
        floor: nextFloor,
        floors: nextFloors,
        activeFloorId: nextFloor.id,
      }
    }),

  reorderFloors: (floorId, nextIndex) => {
    const { floors, activeFloorId } = get()
    const fromIndex = floors.findIndex((f) => f.id === floorId)
    if (fromIndex === -1) return null
    const toIndex = clampIndex(nextIndex, floors.length - 1)
    if (fromIndex === toIndex) return null

    const nextFloors = [...floors]
    const [moving] = nextFloors.splice(fromIndex, 1)
    nextFloors.splice(toIndex, 0, moving)
    const normalized = nextFloors.map((f, index) => ({ ...f, order: index }))
    const nextFloor =
      normalized.find((f) => f.id === activeFloorId) ?? normalized[0]

    set({
      floors: normalized,
      floor: nextFloor,
      activeFloorId: nextFloor.id,
    })
    return { fromIndex, toIndex }
  },

  duplicateFloor: (floorId, sourceElements) => {
    const { floors } = get()
    const sourceIndex = floors.findIndex((f) => f.id === floorId)
    if (sourceIndex === -1) return null
    const source = floors[sourceIndex]

    const nextElements: Record<string, CanvasElement> = {}
    const sourceMap = sourceElements ?? source.elements
    for (const element of Object.values(sourceMap)) {
      const id = crypto.randomUUID()
      nextElements[id] = cloneAndResetElement(element, id)
    }

    const newFloorId = crypto.randomUUID()
    const newFloor: Floor = {
      id: newFloorId,
      name: `${source.name} copy`,
      order: source.order + 1,
      elements: nextElements,
    }

    const nextFloors = [...floors]
    nextFloors.splice(sourceIndex + 1, 0, newFloor)
    const normalized = nextFloors.map((f, index) => ({ ...f, order: index }))

    set({
      floors: normalized,
      floor:
        normalized.find((f) => f.id === get().activeFloorId) ?? get().floor,
    })

    return { newId: newFloorId }
  },

  renameFloor: (name) =>
    set((state) => ({
      floor: { ...state.floor, name },
      floors: [{ ...state.floor, name }],
      activeFloorId: state.floor.id,
    })),

  getFloorElements: (_floorId) => get().floor.elements,

  setFloorElements: (floorIdOrElements, maybeElements) => {
    const elements =
      typeof floorIdOrElements === 'string'
        ? maybeElements ?? {}
        : floorIdOrElements
    set((state) => ({
      floor: { ...state.floor, elements },
      floors: [{ ...state.floor, elements }],
      activeFloorId: state.floor.id,
    }))
  },
}))

/**
 * Hook to access the single active floor.
 * Replaces the need for floors[0] or activeFloorId lookups.
 */
export function useActiveFloor() {
  return useFloorStore((s) => s.floor)
}
