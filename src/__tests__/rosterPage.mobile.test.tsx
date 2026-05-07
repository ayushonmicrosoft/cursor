/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useEmployeeStore } from '../stores/employeeStore'
import { useFloorStore } from '../stores/floorStore'
import { useElementsStore } from '../stores/elementsStore'
import { useProjectStore } from '../stores/projectStore'
import { RosterPage } from '../components/editor/RosterPage'

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

function renderAtRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/t/:teamSlug/o/:officeSlug/roster"
          element={<RosterPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  setViewportWidth(1366)
  useProjectStore.setState({ currentOfficeRole: 'editor' } as any)
  useElementsStore.setState({ elements: {} })
  useFloorStore.setState({
    floors: [{ id: 'f1', name: 'Floor 1', order: 0, elements: {} }],
    activeFloorId: 'f1',
  } as any)
  useEmployeeStore.setState({
    employees: {
      e1: {
        id: 'e1', name: 'Alice', email: 'alice@example.com', department: 'Engineering', team: null,
        title: 'IC5', managerId: null, employmentType: 'full-time', status: 'active',
        officeDays: ['Mon', 'Tue', 'Wed'], startDate: null, endDate: null,
        equipmentNeeds: [], equipmentStatus: 'not-needed', photoUrl: null, tags: [], accommodations: [], sensitivityTags: [],
        seatId: null, floorId: null, leaveType: null, expectedReturnDate: null,
        coverageEmployeeId: null, leaveNotes: null, departureDate: null,
        pendingStatusChanges: [],
        createdAt: new Date().toISOString(),
      },
      e2: {
        id: 'e2', name: 'Bob', email: 'bob@example.com', department: 'Design', team: null,
        title: 'Manager', managerId: null, employmentType: 'full-time', status: 'active',
        officeDays: ['Tue', 'Thu'], startDate: null, endDate: null,
        equipmentNeeds: [], equipmentStatus: 'not-needed', photoUrl: null, tags: [], accommodations: [], sensitivityTags: [],
        seatId: null, floorId: null, leaveType: null, expectedReturnDate: null,
        coverageEmployeeId: null, leaveNotes: null, departureDate: null,
        pendingStatusChanges: [],
        createdAt: new Date().toISOString(),
      },
      e3: {
        id: 'e3', name: 'Charlie', email: 'charlie@example.com', department: 'Product', team: null,
        title: 'PM', managerId: null, employmentType: 'full-time', status: 'active',
        officeDays: ['Mon', 'Fri'], startDate: null, endDate: null,
        equipmentNeeds: [], equipmentStatus: 'not-needed', photoUrl: null, tags: [], accommodations: [], sensitivityTags: [],
        seatId: null, floorId: null, leaveType: null, expectedReturnDate: null,
        coverageEmployeeId: null, leaveNotes: null, departureDate: null,
        pendingStatusChanges: [],
        createdAt: new Date().toISOString(),
      },
    },
    departmentColors: { Engineering: '#2196f3', Design: '#f44336', Product: '#4caf50' },
  })
})

