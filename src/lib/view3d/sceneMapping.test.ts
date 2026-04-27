import { describe, expect, it } from 'vitest'
import type { Floor } from '../../types/floor'
import type { CanvasElement } from '../../types/elements'
import { mapFloorToView3DScene } from './sceneMapping'

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

describe('mapFloorToView3DScene', () => {
  it('maps wall points to segment boxes', () => {
    const wall = {
      ...baseElement('wall-1', 'wall'),
      points: [0, 0, 100, 0, 100, 50],
      bulges: [],
      thickness: 6,
      connectedWallIds: [],
      wallType: 'solid',
    }

    const floor: Floor = {
      id: 'f1',
      name: 'Floor 1',
      order: 0,
      elements: {
        [wall.id]: wall,
      },
    }

    const result = mapFloorToView3DScene(floor)

    expect(result.instances).toHaveLength(2)
    expect(result.instances[0].size[0]).toBe(100)
    expect(result.instances[0].size[2]).toBe(6)
    expect(result.instances[1].position[0]).toBe(100)
    expect(result.instances[1].position[2]).toBe(25)
  })

  it('maps rooms and furniture using center position and rotation', () => {
    const room = {
      ...baseElement('room-1', 'conference-room'),
      x: 300,
      y: 200,
      width: 150,
      height: 80,
      rotation: 15,
      roomName: 'A',
      capacity: 6,
    }

    const desk = {
      ...baseElement('desk-1', 'desk'),
      x: 330,
      y: 210,
      width: 40,
      height: 24,
      deskId: 'D-1',
      assignedEmployeeId: null,
      capacity: 1 as const,
    }

    const floor: Floor = {
      id: 'f1',
      name: 'Floor 1',
      order: 0,
      elements: {
        [room.id]: room,
        [desk.id]: desk,
      },
    }

    const result = mapFloorToView3DScene(floor)
    const roomMesh = result.instances.find((item) => item.id === 'room-1')
    const deskMesh = result.instances.find((item) => item.id === 'desk-1')

    expect(roomMesh?.kind).toBe('room')
    expect(roomMesh?.position).toEqual([300, 5, 200])
    expect(roomMesh?.rotationY).toBeCloseTo(Math.PI / 12)
    expect(deskMesh?.kind).toBe('furniture')
    expect(deskMesh?.size).toEqual([40, 36, 24])
  })

  it('uses element overrides and default bounds when empty', () => {
    const floor: Floor = {
      id: 'f1',
      name: 'Floor 1',
      order: 0,
      elements: {},
    }

    const result = mapFloorToView3DScene(floor, undefined)
    expect(result.instances).toHaveLength(0)
    expect(result.bounds.radius).toBe(100)

    const desk = {
      ...baseElement('desk-2', 'desk'),
      deskId: 'D-2',
      assignedEmployeeId: null,
      capacity: 1 as const,
    }

    const overrideResult = mapFloorToView3DScene(floor, { [desk.id]: desk })
    expect(overrideResult.instances).toHaveLength(1)
  })
})
