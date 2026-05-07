import type { CanvasElement, WallElement } from '../../types/elements'
import type { Floor } from '../../types/floor'
import {
  FURNITURE_PRESENTATION,
  FURNITURE_TYPES,
  getWallPresentation,
  ROOM_PRESENTATION,
  ROOM_TYPES,
  type View3DMaterialProfile,
} from './materials'

export type View3DInstanceKind = 'wall' | 'room' | 'furniture'

export interface View3DBoxInstance {
  id: string
  kind: View3DInstanceKind
  elementType: CanvasElement['type'] | 'wall-segment'
  materialProfile: View3DMaterialProfile
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

const DEFAULTS: Required<View3DMappingOptions> = {
  wallHeight: 96,
  roomHeight: 8,
  furnitureHeight: 20,
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
  wall: WallElement,
  options: Required<View3DMappingOptions>,
  maxCount = Number.POSITIVE_INFINITY,
): View3DBoxInstance[] {
  if (wall.points.length < 4) {
    return []
  }

  const items: View3DBoxInstance[] = []
  const thickness = Number.isFinite(wall.thickness)
    ? Math.max(wall.thickness || 0, options.minThickness)
    : options.minThickness
  const presentation = getWallPresentation(wall, options.wallHeight)

  for (let i = 0; i <= wall.points.length - 4; i += 2) {
    if (items.length >= maxCount) break

    const x1 = wall.points[i]
    const z1 = wall.points[i + 1]
    const x2 = wall.points[i + 2]
    const z2 = wall.points[i + 3]

    if (![x1, z1, x2, z2].every((value) => Number.isFinite(value))) continue

    const dx = x2 - x1
    const dz = z2 - z1
    const length = Math.hypot(dx, dz)
    if (length <= 0) continue

    items.push({
      id: `${wall.id}:seg:${i / 2}`,
      kind: 'wall',
      elementType: 'wall-segment',
      materialProfile: presentation.materialProfile,
      position: [(x1 + x2) / 2, presentation.height / 2, (z1 + z2) / 2],
      size: [length, presentation.height, thickness],
      rotationY: Math.atan2(dz, dx),
      color: presentation.color,
    })
  }

  return items
}

function mapRectLikeElement(
  element: CanvasElement,
  kind: View3DInstanceKind,
  height: number,
  color: string,
  minThickness: number,
  materialProfile: View3DMaterialProfile,
  minDepth = minThickness,
): View3DBoxInstance | null {
  if (![element.x, element.y, element.width, element.height, element.rotation].every((value) => Number.isFinite(value))) {
    return null
  }

  const width = Math.max(element.width, minThickness)
  const depth = Math.max(element.height, minDepth, minThickness)
  if (width <= 0 || depth <= 0) return null

  return {
    id: element.id,
    kind,
    elementType: element.type,
    materialProfile,
    position: [element.x, height / 2, element.y],
    size: [width, height, depth],
    rotationY: toRadians(element.rotation),
    color,
  }
}

export function getTwoPointFiveCameraPresets(bounds: View3DCameraBounds): View3DCameraPreset[] {
  const radius = Math.max(bounds.radius, 100)
  const centerY = 0

  return [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Balanced isometric review angle',
      position: [bounds.centerX + radius * 1.55, Math.max(radius * 0.82, 180), bounds.centerZ + radius * 1.55],
      target: [bounds.centerX, centerY, bounds.centerZ],
    },
    {
      id: 'top-down',
      label: 'Top Down',
      description: 'Orthographic-like plan review angle',
      position: [bounds.centerX + 0.01, Math.max(radius * 2.65, 260), bounds.centerZ + 0.01],
      target: [bounds.centerX, centerY, bounds.centerZ],
    },
    {
      id: 'walkthrough',
      label: 'Walkthrough',
      description: 'Eye-level circulation and sightline review',
      position: [bounds.centerX + radius * 1.18, Math.max(radius * 0.28, 76), bounds.centerZ - radius * 1.18],
      target: [bounds.centerX, Math.max(radius * 0.1, 16), bounds.centerZ],
    },
  ]
}

export function mapFloorToProjectedScene(
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

  for (const element of Object.values(sourceElements)) {
    if (instances.length >= options.maxInstances) break

    if (element.type === 'wall' && 'points' in element && 'thickness' in element) {
      const remaining = Math.max(options.maxInstances - instances.length, 0)
      if (remaining === 0) break
      instances.push(...mapWallElement(element as WallElement, options, remaining))
      continue
    }

    if (ROOM_TYPES.has(element.type)) {
      const roomPresentation = ROOM_PRESENTATION[element.type] ?? {
        color: '#cbd5e1',
        height: options.roomHeight,
      }
      const room = mapRectLikeElement(
        element,
        'room',
        roomPresentation.height,
        roomPresentation.color,
        options.minThickness,
        'room-zone',
      )
      if (room) instances.push(room)
      continue
    }

    if (FURNITURE_TYPES.has(element.type)) {
      const presentation = FURNITURE_PRESENTATION[element.type] ?? {
        color: '#94a3b8',
        height: options.furnitureHeight,
        materialProfile: 'generic-furniture' as const,
      }
      const furniture = mapRectLikeElement(
        element,
        'furniture',
        presentation.height,
        presentation.color,
        options.minThickness,
        presentation.materialProfile,
        presentation.minDepth,
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
