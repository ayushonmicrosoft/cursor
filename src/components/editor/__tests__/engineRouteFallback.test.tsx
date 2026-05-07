import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { EngineChooserPage } from '../EngineChooserPage'
import { EngineHost } from '../EngineHost'
import { useUIStore } from '../../../stores/uiStore'

vi.mock('../MapView', () => ({
  MapView: () => <div data-testid="route-konva-view">Konva View</div>,
}))

vi.mock('../PixiPreviewPage', () => ({
  PixiPreviewPage: ({ onEngineFailure }: { onEngineFailure?: (reason: string) => void }) => (
    <div data-testid="route-pixi-view">
      <button
        type="button"
        data-testid="route-pixi-fail"
        onClick={() => onEngineFailure?.('Pixi runtime failure: repeated build errors.')}
      >
        Fail Pixi
      </button>
    </div>
  ),
}))

describe('engine route fallback flow', () => {
  function LocationProbe() {
    const location = useLocation()
    return <div data-testid="route-path">{location.pathname}</div>
  }

  beforeEach(() => {
    useUIStore.setState({ renderEngine: 'konva', viewMode: '2.5d' })
  })

  it('falls back to Konva after chooser -> pixi -> failure', async () => {
    render(
      <MemoryRouter initialEntries={['/engine']}>
        <Routes>
          <Route path="/engine" element={<EngineChooserPage />} />
          <Route path="/pixi" element={<EngineHost preferredEngine="pixi" />} />
          <Route path="/map" element={<EngineHost preferredEngine="konva" />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /pixijs/i }))

    await waitFor(() => {
      expect(screen.getByTestId('route-pixi-view')).toBeInTheDocument()
    })
    expect(useUIStore.getState().renderEngine).toBe('pixi')

    fireEvent.click(screen.getByTestId('route-pixi-fail'))

    await waitFor(() => {
      expect(screen.getByTestId('route-konva-view')).toBeInTheDocument()
    })
    expect(useUIStore.getState().renderEngine).toBe('konva')
    expect(useUIStore.getState().viewMode).toBe('2d')
    expect(screen.getByTestId('route-path')).toHaveTextContent('/map')
  })
})
