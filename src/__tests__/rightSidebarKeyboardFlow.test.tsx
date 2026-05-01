/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { RightSidebar } from '../components/editor/RightSidebar/RightSidebar'
import { useUIStore } from '../stores/uiStore'

vi.mock('../components/editor/RightSidebar/PropertiesPanel', () => ({
  PropertiesPanel: () => <div>Properties panel</div>,
}))
vi.mock('../components/editor/RightSidebar/ReportsPanel', () => ({
  ReportsPanel: () => <div>Reports panel</div>,
}))
vi.mock('../components/editor/RightSidebar/InsightsPanel', () => ({
  InsightsPanel: () => <div>Insights panel</div>,
}))

beforeEach(() => {
  useUIStore.setState({
    rightSidebarOpen: true,
    rightSidebarTab: 'properties',
  } as any)
})

describe('RightSidebar keyboard and toggle flow', () => {
  it('uses arrow keys, Home, and End to move and activate tabs', () => {
    render(<RightSidebar />)

    const tablist = screen.getByRole('tablist', { name: 'Right sidebar' })
    expect(screen.getByRole('tab', { name: /properties/i })).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(tablist, { key: 'ArrowRight' })
    expect(useUIStore.getState().rightSidebarTab).toBe('reports')
    expect(screen.getByRole('tab', { name: /reports/i })).toHaveFocus()
    expect(screen.getByText('Reports panel')).toBeInTheDocument()

    fireEvent.keyDown(tablist, { key: 'End' })
    expect(useUIStore.getState().rightSidebarTab).toBe('insights')
    expect(screen.getByRole('tab', { name: /insights/i })).toHaveFocus()
    expect(screen.getByText('Insights panel')).toBeInTheDocument()

    fireEvent.keyDown(tablist, { key: 'Home' })
    expect(useUIStore.getState().rightSidebarTab).toBe('properties')
    expect(screen.getByRole('tab', { name: /properties/i })).toHaveFocus()
    expect(screen.getByText('Properties panel')).toBeInTheDocument()

    fireEvent.keyDown(tablist, { key: 'ArrowLeft' })
    expect(useUIStore.getState().rightSidebarTab).toBe('insights')
    expect(screen.getByRole('tab', { name: /insights/i })).toHaveFocus()
  })

  it('collapses the sidebar through the inline toggle control', () => {
    render(<RightSidebar />)

    fireEvent.click(screen.getByRole('button', { name: /close right sidebar/i }))

    expect(useUIStore.getState().rightSidebarOpen).toBe(false)
  })
})
