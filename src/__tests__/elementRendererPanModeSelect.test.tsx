/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act, render } from '@testing-library/react'
import { Stage } from 'react-konva'
import { ElementRenderer } from '../components/editor/Canvas/ElementRenderer'
import { useCanvasStore } from '../stores/canvasStore'
import { useElementsStore } from '../stores/elementsStore'
import { useUIStore } from '../stores/uiStore'

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
  HTMLCanvasElement.prototype.getContext = (() => mockCtx) as unknown as HTMLCanvasElement['getContext']
})

describe('ElementRenderer pan-mode recovery', () => {
  beforeEach(() => {
    useUIStore.setState({ selectedIds: [] } as any)
    useCanvasStore.setState({ activeTool: 'pan' } as any)
    useElementsStore.setState({
      elements: {
        desk1: {
          id: 'desk1',
          type: 'desk',
          x: 120,
          y: 120,
          width: 60,
          height: 30,
          rotation: 0,
          locked: false,
          groupId: null,
          zIndex: 1,
          label: 'Desk',
          visible: true,
          style: { fill: '#f3f4f6', stroke: '#9ca3af', strokeWidth: 1, opacity: 1 },
          deskId: 'D-001',
          assignedEmployeeId: null,
          capacity: 1,
        } as any,
      },
    })
  })

  it('selects clicked element and switches back to select mode from pan', () => {
    let stage: any
    render(
      <Stage width={500} height={500} ref={(s: any) => { stage = s }}>
        <ElementRenderer />
      </Stage>,
    )

    const group = stage.findOne('#element-desk1')
    expect(group).toBeTruthy()

    act(() => {
      group.fire('click', { evt: { shiftKey: false } })
    })

    expect(useUIStore.getState().selectedIds).toEqual(['desk1'])
    expect(useCanvasStore.getState().activeTool).toBe('select')
  })
})
