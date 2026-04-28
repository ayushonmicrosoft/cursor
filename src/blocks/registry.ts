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
}

// ── Registry ──────────────────────────────────────────────────────────────────
export const BLOCK_REGISTRY: Partial<Record<ElementType, BlockMeta>> = {
  // ── Desks ──────────────────────────────────────────────────────────────
  desk: {
    label: 'Desk', category: 'desk', icon: '🖥',
    defaultSize: { w: 80, h: 60 },
    defaultStyle: { fill: '#FEF3C7', stroke: '#D97706', strokeWidth: 1.5, opacity: 1 },
    assignable: true, multiSeat: false, polyline: false,
  },
  'hot-desk': {
    label: 'Hot Desk', category: 'desk', icon: '🔄',
    defaultSize: { w: 80, h: 60 },
    defaultStyle: { fill: '#EDE9FE', stroke: '#7C3AED', strokeWidth: 1.5, opacity: 1 },
    assignable: true, multiSeat: false, polyline: false,
  },
  workstation: {
    label: 'Workstation', category: 'desk', icon: '🖱',
    defaultSize: { w: 240, h: 70 },
    defaultStyle: { fill: '#ECFDF5', stroke: '#10B981', strokeWidth: 1.5, opacity: 1 },
    assignable: true, multiSeat: true, polyline: false,
  },
  'private-office': {
    label: 'Private Office', category: 'desk', icon: '🏢',
    defaultSize: { w: 160, h: 140 },
    defaultStyle: { fill: '#FFF7ED', stroke: '#EA580C', strokeWidth: 1.5, opacity: 1 },
    assignable: true, multiSeat: false, polyline: false,
  },

  // ── Rooms ──────────────────────────────────────────────────────────────
  'conference-room': {
    label: 'Conference Room', category: 'room', icon: '🪑',
    defaultSize: { w: 300, h: 200 },
    defaultStyle: { fill: '#EFF6FF', stroke: '#3B82F6', strokeWidth: 2, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
  },
  'phone-booth': {
    label: 'Phone Booth', category: 'room', icon: '📞',
    defaultSize: { w: 80, h: 80 },
    defaultStyle: { fill: '#F0FDF4', stroke: '#22C55E', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
  },
  'common-area': {
    label: 'Common Area', category: 'room', icon: '☕',
    defaultSize: { w: 200, h: 160 },
    defaultStyle: { fill: '#FFFBEB', stroke: '#F59E0B', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
  },

  // ── Walls ──────────────────────────────────────────────────────────────
  wall: {
    label: 'Wall', category: 'wall', icon: '▬',
    defaultSize: { w: 200, h: 8 },
    defaultStyle: { fill: '#374151', stroke: '#374151', strokeWidth: 8, opacity: 1 },
    assignable: false, multiSeat: false, polyline: true,
  },
  door: {
    label: 'Door', category: 'wall', icon: '🚪',
    defaultSize: { w: 80, h: 8 },
    defaultStyle: { fill: '#92400E', stroke: '#92400E', strokeWidth: 4, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
  },
  window: {
    label: 'Window', category: 'wall', icon: '🪟',
    defaultSize: { w: 80, h: 6 },
    defaultStyle: { fill: '#BAE6FD', stroke: '#0EA5E9', strokeWidth: 3, opacity: 0.7 },
    assignable: false, multiSeat: false, polyline: false,
  },

  // ── Tables ──────────────────────────────────────────────────────────────
  'table-rect': {
    label: 'Rect Table', category: 'table', icon: '⬜',
    defaultSize: { w: 160, h: 80 },
    defaultStyle: { fill: '#F3F4F6', stroke: '#6B7280', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
  },
  'table-conference': {
    label: 'Conference Table', category: 'table', icon: '🔲',
    defaultSize: { w: 300, h: 120 },
    defaultStyle: { fill: '#F3F4F6', stroke: '#6B7280', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
  },
  'table-round': {
    label: 'Round Table', category: 'table', icon: '⭕',
    defaultSize: { w: 100, h: 100 },
    defaultStyle: { fill: '#F3F4F6', stroke: '#6B7280', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
  },
  'table-oval': {
    label: 'Oval Table', category: 'table', icon: '🥚',
    defaultSize: { w: 200, h: 100 },
    defaultStyle: { fill: '#F3F4F6', stroke: '#6B7280', strokeWidth: 1.5, opacity: 1 },
    assignable: false, multiSeat: false, polyline: false,
  },

  // ── Decor ──────────────────────────────────────────────────────────────
  sofa: { label: 'Sofa', category: 'decor', icon: '🛋', defaultSize: { w: 160, h: 70 }, defaultStyle: { fill: '#E5E7EB', stroke: '#9CA3AF', strokeWidth: 1, opacity: 1 }, assignable: false, multiSeat: false, polyline: false },
  plant: { label: 'Plant', category: 'decor', icon: '🌿', defaultSize: { w: 40, h: 40 }, defaultStyle: { fill: '#D1FAE5', stroke: '#059669', strokeWidth: 1, opacity: 1 }, assignable: false, multiSeat: false, polyline: false },
  printer: { label: 'Printer', category: 'decor', icon: '🖨', defaultSize: { w: 60, h: 50 }, defaultStyle: { fill: '#F3F4F6', stroke: '#6B7280', strokeWidth: 1, opacity: 1 }, assignable: false, multiSeat: false, polyline: false },
  whiteboard: { label: 'Whiteboard', category: 'decor', icon: '📋', defaultSize: { w: 180, h: 10 }, defaultStyle: { fill: '#FFFFFF', stroke: '#D1D5DB', strokeWidth: 2, opacity: 1 }, assignable: false, multiSeat: false, polyline: false },
  decor: { label: 'Decor', category: 'decor', icon: '🪑', defaultSize: { w: 60, h: 60 }, defaultStyle: { fill: '#F3F4F6', stroke: '#9CA3AF', strokeWidth: 1, opacity: 1 }, assignable: false, multiSeat: false, polyline: false },

  // ── Shapes ──────────────────────────────────────────────────────────────
  'rect-shape': { label: 'Rectangle', category: 'shape', icon: '▭', defaultSize: { w: 100, h: 60 }, defaultStyle: { fill: '#EFF6FF', stroke: '#3B82F6', strokeWidth: 1.5, opacity: 1 }, assignable: false, multiSeat: false, polyline: false },
  ellipse: { label: 'Ellipse', category: 'shape', icon: '⬭', defaultSize: { w: 100, h: 60 }, defaultStyle: { fill: '#EFF6FF', stroke: '#3B82F6', strokeWidth: 1.5, opacity: 1 }, assignable: false, multiSeat: false, polyline: false },
  'line-shape': { label: 'Line', category: 'shape', icon: '╱', defaultSize: { w: 100, h: 4 }, defaultStyle: { fill: '#6B7280', stroke: '#6B7280', strokeWidth: 2, opacity: 1 }, assignable: false, multiSeat: false, polyline: true },
  arrow: { label: 'Arrow', category: 'shape', icon: '→', defaultSize: { w: 100, h: 4 }, defaultStyle: { fill: '#6B7280', stroke: '#6B7280', strokeWidth: 2, opacity: 1 }, assignable: false, multiSeat: false, polyline: true },
  'free-text': { label: 'Text', category: 'shape', icon: 'T', defaultSize: { w: 120, h: 24 }, defaultStyle: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0, opacity: 1 }, assignable: false, multiSeat: false, polyline: false },

  // ── Media ──────────────────────────────────────────────────────────────
  'background-image': { label: 'Background Image', category: 'media', icon: '🖼', defaultSize: { w: 400, h: 300 }, defaultStyle: { fill: 'transparent', stroke: '#D1D5DB', strokeWidth: 1, opacity: 0.8 }, assignable: false, multiSeat: false, polyline: false },
  'custom-svg': { label: 'Custom SVG', category: 'media', icon: '✏️', defaultSize: { w: 80, h: 80 }, defaultStyle: { fill: 'transparent', stroke: '#6B7280', strokeWidth: 1, opacity: 1 }, assignable: false, multiSeat: false, polyline: false },
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
