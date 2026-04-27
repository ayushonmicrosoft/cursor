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
  minRadius?: number
  maxRadius?: number
  maxInstances?: number
}

export type View3DCameraPresetId = 'overview' | 'top-down' | 'walkthrough'

export interface View3DCameraPreset {
  id: View3DCameraPresetId
  label: string
  description: string
  position: [number, number, number]
  target: [number, number, number]
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
  minRadius: 100,
  maxRadius: 6000,
  maxInstances: 2500,
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

function createBounds(
  instances: View3DBoxInstance[],
  options: Required<Pick<View3DMappingOptions, 'minRadius' | 'maxRadius'>>,
): View3DCameraBounds {
  if (instances.length === 0) {
    return {
      minX: -options.minRadius,
      maxX: options.minRadius,
      minZ: -options.minRadius,
      maxZ: options.minRadius,
      centerX: 0,
      centerZ: 0,
      radius: options.minRadius,
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
  const unclampedRadius = Math.max(maxX - minX, maxZ - minZ) / 2
  const radius = Math.min(options.maxRadius, Math.max(unclampedRadius, options.minRadius))

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    centerX,
    centerZ,
    radius,
  }
}

function mapWallElement(
  el: WallElement,
  options: Required<View3DMappingOptions>,
  maxCount = Number.POSITIVE_INFINITY,
): View3DBoxInstance[] {
  if (el.points.length < 4) {
    return []
  }

  const items: View3DBoxInstance[] = []
  const thickness = Number.isFinite(el.thickness)
    ? Math.max(el.thickness || 0, options.minThickness)
    : options.minThickness

  for (let i = 0; i <= el.points.length - 4; i += 2) {
    if (items.length >= maxCount) {
      break
    }
    const x1 = el.points[i]
    const z1 = el.points[i + 1]
    const x2 = el.points[i + 2]
    const z2 = el.points[i + 3]

    if (![x1, z1, x2, z2].every((value) => Number.isFinite(value))) {
      continue
    }

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
  if (![el.x, el.y, el.width, el.height, el.rotation].every((value) => Number.isFinite(value))) {
    return null
  }

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

export function getView3DCameraPresets(bounds: View3DCameraBounds): View3DCameraPreset[] {
  const radius = Math.max(bounds.radius, 100)
  const centerY = 0

  return [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Balanced isometric review angle',
      position: [bounds.centerX + radius * 1.8, Math.max(radius * 0.95, 180), bounds.centerZ + radius * 1.8],
      target: [bounds.centerX, centerY, bounds.centerZ],
    },
    {
      id: 'top-down',
      label: 'Top Down',
      description: 'Orthographic-like plan review angle',
      position: [bounds.centerX + 0.01, Math.max(radius * 3, 260), bounds.centerZ + 0.01],
      target: [bounds.centerX, centerY, bounds.centerZ],
    },
    {
      id: 'walkthrough',
      label: 'Walkthrough',
      description: 'Eye-level circulation and sightline review',
      position: [bounds.centerX + radius * 1.35, Math.max(radius * 0.35, 72), bounds.centerZ - radius * 1.35],
      target: [bounds.centerX, Math.max(radius * 0.1, 16), bounds.centerZ],
    },
  ]
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
    if (instances.length >= options.maxInstances) {
      break
    }

    if (el.type === 'wall' && 'points' in el && 'thickness' in el) {
      const remaining = Math.max(options.maxInstances - instances.length, 0)
      if (remaining === 0) break
      instances.push(...mapWallElement(el as WallElement, options, remaining))
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
    bounds: createBounds(instances, {
      minRadius: options.minRadius,
      maxRadius: options.maxRadius,
    }),
  }
}
