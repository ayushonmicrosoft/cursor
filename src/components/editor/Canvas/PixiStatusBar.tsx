/**
 * PixiStatusBar — HUD overlay for PixiJS mode.
 * Shown at the bottom of the canvas in pixi viewMode.
 * Features: element count, FPS counter, export PNG, back-to-Konva button.
 */
import { useEffect, useRef, useState, type RefObject } from 'react'
import { useElementsStore } from '../../../stores/elementsStore'
import { useUIStore } from '../../../stores/uiStore'
import type { PixiStageHandle } from './PixiStage'

interface PixiStatusBarProps {
  stageRef: RefObject<PixiStageHandle | null>
}

export function PixiStatusBar({ stageRef }: PixiStatusBarProps) {
  const setViewMode = useUIStore((s) => s.setViewMode)
  const elementCount = useElementsStore((s) => Object.keys(s.elements).length)
  const [fps, setFps] = useState<number>(0)
  const [exporting, setExporting] = useState(false)
  const frameRef = useRef(0)
  const lastRef = useRef(performance.now())

  // FPS via rAF
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

  const fpsColor =
    fps >= 55 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444'

  async function handleExport() {
    if (!stageRef.current) return
    setExporting(true)
    try {
      await stageRef.current.exportPng()
    } finally {
      setExporting(false)
    }
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
      {/* Mode badge */}
      <span style={{
        background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
        color: '#fff',
        borderRadius: 5,
        padding: '2px 8px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
      }}>⚡ PIXI WebGL</span>

      <Divider />

      {/* FPS */}
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ color: fpsColor, fontWeight: 600 }}>{fps}</span>
        <span style={{ color: '#4b5563' }}> fps</span>
      </span>

      <Divider />

      {/* Element count */}
      <span>
        <span style={{ color: '#e8eaf0', fontWeight: 600 }}>{elementCount}</span>
        <span style={{ color: '#4b5563' }}> elements</span>
      </span>

      <Divider />

      {/* Export */}
      <button
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
        {exporting ? 'Exporting…' : '↓ PNG'}
      </button>

      {/* Back to Konva */}
      <button
        onClick={() => setViewMode('2d')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#4b5563',
          padding: '2px 6px',
          fontSize: 11,
          cursor: 'pointer',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#e8eaf0')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#4b5563')}
        title="Switch back to Konva 2D renderer"
      >
        ← Konva
      </button>
    </div>
  )
}

function Divider() {
  return (
    <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', display: 'inline-block' }} />
  )
}
