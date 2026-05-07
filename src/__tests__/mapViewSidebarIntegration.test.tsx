/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS,
  DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY,
  useUIStore,
} from '../stores/uiStore'

vi.mock('../components/editor/FloorSwitcher', () => ({
  FloorSwitcher: () => <div data-testid="floor-switcher" />,
}))
vi.mock('../components/editor/LeftSidebar/ToolSelector', () => ({
  ToolSelector: () => <div data-testid="tool-selector" />,
}))
vi.mock('../components/editor/LeftSidebar/LayerVisibilityPanel', () => ({
  LayerVisibilityPanel: () => <div data-testid="layer-visibility-panel" />,
}))
vi.mock('../components/editor/LeftSidebar/ElementLibrary', () => ({
  ElementLibrary: () => <div data-testid="element-library" />,
}))
vi.mock('../components/editor/LeftSidebar/CollapsibleSection', () => ({
  CollapsibleSection: ({ title, children }: { title: string; children: ReactNode }) => (
    <section aria-label={title}>{children}</section>
  ),
}))
vi.mock('../components/editor/RightSidebar/RightSidebar', () => ({
  RightSidebar: () => <aside data-testid="right-sidebar" />,
}))
vi.mock('../components/editor/RightSidebar/SidebarToggle', () => ({
  SidebarToggle: ({ variant }: { variant: string }) => (
    <button type="button" data-testid={`sidebar-toggle-${variant}`}>
      {variant}
    </button>
  ),
}))
vi.mock('../components/editor/StatusBar', () => ({
  StatusBar: () => <div data-testid="status-bar" />,
}))
vi.mock('../components/editor/Canvas/CanvasStage', () => ({
  CanvasStage: () => <div data-testid="canvas-stage" />,
}))
vi.mock('../components/editor/KeyboardShortcutsOverlay', () => ({
  KeyboardShortcutsOverlay: () => <div data-testid="keyboard-shortcuts-overlay" />,
}))
vi.mock('../components/editor/PresentationOverlay', () => ({
  PresentationOverlay: () => <div data-testid="presentation-overlay" />,
}))
vi.mock('../components/editor/Minimap', () => ({
  Minimap: () => <div data-testid="minimap" />,
}))
vi.mock('../components/editor/Canvas/CanvasActionDock', () => ({
  CanvasActionDock: () => <div data-testid="canvas-action-dock" />,
}))
vi.mock('../components/editor/Canvas/CanvasScaleBar', () => ({
  CanvasScaleBar: () => <div data-testid="canvas-scale-bar" />,
}))
vi.mock('../components/editor/Canvas/NorthArrow', () => ({
  NorthArrow: () => <div data-testid="north-arrow" />,
}))
vi.mock('../components/editor/Canvas/AlignDistributeToolbar', () => ({
  AlignDistributeToolbar: () => <div data-testid="align-distribute-toolbar" />,
}))
vi.mock('../components/editor/Canvas/ElementHoverCard', () => ({
  ElementHoverCard: () => <div data-testid="element-hover-card" />,
}))
vi.mock('../components/editor/FirstRunCoach', () => ({
  FirstRunCoach: () => <div data-testid="first-run-coach" />,
}))
vi.mock('../components/editor/AdminStatsToolbar', () => ({
  AdminStatsToolbar: () => <div data-testid="admin-stats-toolbar" />,
}))

function resetUiState() {
  useUIStore.setState({
    selectedIds: [],
    rightSidebarOpen: true,
    rightSidebarTab: 'properties',
    presentationMode: false,
    viewMode: '2d',
    activeWorkspacePreset: null,
    dockableToolbarLayouts: { ...DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS },
    dockableToolbarVisibility: { ...DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY },
  } as any)
}

async function renderMapView() {
  const { MapView } = await import('../components/editor/MapView')
  return render(
    <MemoryRouter initialEntries={['/t/acme/o/hq/map']}>
      <MapView />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  resetUiState()
})

describe('MapView first-load sidebar integration', () => {
  it('starts with a calm canvas when properties are empty', async () => {
    await renderMapView()
    await waitFor(() => expect(screen.getByTestId('canvas-stage')).toBeInTheDocument())

    await waitFor(() => {
      expect(useUIStore.getState().rightSidebarOpen).toBe(false)
    })

    expect(screen.queryByTestId('right-sidebar')).not.toBeInTheDocument()
    expect(screen.getByTestId('sidebar-toggle-docked')).toBeInTheDocument()
    expect(screen.getByTestId('first-run-coach')).toBeInTheDocument()
    expect(useUIStore.getState().dockableToolbarVisibility['admin-stats']).toBe(false)
  })

  it('keeps admin-state visibility when the admin preset is active', async () => {
    useUIStore.setState({ activeWorkspacePreset: 'admin' } as any)

    await renderMapView()

    await waitFor(() => {
      expect(useUIStore.getState().rightSidebarOpen).toBe(false)
    })

    expect(useUIStore.getState().dockableToolbarVisibility['admin-stats']).toBe(true)
  })
})
