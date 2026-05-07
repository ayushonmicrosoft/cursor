import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AdminStatsToolbar } from '../components/editor/AdminStatsToolbar'
import { useProjectStore } from '../stores/projectStore'
import { useUIStore } from '../stores/uiStore'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderToolbar() {
  return render(
    <MemoryRouter initialEntries={['/t/demo-team/o/demo-office/map']}>
      <Routes>
        <Route
          path="/t/:teamSlug/o/:officeSlug/map"
          element={
            <>
              <AdminStatsToolbar />
              <LocationProbe />
            </>
          }
        />
        <Route
          path="/t/:teamSlug/o/:officeSlug/audit"
          element={<LocationProbe />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminStatsToolbar', () => {
  beforeEach(() => {
    useProjectStore.setState({
      currentOfficeRole: 'owner',
      impersonatedRole: null,
      saveState: 'saved',
      conflict: null,
    })
    useUIStore.setState({ shareModalOpen: false })
  })

  it('opens recovery tools from the admin HUD', () => {
    renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: /recover/i }))
    expect(useUIStore.getState().shareModalOpen).toBe(true)
  })

  it('routes owners to the audit drilldown', () => {
    renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: /audit/i }))
    expect(screen.getByTestId('location')).toHaveTextContent('/t/demo-team/o/demo-office/audit')
  })

  it('shows active conflict count as an admin recovery shortcut', () => {
    useProjectStore.setState({ conflict: { payload: { elements: {} } } })
    renderToolbar()
    expect(screen.getByRole('button', { name: /conflicts/i })).toHaveTextContent('1 active')
  })
})
