import { useElementsStore } from '../../stores/elementsStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { useUIStore } from '../../stores/uiStore'
import { useMemo, useCallback, useRef, useState, memo, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Minimize2, Maximize2 } from 'lucide-react'
import { elementBounds } from '../../lib/elementBounds'

const MINIMAP_WIDTH = 180
const MINIMAP_HEIGHT = 120
const COLLAPSED_SIZE = 40
const MINIMAP_ANCHOR_CLASS = 'cursor-grab select-none overflow-hidden touch-none active:cursor-grabbing bg-white dark:bg-gray-900 right-24 bottom-24'

interface Tile {
  id: string
  bounds: { x: number; y: number; width: number; height: number }
  fill: string
  stroke: string
}

interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

function useTiles(): Tile[] {
  const elements = useElementsStore((s) => s.elements)
  return useMemo(() => {
    const out: Tile[] = []
    for (const el of Object.values(elements)) {
      const b = elementBounds(el)
      if (!b || (b.width === 0 && b.height === 0)) continue
      out.push({
        id: el.id,
        bounds: b,
        fill: el.style.fill,
        stroke: el.style.stroke,
      })
    }
    return out
  }, [elements])
}

function useBounds(tiles: Tile[]): Bounds {
  return useMemo(() => {
    if (tiles.length === 0) return { x: 0, y: 0, width: 800, height: 600 }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const t of tiles) {
      if (t.bounds.x < minX) minX = t.bounds.x
      if (t.bounds.y < minY) minY = t.bounds.y
      if (t.bounds.x + t.bounds.width > maxX) maxX = t.bounds.x + t.bounds.width
      if (t.bounds.y + t.bounds.height > maxY) maxY = t.bounds.y + t.bounds.height
    }
    const padding = 100
    return { x: minX - padding, y: minY - padding, width: maxX - minX + padding * 2, height: maxY - minY + padding * 2 }
  }, [tiles])
}

const MinimapBackground = memo(function MinimapBackground({ tiles, bounds, minimapScale, selectedSet }: { tiles: Tile[]; bounds: Bounds; minimapScale: number; selectedSet: Set<string> }) {
  const unselected: Tile[] = []
  const selected: Tile[] = []
  for (const t of tiles) {
    if (selectedSet.has(t.id)) {
      selected.push(t)
    } else {
      unselected.push(t)
    }
  }
  return (
    <>
      {unselected.map((t) => (
        <rect
          key={t.id}
          x={(t.bounds.x - bounds.x) * minimapScale}
          y={(t.bounds.y - bounds.y) * minimapScale}
          width={Math.max(t.bounds.width * minimapScale, 1)}
          height={Math.max(t.bounds.height * minimapScale, 1)}
          fill={t.fill}
          stroke={t.stroke}
          strokeWidth={0.5}
        />
      ))}
      {selected.map((t) => (
        <rect
          key={t.id}
          x={(t.bounds.x - bounds.x) * minimapScale}
          y={(t.bounds.y - bounds.y) * minimapScale}
          width={Math.max(t.bounds.width * minimapScale, 2)}
          height={Math.max(t.bounds.height * minimapScale, 2)}
          fill="#3B82F6"
          stroke="#1D4ED8"
          strokeWidth={1}
          data-testid={`minimap-selected-${t.id}`}
        />
      ))}
    </>
  )
})

function MinimapViewport({ bounds, minimapScale }: { bounds: Bounds; minimapScale: number }) {
  const stageX = useCanvasStore((s) => s.stageX)
  const stageY = useCanvasStore((s) => s.stageY)
  const stageScale = useCanvasStore((s) => s.stageScale)
  const stageWidth = useCanvasStore((s) => s.stageWidth)
  const stageHeight = useCanvasStore((s) => s.stageHeight)
  const w = stageWidth > 0 ? stageWidth : window.innerWidth
  const h = stageHeight > 0 ? stageHeight : window.innerHeight
  return <rect x={(-stageX / stageScale - bounds.x) * minimapScale} y={(-stageY / stageScale - bounds.y) * minimapScale} width={Math.max((w / stageScale) * minimapScale, 10)} height={Math.max((h / stageScale) * minimapScale, 8)} fill="rgba(59, 130, 246, 0.15)" stroke="#3B82F6" strokeWidth={1.5} rx={2} />
}

