import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MapView } from '../components/editor/MapView'
import { useElementsStore } from '../stores/elementsStore'
import { useFloorStore } from '../stores/floorStore'
import { useUIStore } from '../stores/uiStore'
import type { ReactNode } from 'react'

vi.mock('../components/editor/FloorSwitcher', () => ({
  FloorSwitcher: () => null,
}))
vi.mock('../components/editor/LeftSidebar/ToolSelector', () => ({
  ToolSelector: () => <div>tool-selector</div>,
}))
vi.mock('../components/editor/LeftSidebar/LayerVisibilityPanel', () => ({
  LayerVisibilityPanel: () => <div>layers</div>,
}))
vi.mock('../components/editor/LeftSidebar/ElementLibrary', () => ({
  ElementLibrary: () => <div>library</div>,
}))
vi.mock('../components/editor/LeftSidebar/CollapsibleSection', () => ({
  CollapsibleSection: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
vi.mock('../components/editor/RightSidebar/RightSidebar', () => ({
  RightSidebar: () => <div>right-sidebar</div>,
}))
vi.mock('../components/editor/RightSidebar/SidebarToggle', () => ({
  SidebarToggle: () => <button type="button">toggle-sidebar</button>,
}))
vi.mock('../components/editor/StatusBar', () => ({
  StatusBar: () => null,
}))
vi.mock('../components/editor/Canvas/CanvasStage', () => ({
  CanvasStage: () => null,
}))
vi.mock('../components/editor/KeyboardShortcutsOverlay', () => ({
  KeyboardShortcutsOverlay: () => null,
}))
vi.mock('../components/editor/PresentationOverlay', () => ({
  PresentationOverlay: () => null,
}))
vi.mock('../components/editor/Minimap', () => ({
  Minimap: () => null,
}))
vi.mock('../components/editor/Canvas/CanvasActionDock', () => ({
  CanvasActionDock: () => null,
}))
vi.mock('../components/editor/Canvas/CanvasScaleBar', () => ({
  CanvasScaleBar: () => null,
}))
vi.mock('../components/editor/Canvas/NorthArrow', () => ({
  NorthArrow: () => null,
}))
vi.mock('../components/editor/Canvas/AlignDistributeToolbar', () => ({
  AlignDistributeToolbar: () => null,
}))
vi.mock('../components/editor/Canvas/ElementHoverCard', () => ({
  ElementHoverCard: () => null,
}))
vi.mock('../components/editor/FirstRunCoach', () => ({
  FirstRunCoach: () => null,
}))
vi.mock('../components/editor/AdminStatsToolbar', () => ({
  AdminStatsToolbar: () => null,
}))

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

function renderMapView() {
  return render(
    <MemoryRouter initialEntries={['/t/acme/o/hq/map']}>
      <Routes>
        <Route path="/t/:teamSlug/o/:officeSlug/map" element={<MapView />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  setViewportWidth(1366)
  useElementsStore.setState({ elements: {} } as never)
  useFloorStore.setState({
    floors: [{ id: 'f1', name: 'Floor 1', order: 0, elements: {} }],
    activeFloorId: 'f1',
  } as never)
  useUIStore.setState({
    rightSidebarOpen: true,
    rightSidebarTab: 'people',
    selectedIds: [],
    presentationMode: false,
    viewMode: '2d',
  } as never)
})

describe('MapView responsive layout', () => {
  it('collapses editor sidebars below minimum width', async () => {
    setViewportWidth(1024)
    renderMapView()

    expect(screen.queryByTestId('mapview-left-sidebar')).not.toBeInTheDocument()
    await waitFor(() => {
      expect(useUIStore.getState().rightSidebarOpen).toBe(false)
    })
  })

  it('shows right sidebar as overlay on narrow screens when reopened', async () => {
    setViewportWidth(1024)
    renderMapView()
    await waitFor(() => {
      expect(useUIStore.getState().rightSidebarOpen).toBe(false)
    })

    act(() => {
      useUIStore.getState().setRightSidebarOpen(true)
    })

    expect(screen.getByTestId('mapview-right-sidebar-overlay')).toBeInTheDocument()
    expect(screen.queryByTestId('mapview-right-sidebar-docked')).not.toBeInTheDocument()
  })

  it('keeps sidebars docked at desktop widths', () => {
    setViewportWidth(1366)
    renderMapView()

    expect(screen.getByTestId('mapview-left-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('mapview-right-sidebar-docked')).toBeInTheDocument()
  })
})
