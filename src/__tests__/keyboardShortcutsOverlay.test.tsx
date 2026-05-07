import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useUIStore } from '../stores/uiStore'
import { KeyboardShortcutsOverlay } from '../components/editor/KeyboardShortcutsOverlay'
import { useProjectStore } from '../stores/projectStore'

/**
 * The overlay reads `open` from `uiStore.shortcutsOverlayOpen` and
 * renders nothing while closed, so each test toggles that flag via
 * `setShortcutsOverlayOpen(true)` and asserts on the dialog.
 *
 * `navigator.platform` is mocked per-test (configurable property) so
 * the macOS-vs-other code path can be exercised without leaking
 * across tests. The default `Linux x86_64` value yields `Ctrl`
 * labels; tests that need ⌘ flip it to `MacIntel` before render.
 */

function setPlatform(value: string) {
  Object.defineProperty(navigator, 'platform', {
    value,
    configurable: true,
  })
}

function openOverlay() {
  act(() => {
    useUIStore.getState().setShortcutsOverlayOpen(true)
  })
}

function closeOverlay() {
  act(() => {
    useUIStore.getState().setShortcutsOverlayOpen(false)
  })
}

describe('KeyboardShortcutsOverlay', () => {
  beforeEach(() => {
    closeOverlay()
    useUIStore.setState({ commandPaletteOpen: false, firstRunCoachOpen: false })
    useProjectStore.setState({ currentOfficeRole: null, impersonatedRole: null })
    setPlatform('Linux x86_64')
  })

  afterEach(() => {
    closeOverlay()
    vi.restoreAllMocks()
  })

  it('renders nothing when shortcutsOverlayOpen is false', () => {
    render(<KeyboardShortcutsOverlay />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens when shortcutsOverlayOpen flips to true', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /keyboard shortcuts/i }),
    ).toBeInTheDocument()
  })

  it('auto-focuses the search input on open', async () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    const input = screen.getByLabelText(
      /search keyboard shortcuts/i,
    ) as HTMLInputElement
    // The focus call is queued via requestAnimationFrame so we wait
    // a tick before asserting.
    await act(async () => {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      )
    })
    expect(document.activeElement).toBe(input)
  })

  it('filters by action substring', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    const input = screen.getByLabelText(
      /search keyboard shortcuts/i,
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'undo' } })
    expect(screen.getByText('Undo')).toBeInTheDocument()
    // Other unrelated actions should drop out
    expect(screen.queryByText('Lock / unlock')).toBeNull()
    expect(screen.queryByText('Toggle grid')).toBeNull()
  })

  it('filters by key substring (typing "cmd" matches several)', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    const input = screen.getByLabelText(
      /search keyboard shortcuts/i,
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'cmd' } })
    // Several Cmd-prefixed actions should still be visible
    expect(screen.getByText('Undo')).toBeInTheDocument()
    expect(screen.getByText('Select all')).toBeInTheDocument()
    expect(screen.getByText('Reset zoom')).toBeInTheDocument()
    // Non-Cmd actions should drop out
    expect(screen.queryByText('Toggle grid')).toBeNull()
    expect(screen.queryByText('Wall')).toBeNull()
  })

  it('shows an empty state when nothing matches', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    const input = screen.getByLabelText(
      /search keyboard shortcuts/i,
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'zzznotathing' } })
    // Empty state should show query
    expect(screen.getByText(/zzznotathing/)).toBeInTheDocument()
  })

  it('shows Ctrl labels on non-mac platforms', () => {
    setPlatform('Linux x86_64')
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    // At least one Ctrl pill should appear; ⌘ should not.
    const dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toContain('Ctrl')
    expect(dialog.textContent).not.toContain('\u2318')
  })

  it('shows ⌘ labels on macOS (mocked navigator.platform)', () => {
    setPlatform('MacIntel')
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    const dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toContain('\u2318')
    expect(dialog.textContent).not.toContain('Ctrl')
  })

  it('Escape closes the overlay', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(useUIStore.getState().shortcutsOverlayOpen).toBe(false)
  })

  it('clicking the backdrop closes the overlay', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('Enter inside the search input does not close the overlay', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    const input = screen.getByLabelText(
      /search keyboard shortcuts/i,
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'undo' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('reports the filter result count via aria-live', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    const input = screen.getByLabelText(
      /search keyboard shortcuts/i,
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'undo' } })
    // Result count should be displayed (check for "1 shortcut" pattern)
    expect(screen.getByText(/1 shortcut/i)).toBeInTheDocument()
  })

  it('quick action opens the command palette and closes the overlay', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    fireEvent.click(screen.getByTestId('shortcuts-open-palette'))
    expect(useUIStore.getState().commandPaletteOpen).toBe(true)
    expect(useUIStore.getState().shortcutsOverlayOpen).toBe(false)
  })

  it('quick action flags the first-run tour to replay', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()
    fireEvent.click(screen.getByTestId('shortcuts-replay-tour'))
    expect(useUIStore.getState().firstRunCoachOpen).toBe(true)
    expect(useUIStore.getState().shortcutsOverlayOpen).toBe(false)
  })

  // Wave 12D: New tab functionality tests
  it('has a Touch Gestures tab that can be switched to', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()

    // Should show both tabs
    const touchTab = screen.getByRole('button', { name: /touch/i })
    expect(touchTab).toBeInTheDocument()

    // Click to switch to touch gestures
    fireEvent.click(touchTab)

    // Should show touch gestures heading
    expect(
      screen.getByRole('heading', { name: /touch gestures/i }),
    ).toBeInTheDocument()
  })

  it('touch gestures tab shows gesture descriptions', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()

    // Switch to touch tab
    fireEvent.click(screen.getByRole('button', { name: /touch/i }))

    // Should show touch gestures like "Pan", "Zoom", "Long press"
    expect(screen.getByText(/pan/i)).toBeInTheDocument()
    expect(screen.getByText(/pinch/i)).toBeInTheDocument()
  })

  it('keyboard tab is active by default', () => {
    render(<KeyboardShortcutsOverlay />)
    openOverlay()

    expect(
      screen.getByRole('heading', { name: /keyboard shortcuts/i }),
    ).toBeInTheDocument()
  })
})
