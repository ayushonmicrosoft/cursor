import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DockableToolbar } from '../components/editor/DockableToolbar'
import {
  DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS,
  useUIStore,
  type DockableToolbarId,
} from '../stores/uiStore'

const STORAGE_KEY = 'oandocraft.toolbar-layouts'

function resetToolbarState() {
  useUIStore.setState({
    dockableToolbarLayouts: { ...DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS },
  })
  localStorage.removeItem(STORAGE_KEY)
}

function renderToolbar(id: DockableToolbarId = 'canvas-actions') {
  return render(
    <div data-canvas-toolbar-host style={{ width: 800, height: 600 }}>
      <DockableToolbar
        id={id}
        title="Canvas controls"
        dockedClassName="bottom-12 right-4"
      >
        <div>Body</div>
      </DockableToolbar>
    </div>,
  )
}

describe('DockableToolbar', () => {
  beforeEach(() => {
    resetToolbarState()
  })

  it('can be undocked and docked again from keyboard-focusable buttons', () => {
    const { container } = renderToolbar()
    const root = container.querySelector('[data-toolbar-id="canvas-actions"]') as HTMLElement
    expect(root.dataset.toolbarMode).toBe('docked')

    const toggle = screen.getByRole('button', { name: 'Undock Canvas controls' })
    expect(toggle).toBeEnabled()
    fireEvent.click(toggle)
    expect(root.dataset.toolbarMode).toBe('floating')
    expect(screen.getByRole('button', { name: 'Move Canvas controls' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Dock Canvas controls' }))
    expect(root.dataset.toolbarMode).toBe('docked')
  })

  it('persists floating positions to localStorage', () => {
    renderToolbar()
    useUIStore.getState().setDockableToolbarMode('canvas-actions', 'floating')
    useUIStore.getState().setDockableToolbarPosition('canvas-actions', { x: 321, y: 123 })

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved['canvas-actions']).toMatchObject({
      mode: 'floating',
      position: { x: 321, y: 123 },
    })
  })

  it('resets a floating toolbar to its default layout', () => {
    renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: 'Undock Canvas controls' }))
    useUIStore.getState().setDockableToolbarPosition('canvas-actions', { x: 321, y: 123 })

    fireEvent.click(screen.getByRole('button', { name: 'Reset Canvas controls position' }))

    expect(useUIStore.getState().dockableToolbarLayouts['canvas-actions']).toEqual(
      DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS['canvas-actions'],
    )
  })
})
