import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CanvasStage } from './Canvas/CanvasStage'
import { KeyboardShortcutsOverlay } from './KeyboardShortcutsOverlay'
import { PresentationOverlay } from './PresentationOverlay'
import { MIN_EDITOR_LAYOUT_WIDTH_PX } from './NarrowScreenBanner'
import { KonvaToolbarHost } from './konva/KonvaToolbarHost'
import { KonvaViewport } from './konva/KonvaViewport'
import { useView3DEntry } from './view3d/useView3DEntry'
import { useUIStore } from '../../stores/uiStore'
import {
  normalizeNorthArrowVisibility,
  normalizeNorthRotation,
  useCanvasStore,
} from '../../stores/canvasStore'
import { useActiveFloor } from '../../stores/floorStore'
import { useElementsStore } from '../../stores/elementsStore'
import { useToastStore } from '../../stores/toastStore'

import { focusOnElement } from '../../lib/canvasFocus'

const CANVAS_INSPECTION_MIN_WIDTH_PX = 375

function readViewportWidth(): number {
  if (typeof window === 'undefined') return MIN_EDITOR_LAYOUT_WIDTH_PX
  return window.innerWidth
}

export function MapView() {
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen)
  const selectedIds = useUIStore((s) => s.selectedIds)
  const rightSidebarTab = useUIStore((s) => s.rightSidebarTab)
  const setRightSidebarOpen = useUIStore((s) => s.setRightSidebarOpen)
  const setRightSidebarTab = useUIStore((s) => s.setRightSidebarTab)
  const setDockableToolbarVisible = useUIStore((s) => s.setDockableToolbarVisible)
  const dockableToolbarVisibility = useUIStore((s) => s.dockableToolbarVisibility)
  const activeWorkspacePreset = useUIStore((s) => s.activeWorkspacePreset)
  const firstRunCoachOpen = useUIStore((s) => s.firstRunCoachOpen)
  const setFirstRunCoachOpen = useUIStore((s) => s.setFirstRunCoachOpen)
  const presentationMode = useUIStore((s) => s.presentationMode)
  const viewMode = useUIStore((s) => s.viewMode)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const setRenderEngine = useUIStore((s) => s.setRenderEngine)
  const setCanvasSettings = useCanvasStore((s) => s.setSettings)
  const northRotationRaw = useCanvasStore((s) => s.settings.northRotation)
  const showNorthArrowRaw = useCanvasStore((s) => s.settings.showNorthArrow)
  const showNorthArrow = normalizeNorthArrowVisibility(showNorthArrowRaw)
  const activeFloor = useActiveFloor()
  const elements = useElementsStore((s) => s.elements)
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewportWidth, setViewportWidth] = useState(() => readViewportWidth())
  const { ThreeDEntry, threeDLoadFailed, setThreeDLoadFailed } = useView3DEntry(viewMode)
  const previousSelectionCountRef = useRef(selectedIds.length)
  const collapsedSidebarForCompactRef = useRef(false)
  const wasCompactEditorRef = useRef(viewportWidth < MIN_EDITOR_LAYOUT_WIDTH_PX)

  const isCompactEditor = viewportWidth < MIN_EDITOR_LAYOUT_WIDTH_PX
  const leftToolsVisible = dockableToolbarVisibility['left-tools'] !== false
  const rightInspectorVisible = dockableToolbarVisibility['right-inspector'] !== false

  const showFirstRunCoach =
    firstRunCoachOpen || (selectedIds.length === 0 && !rightSidebarOpen)

  useEffect(() => {
    setRenderEngine('konva')
  }, [setRenderEngine])

  useEffect(() => {
    if (selectedIds.length === 0 && rightSidebarTab === 'properties') {
      setRightSidebarOpen(false)
    }

    if (activeWorkspacePreset !== 'admin') {
      try {
        if (localStorage.getItem('oandocraft.toolbar-visibility') === null) {
          setDockableToolbarVisible('admin-stats', false)
        }
      } catch {
        setDockableToolbarVisible('admin-stats', false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const wasCompactEditor = wasCompactEditorRef.current

    if (isCompactEditor && rightSidebarOpen && (!wasCompactEditor || !collapsedSidebarForCompactRef.current)) {
      collapsedSidebarForCompactRef.current = true
      setRightSidebarOpen(false)
    } else if (!isCompactEditor && wasCompactEditor && collapsedSidebarForCompactRef.current) {
      collapsedSidebarForCompactRef.current = false
      setRightSidebarOpen(true)
    }

    wasCompactEditorRef.current = isCompactEditor
  }, [isCompactEditor, rightSidebarOpen, setRightSidebarOpen])

  useEffect(() => {
    const previousSelectionCount = previousSelectionCountRef.current
    previousSelectionCountRef.current = selectedIds.length

    if (previousSelectionCount === 0 && selectedIds.length > 0) {
      if (rightSidebarTab === 'properties') {
        setRightSidebarOpen(true)
      } else if (!rightSidebarOpen) {
        setRightSidebarTab('properties')
      }
    }
  }, [rightSidebarOpen, rightSidebarTab, selectedIds.length, setRightSidebarOpen, setRightSidebarTab])

  useEffect(() => {
    const next: { showNorthArrow?: boolean; northRotation?: number } = {}

    if (showNorthArrowRaw !== undefined && typeof showNorthArrowRaw !== 'boolean') {
      next.showNorthArrow = normalizeNorthArrowVisibility(showNorthArrowRaw)
    }
    if (northRotationRaw !== undefined) {
      const normalized = normalizeNorthRotation(northRotationRaw)
      if (normalized !== northRotationRaw) {
        next.northRotation = normalized
      }
    }

    if (Object.keys(next).length > 0) {
      setCanvasSettings(next)
    }
  }, [northRotationRaw, setCanvasSettings, showNorthArrowRaw])

  useEffect(() => {
    const seatId = searchParams.get('seat')
    const focusId = searchParams.get('focus')
    if (!seatId && !focusId) return

    if (seatId || focusId) {
      const id = seatId || focusId
      const element = elements[id!]
      if (element) {
        useUIStore.getState().setSelectedIds([id!])
        focusOnElement(
          { x: element.x, y: element.y, width: element.width, height: element.height },
          id!,
        )
      }
    }

    const next = new URLSearchParams(searchParams)
    next.delete('floor')
    next.delete('seat')
    next.delete('focus')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!presentationMode) return
    try {
      if (localStorage.getItem('presentationModeHintSeen') === '1') return
      localStorage.setItem('presentationModeHintSeen', '1')
    } catch {
      return
    }
    useToastStore.getState().push({
      tone: 'info',
      title: 'Press Esc or P to exit presentation mode.',
    })
  }, [presentationMode])

  if (presentationMode) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen bg-white dark:bg-gray-900">
        <CanvasStage />
        <KeyboardShortcutsOverlay />
        <PresentationOverlay />
        <button
          onClick={() => useUIStore.getState().setPresentationMode(false)}
          className="absolute top-4 right-4 z-50 px-3 py-2 rounded-md bg-gray-900/80 hover:bg-gray-900 text-white text-sm font-medium shadow-lg backdrop-blur-sm flex items-center gap-2 transition-colors"
          title="Exit presentation mode (Esc or P)"
          aria-label="Exit presentation mode"
        >
          <span>Exit</span>
          <kbd className="text-[10px] font-mono bg-white/20 dark:bg-gray-900/20 px-1.5 py-0.5 rounded">Esc</kbd>
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 min-w-0 overflow-hidden">
        <div
          className="flex min-w-0 flex-1 overflow-hidden"
          style={{ minWidth: `${CANVAS_INSPECTION_MIN_WIDTH_PX}px` }}
          data-editor-min-width={CANVAS_INSPECTION_MIN_WIDTH_PX}
        >
          <KonvaToolbarHost
            leftToolsVisible={leftToolsVisible}
            rightInspectorVisible={rightInspectorVisible}
            rightSidebarOpen={rightSidebarOpen}
          >
            <KonvaViewport
              viewMode={viewMode}
              ThreeDEntry={ThreeDEntry}
              threeDLoadFailed={threeDLoadFailed}
              activeFloor={activeFloor}
              elements={elements}
              showNorthArrow={showNorthArrow}
              showFirstRunCoach={showFirstRunCoach}
              firstRunCoachOpen={firstRunCoachOpen}
              setFirstRunCoachOpen={setFirstRunCoachOpen}
              setViewMode={setViewMode}
              setThreeDLoadFailed={setThreeDLoadFailed}
            />
          </KonvaToolbarHost>
        </div>
      </div>
    </>
  )
}
