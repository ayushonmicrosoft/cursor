/**
 * Block Registry — single source of truth for all element types.
 *
 * Maps every ElementType to its metadata, defaults, and rendering hints.
 * Both Konva and PixiJS renderers import from here instead of duplicating
 * category sets (DESK_TYPES, ROOM_TYPES, etc.) in multiple files.
 *
 * Usage:
 *   import { BLOCK_REGISTRY, blockCategory } from '../blocks/registry'
 *   const meta = BLOCK_REGISTRY['desk']   // { label, category, defaultSize, ... }
 *   const cat  = blockCategory('desk')     // 'desk'
 */

import type { ElementType, ElementStyle } from '../types/elements'

// ── Categories ────────────────────────────────────────────────────────────────
export type BlockCategory =
  | 'desk'        // assignable seats (desk, hot-desk, workstation, private-office)
  | 'room'        // enclosed spaces (conference-room, phone-booth, common-area, lounge)
  | 'wall'        // structural lines (wall, door, window, glass-wall)
  | 'table'       // shared tables (table-rect, table-conference, table-round, table-oval)
  | 'decor'       // furniture / props (sofa, plant, printer, whiteboard, decor)
  | 'shape'       // drawing primitives (rect-shape, ellipse, line-shape, arrow, free-text)
  | 'media'       // background images, SVG uploads

// ── Block definition ──────────────────────────────────────────────────────────
export type BlockSourceTier = 'canonical' | 'curated' | 'legacy' | 'fallback'

export interface BlockMeta {
  label: string
  category: BlockCategory
  defaultSize: { w: number; h: number }
  defaultStyle: Partial<ElementStyle>
  /** Can an employee be assigned to this block? */
  assignable: boolean
  /** Does it carry multi-employee positions (workstation bench)? */
  multiSeat: boolean
  /** Is this a polyline element (has `points[]`)? */
  polyline: boolean
  /** Emoji/icon char for quick identification in the UI. */
  icon: string
  /** Governance tier for source quality and replacement priority. */
  sourceTier: BlockSourceTier
  /** Is this the preferred canonical block for its family? */
  canonical: boolean
  /** Human-readable provenance note for docs and review. */
  provenance: string
}

