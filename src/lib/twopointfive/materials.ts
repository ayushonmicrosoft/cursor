import type { CanvasElement, WallElement } from '../../types/elements'

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

export const VIEW3D_MATERIAL_SETTINGS: Record<
  View3DMaterialProfile,
  {
    roughness: number
    metalness: number
    opacity?: number
    edge: string
    edgeOpacity: number
    emissive?: string
  }
> = {
  'solid-wall': { roughness: 0.72, metalness: 0.04, edge: '#0f172a', edgeOpacity: 0.3 },
  'glass-wall': { roughness: 0.2, metalness: 0, opacity: 0.36, edge: '#0369a1', edgeOpacity: 0.36 },
  'half-wall': { roughness: 0.7, metalness: 0.03, edge: '#1e293b', edgeOpacity: 0.28 },
  'room-zone': { roughness: 0.9, metalness: 0, opacity: 0.42, edge: '#475569', edgeOpacity: 0.24 },
  'work-surface': { roughness: 0.64, metalness: 0.08, edge: '#075985', edgeOpacity: 0.22 },
  'hot-desk': { roughness: 0.66, metalness: 0.06, edge: '#0f766e', edgeOpacity: 0.22 },
  'meeting-table': { roughness: 0.58, metalness: 0.04, edge: '#78350f', edgeOpacity: 0.2 },
  'soft-seating': { roughness: 0.86, metalness: 0, edge: '#9a3412', edgeOpacity: 0.2 },
  divider: { roughness: 0.7, metalness: 0.03, opacity: 0.9, edge: '#334155', edgeOpacity: 0.26 },
  plant: { roughness: 0.82, metalness: 0, edge: '#166534', edgeOpacity: 0.16 },
  equipment: { roughness: 0.54, metalness: 0.16, edge: '#334155', edgeOpacity: 0.2 },
  whiteboard: { roughness: 0.38, metalness: 0.02, edge: '#94a3b8', edgeOpacity: 0.28, emissive: '#f8fafc' },
  'generic-furniture': { roughness: 0.68, metalness: 0.04, edge: '#334155', edgeOpacity: 0.2 },
}

export const ROOM_TYPES = new Set<CanvasElement['type']>([
  'conference-room',
  'phone-booth',
  'common-area',
])

export const FURNITURE_TYPES = new Set<CanvasElement['type']>([
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

export const ROOM_PRESENTATION: Partial<
  Record<CanvasElement['type'], { color: string; height: number }>
> = {
  'conference-room': { color: '#bfdbfe', height: 10 },
  'phone-booth': { color: '#ddd6fe', height: 14 },
  'common-area': { color: '#bbf7d0', height: 6 },
}

export const FURNITURE_PRESENTATION: Partial<
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

export function getWallPresentation(
  wall: WallElement,
  wallHeight: number,
): { height: number; color: string; materialProfile: 'solid-wall' | 'glass-wall' | 'half-wall' } {
  if (wall.wallType === 'glass') {
    return {
      height: Math.max(wallHeight * 0.92, 72),
      color: '#7dd3fc',
      materialProfile: 'glass-wall',
    }
  }
  if (wall.wallType === 'half-height') {
    return {
      height: Math.max(wallHeight * 0.52, 44),
      color: '#64748b',
      materialProfile: 'half-wall',
    }
  }
  return {
    height: wall.wallType === 'demountable' ? Math.max(wallHeight * 0.82, 72) : wallHeight,
    color: wall.wallType === 'demountable' ? '#475569' : '#334155',
    materialProfile: 'solid-wall',
  }
}
