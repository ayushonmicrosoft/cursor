import { useEffect } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { KonvaViewport } from '../konva/KonvaViewport'

const bindStage = vi.fn()
const unbindStage = vi.fn()
const init = vi.fn()
const dispose = vi.fn()

vi.mock('../../../lib/konva/KonvaAdapter', () => ({
  KonvaAdapter: class {
    init = init
    bindStage = bindStage
    unbindStage = unbindStage
    dispose = dispose
  },
}))

const mockStage = {}

vi.mock('../Canvas/CanvasStage', () => ({
  CanvasStage: ({ onStageReady }: { onStageReady?: (stage: unknown | null) => void }) => {
    useEffect(() => {
      const timeoutId = window.setTimeout(() => onStageReady?.(mockStage), 0)
      return () => {
        window.clearTimeout(timeoutId)
        onStageReady?.(null)
      }
    }, [onStageReady])
    return <div data-testid="mock-canvas-stage" />
  },
}))

vi.mock('../StatusBar', () => ({ StatusBar: () => <div /> }))
vi.mock('../Minimap', () => ({ Minimap: () => <div /> }))
vi.mock('../Canvas/AlignDistributeToolbar', () => ({ AlignDistributeToolbar: () => <div /> }))
vi.mock('../Canvas/ElementHoverCard', () => ({ ElementHoverCard: () => <div /> }))
vi.mock('../AdminStatsToolbar', () => ({ AdminStatsToolbar: () => <div /> }))
vi.mock('../Canvas/CanvasScaleBar', () => ({ CanvasScaleBar: () => <div /> }))
vi.mock('../Canvas/NorthArrow', () => ({ NorthArrow: () => <div /> }))
vi.mock('../FirstRunCoach', () => ({ FirstRunCoach: () => <div /> }))
vi.mock('../Canvas/CanvasActionDock', () => ({ CanvasActionDock: () => <div /> }))
vi.mock('../Canvas/ColorPaletteToolbar', () => ({ ColorPaletteToolbar: () => <div /> }))
vi.mock('../view3d/TwoPointFiveOverlay', () => ({ TwoPointFiveOverlay: () => <div /> }))

describe('KonvaViewport adapter lifecycle', () => {
  beforeEach(() => {
    bindStage.mockClear()
    unbindStage.mockClear()
    init.mockClear()
    dispose.mockClear()
  })

  it('unbinds stage when switching out of 2d view', async () => {
    const { rerender } = render(
      <KonvaViewport
        viewMode="2d"
        ThreeDEntry={null}
        threeDLoadFailed={false}
        activeFloor={null}
        elements={{}}
        showNorthArrow={false}
        showFirstRunCoach={false}
        firstRunCoachOpen={false}
        setFirstRunCoachOpen={() => undefined}
        setViewMode={() => undefined}
        setThreeDLoadFailed={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(bindStage).toHaveBeenCalledTimes(1)
    })
    expect(unbindStage).toHaveBeenCalledTimes(0)

    rerender(
      <KonvaViewport
        viewMode="2.5d"
        ThreeDEntry={null}
        threeDLoadFailed={false}
        activeFloor={null}
        elements={{}}
        showNorthArrow={false}
        showFirstRunCoach={false}
        firstRunCoachOpen={false}
        setFirstRunCoachOpen={() => undefined}
        setViewMode={() => undefined}
        setThreeDLoadFailed={() => undefined}
      />,
    )

    expect(unbindStage).toHaveBeenCalledTimes(1)
  })
})
