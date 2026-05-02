import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { EngineHost } from '../EngineHost'
import { useUIStore } from '../../../stores/uiStore'

vi.mock('../PixiPreviewPage', () => ({
  PixiPreviewPage: () => <div data-testid="deterministic-pixi-view">Pixi View</div>,
}))

describe('EngineHost preferred pixi route determinism', () => {
  beforeEach(() => {
    useUIStore.setState({
      renderEngine: 'konva',
      selectedIds: [],
      rightSidebarTab: 'properties',
      rightSidebarOpen: true,
      viewMode: '2.5d',
    })
  })

  it('does not mount Konva MapView side effects on preferred pixi route', async () => {
    render(<EngineHost preferredEngine="pixi" />)

    await waitFor(() => {
      expect(screen.getByTestId('deterministic-pixi-view')).toBeInTheDocument()
    })

    expect(useUIStore.getState().renderEngine).toBe('pixi')
    expect(useUIStore.getState().rightSidebarOpen).toBe(true)
  })
})