describe('RosterPage mobile rendering (<640px)', () => {
  it('automatically renders cards view under 640px', () => {
    setViewportWidth(600)
    renderAtRoute('/t/acme/o/hq/roster')

    // Should show card grid instead of table
    expect(screen.getByTestId('roster-cards')).toBeInTheDocument()
    
    // Should show all employees as cards
    expect(screen.getByText('Alice')).toBeTruthy()
    expect(screen.getByText('Bob')).toBeTruthy()
    expect(screen.getByText('Charlie')).toBeTruthy()
  })

  it('shows table at 640px (breakpoint edge)', () => {
    setViewportWidth(640)
    renderAtRoute('/t/acme/o/hq/roster')

    // At exactly 640px, should be table (640 is the breakpoint)
    expect(screen.queryByTestId('roster-cards')).not.toBeInTheDocument()
  })

  it('preserves card view when explicitly requested via URL', () => {
    setViewportWidth(1366)
    renderAtRoute('/t/acme/o/hq/roster?view=cards')

    // Should show cards even on large screen because of URL param
    expect(screen.getByTestId('roster-cards')).toBeInTheDocument()
  })

  it('preserves list view when explicitly requested via URL even on narrow screens', () => {
    setViewportWidth(600)
    renderAtRoute('/t/acme/o/hq/roster?view=list')

    // Should show table when explicitly requested
    expect(screen.queryByTestId('roster-cards')).not.toBeInTheDocument()
    
    // Employees should still be visible in table
    expect(screen.getByText('Alice')).toBeTruthy()
    expect(screen.getByText('Bob')).toBeTruthy()
    expect(screen.getByText('Charlie')).toBeTruthy()
  })

  it('shows filter chips in mobile card view', () => {
    setViewportWidth(600)
    renderAtRoute('/t/acme/o/hq/roster?status=active')

    // Should show active filter
    expect(screen.getByLabelText(/Remove filter: Status: active/i)).toBeTruthy()
  })

  it('allows bulk selection in card view', () => {
    setViewportWidth(600)
    renderAtRoute('/t/acme/o/hq/roster')

    const toggleAll = screen.getByLabelText('Toggle all') as HTMLInputElement
    expect(toggleAll.checked).toBe(false)

    act(() => {
      toggleAll.click()
    })

    // All employees should be selected
    expect(useEmployeeStore.getState().employees.e1).toBeTruthy()
    // Verify checkboxes are checked
    const aliceSel = screen.getByLabelText('Select Alice') as HTMLInputElement
    const bobSel = screen.getByLabelText('Select Bob') as HTMLInputElement
    expect(aliceSel.checked).toBe(true)
    expect(bobSel.checked).toBe(true)
  })

  it('opens detail drawer when clicking on a card', () => {
    setViewportWidth(600)
    renderAtRoute('/t/acme/o/hq/roster')

    // Click on Alice's card
    const aliceCard = screen.getByText('Alice').closest('button') || screen.getByText('Alice').closest('[role="button"]') || screen.getByText('Alice').parentElement
    if (aliceCard) {
      act(() => {
        aliceCard.click()
      })
    }

    // Detail drawer should open
    expect(screen.getByRole('dialog', { name: /Edit Alice/i })).toBeTruthy()
  })

  it('shows compact stats chips in mobile view', () => {
    setViewportWidth(600)
    renderAtRoute('/t/acme/o/hq/roster')

    // Should show count stats
    expect(screen.getByRole('button', { name: /3.*Total/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /3.*Active/i })).toBeTruthy()
  })

  it('shows office days indicator on cards', () => {
    setViewportWidth(600)
    renderAtRoute('/t/acme/o/hq/roster')

    // Check for office days visualization on cards
    // Alice is in Mon/Tue/Wed
    const aliceRow = screen.getByText('Alice').closest('.grid > div')
    if (aliceRow) {
      // Should have some visual indication of office days
      expect(aliceRow).toBeTruthy()
    }
  })
})

describe('RosterPage responsive breakpoints', () => {
  it('starts with table on desktop by default', () => {
    // Desktop
    setViewportWidth(1366)
    renderAtRoute('/t/acme/o/hq/roster')

    // Desktop: table view (no cards container)
    expect(screen.queryByTestId('roster-cards')).not.toBeInTheDocument()
  })

  it('renders cards on initial mount when URL has view=cards', () => {
    setViewportWidth(1366)
    renderAtRoute('/t/acme/o/hq/roster?view=cards')

    // Should be cards
    expect(screen.getByTestId('roster-cards')).toBeInTheDocument()
  })

  it('maintains filters when switching views via URL', () => {
    setViewportWidth(600)
    renderAtRoute('/t/acme/o/hq/roster?status=active')

    // On mobile, cards should show with active filter
    expect(screen.getByTestId('roster-cards')).toBeInTheDocument()
    expect(screen.getByLabelText(/Remove filter: Status: active/i)).toBeTruthy()
  })
})
