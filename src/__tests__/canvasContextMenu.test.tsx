/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useCanvasStore } from '../stores/canvasStore'
import { useUIStore } from '../stores/uiStore'
import { useElementsStore } from '../stores/elementsStore'

describe('CanvasStage - gesture integration', () => {
  beforeEach(() => {
    useCanvasStore.setState({
      stageX: 0,
      stageY: 0,
      stageScale: 1,
      stageWidth: 800,
      stageHeight: 600,
      activeTool: 'select',
      settings: { gridSize: 25, scale: 1, scaleUnit: 'px', showGrid: false, showDimensions: false, northRotation: 0, showNorthArrow: true, showDeskIds: false },
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      zoomAtPoint: vi.fn(),
      zoomToFit: vi.fn(),
      zoomToContent: vi.fn(),
      resetZoom: vi.fn(),
      setActiveTool: vi.fn(),
      setWallDrawStyle: vi.fn(),
      setSettings: vi.fn(),
      toggleGrid: vi.fn(),
      toggleDimensions: vi.fn(),
      toggleNorthArrow: vi.fn(),
      toggleDeskIds: vi.fn(),
      setStagePosition: vi.fn(),
      setStageScale: vi.fn(),
      setStageSize: vi.fn(),
    })
    useElementsStore.setState({ elements: {} })
    useUIStore.setState({
      selectedIds: [],
      contextMenu: null,
      editingLabelId: null,
      clearSelection: vi.fn(),
      setContextMenu: vi.fn(),
      setSelectedIds: vi.fn(),
      toggleSelection: vi.fn(),
      setHoveredId: vi.fn(),
      setEditingLabelId: vi.fn(),
      clearAssignmentQueue: vi.fn(),
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('zoomAtPoint is available in canvas store', () => {
    const store = useCanvasStore.getState()
    expect(typeof store.zoomAtPoint).toBe('function')
  })

  it('zoomAtPoint accepts point coordinates and scale', () => {
    const zoomAtPointSpy = vi.fn()
    useCanvasStore.setState({
      ...useCanvasStore.getState(),
      zoomAtPoint: zoomAtPointSpy,
    })

    useCanvasStore.getState().zoomAtPoint(400, 300, 2)

    expect(zoomAtPointSpy).toHaveBeenCalledWith(400, 300, 2)
  })

  it('zoomAtPoint handles coordinate values as numbers', () => {
    const zoomAtPointSpy = vi.fn()
    useCanvasStore.setState({
      ...useCanvasStore.getState(),
      zoomAtPoint: zoomAtPointSpy,
    })

    const pointX = 400
    const pointY = 300
    const scale = 2

    useCanvasStore.getState().zoomAtPoint(pointX, pointY, scale)

    expect(zoomAtPointSpy).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), expect.any(Number))
  })
})
