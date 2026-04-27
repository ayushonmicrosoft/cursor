import type { CanvasElement, WallElement } from '../../types/elements'
import type { Floor } from '../../types/floor'

export type View3DInstanceKind = 'wall' | 'room' | 'furniture'

export type View3DMaterialProfile =
  | 'solid-wall'
  | 'glass-wall'
  | 'half-wall'
  | 'room-zone'
  | 'work-surface'
  | 'hot-desk'
  | 'meeting-table'
  | 'soft-seating'
  | 'divider'
  | 'plant'
  | 'equipment'
  | 'whiteboard'
  | 'generic-furniture'

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
  wallHeight: 96,
  roomHeight: 8,
  furnitureHeight: 20,
  minThickness: 2,
  minRadius: 100,
  maxRadius: 6000,
  maxInstances: 2500,
}

const ROOM_PRESENTATION: Partial<
  Record<CanvasElement['type'], { color: string; height: number }>
> = {
  'conference-room': { color: '#bfdbfe', height: 10 },
  'phone-booth': { color: '#ddd6fe', height: 14 },
  'common-area': { color: '#bbf7d0', height: 6 },
}

const FURNITURE_PRESENTATION: Partial<
  Record<
    CanvasElement['type'],
    { color: string; height: number; materialProfile: View3DMaterialProfile; minDepth?: number }
  >
> = {
  desk: { color: '#38bdf8', height: 18, materialProfile: 'work-surface' },
  'hot-desk': { color: '#2dd4bf', height: 18, materialProfile: 'hot-desk' },
  workstation: { color: '#60a5fa', height: 20, materialProfile: 'work-surface' },
  'private-office': { color: '#818cf8', height: 28, materialProfile: 'work-surface' },
  'table-rect': { color: '#d6a85e', height: 18, materialProfile: 'meeting-table' },
  'table-conference': { color: '#c084fc', height: 20, materialProfile: 'meeting-table' },
  'table-round': { color: '#d6a85e', height: 18, materialProfile: 'meeting-table' },
  'table-oval': { color: '#d6a85e', height: 18, materialProfile: 'meeting-table' },
  chair: { color: '#64748b', height: 16, materialProfile: 'generic-furniture', minDepth: 10 },
  counter: { color: '#94a3b8', height: 34, materialProfile: 'equipment' },
  divider: { color: '#64748b', height: 48, materialProfile: 'divider', minDepth: 4 },
  planter: { color: '#22c55e', height: 24, materialProfile: 'plant', minDepth: 12 },
  plant: { color: '#16a34a', height: 34, materialProfile: 'plant', minDepth: 12 },
  sofa: { color: '#f97316', height: 20, materialProfile: 'soft-seating' },
  printer: { color: '#64748b', height: 28, materialProfile: 'equipment', minDepth: 18 },
  whiteboard: { color: '#f8fafc', height: 64, materialProfile: 'whiteboard', minDepth: 3 },
  decor: { color: '#a3a3a3', height: 22, materialProfile: 'generic-furniture' },
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

function getWallPresentation(el: WallElement, options: Required<View3DMappingOptions>) {
  if (el.wallType === 'glass') {
    return {
      height: Math.max(options.wallHeight * 0.92, 72),
      color: '#7dd3fc',
      materialProfile: 'glass-wall' as const,
    }
  }
  if (el.wallType === 'half-height') {
    return {
      height: Math.max(options.wallHeight * 0.52, 44),
      color: '#64748b',
      materialProfile: 'half-wall' as const,
    }
  }
  return {
    height: el.wallType === 'demountable' ? Math.max(options.wallHeight * 0.82, 72) : options.wallHeight,
    color: el.wallType === 'demountable' ? '#475569' : '#334155',
    materialProfile: 'solid-wall' as const,
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
  const presentation = getWallPresentation(el, options)

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
  el: CanvasElement,
  kind: View3DInstanceKind,
  height: number,
  color: string,
  minThickness: number,
  materialProfile: View3DMaterialProfile,
  minDepth = minThickness,
): View3DBoxInstance | null {
  if (![el.x, el.y, el.width, el.height, el.rotation].every((value) => Number.isFinite(value))) {
    return null
  }

  const width = Math.max(el.width, minThickness)
  const depth = Math.max(el.height, minDepth, minThickness)

  if (width <= 0 || depth <= 0) {
    return null
  }

  return {
    id: el.id,
    kind,
    elementType: el.type,
    materialProfile,
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
      const roomPresentation = ROOM_PRESENTATION[el.type] ?? {
        color: '#cbd5e1',
        height: options.roomHeight,
      }
      const room = mapRectLikeElement(
        el,
        'room',
        roomPresentation.height,
        roomPresentation.color,
        options.minThickness,
        'room-zone',
      )
      if (room) instances.push(room)
      continue
    }

    if (FURNITURE_TYPES.has(el.type)) {
      const presentation = FURNITURE_PRESENTATION[el.type] ?? {
        color: '#94a3b8',
        height: options.furnitureHeight,
        materialProfile: 'generic-furniture' as const,
      }
      const furniture = mapRectLikeElement(
        el,
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
