/**
 * PixiStatusBar - HUD overlay for PixiJS preview mode.
 */
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useElementsStore } from '../../../stores/elementsStore'
import type { PixiStageHandle } from './PixiStage'
import { blocksByCategory, isPolylineType } from '../../../blocks/registry'
import type { CanvasElement, ElementType } from '../../../types/elements'

interface PixiStatusBarProps {
  stageRef: RefObject<PixiStageHandle | null>
  onBackToMap?: () => void
}

const DESK_TYPES = new Set<string>(blocksByCategory('desk').filter((t) => t !== 'workstation'))
const WALL_TYPES = new Set<string>(blocksByCategory('wall'))
const TABLE_TYPES = new Set<string>(blocksByCategory('table'))
const ROOM_TYPES = new Set<string>(blocksByCategory('room'))

function isRenderableInPixi(el: CanvasElement): boolean {
  if (!el.visible) return false
  const t = el.type as string
  if (t === 'workstation') return el.width > 0 && el.height > 0
  if (WALL_TYPES.has(t) && isPolylineType(el.type as ElementType)) {
    return Array.isArray((el as { points?: unknown }).points)
  }
  if (DESK_TYPES.has(t) || TABLE_TYPES.has(t) || ROOM_TYPES.has(t)) {
    return el.width > 0 && el.height > 0
  }
  return el.width > 0 && el.height > 0
}

export function PixiStatusBar({ stageRef, onBackToMap }: PixiStatusBarProps) {
  const elements = useElementsStore((s) => s.elements)
  const renderableCount = useMemo(
    () => Object.values(elements).filter((el) => isRenderableInPixi(el)).length,
    [elements],
  )
  const [fps, setFps] = useState<number>(0)
  const [exporting, setExporting] = useState(false)
  const frameRef = useRef(0)
  const lastRef = useRef(performance.now())

  useEffect(() => {
    let id: number
    const tick = () => {
      frameRef.current++
      const now = performance.now()
      if (now - lastRef.current >= 1000) {
        setFps(Math.round((frameRef.current * 1000) / (now - lastRef.current)))
        frameRef.current = 0
        lastRef.current = now
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  const fpsColor = fps >= 55 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444'

  async function handleExport() {
    if (!stageRef.current) return
    setExporting(true)
    try {
      await stageRef.current.exportPng()
    } finally {
      setExporting(false)
    }
  }

  function handleBackToMap() {
    onBackToMap?.()
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(10,11,15,0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: 10,
        padding: '6px 14px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        color: '#9ba3b8',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        zIndex: 50,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
        color: '#fff',
        borderRadius: 5,
        padding: '2px 8px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
      }}>PIXI Editor</span>

      <Divider />

      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ color: fpsColor, fontWeight: 600 }}>{fps}</span>
        <span style={{ color: '#4b5563' }}> fps</span>
      </span>

      <Divider />

      <span>
        <span style={{ color: '#e8eaf0', fontWeight: 600 }}>{renderableCount}</span>
        <span style={{ color: '#4b5563' }}> renderable</span>
      </span>

      <Divider />
      <span style={{ color: '#34d399', fontSize: 11, fontWeight: 600 }}>editable</span>

      <Divider />

      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        style={{
          background: 'transparent',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: 6,
          color: exporting ? '#4b5563' : '#818cf8',
          padding: '2px 10px',
          fontSize: 11,
          fontWeight: 600,
          cursor: exporting ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
        }}
        title="Export current view as PNG"
      >
        {exporting ? 'Exporting...' : 'PNG'}
      </button>

      <button
        type="button"
        onClick={handleBackToMap}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#9ba3b8',
          padding: '2px 6px',
          fontSize: 11,
          cursor: 'pointer',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#e8eaf0')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#9ba3b8')}
        title="Return to the Konva map editor"
      >
        Back to 2D
      </button>
    </div>
  )
}

function Divider() {
  return (
    <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', display: 'inline-block' }} />
  )
}
