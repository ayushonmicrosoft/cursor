import { useEffect, useRef } from 'react'
import { useElementsStore } from '../../stores/elementsStore'
import { useEmployeeStore } from '../../stores/employeeStore'
import { useFloorStore } from '../../stores/floorStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { useProjectStore } from '../../stores/projectStore'
import { useSeatHistoryStore } from '../../stores/seatHistoryStore'
import { useNeighborhoodStore } from '../../stores/neighborhoodStore'
import { useAnnotationsStore } from '../../stores/annotationsStore'
import { saveOffice, saveOfficeForce } from './officeRepository'

/**
 * Office sync hook — manages the debounced persistence of the office state
 * to Supabase.
 */

const DEBOUNCE_MS = 2000
const RETRY_DELAYS = [2000, 5000, 15000, 30000]

export function buildCurrentPayload(): Record<string, unknown> {
  const elements = useElementsStore.getState().elements
  const { employees, departmentColors } = useEmployeeStore.getState()
  const { floor } = useFloorStore.getState()
  const settings = useCanvasStore.getState().settings
  const seatHistory = useSeatHistoryStore.getState().entries
  const neighborhoods = useNeighborhoodStore.getState().neighborhoods
  const annotations = useAnnotationsStore.getState().annotations

  return {
    version: 2,
    elements,
    employees,
    departmentColors,
    floors: [floor],
    activeFloorId: floor.id,
    settings,
    seatHistory,
    neighborhoods,
    annotations,
  }
}

export function useOfficeSync() {
  const elements = useElementsStore((s) => s.elements)
  const employees = useEmployeeStore((s) => s.employees)
  const departmentColors = useEmployeeStore((s) => s.departmentColors)
  const floor = useFloorStore((s) => s.floor)
  const settings = useCanvasStore((s) => s.settings)
  const neighborhoods = useNeighborhoodStore((s) => s.neighborhoods)
  const annotations = useAnnotationsStore((s) => s.annotations)
  const seatHistory = useSeatHistoryStore((s) => s.entries)

  const officeId = useProjectStore((s) => s.officeId)
  const loadedVersion = useProjectStore((s) => s.loadedVersion)
  const setLoadedVersion = useProjectStore((s) => s.setLoadedVersion)
  const setSaveState = useProjectStore((s) => s.setSaveState)
  const setLastSavedAt = useProjectStore((s) => s.setLastSavedAt)

  const initialSnapshotRef = useRef<unknown>(null)
  const lastSavedSnapshotRef = useRef<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryIndex = useRef(0)

  useEffect(() => {
    if (!officeId || !loadedVersion) return
    const snapshot = { 
      elements, 
      employees, 
      departmentColors, 
      floor, 
      settings, 
      seatHistory, 
      neighborhoods, 
      annotations, 
    }

    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = snapshot
      lastSavedSnapshotRef.current = JSON.stringify(snapshot)
      return
    }

    const currentSnapshotStr = JSON.stringify(snapshot)
    if (currentSnapshotStr === lastSavedSnapshotRef.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const doSave = async (): Promise<void> => {
      const currentVersion = useProjectStore.getState().loadedVersion
      const currentOfficeId = useProjectStore.getState().officeId
      if (!currentOfficeId || !currentVersion) return

      setSaveState('saving')
      const payload = buildCurrentPayload()
      const res = await saveOffice(currentOfficeId, payload, currentVersion)
      if (res.ok) {
        retryIndex.current = 0
        setLoadedVersion(res.updated_at)
        setLastSavedAt(res.updated_at)
        setSaveState('saved')
        lastSavedSnapshotRef.current = JSON.stringify({
          elements: useElementsStore.getState().elements,
          employees: useEmployeeStore.getState().employees,
          departmentColors: useEmployeeStore.getState().departmentColors,
          floor: useFloorStore.getState().floor,
          settings: useCanvasStore.getState().settings,
          seatHistory: useSeatHistoryStore.getState().entries,
          neighborhoods: useNeighborhoodStore.getState().neighborhoods,
          annotations: useAnnotationsStore.getState().annotations,
        })
        return
      }
      if (res.reason === 'conflict') {
        setSaveState('error')
        useProjectStore.setState({ conflict: { payload } })
        return
      }
      setSaveState('error')
      const delay = RETRY_DELAYS[Math.min(retryIndex.current, RETRY_DELAYS.length - 1)]
      retryIndex.current += 1
      retryTimerRef.current = setTimeout(() => {
        void doSave()
      }, delay)
    }

    debounceRef.current = setTimeout(() => {
      void doSave()
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [
    officeId,
    loadedVersion,
    elements,
    employees,
    departmentColors,
    floor,
    settings,
    seatHistory,
    neighborhoods,
    annotations,
    setSaveState,
    setLastSavedAt,
    setLoadedVersion,
  ])

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [])

  async function overwrite() {
    const state = useProjectStore.getState()
    if (!state.officeId) return
    setSaveState('saving')
    const payload = buildCurrentPayload()
    const res = await saveOfficeForce(state.officeId, payload)
    if (res.ok) {
      setLoadedVersion(res.updated_at)
      setLastSavedAt(res.updated_at)
      setSaveState('saved')
      useProjectStore.setState({ conflict: null })
    } else {
      setSaveState('error')
    }
  }

  return { overwrite }
}
