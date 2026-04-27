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
import { useUIStore } from '../stores/uiStore'

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
  useUIStore.setState({ viewMode: '2d' })
})

describe('TopBar view mode switch', () => {
  it('shows both 2D and 2.5D controls', () => {
    renderTopBar()
    expect(screen.getByRole('button', { name: /switch to 2d view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /switch to 2.5d view/i })).toBeInTheDocument()
  })

  it('updates the ui store when toggling mode', () => {
    renderTopBar()

    fireEvent.click(screen.getByRole('button', { name: /switch to 2.5d view/i }))
    expect(useUIStore.getState().viewMode).toBe('2.5d')

    fireEvent.click(screen.getByRole('button', { name: /switch to 2d view/i }))
    expect(useUIStore.getState().viewMode).toBe('2d')
  })
})
