/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll } from 'vitest'
import { render } from '@testing-library/react'
import { Stage, Layer } from 'react-konva'
import { MeasureOverlay, type MeasureSession } from '../components/editor/Canvas/MeasureOverlay'

// Same canvas-context stub we use in the dimension-layer tests; Konva's
// hit-test layer touches the 2D context during mount even for `listening=false`
// overlays, so we need the full shim.
beforeAll(() => {
  const mockCtx = {
    scale: () => {}, clearRect: () => {}, fillRect: () => {}, strokeRect: () => {},
    beginPath: () => {}, closePath: () => {}, moveTo: () => {}, lineTo: () => {},
    arc: () => {}, arcTo: () => {}, bezierCurveTo: () => {}, quadraticCurveTo: () => {},
    fill: () => {}, stroke: () => {}, save: () => {}, restore: () => {},
    translate: () => {}, rotate: () => {}, transform: () => {}, setTransform: () => {},
    drawImage: () => {},
    measureText: () => ({ width: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 }),
    fillText: () => {}, strokeText: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createPattern: () => ({}),
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: () => {},
    clip: () => {}, rect: () => {}, isPointInPath: () => false,
    canvas: { width: 0, height: 0 },
  } as unknown as CanvasRenderingContext2D
  HTMLCanvasElement.prototype.getContext = (() =>
    mockCtx) as unknown as HTMLCanvasElement['getContext']
})

function getLayerTexts(stage: any): string[] {
  const texts: string[] = []
  for (const layer of stage.getLayers()) {
    layer.find('Text').forEach((t: any) => texts.push(t.text()))
  }
  return texts
}

function mount(session: MeasureSession, scale = 1, scaleUnit: 'ft' | 'm' | 'px' = 'ft') {
  let stage: any
  render(
    <Stage width={400} height={400} ref={(s) => { stage = s }}>
      <Layer><MeasureOverlay session={session} scale={scale} scaleUnit={scaleUnit} /></Layer>
    </Stage>,
  )
  return stage
}

describe('MeasureOverlay', () => {
  it('renders nothing when there are no points and no cursor', () => {
    const stage = mount({ points: [], cursor: null, finalised: false })
    expect(getLayerTexts(stage)).toEqual([])
  })

  it('labels the live segment between the last committed point and the cursor', () => {
    const stage = mount(
      { points: [0, 0], cursor: { x: 100, y: 0 }, finalised: false },
      1,
      'ft',
    )
    const texts = getLayerTexts(stage)
    expect(texts).toContain('100.0 ft')
  })

  it('labels each segment and shows a running total for multi-segment sessions', () => {
    const stage = mount(
      { points: [0, 0, 100, 0], cursor: { x: 100, y: 50 }, finalised: false },
      1,
      'ft',
    )
    const texts = getLayerTexts(stage)
    expect(texts).toContain('100.0 ft')
    expect(texts).toContain('50.0 ft')
    expect(texts.some((t) => t.includes('Total: 150.0 ft'))).toBe(true)
  })

  it('reports polygon area via the shoelace formula once 3+ vertices exist', () => {
    const stage = mount(
      {
        points: [0, 0, 100, 0, 100, 100],
        cursor: { x: 0, y: 100 },
        finalised: false,
      },
      1,
      'ft',
    )
    const texts = getLayerTexts(stage)
    expect(texts.some((t) => t.includes('Area: 10000.0 ft\u00B2'))).toBe(true)
  })

  it('still renders labels after finalisation (cursor ignored)', () => {
    const stage = mount(
      {
        points: [0, 0, 100, 0],
        cursor: { x: 100, y: 200 },
        finalised: true,
      },
      1,
      'ft',
    )
    const texts = getLayerTexts(stage)
    expect(texts).toContain('100.0 ft')
    expect(texts).not.toContain('200.0 ft')
  })

  it('skips zero-length segments (e.g. dblclick at same spot)', () => {
    const stage = mount(
      { points: [50, 50, 50, 50], cursor: { x: 50, y: 150 }, finalised: false },
      1,
      'ft',
    )
    const texts = getLayerTexts(stage)
    expect(texts).not.toContain('0.0 ft')
    expect(texts).toContain('100.0 ft')
  })

  it('honours scale + unit (px pass-through vs real-world)', () => {
    const ftStage = mount(
      { points: [0, 0], cursor: { x: 100, y: 0 }, finalised: false },
      0.5,
      'ft',
    )
    expect(getLayerTexts(ftStage)).toContain('50.0 ft')

    const pxStage = mount(
      { points: [0, 0], cursor: { x: 100, y: 0 }, finalised: false },
      0.5,
      'px',
    )
    expect(getLayerTexts(pxStage)).toContain('100.0 px')
  })
})
