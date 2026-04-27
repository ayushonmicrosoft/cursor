import type { CanvasElement, WallElement } from '../../types/elements'
import type { Floor } from '../../types/floor'

export type View3DInstanceKind = 'wall' | 'room' | 'furniture'

export interface View3DBoxInstance {
  id: string
  kind: View3DInstanceKind
  position: [number, number, number]
  size: [number, number, number]
  rotationY: number
  color: string
}

export interface View3DCameraBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  centerX: number
  centerZ: number
  radius: number
}

export interface View3DSceneData {
  instances: View3DBoxInstance[]
  bounds: View3DCameraBounds
}

export interface View3DMappingOptions {
  wallHeight?: number
  roomHeight?: number
  furnitureHeight?: number
  minThickness?: number
}

const ROOM_TYPES = new Set<CanvasElement['type']>([
  'conference-room',
  'phone-booth',
  'common-area',
])

const FURNITURE_TYPES = new Set<CanvasElement['type']>([
  'desk',
  'hot-desk',
  'workstation',
  'private-office',
  'table-rect',
  'table-conference',
  'table-round',
  'table-oval',
  'chair',
  'counter',
  'divider',
  'planter',
  'decor',
  'sofa',
  'plant',
  'printer',
  'whiteboard',
])

const DEFAULTS: Required<View3DMappingOptions> = {
  wallHeight: 120,
  roomHeight: 10,
  furnitureHeight: 36,
  minThickness: 2,
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

function createBounds(instances: View3DBoxInstance[]): View3DCameraBounds {
  if (instances.length === 0) {
    return {
      minX: -100,
      maxX: 100,
      minZ: -100,
      maxZ: 100,
      centerX: 0,
      centerZ: 0,
      radius: 100,
    }
  }

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minZ = Number.POSITIVE_INFINITY
  let maxZ = Number.NEGATIVE_INFINITY

  for (const instance of instances) {
    const [x, , z] = instance.position
    const [width, , depth] = instance.size
    const halfW = width / 2
    const halfD = depth / 2
    minX = Math.min(minX, x - halfW)
    maxX = Math.max(maxX, x + halfW)
    minZ = Math.min(minZ, z - halfD)
    maxZ = Math.max(maxZ, z + halfD)
  }

  const centerX = (minX + maxX) / 2
  const centerZ = (minZ + maxZ) / 2
  const radius = Math.max(maxX - minX, maxZ - minZ) / 2

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    centerX,
    centerZ,
    radius: Math.max(radius, 50),
  }
}

function mapWallElement(el: WallElement, options: Required<View3DMappingOptions>): View3DBoxInstance[] {
  if (el.points.length < 4) {
    return []
  }

  const items: View3DBoxInstance[] = []
  const thickness = Math.max(el.thickness || 0, options.minThickness)

  for (let i = 0; i <= el.points.length - 4; i += 2) {
    const x1 = el.points[i]
    const z1 = el.points[i + 1]
    const x2 = el.points[i + 2]
    const z2 = el.points[i + 3]
    const dx = x2 - x1
    const dz = z2 - z1
    const length = Math.hypot(dx, dz)

    if (length <= 0) {
      continue
    }

    items.push({
      id: `${el.id}:seg:${i / 2}`,
      kind: 'wall',
      position: [(x1 + x2) / 2, options.wallHeight / 2, (z1 + z2) / 2],
      size: [length, options.wallHeight, thickness],
      rotationY: Math.atan2(dz, dx),
      color: '#475569',
    })
  }

  return items
}

function mapRectLikeElement(
  el: CanvasElement,
  kind: View3DInstanceKind,
  height: number,
  color: string,
  minThickness: number,
): View3DBoxInstance | null {
  const width = Math.max(el.width, minThickness)
  const depth = Math.max(el.height, minThickness)

  if (width <= 0 || depth <= 0) {
    return null
  }

  return {
    id: el.id,
    kind,
    position: [el.x, height / 2, el.y],
    size: [width, height, depth],
    rotationY: toRadians(el.rotation),
    color,
  }
}

export function mapFloorToView3DScene(
  floor: Floor | null | undefined,
  elementsOverride?: Record<string, CanvasElement>,
  inputOptions: View3DMappingOptions = {},
): View3DSceneData {
  const options: Required<View3DMappingOptions> = {
    ...DEFAULTS,
    ...inputOptions,
  }

  const sourceElements = elementsOverride ?? floor?.elements ?? {}
  const instances: View3DBoxInstance[] = []

  for (const el of Object.values(sourceElements)) {
    if (el.type === 'wall' && 'points' in el && 'thickness' in el) {
      instances.push(...mapWallElement(el as WallElement, options))
      continue
    }

    if (ROOM_TYPES.has(el.type)) {
      const room = mapRectLikeElement(
        el,
        'room',
        options.roomHeight,
        '#cbd5e1',
        options.minThickness,
      )
      if (room) instances.push(room)
      continue
    }

    if (FURNITURE_TYPES.has(el.type)) {
      const furniture = mapRectLikeElement(
        el,
        'furniture',
        options.furnitureHeight,
        '#94a3b8',
        options.minThickness,
      )
      if (furniture) instances.push(furniture)
    }
  }

  return {
    instances,
    bounds: createBounds(instances),
  }
}
