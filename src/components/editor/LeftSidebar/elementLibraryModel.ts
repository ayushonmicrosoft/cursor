import type { BlockSourceTier } from '../../../blocks/registry'

export type LibraryItem = {
  type: string
  label: string
  category: string
  kit?: string
  shape?: string
  capacity?: number
  dimensions?: { width: number; height: number; unit: string }
  svgSource?: string
  customShapeId?: string
}

export const SHAPE_VARIANT_MAP: Record<string, string> = {
  'rect-shape': 'rectangle',
  ellipse: 'ellipse',
  'line-shape': 'line',
  arrow: 'arrow',
  'free-text': 'text',
}

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
