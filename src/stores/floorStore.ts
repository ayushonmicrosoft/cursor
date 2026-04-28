import { create } from 'zustand'
import type { Floor } from '../types/floor'
import type { CanvasElement } from '../types/elements'

/**
 * Single-floor store.
 *
 * Replaces the legacy multi-floor system. All projects now have exactly one
 * floor context, identified by 'default'.
 */

export const DEFAULT_FLOOR_ID = 'default'

interface FloorState {
  floor: Floor
  
  setFloor: (floor: Floor) => void
  renameFloor: (name: string) => void
  getFloorElements: () => Record<string, CanvasElement>
  setFloorElements: (elements: Record<string, CanvasElement>) => void
}

export const useFloorStore = create<FloorState>((set, get) => ({
  floor: {
    id: DEFAULT_FLOOR_ID,
    name: 'Main Floor',
    order: 0,
    elements: {},
  },

  setFloor: (floor) => set({ floor }),

  renameFloor: (name) =>
    set((state) => ({
      floor: { ...state.floor, name },
    })),

  getFloorElements: () => get().floor.elements,

  setFloorElements: (elements) =>
    set((state) => ({
      floor: { ...state.floor, elements },
    })),
}))

/**
 * Hook to access the single active floor.
 * Replaces the need for floors[0] or activeFloorId lookups.
 */
export function useActiveFloor() {
  return useFloorStore((s) => s.floor)
}