// ── Registry ──────────────────────────────────────────────────────────────────
export const BLOCK_REGISTRY: Partial<Record<ElementType, BlockMeta>> = {
  // ── Canonical plan blocks ───────────────────────────────────────────────
  desk: {
    label: 'Desk', category: 'desk', icon: 'desk',
    defaultSize: { w: 84, h: 60 },
    defaultStyle: { fill: '#f5efe2', stroke: '#a16207', strokeWidth: 1.5, opacity: 1 },
    assignable: true, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical assignable desk block for standard single-seat work points.',
  },
  'hot-desk': {
    label: 'Hot Desk', category: 'desk', icon: 'hot',
    defaultSize: { w: 84, h: 60 },
    defaultStyle: { fill: '#ede9fe', stroke: '#7c3aed', strokeWidth: 1.5, opacity: 1 },
    assignable: true, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical flexible desk block for shared or transient assignments.',
  },
  workstation: {
    label: 'Workstation Bench', category: 'desk', icon: 'bench',
    defaultSize: { w: 240, h: 72 },
    defaultStyle: { fill: '#ecfdf5', stroke: '#059669', strokeWidth: 1.5, opacity: 1 },
    assignable: true, multiSeat: true, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical multi-seat workstation block for bench-style seating.',
  },
  'private-office': {
    label: 'Private Office', category: 'desk', icon: 'office',
    defaultSize: { w: 160, h: 140 },
    defaultStyle: { fill: '#fff7ed', stroke: '#ea580c', strokeWidth: 1.5, opacity: 1 },
    assignable: true, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical enclosed work block for private offices.',
  },

  'conference-room': {
    label: 'Conference Room', category: 'room', icon: 'room',
    defaultSize: { w: 300, h: 200 },
    defaultStyle: { fill: '#eff6ff', stroke: '#2563eb', strokeWidth: 2, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical meeting room block for enclosed collaboration space.',
  },
  'phone-booth': {
    label: 'Phone Booth', category: 'room', icon: 'booth',
    defaultSize: { w: 84, h: 84 },
    defaultStyle: { fill: '#f0fdf4', stroke: '#16a34a', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical quiet-focus room block.',
  },
  'common-area': {
    label: 'Common Area', category: 'room', icon: 'common',
    defaultSize: { w: 220, h: 160 },
    defaultStyle: { fill: '#fffbeb', stroke: '#d97706', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical shared amenity block for lounge or kitchen-adjacent space.',
  },

  wall: {
    label: 'Wall', category: 'wall', icon: 'wall',
    defaultSize: { w: 200, h: 8 },
    defaultStyle: { fill: '#4b5563', stroke: '#4b5563', strokeWidth: 8, opacity: 1 },
    assignable: false, multiSeat: false, polyline: true,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical structural boundary block.',
  },
  door: {
    label: 'Door', category: 'wall', icon: 'door',
    defaultSize: { w: 80, h: 8 },
    defaultStyle: { fill: '#92400e', stroke: '#92400e', strokeWidth: 4, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical wall interruption block for access points.',
  },
  window: {
    label: 'Window', category: 'wall', icon: 'window',
    defaultSize: { w: 80, h: 6 },
    defaultStyle: { fill: '#bae6fd', stroke: '#0ea5e9', strokeWidth: 3, opacity: 0.72 },
    assignable: false, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical transparent wall feature block.',
  },

  'table-rect': {
    label: 'Rectangular Table', category: 'table', icon: 'table-rect',
    defaultSize: { w: 160, h: 80 },
    defaultStyle: { fill: '#f3f4f6', stroke: '#6b7280', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical rectangular shared table block.',
  },
  'table-conference': {
    label: 'Conference Table', category: 'table', icon: 'table-conf',
    defaultSize: { w: 300, h: 120 },
    defaultStyle: { fill: '#f3f4f6', stroke: '#6b7280', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical meeting table block.',
  },
  'table-round': {
    label: 'Round Table', category: 'table', icon: 'table-round',
    defaultSize: { w: 100, h: 100 },
    defaultStyle: { fill: '#f3f4f6', stroke: '#6b7280', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical circular table block.',
  },
  'table-oval': {
    label: 'Oval Table', category: 'table', icon: 'table-oval',
    defaultSize: { w: 200, h: 100 },
    defaultStyle: { fill: '#f3f4f6', stroke: '#6b7280', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
    sourceTier: 'canonical', canonical: true,
    provenance: 'Canonical oval shared table block.',
  },

  sofa: { label: 'Sofa', category: 'decor', icon: 'sofa', defaultSize: { w: 160, h: 70 }, defaultStyle: { fill: '#e5e7eb', stroke: '#9ca3af', strokeWidth: 1, opacity: 1 }, assignable: false, multiSeat: false, polyline: false, sourceTier: 'curated', canonical: false, provenance: 'Curated furniture prop block for lounge contexts.' },
  plant: { label: 'Plant', category: 'decor', icon: 'plant', defaultSize: { w: 40, h: 40 }, defaultStyle: { fill: '#d1fae5', stroke: '#059669', strokeWidth: 1, opacity: 1 }, assignable: false, multiSeat: false, polyline: false, sourceTier: 'curated', canonical: false, provenance: 'Curated environmental prop block.' },
  printer: { label: 'Printer', category: 'decor', icon: 'printer', defaultSize: { w: 60, h: 50 }, defaultStyle: { fill: '#f3f4f6', stroke: '#6b7280', strokeWidth: 1, opacity: 1 }, assignable: false, multiSeat: false, polyline: false, sourceTier: 'curated', canonical: false, provenance: 'Curated office support prop block.' },
  whiteboard: { label: 'Whiteboard', category: 'decor', icon: 'whiteboard', defaultSize: { w: 180, h: 10 }, defaultStyle: { fill: '#ffffff', stroke: '#d1d5db', strokeWidth: 2, opacity: 1 }, assignable: false, multiSeat: false, polyline: false, sourceTier: 'curated', canonical: false, provenance: 'Curated collaborative surface block.' },
  decor: { label: 'Decor', category: 'decor', icon: 'decor', defaultSize: { w: 60, h: 60 }, defaultStyle: { fill: '#f3f4f6', stroke: '#9ca3af', strokeWidth: 1, opacity: 1 }, assignable: false, multiSeat: false, polyline: false, sourceTier: 'legacy', canonical: false, provenance: 'Legacy catch-all decor block retained for backward compatibility.' },

  'rect-shape': { label: 'Rectangle', category: 'shape', icon: 'rect', defaultSize: { w: 100, h: 60 }, defaultStyle: { fill: '#eff6ff', stroke: '#3b82f6', strokeWidth: 1.5, opacity: 1 }, assignable: false, multiSeat: false, polyline: false, sourceTier: 'canonical', canonical: true, provenance: 'Canonical drawing primitive.' },
  ellipse: { label: 'Ellipse', category: 'shape', icon: 'ellipse', defaultSize: { w: 100, h: 60 }, defaultStyle: { fill: '#eff6ff', stroke: '#3b82f6', strokeWidth: 1.5, opacity: 1 }, assignable: false, multiSeat: false, polyline: false, sourceTier: 'canonical', canonical: true, provenance: 'Canonical drawing primitive.' },
  'line-shape': { label: 'Line', category: 'shape', icon: 'line', defaultSize: { w: 100, h: 4 }, defaultStyle: { fill: '#6b7280', stroke: '#6b7280', strokeWidth: 2, opacity: 1 }, assignable: false, multiSeat: false, polyline: true, sourceTier: 'canonical', canonical: true, provenance: 'Canonical drawing primitive.' },
  arrow: { label: 'Arrow', category: 'shape', icon: 'arrow', defaultSize: { w: 100, h: 4 }, defaultStyle: { fill: '#6b7280', stroke: '#6b7280', strokeWidth: 2, opacity: 1 }, assignable: false, multiSeat: false, polyline: true, sourceTier: 'canonical', canonical: true, provenance: 'Canonical drawing primitive.' },
  'free-text': { label: 'Text', category: 'shape', icon: 'text', defaultSize: { w: 120, h: 24 }, defaultStyle: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0, opacity: 1 }, assignable: false, multiSeat: false, polyline: false, sourceTier: 'canonical', canonical: true, provenance: 'Canonical annotation primitive.' },

  'background-image': { label: 'Background Image', category: 'media', icon: 'image', defaultSize: { w: 400, h: 300 }, defaultStyle: { fill: 'transparent', stroke: '#d1d5db', strokeWidth: 1, opacity: 0.8 }, assignable: false, multiSeat: false, polyline: false, sourceTier: 'curated', canonical: true, provenance: 'Canonical media surface for reference imagery.' },
  'custom-svg': { label: 'Custom SVG', category: 'media', icon: 'svg', defaultSize: { w: 80, h: 80 }, defaultStyle: { fill: 'transparent', stroke: '#6b7280', strokeWidth: 1, opacity: 1 }, assignable: false, multiSeat: false, polyline: false, sourceTier: 'curated', canonical: true, provenance: 'Canonical upload surface for sanitized SVG assets.' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function blockMeta(type: ElementType): BlockMeta | undefined {
  return BLOCK_REGISTRY[type]
}

export function blockCategory(type: ElementType): BlockCategory | undefined {
  return BLOCK_REGISTRY[type]?.category
}

export function isAssignableType(type: ElementType): boolean {
  return BLOCK_REGISTRY[type]?.assignable ?? false
}

export function isMultiSeatType(type: ElementType): boolean {
  return BLOCK_REGISTRY[type]?.multiSeat ?? false
}

export function isPolylineType(type: ElementType): boolean {
  return BLOCK_REGISTRY[type]?.polyline ?? false
}

export function blocksByCategory(category: BlockCategory): ElementType[] {
  return (Object.entries(BLOCK_REGISTRY) as [ElementType, BlockMeta][])
    .filter(([, meta]) => meta.category === category)
    .map(([type]) => type)
}
