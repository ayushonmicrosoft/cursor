import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { MIN_EDITOR_LAYOUT_WIDTH_PX } from './NarrowScreenBanner'
import { PixiToolbarHost } from './pixi/PixiToolbarHost'
import { PixiViewport } from './pixi/PixiViewport'
import { classifyPixiError } from './pixiPreviewErrorModel'
import type { PixiStageError, PixiStageHandle, PixiViewportState } from './Canvas/PixiStage'

const PIXI_INSPECTION_MIN_WIDTH_PX = 375

function readViewportWidth(): number {
  if (typeof window === 'undefined') return MIN_EDITOR_LAYOUT_WIDTH_PX
  return window.innerWidth
}

interface PixiPreviewPageProps {
  onEngineFailure?: (reason: string) => void
}

export function PixiPreviewPage({ onEngineFailure }: PixiPreviewPageProps = {}) {
  const navigate = useNavigate()
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen)
  const setRightSidebarOpen = useUIStore((s) => s.setRightSidebarOpen)
  const setRenderEngine = useUIStore((s) => s.setRenderEngine)
  const dockableToolbarLayouts = useUIStore((s) => s.dockableToolbarLayouts)
  const dockableToolbarVisibility = useUIStore((s) => s.dockableToolbarVisibility)
  const pixiStageRef = useRef<PixiStageHandle | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [error, setError] = useState<string | null>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [viewportWidth, setViewportWidth] = useState(() => readViewportWidth())
  const [viewport, setViewport] = useState<PixiViewportState>({ scale: 1, x: 0, y: 0 })
  const compactCollapseRef = useRef(false)
  const isCompactEditor = viewportWidth < MIN_EDITOR_LAYOUT_WIDTH_PX
  const leftToolsFloating = dockableToolbarLayouts['left-tools']?.mode === 'floating'
  const rightInspectorFloating = dockableToolbarLayouts['right-inspector']?.mode === 'floating'
  const leftToolsVisible = dockableToolbarVisibility['left-tools'] !== false
  const rightInspectorVisible = dockableToolbarVisibility['right-inspector'] !== false

  const handlePixiError = useCallback((errorEvent: PixiStageError) => {
    const normalized = classifyPixiError(errorEvent)
    setError(normalized.message)
    if (normalized.shouldFallback) {
      onEngineFailure?.(normalized.message)
    }
  }, [onEngineFailure])

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect()
    resizeObserverRef.current = null
    if (!node) return

    const measure = () => {
      const { width, height } = node.getBoundingClientRect()
      const newW = Math.max(0, Math.round(width))
      const newH = Math.max(0, Math.round(height))
      setSize(prev => prev.w === newW && prev.h === newH ? prev : { w: newW, h: newH })
    }

    const ro = new ResizeObserver(measure)
    ro.observe(node)
    resizeObserverRef.current = ro
    measure()
  }, [])

  useEffect(() => {
    return () => resizeObserverRef.current?.disconnect()
  }, [])

  useEffect(() => {
    setRenderEngine('pixi')
  }, [setRenderEngine])

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (isCompactEditor && rightSidebarOpen && !compactCollapseRef.current) {
      compactCollapseRef.current = true
      setRightSidebarOpen(false)
    } else if (!isCompactEditor && compactCollapseRef.current) {
      compactCollapseRef.current = false
      setRightSidebarOpen(true)
    }
  }, [isCompactEditor, rightSidebarOpen, setRightSidebarOpen])

  return (
    <PixiToolbarHost
      isCompactEditor={isCompactEditor}
      leftToolsVisible={leftToolsVisible}
      leftToolsFloating={leftToolsFloating}
      leftSidebarOpen={leftSidebarOpen}
      setLeftSidebarOpen={setLeftSidebarOpen}
      rightSidebarOpen={rightSidebarOpen}
      rightInspectorVisible={rightInspectorVisible}
      rightInspectorFloating={rightInspectorFloating}
    >
      <PixiViewport
        size={size}
        containerRef={containerRef}
        error={error}
        onPixiError={handlePixiError}
        pixiStageRef={pixiStageRef}
        viewport={viewport}
        onViewportChange={setViewport}
        onBackToMap={() => navigate('../map', { replace: true })}
        leftToolsVisible={leftToolsVisible}
        leftToolsFloating={leftToolsFloating}
        rightSidebarOpen={rightSidebarOpen}
        rightInspectorVisible={rightInspectorVisible}
        rightInspectorFloating={rightInspectorFloating}
        isCompactEditor={isCompactEditor}
        minWidthPx={PIXI_INSPECTION_MIN_WIDTH_PX}
      />
    </PixiToolbarHost>
  )
}
