import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MapView } from '../components/editor/MapView'
import { useElementsStore } from '../stores/elementsStore'
import { useFloorStore } from '../stores/floorStore'
import { useUIStore } from '../stores/uiStore'
import type { ReactNode } from 'react'
import { MOBILE_BREAKPOINT_PX, MIN_EDITOR_LAYOUT_WIDTH_PX } from '../components/editor/NarrowScreenBanner'

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
  RightSidebar: () => <div data-testid="right-sidebar">right-sidebar</div>,
}))
vi.mock('../components/editor/RightSidebar/SidebarToggle', () => ({
  SidebarToggle: () => <button type="button">toggle-sidebar</button>,
}))
vi.mock('../components/editor/StatusBar', () => ({
  StatusBar: () => null,
}))
vi.mock('../components/editor/Canvas/CanvasStage', () => ({
  CanvasStage: () => <div data-testid="canvas-stage">canvas-stage</div>,
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
    rightSidebarTab: 'properties',
    selectedIds: [],
    presentationMode: false,
    viewMode: '2d',
  } as never)
})

describe('MapView responsive layout', () => {
  it('collapses editor sidebars below minimum width (desktop breakpoint)', async () => {
    setViewportWidth(1024)
    renderMapView()

    expect(screen.queryByTestId('mapview-left-sidebar')).not.toBeInTheDocument()
    await waitFor(() => {
      expect(useUIStore.getState().rightSidebarOpen).toBe(false)
    })
  })

  it('shows right sidebar as overlay on tablet screens (768px-1179px) when reopened', async () => {
    setViewportWidth(900)
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

  it('shows left sidebar docked at desktop widths', () => {
    setViewportWidth(1366)
    renderMapView()

    // Left sidebar should be visible at desktop widths
    expect(screen.getByTestId('mapview-left-sidebar')).toBeInTheDocument()
    // Toggle button indicates right sidebar can be opened
    expect(screen.getByText('toggle-sidebar')).toBeInTheDocument()
  })
})

describe('MapView mobile editor mode (480px-767px)', () => {
  it('hides left sidebar in mobile editor mode', () => {
    setViewportWidth(600)
    renderMapView()

    expect(screen.queryByTestId('mapview-left-sidebar')).not.toBeInTheDocument()
  })

  it('does not show right sidebar overlay on mobile (uses bottom sheet instead)', async () => {
    setViewportWidth(600)
    renderMapView()
    
    // Wait for initial sidebar collapse
    await waitFor(() => {
      expect(useUIStore.getState().rightSidebarOpen).toBe(false)
    })

    // Try to open sidebar
    act(() => {
      useUIStore.setState({ rightSidebarOpen: true, selectedIds: ['test-element'] })
    })

    // On mobile, right sidebar overlay should not be shown (bottom sheet is used instead)
    expect(screen.queryByTestId('mapview-right-sidebar-overlay')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mapview-right-sidebar-docked')).not.toBeInTheDocument()
  })

  it('renders mobile bottom bar in mobile editor mode', () => {
    setViewportWidth(600)
    const { container } = renderMapView()

    // Check for bottom bar presence via its z-index class or structure
    expect(container.querySelector('.absolute.bottom-0')).toBeInTheDocument()
  })

  it('does not render mobile bottom bar at desktop widths', () => {
    setViewportWidth(1366)
    const { container } = renderMapView()

    expect(container.querySelector('.absolute.bottom-0')).not.toBeInTheDocument()
  })

  it('maintains canvas visibility at all supported widths', () => {
    // Desktop
    setViewportWidth(1366)
    const { rerender } = renderMapView()
    expect(screen.getByTestId('canvas-stage')).toBeInTheDocument()

    // Tablet
    setViewportWidth(900)
    act(() => {
      rerender(
        <MemoryRouter initialEntries={['/t/acme/o/hq/map']}>
          <Routes>
            <Route path="/t/:teamSlug/o/:officeSlug/map" element={<MapView />} />
          </Routes>
        </MemoryRouter>
      )
    })
    expect(screen.getByTestId('canvas-stage')).toBeInTheDocument()

    // Mobile editor mode
    setViewportWidth(600)
    act(() => {
      rerender(
        <MemoryRouter initialEntries={['/t/acme/o/hq/map']}>
          <Routes>
            <Route path="/t/:teamSlug/o/:officeSlug/map" element={<MapView />} />
          </Routes>
        </MemoryRouter>
      )
    })
    expect(screen.getByTestId('canvas-stage')).toBeInTheDocument()

    // Below 480px (warning mode, but canvas should still render)
    setViewportWidth(400)
    act(() => {
      rerender(
        <MemoryRouter initialEntries={['/t/acme/o/hq/map']}>
          <Routes>
            <Route path="/t/:teamSlug/o/:officeSlug/map" element={<MapView />} />
          </Routes>
        </MemoryRouter>
      )
    })
    expect(screen.getByTestId('canvas-stage')).toBeInTheDocument()
  })
})
