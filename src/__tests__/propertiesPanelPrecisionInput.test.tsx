/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PropertiesPanel } from '../components/editor/RightSidebar/PropertiesPanel'
import { useElementsStore } from '../stores/elementsStore'
import { useUIStore } from '../stores/uiStore'
import { useFloorStore } from '../stores/floorStore'
import { useProjectStore } from '../stores/projectStore'
import { useCanvasStore } from '../stores/canvasStore'
import { DEFAULT_CANVAS_SETTINGS } from '../types/project'
import type { DecorElement, WallElement } from '../types/elements'

function renderPanel() {
  return render(
    <MemoryRouter initialEntries={['/t/acme/o/hq/map']}>
      <Routes>
        <Route path="/t/:teamSlug/o/:officeSlug/*" element={<PropertiesPanel />} />
      </Routes>
    </MemoryRouter>,
  )
}

function makeDecor(id: string, width = 60): DecorElement {
  return {
    id,
    type: 'decor',
    shape: 'armchair',
    x: 0,
    y: 0,
    width,
    height: 40,
    rotation: 0,
    locked: false,
    groupId: null,
    zIndex: 1,
    label: 'Decor',
    visible: true,
    style: { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 },
  }
}

function makeWall(id: string): WallElement {
  return {
    id,
    type: 'wall',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    locked: false,
    groupId: null,
    zIndex: 1,
    label: 'Wall',
    visible: true,
    style: { fill: '#000', stroke: '#111827', strokeWidth: 6, opacity: 1 },
    points: [0, 0, 100, 0],
    thickness: 6,
    connectedWallIds: [],
    wallType: 'solid',
  }
}

function wallLength(points: number[]): number {
  let total = 0
  for (let i = 0; i + 3 < points.length; i += 2) {
    total += Math.hypot(points[i + 2] - points[i], points[i + 3] - points[i + 1])
  }
  return total
}

beforeEach(() => {
  useElementsStore.setState({ elements: {} })
  useUIStore.setState({ selectedIds: [] } as any)
  useFloorStore.setState({
    floors: [{ id: 'f1', name: 'Floor 1', order: 0, elements: {} }],
    activeFloorId: 'f1',
  } as any)
  useProjectStore.setState({
    currentOfficeRole: 'editor',
    impersonatedRole: null,
  } as any)
  useCanvasStore.setState({
    settings: { ...DEFAULT_CANVAS_SETTINGS, scale: 0.5, scaleUnit: 'ft' },
  } as any)
})

describe('PropertiesPanel precision numeric input', () => {
  it('parses width with explicit real-world units and updates immediately', () => {
    useElementsStore.setState({ elements: { d1: makeDecor('d1', 60) } })
    useUIStore.setState({ selectedIds: ['d1'] } as any)
    renderPanel()

    fireEvent.change(screen.getByTestId('properties-layout-width'), { target: { value: '12ft' } })

    expect((useElementsStore.getState().elements.d1 as DecorElement).width).toBeCloseTo(24, 6)
  })

  it('rejects invalid width text and restores the previous value on blur', () => {
    useElementsStore.setState({ elements: { d1: makeDecor('d1', 60) } })
    useUIStore.setState({ selectedIds: ['d1'] } as any)
    renderPanel()

    const widthInput = screen.getByTestId('properties-layout-width') as HTMLInputElement
    fireEvent.change(widthInput, { target: { value: 'abc' } })
    expect((useElementsStore.getState().elements.d1 as DecorElement).width).toBe(60)

    fireEvent.blur(widthInput)
    expect(widthInput.value).toBe('60')
  })

  it('normalizes rotation input to deterministic 0..359 degrees', () => {
    useElementsStore.setState({ elements: { d1: makeDecor('d1', 60) } })
    useUIStore.setState({ selectedIds: ['d1'] } as any)
    renderPanel()

    fireEvent.change(screen.getByTestId('properties-layout-rotation'), { target: { value: '-90deg' } })

    expect((useElementsStore.getState().elements.d1 as DecorElement).rotation).toBe(270)
  })

  it('updates wall length by scaling points from the first vertex', () => {
    useElementsStore.setState({ elements: { w1: makeWall('w1') } })
    useUIStore.setState({ selectedIds: ['w1'] } as any)
    renderPanel()

    fireEvent.change(screen.getByTestId('properties-wall-length'), { target: { value: '25ft' } })

    const wall = useElementsStore.getState().elements.w1 as WallElement
    expect(wallLength(wall.points)).toBeCloseTo(50, 6)
  })

  it('rejects out-of-range wall thickness values', () => {
    useElementsStore.setState({ elements: { w1: makeWall('w1') } })
    useUIStore.setState({ selectedIds: ['w1'] } as any)
    renderPanel()

    fireEvent.change(screen.getByTestId('properties-wall-thickness'), { target: { value: '21' } })

    expect((useElementsStore.getState().elements.w1 as WallElement).thickness).toBe(6)
  })

  it('broadcasts valid width edits to all selected elements', () => {
    useElementsStore.setState({
      elements: {
        a: makeDecor('a', 12),
        b: makeDecor('b', 30),
      },
    })
    useUIStore.setState({ selectedIds: ['a', 'b'] } as any)
    renderPanel()

    fireEvent.change(screen.getByTestId('properties-multi-width'), { target: { value: '8ft' } })

    const elements = useElementsStore.getState().elements
    expect((elements.a as DecorElement).width).toBeCloseTo(16, 6)
    expect((elements.b as DecorElement).width).toBeCloseTo(16, 6)
  })
})
