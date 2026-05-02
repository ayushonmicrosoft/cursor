import { describe, expect, it } from 'vitest'
import type { CanvasElement } from '../../../types/elements'
import type { Floor } from '../../../types/floor'
import { mapFloorToProjectedScene } from '../projector'
import { mapFloorToView3DScene } from '../../view3d/sceneMapping'
import { KonvaAdapter } from '../../konva/KonvaAdapter'
import { PixiAdapter } from '../../pixi/PixiAdapter'

function baseElement(id: string, type: CanvasElement['type']): CanvasElement {
  return {
    id,
    type,
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    rotation: 0,
    locked: false,
    groupId: null,
    zIndex: 1,
    label: '',
    visible: true,
    style: {
      fill: '#fff',
      stroke: '#000',
      strokeWidth: 1,
      opacity: 1,
    },
  } as CanvasElement
}

function createFloorFixture(): Floor {
  const wall = {
    ...baseElement('wall-1', 'wall'),
    points: [0, 0, 160, 0],
    bulges: [],
    thickness: 6,
    connectedWallIds: [],
    wallType: 'solid',
  }
  const desk = {
    ...baseElement('desk-1', 'desk'),
    x: 80,
    y: 40,
    width: 48,
    height: 24,
    deskId: 'D-1',
    assignedEmployeeId: null,
    capacity: 1 as const,
  } as CanvasElement
  const room = {
    ...baseElement('room-1', 'conference-room'),
    x: 220,
    y: 160,
    width: 120,
    height: 80,
    roomName: 'Board Room',
    capacity: 10,
  } as CanvasElement

  return {
    id: 'floor-a',
    name: 'Floor A',
    order: 0,
    elements: {
      [wall.id]: wall,
      [desk.id]: desk,
      [room.id]: room,
    },
  }
}

describe('twopointfive parity', () => {
  it('matches legacy view3d mapping output', () => {
    const floor = createFloorFixture()
    const next = mapFloorToProjectedScene(floor)
    const legacy = mapFloorToView3DScene(floor)
    expect(next).toEqual(legacy)
  })

  it('produces equivalent projected scene from both engine adapters', () => {
    const floor = createFloorFixture()
    const konva = new KonvaAdapter().projectSceneForReview(floor)
    const pixi = new PixiAdapter().projectSceneForReview(floor)
    expect(konva).toEqual(pixi)
  })
})
