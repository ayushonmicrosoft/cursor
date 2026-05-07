import {
  findAlignmentGuides,
  getSnappedPosition,
  snapRotation,
  snapToGrid,
  type AlignmentGuide,
  type Point,
  type Rect,
} from './geometry'

export interface GridSnapOptions {
  enabled: boolean
  gridSize: number
}

export interface AlignmentSnapOptions {
  enabled?: boolean
  threshold: number
}

export interface ElementSnapInput {
  position: Point
  size: { width: number; height: number }
  references: Rect[]
  alignment: AlignmentSnapOptions
}

export interface ElementSnapResult {
  snapped: Point
  guides: AlignmentGuide[]
}

/**
 * Shared snapping contract for every rendering engine.
 *
 * Konva owns the mature interaction path today, but Pixi and SVG/export
 * should call through this module instead of inventing engine-specific
 * snapping math.
 */
export const SnapEngine = {
  gridValue(value: number, options: GridSnapOptions): number {
    if (!options.enabled || options.gridSize <= 0) return value
    return snapToGrid(value, options.gridSize)
  },

  gridPoint(point: Point, options: GridSnapOptions): Point {
    if (!options.enabled || options.gridSize <= 0) return point
    return {
      x: snapToGrid(point.x, options.gridSize),
      y: snapToGrid(point.y, options.gridSize),
    }
  },

  rotation(degrees: number, snapIncrement: number): number {
    if (snapIncrement <= 0) return degrees
    return snapRotation(degrees, snapIncrement)
  },

  alignment(input: ElementSnapInput): ElementSnapResult {
    if (!input.alignment.enabled) {
      return { snapped: input.position, guides: [] }
    }
    return getSnappedPosition(
      input.position,
      input.references,
      input.size,
      input.alignment.threshold,
    )
  },

  guides(
    movingRect: Rect,
    references: Rect[],
    options: AlignmentSnapOptions,
  ): AlignmentGuide[] {
    if (!options.enabled) return []
    return findAlignmentGuides(movingRect, references, options.threshold)
  },
}

export type { AlignmentGuide, Point, Rect }
