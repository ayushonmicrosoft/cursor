import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render } from '@testing-library/react'

const { saveOffice, saveOfficeForce } = vi.hoisted(() => ({
  saveOffice: vi.fn(),
  saveOfficeForce: vi.fn(),
}))

vi.mock('../lib/offices/officeRepository', () => ({
  saveOffice: (...a: unknown[]) => saveOffice(...a),
  saveOfficeForce: (...a: unknown[]) => saveOfficeForce(...a),
}))
// Zustand-store mocks. Each selector-or-undefined hook is packaged
// through `unknown` to satisfy `tsc -b`'s stricter cast-checking,
// which flags the arrow-function-cast-to-Record<string, unknown>
// pattern that vi.mock's factory return type infers.
type Selector<S> = ((s: S) => unknown) | undefined
function makeStoreHook<S>(state: S) {
  const hook = ((sel: Selector<S>) => (sel ? sel(state) : state)) as unknown as {
    (sel?: Selector<S>): unknown
    getState: () => S
    setState: (u: Partial<S> | ((s: S) => Partial<S>)) => void
  }
  hook.getState = () => state
  hook.setState = (u) => {
    Object.assign(state as object, typeof u === 'function' ? u(state) : u)
  }
  return hook
}

vi.mock('../stores/elementsStore', () => ({
  useElementsStore: makeStoreHook({ elements: {} }),
}))
vi.mock('../stores/employeeStore', () => ({
  useEmployeeStore: makeStoreHook({ employees: {}, departmentColors: {} }),
}))
vi.mock('../stores/floorStore', () => ({
  useFloorStore: makeStoreHook({
    floor: { id: 'default', name: 'Main Floor', order: 0, elements: {} },
    floors: [],
    activeFloorId: 'default',
  }),
}))
vi.mock('../stores/canvasStore', () => ({
  useCanvasStore: makeStoreHook({ settings: {} }),
}))
vi.mock('../stores/projectStore', () => {
  const state: Record<string, unknown> = {
    saveState: 'idle',
    lastSavedAt: null,
    loadedVersion: 'v0',
    officeId: 'o1',
    conflict: null,
    setLoadedVersion: (v: string | null) => {
      state.loadedVersion = v
    },
    setSaveState: (s: string) => {
      state.saveState = s
    },
    setLastSavedAt: (at: string) => {
      state.lastSavedAt = at
    },
  }
  const hook = makeStoreHook(state) as unknown as {
    (sel?: Selector<Record<string, unknown>>): unknown
    setState: (u: unknown) => void
    getState: () => Record<string, unknown>
  }
  hook.setState = (u: unknown) =>
    Object.assign(state, typeof u === 'function' ? (u as (s: unknown) => object)(state) : (u as object))
  hook.getState = () => state
  return { useProjectStore: hook }
})

import { useOfficeSync } from '../lib/offices/useOfficeSync'

function Probe() {
  useOfficeSync()
  return null
}

describe('useOfficeSync', () => {
  beforeEach(() => {
    saveOffice.mockReset()
    saveOfficeForce.mockReset()
    vi.useFakeTimers()
  })

  it('debounces and skips the initial-mount snapshot', async () => {
    saveOffice.mockResolvedValue({ ok: true, updated_at: 'v1' })
    render(<Probe />)
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(saveOffice).not.toHaveBeenCalled()
  })
})
