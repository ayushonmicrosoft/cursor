import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { EngineHost } from '../EngineHost'
import { useUIStore } from '../../../stores/uiStore'
import { useToastStore } from '../../../stores/toastStore'

vi.mock('../MapView', () => ({
  MapView: () => <div data-testid="engine-konva-view">Konva View</div>,
}))

vi.mock('../PixiPreviewPage', () => ({
  PixiPreviewPage: ({ onEngineFailure }: { onEngineFailure?: (reason: string) => void }) => (
    <div data-testid="engine-pixi-view">
      <button
        type="button"
        data-testid="engine-pixi-fail"
        onClick={() => onEngineFailure?.('Pixi failed to initialize in this browser context.')}
      >
        Fail
      </button>
    </div>
  ),
}))

describe('EngineHost switch + fallback', () => {
  beforeEach(() => {
    useToastStore.setState({ items: [] })
    useUIStore.setState({
      renderEngine: 'konva',
      viewMode: '2d',
    })
  })

  it('renders Konva host when renderEngine=konva', () => {
    render(<EngineHost />)
    expect(screen.getByTestId('engine-konva-view')).toBeInTheDocument()
    expect(screen.queryByTestId('engine-pixi-view')).not.toBeInTheDocument()
  })

  it('renders Pixi host when renderEngine=pixi', () => {
    useUIStore.setState({ renderEngine: 'pixi' })
    render(<EngineHost />)
    expect(screen.getByTestId('engine-pixi-view')).toBeInTheDocument()
    expect(screen.queryByTestId('engine-konva-view')).not.toBeInTheDocument()
  })

  it('falls back to Konva when Pixi init fails', async () => {
    useUIStore.setState({ renderEngine: 'pixi', viewMode: '2.5d' })
    render(<EngineHost />)
    fireEvent.click(screen.getByTestId('engine-pixi-fail'))

    await waitFor(() => {
      expect(useUIStore.getState().renderEngine).toBe('konva')
    })
    expect(useUIStore.getState().viewMode).toBe('2d')
    expect(screen.getByTestId('engine-konva-view')).toBeInTheDocument()
    expect(useToastStore.getState().items.length).toBe(1)
  })

  it('forces Konva on map route policy even when store persists pixi', async () => {
    useUIStore.setState({ renderEngine: 'pixi' })
    render(<EngineHost routePolicyId="map" />)

    expect(screen.getByTestId('engine-konva-view')).toBeInTheDocument()
    await waitFor(() => {
      expect(useUIStore.getState().renderEngine).toBe('konva')
    })
  })

  it('forces Pixi on pixi route policy even when store persists konva', async () => {
    useUIStore.setState({ renderEngine: 'konva' })
    render(<EngineHost routePolicyId="pixi" />)

    expect(screen.getByTestId('engine-pixi-view')).toBeInTheDocument()
    await waitFor(() => {
      expect(useUIStore.getState().renderEngine).toBe('pixi')
    })
  })
})
