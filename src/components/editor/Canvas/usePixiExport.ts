/**
 * Phase 5 — PNG export hook (standalone utility).
 * PixiJS v8 extract.canvas() is SYNCHRONOUS and returns ICanvas.
 * Cast to HTMLCanvasElement is safe in a browser context.
 */
import { useCallback, useRef } from 'react'
import type { Application } from 'pixi.js'

export function usePixiExport() {
  const appRef = useRef<Application | null>(null)

  const registerApp = useCallback((app: Application | null) => {
    appRef.current = app
  }, [])

  const exportPng = useCallback(async (): Promise<void> => {
    const app = appRef.current
    if (!app) {
      console.warn('[PixiExport] No app registered')
      return
    }

    const { useProjectStore } = await import('../../../stores/projectStore')
    const { useFloorStore } = await import('../../../stores/floorStore')
    const p = useProjectStore.getState().currentProject
    const fl = useFloorStore
      .getState()
      .floors.find((f) => f.id === useFloorStore.getState().activeFloorId)

    // v8 extract is synchronous — returns ICanvas (HTMLCanvasElement in browser)
    const cv = app.renderer.extract.canvas(app.stage) as HTMLCanvasElement
    cv.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${p?.name ?? 'office'}-${fl?.name ?? 'floor'}-pixi.png`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
  }, [])

  return { registerApp, exportPng }
}
