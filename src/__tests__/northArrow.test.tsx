/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { NorthArrow } from '../components/editor/Canvas/NorthArrow'
import { useCanvasStore } from '../stores/canvasStore'
import { useElementsStore } from '../stores/elementsStore'
import { useFloorStore } from '../stores/floorStore'
import { useUIStore } from '../stores/uiStore'
import { switchToFloor } from '../lib/seatAssignment'
import { DEFAULT_CANVAS_SETTINGS } from '../types/project'

// `useCan` proxies to the project store + permissions table. Mocking it
// directly lets each test pin the `editMap` answer without reaching for
// realistic role/membership setup. Same pattern as planHealthPill.test.tsx.
const useCanMock = vi.fn((_action: string): boolean => true)
vi.mock('../hooks/useCan', () => ({
  useCan: (action: string) => useCanMock(action),
}))

beforeEach(() => {
  useCanMock.mockImplementation(() => true)
  useCanvasStore.setState({
    settings: { ...DEFAULT_CANVAS_SETTINGS, northRotation: 0 },
  })
  useElementsStore.setState({ elements: {} })
  useFloorStore.setState({
    floors: [
      { id: 'floor-1', name: 'Floor 1', order: 0, elements: {} },
      { id: 'floor-2', name: 'Floor 2', order: 1, elements: {} },
    ],
    activeFloorId: 'floor-1',
  })
  useUIStore.setState({ presentationMode: false })
})

describe('NorthArrow', () => {
  it('renders the compass affordance', () => {
    render(<NorthArrow />)
    expect(screen.getByTestId('north-arrow')).toBeInTheDocument()
  })

  it('anchors away from the admin HUD zone', () => {
    render(<NorthArrow />)
    const arrow = screen.getByTestId('north-arrow')
    expect(arrow).toHaveAttribute('data-compass-anchor', 'top-right')
    expect(arrow.className).toContain('right-4')
    expect(arrow.className).not.toContain('left-4')
  })

  it('keeps the north label readable outside the rotating needle', () => {
    render(<NorthArrow />)
    expect(screen.getByText('N')).toBeInTheDocument()
  })

  it('is hidden in presentation mode', () => {
    useUIStore.setState({ presentationMode: true })
    render(<NorthArrow />)
    expect(screen.queryByTestId('north-arrow')).not.toBeInTheDocument()
  })

  it('Right/Up arrow rotates clockwise by 5°', () => {
    render(<NorthArrow />)
    const arrow = screen.getByTestId('north-arrow')
    fireEvent.keyDown(arrow, { key: 'ArrowRight' })
    expect(useCanvasStore.getState().settings.northRotation).toBe(5)
    fireEvent.keyDown(arrow, { key: 'ArrowUp' })
    expect(useCanvasStore.getState().settings.northRotation).toBe(10)
  })

  it('Left/Down arrow rotates counterclockwise by 5° and wraps below zero', () => {
    render(<NorthArrow />)
    const arrow = screen.getByTestId('north-arrow')
    fireEvent.keyDown(arrow, { key: 'ArrowLeft' })
    // 0 - 5 wraps to 355
    expect(useCanvasStore.getState().settings.northRotation).toBe(355)
    fireEvent.keyDown(arrow, { key: 'ArrowDown' })
    expect(useCanvasStore.getState().settings.northRotation).toBe(350)
  })

  it('Home resets rotation to 0', () => {
    useCanvasStore.setState({
      settings: { ...useCanvasStore.getState().settings, northRotation: 137 },
    })
    render(<NorthArrow />)
    fireEvent.keyDown(screen.getByTestId('north-arrow'), { key: 'Home' })
    expect(useCanvasStore.getState().settings.northRotation).toBe(0)
  })

  it('aria-valuenow reflects current rotation', () => {
    useCanvasStore.setState({
      settings: { ...useCanvasStore.getState().settings, northRotation: 42 },
    })
    render(<NorthArrow />)
    const arrow = screen.getByTestId('north-arrow')
    expect(arrow.getAttribute('aria-valuenow')).toBe('42')
    expect(arrow.getAttribute('role')).toBe('slider')
  })

  it('is read-only when useCan(editMap) is false (no slider semantics, no key edits)', () => {
    useCanMock.mockImplementation(() => false)
    useCanvasStore.setState({
      settings: { ...useCanvasStore.getState().settings, northRotation: 30 },
    })
    render(<NorthArrow />)
    const arrow = screen.getByTestId('north-arrow')
    // No `slider` role so screen readers don't promise interactivity.
    expect(arrow.getAttribute('role')).toBeNull()
    expect(arrow.getAttribute('aria-valuenow')).toBeNull()
    // Arrow keys are no-ops.
    act(() => {
      fireEvent.keyDown(arrow, { key: 'ArrowRight' })
    })
    expect(useCanvasStore.getState().settings.northRotation).toBe(30)
  })

  it('normalizes legacy compass values and keeps them stable across floor switch + remount', async () => {
    useCanvasStore.setState({
      settings: {
        ...DEFAULT_CANVAS_SETTINGS,
        northRotation: 725 as any,
        showNorthArrow: 'yes' as any,
      },
    } as any)

    const { unmount } = render(<NorthArrow />)
    await waitFor(() => {
      expect(useCanvasStore.getState().settings.northRotation).toBe(5)
    })
    expect(useCanvasStore.getState().settings.showNorthArrow).toBe(true)

    act(() => {
      switchToFloor('floor-2')
    })
    expect(useCanvasStore.getState().settings.northRotation).toBe(5)
    expect(useCanvasStore.getState().settings.showNorthArrow).toBe(true)

    unmount()
    render(<NorthArrow />)
    expect(screen.getByTestId('north-arrow').getAttribute('aria-valuenow')).toBe('5')
  })

  it('preserves heading while visibility toggles and floors change', () => {
    useCanvasStore.setState({
      settings: {
        ...DEFAULT_CANVAS_SETTINGS,
        northRotation: 137,
        showNorthArrow: true,
      },
    })

    useCanvasStore.getState().toggleNorthArrow()
    expect(useCanvasStore.getState().settings.showNorthArrow).toBe(false)
    expect(useCanvasStore.getState().settings.northRotation).toBe(137)

    act(() => {
      switchToFloor('floor-2')
    })
    expect(useCanvasStore.getState().settings.showNorthArrow).toBe(false)
    expect(useCanvasStore.getState().settings.northRotation).toBe(137)
  })
})