export function Minimap() {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const { setStagePosition } = useCanvasStore(useShallow((s) => ({ setStagePosition: s.setStagePosition })))
  const ref = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)
  const tiles = useTiles()
  const bounds = useBounds(tiles)
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const minimapScale = Math.min(MINIMAP_WIDTH / bounds.width, MINIMAP_HEIGHT / bounds.height)
  const dragStateRef = useRef<{ active: boolean; pending: boolean; clientX: number; clientY: number }>({ active: false, pending: false, clientX: 0, clientY: 0 })
  const rafIdRef = useRef<number | null>(null)
  const moveHandlerRef = useRef<((event: PointerEvent) => void) | null>(null)
  const upHandlerRef = useRef<(() => void) | null>(null)

  const cleanupWindowHandlers = useCallback(() => {
    if (moveHandlerRef.current) { window.removeEventListener('pointermove', moveHandlerRef.current); moveHandlerRef.current = null }
    if (upHandlerRef.current) { window.removeEventListener('pointerup', upHandlerRef.current); window.removeEventListener('pointercancel', upHandlerRef.current); upHandlerRef.current = null }
  }, [])
  const applyPan = useCallback(() => {
    const state = dragStateRef.current
    state.pending = false
    if (!state.active) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const localX = state.clientX - rect.left
    const localY = state.clientY - rect.top
    const cs = useCanvasStore.getState()
    const w = cs.stageWidth > 0 ? cs.stageWidth : window.innerWidth
    const h = cs.stageHeight > 0 ? cs.stageHeight : window.innerHeight
    const canvasX = localX / minimapScale + bounds.x
    const canvasY = localY / minimapScale + bounds.y
    setStagePosition(-canvasX * cs.stageScale + w / 2, -canvasY * cs.stageScale + h / 2)
  }, [bounds, minimapScale, setStagePosition])
  const scheduleApply = useCallback(() => {
    const state = dragStateRef.current
    if (state.pending) return
    state.pending = true
    rafIdRef.current = requestAnimationFrame(() => { rafIdRef.current = null; applyPan() })
  }, [applyPan])
  const stopDragging = useCallback(() => {
    const state = dragStateRef.current
    state.active = false
    state.pending = false
    cleanupWindowHandlers()
    if (rafIdRef.current !== null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null }
  }, [cleanupWindowHandlers])
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const target = e.target as HTMLElement | null
    if (target && target.closest('[data-minimap-collapse-button]')) return
    const state = dragStateRef.current
    stopDragging()
    state.active = true
    state.clientX = e.clientX
    state.clientY = e.clientY
    scheduleApply()
    const onMove = (moveEvent: PointerEvent) => { if (!state.active) return; state.clientX = moveEvent.clientX; state.clientY = moveEvent.clientY; scheduleApply() }
    const onUp = () => stopDragging()
    moveHandlerRef.current = onMove
    upHandlerRef.current = onUp
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }, [scheduleApply, stopDragging])
  useEffect(() => () => stopDragging(), [stopDragging])
  const shellClass = MINIMAP_ANCHOR_CLASS
  if (collapsed) {
    return <div ref={ref} role="region" aria-label="Canvas overview" data-minimap-anchor="bottom-right-offset" className={shellClass} style={{ width: COLLAPSED_SIZE, height: COLLAPSED_SIZE }}><button type="button" data-minimap-collapse-button onClick={() => setCollapsed(false)} aria-expanded={false} aria-label="Expand overview" className="flex h-full w-full items-center justify-center text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"><Maximize2 size={16} /></button></div>
  }
  return <div ref={ref} role="region" aria-label="Canvas overview" data-minimap-anchor="bottom-right-offset" className={shellClass} style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }} onPointerDown={handlePointerDown}><svg width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT}><MinimapBackground tiles={tiles} bounds={bounds} minimapScale={minimapScale} selectedSet={selectedSet} /><MinimapViewport bounds={bounds} minimapScale={minimapScale} /></svg><button type="button" data-minimap-collapse-button onClick={(e) => { e.stopPropagation(); setCollapsed(true) }} aria-expanded={true} aria-label="Collapse overview" className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-sm bg-white/85 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900/85 dark:text-gray-300 dark:hover:bg-gray-800"><Minimize2 size={12} /></button></div>
}
