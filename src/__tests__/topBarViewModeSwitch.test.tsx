/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { TopBar } from '../components/editor/TopBar'
import { useProjectStore } from '../stores/projectStore'
import { useFloorStore } from '../stores/floorStore'
import { useElementsStore } from '../stores/elementsStore'
import { useEmployeeStore } from '../stores/employeeStore'
import { useCanvasStore } from '../stores/canvasStore'
import {
  DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS,
  DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY,
  WORKSPACE_PRESET_CONFIGS,
  useUIStore,
} from '../stores/uiStore'

const TOOLBAR_LAYOUTS_STORAGE_KEY = 'oandocraft.toolbar-layouts-v3'
const TOOLBAR_VISIBILITY_STORAGE_KEY = 'oandocraft.toolbar-visibility-v3'
const WORKSPACE_PRESET_STORAGE_KEY = 'oandocraft.workspace-preset-v3'

function renderTopBar() {
  return render(
    <MemoryRouter initialEntries={['/t/acme/o/hq/map']}>
      <Routes>
        <Route path="/t/:teamSlug/o/:officeSlug/*" element={<TopBar />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.removeItem(TOOLBAR_LAYOUTS_STORAGE_KEY)
  localStorage.removeItem(TOOLBAR_VISIBILITY_STORAGE_KEY)
  localStorage.removeItem(WORKSPACE_PRESET_STORAGE_KEY)
  useProjectStore.setState({
    currentProject: {
      id: 'p1',
      ownerId: null,
      name: 'Acme HQ',
      slug: 'acme-hq',
      buildingName: null,
      floors: [],
      activeFloorId: 'f1',
      canvasSettings: {
        gridSize: 12, scale: 1, scaleUnit: 'ft',
        showGrid: true, showDimensions: false,
      },
      thumbnailUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    currentOfficeRole: 'owner',
  } as any)
  useFloorStore.setState({
    floors: [{ id: 'f1', name: 'Floor 1', order: 0, elements: {} }],
    activeFloorId: 'f1',
  } as any)
  useElementsStore.setState({ elements: {} } as any)
  useEmployeeStore.setState({ employees: {}, departmentColors: {} } as any)
  useCanvasStore.setState({
    settings: {
      gridSize: 12, scale: 1, scaleUnit: 'ft',
      showGrid: true, showDimensions: false,
    },
  } as any)
  useUIStore.setState({
    viewMode: '2d',
    dockableToolbarLayouts: { ...DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS },
    dockableToolbarVisibility: { ...DEFAULT_DOCKABLE_TOOLBAR_VISIBILITY },
    activeWorkspacePreset: null,
  })
})

describe('TopBar view mode switch', () => {
  it('shows both 2D and 2.5D controls', () => {
    renderTopBar()
    expect(screen.getByRole('button', { name: /switch to 2d view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /switch to 2.5d view/i })).toBeInTheDocument()
  })

  it('updates the ui store when toggling mode', () => {
    renderTopBar()

    const reviewButton = screen.getByRole('button', { name: /switch to 2.5d view/i })
    fireEvent.click(reviewButton)
    expect(useUIStore.getState().viewMode).toBe('2.5d')
    expect(reviewButton).toHaveClass('bg-slate-900')

    const planButton = screen.getByRole('button', { name: /switch to 2d view/i })
    fireEvent.click(planButton)
    expect(useUIStore.getState().viewMode).toBe('2d')
    expect(planButton).toHaveClass('bg-white')
  })

  it('keeps topbar controls inside the viewport rail on narrow widths', () => {
    renderTopBar()

    const toolbar = document.querySelector('[data-fixed-toolbar="top-bar"]')
    const layoutRow = screen.getByTestId('topbar-layout-row')
    expect(toolbar).toHaveClass('flex-nowrap')
    expect(layoutRow).toHaveClass('flex-nowrap')
    expect(layoutRow).not.toHaveAttribute('data-editor-min-width')
  })

  it('applies a workspace preset from the Toolbars menu and persists it', () => {
    renderTopBar()

    fireEvent.click(screen.getByRole('button', { name: /workspace layout settings/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Admin' }))

    const state = useUIStore.getState()
    expect(state.activeWorkspacePreset).toBe('admin')
    expect(state.dockableToolbarLayouts).toEqual(WORKSPACE_PRESET_CONFIGS.admin.layouts)
    expect(state.dockableToolbarVisibility).toEqual(WORKSPACE_PRESET_CONFIGS.admin.visibility)
    expect(localStorage.getItem(WORKSPACE_PRESET_STORAGE_KEY)).toBe('admin')
    expect(JSON.parse(localStorage.getItem(TOOLBAR_LAYOUTS_STORAGE_KEY) ?? '{}')).toEqual(
      WORKSPACE_PRESET_CONFIGS.admin.layouts,
    )
    expect(JSON.parse(localStorage.getItem(TOOLBAR_VISIBILITY_STORAGE_KEY) ?? '{}')).toEqual(
      WORKSPACE_PRESET_CONFIGS.admin.visibility,
    )
  })
})
