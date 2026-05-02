import type { ElementType } from '../types/elements'
import { blockCategory, blocksByCategory, isPolylineType } from './registry'

export type BlockRenderEngine = 'konva' | 'pixi' | 'svg'

export type BlockRenderFamily =
  | 'desk'
  | 'workstation'
  | 'wall'
  | 'table'
  | 'room'
  | 'decor'
  | 'shape'
  | 'media'
  | 'unknown'

export interface BlockRendererAdapter<TTarget, TContext = unknown> {
  engine: BlockRenderEngine
  family: BlockRenderFamily
  supports: (type: ElementType) => boolean
  render: (target: TTarget, context: TContext) => void
}

export const DESK_BLOCK_TYPES = new Set<string>(
  blocksByCategory('desk').filter((type) => type !== 'workstation'),
)
export const WALL_BLOCK_TYPES = new Set<string>(blocksByCategory('wall'))
export const TABLE_BLOCK_TYPES = new Set<string>(blocksByCategory('table'))
export const ROOM_BLOCK_TYPES = new Set<string>(blocksByCategory('room'))

export function blockRenderFamily(type: ElementType): BlockRenderFamily {
  if (type === 'workstation') return 'workstation'
  const category = blockCategory(type)
  return category ?? 'unknown'
}

export function isStrokeOnlyBlock(type: ElementType): boolean {
  return WALL_BLOCK_TYPES.has(type) && isPolylineType(type)
}

export function isCenterAnchoredBlock(type: ElementType): boolean {
  return !isStrokeOnlyBlock(type)
}
