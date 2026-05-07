import { nanoid } from 'nanoid'
import type { BlockSourceTier } from '../../../blocks/registry'
import type { BaseElement, ElementStyle, ElementType } from '../../../types/elements'

export const LIBRARY_DRAG_MIME = 'application/x-oandocraft-library-item'

export type ShapeVariant =
  | 'rectangle'
  | 'rounded-rect'
  | 'triangle'
  | 'ellipse'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'callout'
  | 'arc'
  | 'diamond'
  | 'hexagon'
  | 'pentagon'
  | 'oval'
  | 'speech-bubble'
  | 'text'

export type LibraryItem = {
  type: string
  label: string
  category: string
  kit?: string
  shape?: string
  shapeVariant?: ShapeVariant
  capacity?: number
  dimensions?: { width: number; height: number; unit: string }
  svgSource?: string
  customShapeId?: string
}

export const SHAPE_VARIANT_MAP: Record<string, ShapeVariant> = {
  Rectangle: 'rectangle',
  Ellipse: 'ellipse',
  Line: 'line',
  Arrow: 'arrow',
  Text: 'text',
  'Rounded Rect': 'rounded-rect',
  Triangle: 'triangle',
  Circle: 'circle',
  Callout: 'callout',
  Arc: 'arc',
  Diamond: 'diamond',
  Hexagon: 'hexagon',
  Pentagon: 'pentagon',
  Oval: 'oval',
  'Speech Bubble': 'speech-bubble',
}

export const SHAPE_CREATOR_LABELS: Array<{ type: string; label: string; hint: string }> = [
  { type: 'rect-shape', label: 'Rectangle', hint: 'Drag to size a rectangle' },
  { type: 'ellipse', label: 'Ellipse', hint: 'Drag to size an ellipse' },
  { type: 'line-shape', label: 'Line', hint: 'Drag to draw a line' },
  { type: 'arrow', label: 'Arrow', hint: 'Drag to draw an arrow' },
  { type: 'free-text', label: 'Text', hint: 'Click to place text' },
]

export type LibraryBlock = {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  assetType: string
  sourceTier: BlockSourceTier
  canonical: boolean
  provenance: string
  sourceUrl?: string | null
  assetUrl?: string | null
  thumbnailUrl?: string | null
  status: 'draft' | 'imported' | 'verified' | 'archived'
}

function baseElement(type: ElementType, x: number, y: number, zIndex: number, label: string) {
  return {
    id: nanoid(),
    type,
    x,
    y,
    width: 1,
    height: 1,
    rotation: 0,
    locked: false,
    groupId: null,
    zIndex,
    label,
    visible: true,
    style: { fill: 'transparent', stroke: '#111827', strokeWidth: 1, opacity: 1 } satisfies ElementStyle,
  }
}

function parseSvgDimensions(svgSource?: string): { width: number; height: number; unit: string } | null {
  if (!svgSource) return null
  const viewBoxMatch = svgSource.match(/viewBox\s*=\s*(["'])([^"']+)\1/i)
  if (viewBoxMatch) {
    const parts = viewBoxMatch[2].trim().split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts.every((value) => Number.isFinite(value))) {
      const [, , width, height] = parts
      if (width > 0 && height > 0) return { width, height, unit: 'px' }
    }
  }

  const widthMatch = svgSource.match(/\bwidth\s*=\s*(["'])([^"']+)\1/i)
  const heightMatch = svgSource.match(/\bheight\s*=\s*(["'])([^"']+)\1/i)
  if (widthMatch && heightMatch) {
    const width = Number.parseFloat(widthMatch[2])
    const height = Number.parseFloat(heightMatch[2])
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return { width, height, unit: 'px' }
    }
  }

  return null
}

export function buildLibraryElements(
  item: LibraryItem,
  x: number,
  y: number,
  zIndex: number,
  _existing: BaseElement[] = [],
): BaseElement[] {
  const dims =
    item.type === 'custom-svg'
      ? item.dimensions ?? parseSvgDimensions(item.svgSource) ?? { width: 80, height: 80, unit: 'px' }
      : item.dimensions ?? { width: 80, height: 80, unit: 'px' }

  if (item.type === 'custom-svg') {
    return [
      {
        ...baseElement('custom-svg' as ElementType, x, y, zIndex, item.label),
        type: 'custom-svg' as ElementType,
        width: dims.width,
        height: dims.height,
        svgSource: item.svgSource,
        customShapeId: item.customShapeId,
      } as BaseElement,
    ]
  }

  if (item.type === 'free-text') {
    return [
      {
        ...baseElement('free-text', x, y, zIndex, item.label),
        type: 'free-text',
        width: 80,
        height: 28,
        text: item.label,
        fontSize: 18,
      } as BaseElement,
    ]
  }

  if (item.type === 'line-shape' || item.type === 'arrow') {
    return [
      {
        ...baseElement(item.type as ElementType, x, y, zIndex, item.label),
        type: item.type as ElementType,
        width: 100,
        height: 100,
        points: [x - 40, y - 40, x + 40, y + 40],
      } as BaseElement,
    ]
  }

  if (item.type === 'rect-shape' || item.type === 'ellipse') {
    return [
      {
        ...baseElement(item.type as ElementType, x, y, zIndex, item.label),
        type: item.type as ElementType,
        width: 100,
        height: 100,
      } as BaseElement,
    ]
  }

  return [
    {
      ...baseElement(item.type as ElementType, x, y, zIndex, item.label),
      type: item.type as ElementType,
      width: dims.width,
      height: dims.height,
      catalog: item.capacity ? { capacity: item.capacity, dimensions: dims, source: 'catalog' } : undefined,
    } as BaseElement,
  ]
}
