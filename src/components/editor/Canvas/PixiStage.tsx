/**
 * PixiStage — Phase 2–5 bridge renderer.
 *
 * Fixes vs previous version:
 *  - rAF debounce on draw() — prevents hang from rapid Zustand ticks on mount
 *  - Grid layer wired (PixiGridLayer)
 *  - pointer-events: none on the canvas element itself so sidebars remain clickable
 *    (the Container event system handles canvas interaction internally)
 *  - Guard: don't init Pixi with 0×0 dimensions
 */
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Application, Container, Graphics, Text, TextStyle, type FederatedPointerEvent } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { useElementsStore } from '../../../stores/elementsStore'
import { useUIStore } from '../../../stores/uiStore'
import { useCanvasStore } from '../../../stores/canvasStore'
import { useEmployeeStore } from '../../../stores/employeeStore'
import { useNeighborhoodStore } from '../../../stores/neighborhoodStore'
import { useFloorStore } from '../../../stores/floorStore'
import type { CanvasElement, DeskElement, PrivateOfficeElement, WorkstationElement } from '../../../types/elements'
import type { Employee } from '../../../types/employee'
import {
  DESK_BLOCK_TYPES,
  ROOM_BLOCK_TYPES,
  TABLE_BLOCK_TYPES,
  isCenterAnchoredBlock,
  isStrokeOnlyBlock,
} from '../../../blocks/rendering'
import { renderDesk } from '../../../lib/pixi/PixiDeskRenderer'
import { renderWorkstation } from '../../../lib/pixi/PixiWorkstationRenderer'
import { renderWall } from '../../../lib/pixi/PixiWallRenderer'
import { renderTable } from '../../../lib/pixi/PixiTableRenderer'
import { renderRoom } from '../../../lib/pixi/PixiRoomRenderer'
import { renderFurniture } from '../../../lib/pixi/PixiFurnitureRenderer'
import { syncNeighborhoodLayer } from '../../../lib/pixi/PixiNeighborhoodLayer'
import { syncAlignmentGuides } from '../../../lib/pixi/PixiAlignmentGuides'
import { syncSelectionHandles } from '../../../lib/pixi/PixiSelectionHandles'
import { syncGrid } from '../../../lib/pixi/PixiGridLayer'
import { parsePixiColor } from '../../../lib/pixiColor'
import { ZOOM_FACTOR, ZOOM_MAX, ZOOM_MIN } from '../../../lib/constants'
import { createPixiNodeId } from '../../../lib/pixi/pixiNodeFactory'

export interface PixiViewportState {
  scale: number
  x: number
  y: number
}

export interface PixiStageHandle {
  exportPng(): Promise<void>
  zoomIn(): void
  zoomOut(): void
  fitToContent(): void
  resetView(): void
  getViewport(): PixiViewportState
}

export interface PixiStageError {
  severity: 'warning' | 'fatal'
  code: string
  message: string
}

export interface PixiStageEventBridge {
  on: (eventName: string, handler: (event: unknown) => void) => void
  off: (eventName: string, handler: (event: unknown) => void) => void
}

interface PixiStageProps {
  width: number
  height: number
  onError?: (error: PixiStageError) => void
  onViewportChange?: (viewport: PixiViewportState) => void
  onStageReady?: (stage: PixiStageEventBridge | null) => void
}

