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

  it('renders the first step copy referencing the tour intro', () => {
    render(<FirstRunCoach />)
    expect(screen.getByText(/welcome to oandocraft/i)).toBeInTheDocument()
    expect(screen.getByText(/let's walk through the basics/i)).toBeInTheDocument()
    expect(screen.getByText(/1\s*\/\s*15/)).toBeInTheDocument()
  })

  it('Next button advances through the tour steps in order', () => {
    render(<FirstRunCoach />)
    const titles = [
      /welcome to oandocraft/i,
      /choose your tool/i,
      /place your first element/i,
      /navigate the canvas/i,
      /select and move/i,
      /right-click \/ long-press menu/i,
      /add your team/i,
      /assign seats/i,
      /create neighborhoods/i,
      /find anything/i,
      /keyboard shortcuts/i,
      /reports & insights/i,
      /export & share/i,
      /you're ready!/i,
      /restart this tour anytime/i,
    ]
    expect(screen.getByText(/let's walk through the basics/i)).toBeInTheDocument()
    expect(screen.getByText(titles[0])).toBeInTheDocument()
    for (let i = 1; i < titles.length; i++) {
      fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
      expect(screen.getByText(titles[i])).toBeInTheDocument()
    }
    expect(screen.queryByRole('button', { name: /^next$/i })).toBeNull()
    expect(screen.getByRole('button', { name: /^done$/i })).toBeInTheDocument()
  })

  it('step copy references the real editor shortcuts (Cmd+K, ?, M/R)', () => {
    render(<FirstRunCoach />)
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText(/click any tool to activate it/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText(/try selecting a tool and clicking on the canvas/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText(/pan:/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /go to step 11/i }))
    expect(screen.getByText(/use ← → arrow keys to navigate/i)).toBeInTheDocument()
  })

  it('Back button steps backwards', () => {
    render(<FirstRunCoach />)
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText(/click any tool to activate it/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }))
    expect(screen.getByText(/welcome to oandocraft/i)).toBeInTheDocument()
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
    expect(localStorage.getItem('floorcraft.onboardingCompleted')).toBe('1')
    expect(
      screen.queryByRole('dialog', { name: /welcome to oandocraft/i }),
    ).toBeNull()
  })

  it('uses dialog role with aria-labelledby pointing at the dialog title', () => {
    render(<FirstRunCoach />)
    const dialog = screen.getByRole('dialog', {
      name: /welcome to oandocraft/i,
    })
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
    expect(screen.getByText(/place your first element/i)).toBeInTheDocument()
    expect(screen.getByText(/3\s*\/\s*15/)).toBeInTheDocument()
  })
})
