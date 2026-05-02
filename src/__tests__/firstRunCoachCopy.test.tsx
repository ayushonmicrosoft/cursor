import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FirstRunCoach } from '../components/editor/FirstRunCoach'
import { useUIStore } from '../stores/uiStore'

/**
 * Copy + behavior coverage for the tour-style first-run coach:
 *  - Renders the expected step copy referencing key editor discovery flows.
 *  - Step indicator advances and supports direct-dot jumping.
 *  - Escape dismisses + persists the seen flag.
 */
describe('FirstRunCoach copy + step behavior', () => {
  beforeEach(() => {
    localStorage.clear()
    useUIStore.setState({ commandPaletteOpen: false })
    // The first-run composite also renders the demo seeder card on empty
    // offices. Dismiss it so these tour tests stay focused on the tour.
    localStorage.setItem('floocraft.firstRunDemoDismissed', '1')
  })

  it('renders the first step copy referencing pan + zoom', () => {
    render(<FirstRunCoach />)
    expect(screen.getByText(/move around the canvas/i)).toBeInTheDocument()
    expect(screen.getByText(/drag the empty canvas/i)).toBeInTheDocument()
    expect(screen.getByText(/1\s*\/\s*5/)).toBeInTheDocument()
  })

  it('Next button advances through the five steps in order', () => {
    render(<FirstRunCoach />)
    const titles = [
      /move around the canvas/i,
      /pick a tool/i,
      /^command palette$/i,
      /see every shortcut/i,
      /switch views/i,
    ]
    expect(screen.getByRole('heading', { name: titles[0] })).toBeInTheDocument()
    for (let i = 1; i < titles.length; i++) {
      fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
      expect(screen.getByRole('heading', { name: titles[i] })).toBeInTheDocument()
    }
    expect(screen.queryByRole('button', { name: /^next$/i })).toBeNull()
    expect(screen.getByRole('button', { name: /^done$/i })).toBeInTheDocument()
  })

  it('step copy references the real editor shortcuts (Cmd+K, ?, M/R)', () => {
    render(<FirstRunCoach />)
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText(/every action in one searchable list/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText(/full shortcut cheat\s+sheet/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText(/tabs sit at the/i)).toBeInTheDocument()
  })

  it('Back button steps backwards', () => {
    render(<FirstRunCoach />)
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText(/pick a tool/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }))
    expect(screen.getByText(/move around the canvas/i)).toBeInTheDocument()
  })

  it('does not steal keyboard focus when it mounts', () => {
    render(
      <>
        <button type="button" data-testid="outside">
          Outside
        </button>
        <FirstRunCoach />
      </>,
    )
    const outside = screen.getByTestId('outside')
    outside.focus()
    expect(document.activeElement).toBe(outside)
  })

  it('Escape dismisses and persists the seen flag', () => {
    render(<FirstRunCoach />)
    fireEvent.keyDown(
      screen.getByRole('dialog', { name: /welcome to oandocraft/i }),
      { key: 'Escape' },
    )
    expect(localStorage.getItem('firstRunWelcomeSeen')).toBe('1')
    expect(screen.queryByRole('dialog', { name: /welcome to oandocraft/i })).toBeNull()
  })

  it('uses dialog role with aria-labelledby pointing at the dialog title', () => {
    render(<FirstRunCoach />)
    const dialog = screen.getByRole('dialog', { name: /welcome to oandocraft/i })
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    if (labelledBy) {
      const heading = document.getElementById(labelledBy)
      expect(heading?.textContent).toMatch(/welcome to oandocraft/i)
    }
  })

  it('step indicator dots are clickable to jump to a step', () => {
    render(<FirstRunCoach />)
    fireEvent.click(screen.getByRole('button', { name: /go to step 3/i }))
    expect(screen.getByRole('heading', { name: /^command palette$/i })).toBeInTheDocument()
    expect(screen.getByText(/3\s*\/\s*5/)).toBeInTheDocument()
  })
})
