import { describe, expect, it } from 'vitest'
import type { Floor } from '../../types/floor'
import type { CanvasElement } from '../../types/elements'
import { getView3DCameraPresets, mapFloorToView3DScene } from './sceneMapping'

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
    } as CanvasElement

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
    expect(roomMesh?.materialProfile).toBe('room-zone')
    expect(roomMesh?.rotationY).toBeCloseTo(Math.PI / 12)
    expect(deskMesh?.kind).toBe('furniture')
    expect(deskMesh?.materialProfile).toBe('work-surface')
    expect(deskMesh?.size).toEqual([40, 18, 24])
  })

  it('uses review-mode proportions and materials for distinct object families', () => {
    const glassWall = {
      ...baseElement('wall-glass', 'wall'),
      points: [0, 0, 100, 0],
      bulges: [],
      thickness: 6,
      connectedWallIds: [],
      wallType: 'glass',
    }
    const hotDesk = {
      ...baseElement('hot-desk-1', 'hot-desk'),
      x: 30,
      y: 40,
      width: 42,
      height: 24,
      deskId: 'H-1',
      assignedEmployeeId: null,
      capacity: 1 as const,
    } as CanvasElement
    const divider = {
      ...baseElement('divider-1', 'divider'),
      x: 80,
      y: 40,
      width: 80,
      height: 4,
    } as CanvasElement

    const floor: Floor = {
      id: 'f-review',
      name: 'Review Floor',
      order: 0,
      elements: {
        [glassWall.id]: glassWall,
        [hotDesk.id]: hotDesk,
        [divider.id]: divider,
      },
    }

    const result = mapFloorToView3DScene(floor)
    const glassWallMesh = result.instances.find((item) => item.id === 'wall-glass:seg:0')
    const hotDeskMesh = result.instances.find((item) => item.id === 'hot-desk-1')
    const dividerMesh = result.instances.find((item) => item.id === 'divider-1')

    expect(glassWallMesh?.materialProfile).toBe('glass-wall')
    expect(glassWallMesh?.size[1]).toBeLessThan(120)
    expect(hotDeskMesh?.materialProfile).toBe('hot-desk')
    expect(hotDeskMesh?.size[1]).toBe(18)
    expect(dividerMesh?.materialProfile).toBe('divider')
    expect(dividerMesh?.size[1]).toBe(48)
    expect(dividerMesh?.size[2]).toBeGreaterThanOrEqual(4)
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
    } as CanvasElement

    const overrideResult = mapFloorToView3DScene(floor, { [desk.id]: desk })
    expect(overrideResult.instances).toHaveLength(1)
  })

  it('caps mapped instances for perf on large floors', () => {
    const floor: Floor = {
      id: 'f-perf',
      name: 'Perf Floor',
      order: 0,
      elements: {},
    }

    for (let i = 0; i < 12; i += 1) {
      floor.elements[`desk-${i}`] = {
        ...baseElement(`desk-${i}`, 'desk'),
        x: i * 20,
        y: i * 10,
        deskId: `D-${i}`,
        assignedEmployeeId: null,
        capacity: 1 as const,
      } as CanvasElement
    }

    const result = mapFloorToView3DScene(floor, undefined, { maxInstances: 5 })
    expect(result.instances).toHaveLength(5)
  })

  it('clamps very large bounds to max radius defaults', () => {
    const giantRoom = {
      ...baseElement('room-giant', 'conference-room'),
      x: 0,
      y: 0,
      width: 22000,
      height: 8000,
      roomName: 'Giant',
      capacity: 99,
    }

    const floor: Floor = {
      id: 'f-giant',
      name: 'Giant Floor',
      order: 0,
      elements: {
        [giantRoom.id]: giantRoom,
      },
    }

    const result = mapFloorToView3DScene(floor)
    expect(result.bounds.radius).toBe(6000)
  })

  it('returns review camera presets anchored to scene bounds', () => {
    const floor: Floor = {
      id: 'f-preset',
      name: 'Preset Floor',
      order: 0,
      elements: {},
    }

    const scene = mapFloorToView3DScene(floor)
    const presets = getView3DCameraPresets(scene.bounds)

    expect(presets).toHaveLength(3)
    expect(presets.map((preset) => preset.id)).toEqual(['overview', 'top-down', 'walkthrough'])
    expect(presets[1].position[1]).toBeGreaterThan(presets[0].position[1])
    expect(presets[2].target[1]).toBeGreaterThan(0)
  })
})