const SEAT_STYLE = new TextStyle({ fontSize: 9, fill: '#1F2937', fontFamily: 'Inter,sans-serif', fontWeight: '600' })
const PALETTE = [0x6366f1, 0x10b981, 0xf59e0b, 0xef4444, 0x8b5cf6, 0x06b6d4, 0xf97316, 0x84cc16]
function deptColor(dept: string | null): number {
  if (!dept) return 0x6366f1
  let h = 0; for (let i = 0; i < dept.length; i++) h = (h * 31 + dept.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export const PixiStage = forwardRef<PixiStageHandle, PixiStageProps>(function PixiStage({ width, height, onError, onViewportChange, onStageReady }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<Application | null>(null)
  const worldRef = useRef<Viewport | null>(null)
  const mapRef = useRef<Map<string, Container>>(new Map())
  const gridLayerRef = useRef<Container | null>(null)
  const dragRef = useRef<{ id: string; action?: 'move' | 'resize'; handleIndex?: number; swx: number; swy: number; sex: number; sey: number; sw?: number; sh?: number } | null>(null)
  const rafRef = useRef<number | null>(null)
  const viewportPublishRafRef = useRef<number | null>(null)
  const buildFailureRef = useRef(0)
  const drawOverrunRef = useRef(0)
  const lastViewportRef = useRef<PixiViewportState | null>(null)

  const emitViewport = (force = false) => {
    const world = worldRef.current
    if (!world) return
    const next = { scale: world.scale.x, x: world.x, y: world.y }
    const prev = lastViewportRef.current
    const changed =
      !prev ||
      Math.abs(next.scale - prev.scale) > 0.001 ||
      Math.abs(next.x - prev.x) > 2 ||
      Math.abs(next.y - prev.y) > 2
    if (!force && !changed) return
    lastViewportRef.current = next
    onViewportChange?.(next)
  }

  const publishViewport = (force = false) => {
    if (force) {
      if (viewportPublishRafRef.current !== null) {
        cancelAnimationFrame(viewportPublishRafRef.current)
        viewportPublishRafRef.current = null
      }
      emitViewport(true)
      return
    }
    if (viewportPublishRafRef.current !== null) return
    viewportPublishRafRef.current = requestAnimationFrame(() => {
      viewportPublishRafRef.current = null
      emitViewport(false)
    })
  }

  const redrawGrid = () => {
    const gridLayer = gridLayerRef.current
    const world = worldRef.current
    if (!gridLayer || !world) return
    if (!useCanvasStore.getState().settings.showGrid) {
      gridLayer.removeChildren().forEach((child) => child.destroy())
      return
    }
    syncGrid(gridLayer, world.x, world.y, world.scale.x, width || 800, height || 600)
  }

  const zoomAtViewportCenter = (factor: number) => {
    const world = worldRef.current
    if (!world) return
    const oldScale = world.scale.x || 1
    const nextScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, oldScale * factor))
    if (nextScale === oldScale) return
    const centerX = (width || 800) / 2
    const centerY = (height || 600) / 2
    const worldX = (centerX - world.x) / oldScale
    const worldY = (centerY - world.y) / oldScale
    world.scale.set(nextScale, nextScale)
    world.x = centerX - worldX * nextScale
    world.y = centerY - worldY * nextScale
    redrawGrid()
    publishViewport(true)
  }

  useImperativeHandle(ref, () => ({
    async exportPng() {
      const app = appRef.current; if (!app) return
      const { useProjectStore } = await import('../../../stores/projectStore')
      const { useFloorStore: uFS } = await import('../../../stores/floorStore')
      const p = useProjectStore.getState().currentProject
      const fl = uFS.getState().floors.find(f => f.id === uFS.getState().activeFloorId)
      const cv = app.renderer.extract.canvas(app.stage) as HTMLCanvasElement
      cv.toBlob(blob => {
        if (!blob) return; const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${p?.name ?? 'office'}-${fl?.name ?? 'floor'}-pixi.png`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
        a.click(); URL.revokeObjectURL(a.href)
      }, 'image/png')
    },
    zoomIn() {
      zoomAtViewportCenter(ZOOM_FACTOR)
    },
    zoomOut() {
      zoomAtViewportCenter(1 / ZOOM_FACTOR)
    },
    fitToContent() {
      const world = worldRef.current
      if (!world) return
      fitWorldToElements(world, useElementsStore.getState().elements, width || 800, height || 600)
      redrawGrid()
      publishViewport(true)
    },
    resetView() {
      const world = worldRef.current
      if (!world) return
      world.x = 0
      world.y = 0
      world.scale.set(1, 1)
      redrawGrid()
      publishViewport(true)
    },
    getViewport() {
      const world = worldRef.current
      return world ? { scale: world.scale.x, x: world.x, y: world.y } : { scale: 1, x: 0, y: 0 }
    }
  }))

  useEffect(() => {
    const w = width > 0 ? width : 800
    const h = height > 0 ? height : 600
    if (!canvasRef.current) return
    let dead = false
    const map = mapRef.current

    const app = new Application()
    app.init({
      canvas: canvasRef.current,
      preference: 'canvas',
      width: w, height: h,
      backgroundColor: 0xf1f5f9,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio ?? 1, 2),
    }).then(() => {
      if (dead) { app.destroy(); return }
      appRef.current = app
      onStageReady?.(app.stage as unknown as PixiStageEventBridge)

      // ── Layer stack ──────────────────────────────────────────────────
      const world = new Viewport({
        screenWidth: w,
        screenHeight: h,
        worldWidth: 5000,
        worldHeight: 5000,
        events: app.renderer.events,
        passiveWheel: false,
      })
      app.stage.addChild(world); worldRef.current = world
      world
        .drag({ mouseButtons: 'left' })
        .pinch()
        .wheel()
        .decelerate()
        .clampZoom({ minScale: ZOOM_MIN, maxScale: ZOOM_MAX })
      const gridLayer = new Container()   // [0] grid
      const nlLayer = new Container()   // [1] neighborhoods
      const elLayer = new Container()   // [2] elements
      const glLayer = new Container()   // [3] guides
      const hlLayer = new Container()   // [4] handles
      world.addChild(gridLayer); world.addChild(nlLayer)
      world.addChild(elLayer); world.addChild(glLayer); world.addChild(hlLayer)
      gridLayerRef.current = gridLayer

      const handleViewportMove = () => {
        schedGrid()
        publishViewport()
      }
      world.on('moved', handleViewportMove)
      world.on('zoomed', handleViewportMove)

      app.stage.eventMode = 'static'; app.stage.hitArea = app.screen
      app.stage.on('pointermove', (e: FederatedPointerEvent) => {
        if (dragRef.current) {
          const d = dragRef.current
          const wp = world.toLocal(e.global)
          const dx = wp.x - d.swx
          const dy = wp.y - d.swy

          if (d.action === 'resize') {
            const el = useElementsStore.getState().elements[d.id]
            if (!el) return
            const isCenter = isCenterAnchoredBlock(el.type)
            const oldLeft = isCenter ? d.sex - d.sw! / 2 : d.sex
            const oldTop = isCenter ? d.sey - d.sh! / 2 : d.sey
            const oldRight = isCenter ? d.sex + d.sw! / 2 : d.sex + d.sw!
            const oldBottom = isCenter ? d.sey + d.sh! / 2 : d.sey + d.sh!

            let newLeft = oldLeft
            let newTop = oldTop
            let newRight = oldRight
            let newBottom = oldBottom

            if ([0, 6, 7].includes(d.handleIndex!)) newLeft += dx
            if ([0, 1, 2].includes(d.handleIndex!)) newTop += dy
            if ([2, 3, 4].includes(d.handleIndex!)) newRight += dx
            if ([4, 5, 6].includes(d.handleIndex!)) newBottom += dy

            if (newRight - newLeft < 10) {
              if ([0, 6, 7].includes(d.handleIndex!)) newLeft = newRight - 10
              else newRight = newLeft + 10
            }
            if (newBottom - newTop < 10) {
              if ([0, 1, 2].includes(d.handleIndex!)) newTop = newBottom - 10
              else newBottom = newTop + 10
            }

            const newW = newRight - newLeft
            const newH = newBottom - newTop
            const newX = isCenter ? newLeft + newW / 2 : newLeft
            const newY = isCenter ? newTop + newH / 2 : newTop

            useElementsStore.getState().updateElement(d.id, { x: newX, y: newY, width: newW, height: newH })
          } else {
            useElementsStore.getState().updateElement(d.id, { x: d.sex + dx, y: d.sey + dy })
          }
          schedDraw()
          return
        }
      })
      app.stage.on('pointerup', () => { dragRef.current = null })
      app.stage.on('pointerupoutside', () => { dragRef.current = null })

      // ── Grid helpers ──────────────────────────────────────────────────
      function drawGrid() {
        if (!useCanvasStore.getState().settings.showGrid) {
          gridLayer.removeChildren().forEach((child) => child.destroy())
          return
        }
        syncGrid(gridLayer, world.x, world.y, world.scale.x, w, h)
      }
      let gridRaf: number | null = null
      function schedGrid() {
        if (gridRaf) return; gridRaf = requestAnimationFrame(() => { drawGrid(); gridRaf = null })
      }

      // ── Element draw (rAF-debounced) ──────────────────────────────────
      function schedDraw() {
        if (dead) return
        if (rafRef.current) return
        rafRef.current = requestAnimationFrame(() => {
          const startedAt = performance.now()
          rafRef.current = null
          if (dead) return
          const els = useElementsStore.getState().elements
          const selIds = useUIStore.getState().selectedIds
          const setSelIds = useUIStore.getState().setSelectedIds
          const emps = useEmployeeStore.getState().employees
          const hoods = useNeighborhoodStore.getState().neighborhoods
          const floorId = useFloorStore.getState().activeFloorId
          const guides = useUIStore.getState().dragAlignmentGuides
          syncNeighborhoodLayer(nlLayer, hoods, floorId)
          const failures = syncElLayer(elLayer, map, els, selIds, setSelIds, emps, dragRef)
          if (failures > 0) {
            buildFailureRef.current += failures
            if (buildFailureRef.current >= 3) {
              console.error('[PixiStage] Repeated element build failures')
              onError?.({
                severity: 'fatal',
                code: 'pixi-build-failure',
                message: 'Pixi could not draw some elements. Falling back to the stable renderer.',
              })
              buildFailureRef.current = 0
            }
          } else {
            buildFailureRef.current = 0
          }
          syncAlignmentGuides(glLayer, guides)
          syncSelectionHandles(hlLayer, selIds.map(id => els[id]).filter(Boolean) as CanvasElement[], dragRef)

          const elapsed = performance.now() - startedAt
          if (elapsed > 32) {
            drawOverrunRef.current += 1
            if (drawOverrunRef.current >= 6) {
              console.warn('[PixiStage] Repeated slow frames', { elapsed })
              onError?.({
                severity: 'warning',
                code: 'pixi-slow-frames',
                message: 'Pixi is rendering slowly. The preview is still open.',
              })
              drawOverrunRef.current = 0
            }
          } else {
            drawOverrunRef.current = 0
          }
        })
      }

      // Initial draw + subscriptions
      fitWorldToElements(world, useElementsStore.getState().elements, w, h)
      drawGrid()
      publishViewport(true)
      schedDraw()
      const u1 = useElementsStore.subscribe(schedDraw)
      const u2 = useUIStore.subscribe((state, prev) => {
        if (
          state.selectedIds !== prev.selectedIds ||
          state.dragAlignmentGuides !== prev.dragAlignmentGuides ||
          state.viewMode !== prev.viewMode
        ) {
          schedDraw()
        }
      })
      const u3 = useNeighborhoodStore.subscribe(schedDraw)
      const u4 = useFloorStore.subscribe(schedDraw)
      const u5 = useCanvasStore.subscribe((state, prev) => {
        if (state.settings.showGrid !== prev.settings.showGrid) schedGrid()
      })
        ; (app as Application & { _c?: () => void })._c = () => {
          u1(); u2(); u3(); u4(); u5()
          world.off('moved', handleViewportMove)
          world.off('zoomed', handleViewportMove)
          if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
          if (viewportPublishRafRef.current !== null) { cancelAnimationFrame(viewportPublishRafRef.current); viewportPublishRafRef.current = null }
          if (gridRaf) { cancelAnimationFrame(gridRaf); gridRaf = null }
        }
    }).catch((error) => {
      if (dead) return
      console.error('[PixiStage] Failed to initialize Pixi', error)
      onError?.({
        severity: 'fatal',
        code: 'pixi-init-failure',
        message: 'Pixi failed to initialize in this browser context.',
      })
    })

    return () => {
      dead = true
      onStageReady?.(null)
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      if (viewportPublishRafRef.current !== null) { cancelAnimationFrame(viewportPublishRafRef.current); viewportPublishRafRef.current = null }
      const a = appRef.current as (Application & { _c?: () => void }) | null
      if (a) { a._c?.(); a.destroy(true); appRef.current = null }
      map.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount only — resize handled separately

  useEffect(() => {
    const app = appRef.current; if (!app) return
    const w = width > 0 ? width : 800, h = height > 0 ? height : 600
    app.renderer.resize(w, h)
    worldRef.current?.resize(w, h, 5000, 5000)
    // Redraw grid at new size
    const gl = gridLayerRef.current, world = worldRef.current
    if (gl && world) {
      if (useCanvasStore.getState().settings.showGrid) {
        syncGrid(gl, world.x, world.y, world.scale.x, w, h)
      } else {
        gl.removeChildren().forEach((child) => child.destroy())
      }
    }
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width, height, touchAction: 'none' }}
      aria-label="PixiJS floor plan (experimental)"
    />
  )
})

// ── Element layer sync ────────────────────────────────────────────────────────
interface StatefulContainer extends Container {
  _state?: { el: CanvasElement; sel: boolean; empHash: string }
}

function syncElLayer(
  layer: Container, map: Map<string, Container>, elements: Record<string, CanvasElement>,
  selIds: string[],
  setSelIds: (ids: string[]) => void,
  emps: Record<string, Employee>,
  dragRef: React.MutableRefObject<{ id: string; action?: 'move' | 'resize'; handleIndex?: number; swx: number; swy: number; sex: number; sey: number; sw?: number; sh?: number } | null>,
): number {
  let failures = 0
  const cur = new Set(Object.keys(elements))
  for (const [id, c] of map) { if (!cur.has(id)) { layer.removeChild(c); c.destroy({ children: true }); map.delete(id) } }

  let childIdx = 0
  for (const el of Object.values(elements).sort((a, b) => a.zIndex - b.zIndex)) {
    if (!el.visible) {
      const x = map.get(el.id)
      if (x) { layer.removeChild(x); x.destroy({ children: true }); map.delete(el.id) }
      continue
    }

    const sel = selIds.includes(el.id)
    let empHash = ''
    if ('assignedEmployeeId' in el && el.assignedEmployeeId) {
      const emp = emps[el.assignedEmployeeId as string]
      if (emp) empHash = `${emp.name}:${emp.department}`
    } else if ('assignedEmployeeIds' in el && Array.isArray(el.assignedEmployeeIds)) {
      empHash = el.assignedEmployeeIds.map(id => {
        const emp = id ? emps[id as string] : null
        return emp ? `${emp.name}:${emp.department}` : ''
      }).join(',')
    }

    const existing = map.get(el.id) as StatefulContainer | undefined
    let c = existing

    if (existing) {
      const state = existing._state
      if (state && state.el === el && state.sel === sel && state.empHash === empHash) {
        // Unchanged, keep c = existing
      } else if (state && state.sel === sel && state.empHash === empHash && isOnlyPositionChanged(state.el, el)) {
        // Only position/rotation changed, just update layout without rebuilding
        updateContainerLayout(existing, el)
        existing._state!.el = el
      } else {
        layer.removeChild(existing); existing.destroy({ children: true }); map.delete(el.id)
        try {
          c = buildEl(el, selIds, setSelIds, emps, dragRef) as StatefulContainer
        } catch (error) {
          console.error('[PixiStage] Failed to rebuild element', { id: el.id, type: el.type, error })
          failures += 1
          c = undefined
        }
        if (!c) continue
        c._state = { el, sel, empHash }
        map.set(el.id, c); layer.addChild(c)
      }
    } else {
      try {
        c = buildEl(el, selIds, setSelIds, emps, dragRef) as StatefulContainer
      } catch (error) {
        console.error('[PixiStage] Failed to build element', { id: el.id, type: el.type, error })
        failures += 1
        c = undefined
      }
      if (!c) continue
      c._state = { el, sel, empHash }
      map.set(el.id, c); layer.addChild(c)
    }

    if (c) {
      if (layer.getChildIndex(c) !== childIdx) {
        layer.setChildIndex(c, childIdx)
      }
      childIdx++
    }
  }
  return failures
}

function buildEl(
  el: CanvasElement, selIds: string[],
  setSelIds: (ids: string[]) => void,
  emps: Record<string, Employee>,
  dragRef: React.MutableRefObject<{ id: string; action?: 'move' | 'resize'; handleIndex?: number; swx: number; swy: number; sex: number; sey: number; sw?: number; sh?: number } | null>,
): Container {
  const w = Number.isFinite(el.width) ? Math.max(0, el.width) : 0
  const h = Number.isFinite(el.height) ? Math.max(0, el.height) : 0
  const c = new Container()
  c.label = createPixiNodeId(el.id)
  c.name = createPixiNodeId(el.id)
  const centerAnchored = isCenterAnchoredElement(el)
  c.x = el.x
  c.y = el.y
  if (centerAnchored) {
    c.pivot.set(w / 2, h / 2)
  }
  c.rotation = (el.rotation * Math.PI) / 180
  c.alpha = el.style?.opacity ?? 1
  const sel = selIds.includes(el.id); const g = new Graphics()

  const t = el.type as string
  if (t === 'workstation') {
    renderWorkstation(g, c, el as WorkstationElement, emps, sel)
  } else if (isStrokeOnlyBlock(el.type)) {
    renderWall(g, el as Parameters<typeof renderWall>[1], sel)
  } else if (DESK_BLOCK_TYPES.has(t)) {
    renderDesk(g, el as DeskElement | PrivateOfficeElement, sel)
  } else if (TABLE_BLOCK_TYPES.has(t)) {
    renderTable(g, el as Parameters<typeof renderTable>[1], sel)
  } else if (ROOM_BLOCK_TYPES.has(t)) {
    renderRoom(c, el as Parameters<typeof renderRoom>[1], sel)
  } else if (['sofa','plant','printer','whiteboard','decor','ellipse','line-shape','rect-shape'].includes(t)) {
    renderFurniture(g, el, sel)
  } else {
    if (w > 0 && h > 0) {
      const f = parsePixiColor(el.style?.fill, 0x9ca3af)
      const s = parsePixiColor(el.style?.stroke, 0x6b7280)
      g.roundRect(0, 0, w, h, 3).fill({ color: f }).stroke({ color: sel ? 0x7c3aed : s, width: sel ? 2 : 1 })
    }
  }
  if (!ROOM_BLOCK_TYPES.has(t)) c.addChild(g)

  // Seat label — single-seat desks only
  if (DESK_BLOCK_TYPES.has(t) && t !== 'workstation') {
    const aid = (el as DeskElement).assignedEmployeeId
    if (aid && emps[aid]) {
      const emp = emps[aid]; const dc = deptColor(emp.department)
      const bw = Math.min(w - 4, 80); const bg = new Graphics()
      bg.roundRect(w / 2 - bw / 2, -18, bw, 14, 3).fill({ color: dc })
      c.addChild(bg)
      const t = new Text({ text: emp.name.split(' ')[0], style: SEAT_STYLE })
      t.x = w / 2 - t.width / 2; t.y = -17; c.addChild(t)
    }
  }

  c.eventMode = 'static'
  c.cursor = el.locked ? 'pointer' : 'grab'
  c.on('pointerdown', (e: FederatedPointerEvent) => {
    e.stopPropagation()
    const multi = e.ctrlKey || e.metaKey || e.shiftKey
    const cur = useUIStore.getState().selectedIds
    setSelIds(multi ? (cur.includes(el.id) ? cur.filter(i => i !== el.id) : [...cur, el.id]) : [el.id])
    if (el.locked) return
    const wp = c.parent?.toLocal(e.global)
    if (wp) {
      dragRef.current = { id: el.id, action: 'move', swx: wp.x, swy: wp.y, sex: el.x, sey: el.y }
      c.cursor = 'grabbing'
    }
  })
  c.on('pointerup', () => { if (dragRef.current?.action === 'move') dragRef.current = null; c.cursor = el.locked ? 'pointer' : 'grab' })
  c.on('pointerupoutside', () => { if (dragRef.current?.action === 'move') dragRef.current = null; c.cursor = el.locked ? 'pointer' : 'grab' })
  return c
}

function fitWorldToElements(
  world: Container,
  elements: Record<string, CanvasElement>,
  viewportW: number,
  viewportH: number,
): void {
  const visible = Object.values(elements).filter((el) => el.visible)
  if (visible.length === 0 || viewportW <= 0 || viewportH <= 0) return

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const el of visible) {
    const w = Number.isFinite(el.width) ? Math.max(0, el.width) : 0
    const h = Number.isFinite(el.height) ? Math.max(0, el.height) : 0
    if (isCenterAnchoredElement(el)) {
      minX = Math.min(minX, el.x - w / 2)
      minY = Math.min(minY, el.y - h / 2)
      maxX = Math.max(maxX, el.x + w / 2)
      maxY = Math.max(maxY, el.y + h / 2)
    } else {
      minX = Math.min(minX, el.x)
      minY = Math.min(minY, el.y)
      maxX = Math.max(maxX, el.x + w)
      maxY = Math.max(maxY, el.y + h)
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) return

  const contentW = Math.max(1, maxX - minX)
  const contentH = Math.max(1, maxY - minY)
  const margin = 48
  const fitScale = Math.min(
    (viewportW - margin * 2) / contentW,
    (viewportH - margin * 2) / contentH,
    2.5,
  )
  const scale = Number.isFinite(fitScale) ? Math.max(0.15, fitScale) : 1

  world.scale.set(scale, scale)
  world.x = viewportW / 2 - (minX + contentW / 2) * scale
  world.y = viewportH / 2 - (minY + contentH / 2) * scale
}

function isCenterAnchoredElement(el: CanvasElement): boolean {
  return isCenterAnchoredBlock(el.type)
}

function isOnlyPositionChanged(a: CanvasElement, b: CanvasElement): boolean {
  const keysA = Object.keys(a) as (keyof CanvasElement)[]
  const keysB = Object.keys(b) as (keyof CanvasElement)[]
  if (keysA.length !== keysB.length) return false
  for (const k of keysA) {
    if (k === 'x' || k === 'y' || k === 'rotation') continue
    if (a[k] !== b[k]) return false
  }
  return true
}

function updateContainerLayout(c: Container, el: CanvasElement) {
  const w = Number.isFinite(el.width) ? Math.max(0, el.width) : 0
  const h = Number.isFinite(el.height) ? Math.max(0, el.height) : 0
  const centerAnchored = isCenterAnchoredElement(el)
  
  c.x = el.x
  c.y = el.y
  if (centerAnchored) {
    c.pivot.set(w / 2, h / 2)
  } else {
    c.pivot.set(0, 0)
  }
  c.rotation = (el.rotation * Math.PI) / 180
}
