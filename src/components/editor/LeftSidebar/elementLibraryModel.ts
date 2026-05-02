import { TABLE_SEAT_DEFAULTS, getDefaults } from '../../../lib/constants'
import { computeSeatPositions } from '../../../lib/seatLayout'
import { nextSeatNumber } from '../../../lib/seatNumbering'
import type {
  ElementType,
  TableType,
  TableElement,
  BaseElement,
  DeskElement,
  WorkstationElement,
  PrivateOfficeElement,
  ConferenceRoomElement,
  PhoneBoothElement,
  CommonAreaElement,
  DecorElement,
  DecorShape,
  CustomSvgElement,
  CanvasElement,
} from '../../../types/elements'

export type CatalogKitId =
  | 'bench-2'
  | 'bench-4'
  | 'bench-6'
  | 'bench-8'
  | 'sit-stand'
  | 'premium-chair'
  | 'huddle-room'
  | 'boardroom'
  | 'focus-pod-row'
  | 'lounge'
  | 'reception'
  | 'copy-zone'

export interface LibraryItem {
  type: ElementType
  label: string
  category: string
  shape?: string
  kit?: CatalogKitId
  dimensions?: { width: number; height: number; unit?: string }
  capacity?: number | string
  svgSource?: string
  customShapeId?: string
}

export const LIBRARY_DRAG_MIME = 'application/floocraft-element-type'

type AnyLibraryElement =
  | TableElement
  | DeskElement
  | WorkstationElement
  | PrivateOfficeElement
  | ConferenceRoomElement
  | PhoneBoothElement
  | CommonAreaElement
  | DecorElement
  | BaseElement

function isTableType(type: ElementType): type is TableType {
  return type === 'table-rect' || type === 'table-conference' || type === 'table-round' || type === 'table-oval'
}

function catalogMeta(item: LibraryItem): BaseElement['catalog'] | undefined {
  if (!item.kit && item.type !== 'custom-svg') return undefined
  return {
    source: item.type === 'custom-svg' ? 'import' : 'catalog',
    family: item.kit ?? item.category,
    capacity: typeof item.capacity === 'number' ? item.capacity : undefined,
    dimensions: item.dimensions
      ? { width: item.dimensions.width, height: item.dimensions.height, unit: item.dimensions.unit ?? 'in' }
      : undefined,
  }
}

function numberCapacity(item: LibraryItem, fallback: number): number {
  return typeof item.capacity === 'number' ? item.capacity : fallback
}

function buildLibraryElement(
  item: LibraryItem,
  x: number,
  y: number,
  zIndex: number,
  existingElements: Record<string, CanvasElement> = {},
): AnyLibraryElement {
  const defaults = getDefaults(item.type, item.shape) || { width: 60, height: 60, fill: '#F3F4F6', stroke: '#6B7280' }
  const id = crypto.randomUUID()
  const meta = catalogMeta(item)

  const baseProps = {
    id,
    x,
    y,
    width: defaults.width,
    height: defaults.height,
    rotation: 0,
    locked: false,
    groupId: null,
    zIndex,
    label: item.label,
    visible: true,
    ...(meta ? { catalog: meta } : {}),
    style: { fill: defaults.fill, stroke: defaults.stroke, strokeWidth: 1.4, opacity: 1 },
  } as const

  if (isTableType(item.type)) {
    const seatCount = TABLE_SEAT_DEFAULTS[item.type] || 6
    const layout = item.type === 'table-conference' || item.type === 'table-round' || item.type === 'table-oval' ? 'around' as const : 'both-sides' as const
    const element: TableElement = {
      ...baseProps,
      type: item.type,
      seatCount,
      seatLayout: layout,
      seats: computeSeatPositions(item.type, seatCount, layout, defaults.width, defaults.height),
    }
    return element
  }

  if (item.type === 'desk' || item.type === 'hot-desk') {
    const deskId = nextSeatNumber(existingElements)
    const element: DeskElement = {
      ...baseProps,
      type: item.type,
      deskId,
      assignedEmployeeId: null,
      capacity: 1,
      ...(item.shape ? { shape: item.shape as DeskElement['shape'] } : {}),
    }
    return element
  }

  if (item.type === 'workstation') {
    const deskId = nextSeatNumber(existingElements)
    const positions = numberCapacity(item, 4)
    const element: WorkstationElement = {
      ...baseProps,
      type: 'workstation',
      deskId,
      positions,
      assignedEmployeeIds: Array.from({ length: positions }, () => null),
    }
    return element
  }

  if (item.type === 'private-office') {
    const deskId = nextSeatNumber(existingElements)
    const element: PrivateOfficeElement = {
      ...baseProps,
      type: 'private-office',
      deskId,
      capacity: item.shape === 'u-shape' ? 2 : 1,
      assignedEmployeeIds: [],
      ...(item.shape ? { shape: item.shape as PrivateOfficeElement['shape'] } : {}),
    }
    return element
  }

  if (item.type === 'conference-room') {
    const element: ConferenceRoomElement = {
      ...baseProps,
      type: 'conference-room',
      roomName: 'Conference Room',
      capacity: numberCapacity(item, 8),
    }
    return element
  }

  if (item.type === 'phone-booth') {
    const element: PhoneBoothElement = {
      ...baseProps,
      type: 'phone-booth',
    }
    return element
  }

  if (item.type === 'common-area') {
    const element: CommonAreaElement = {
      ...baseProps,
      type: 'common-area',
      areaName: 'Common Area',
    }
    return element
  }

  if (item.type === 'decor') {
    const el: DecorElement = {
      ...baseProps,
      type: 'decor',
      shape: item.shape as DecorShape,
    } as DecorElement
    return el
  }

  if (item.type === 'custom-svg' && item.svgSource) {
    const el: CustomSvgElement = {
      ...baseProps,
      type: 'custom-svg',
      svgSource: item.svgSource,
    }
    return el
  }

  const element: BaseElement = {
    ...baseProps,
    type: item.type,
  }
  return element
}

type KitPart = {
  item: LibraryItem
  dx: number
  dy: number
  width?: number
  height?: number
  rotation?: number
  capacity?: number
}

function kitParts(item: LibraryItem): KitPart[] | null {
  switch (item.kit) {
    case 'bench-2':
      return [
        { item: { ...item, kit: undefined, type: 'workstation', label: '2-seat bench', capacity: 2 }, dx: 0, dy: 0, width: 120, height: 56 },
        { item: { type: 'divider', label: 'Bench divider', category: item.category }, dx: 0, dy: 0, width: 132, height: 5 },
      ]
    case 'bench-4':
      return [
        { item: { ...item, kit: undefined, type: 'workstation', label: '4-seat bench', capacity: 4 }, dx: 0, dy: 0, width: 200, height: 60 },
        { item: { type: 'divider', label: 'Bench divider', category: item.category }, dx: 0, dy: 0, width: 212, height: 5 },
      ]
    case 'bench-6':
      return [
        { item: { ...item, kit: undefined, type: 'workstation', label: '3-seat bench A', capacity: 3 }, dx: 0, dy: -38, width: 168, height: 56 },
        { item: { ...item, kit: undefined, type: 'workstation', label: '3-seat bench B', capacity: 3 }, dx: 0, dy: 38, width: 168, height: 56, rotation: 180 },
        { item: { type: 'divider', label: 'Bench spine', category: item.category }, dx: 0, dy: 0, width: 184, height: 5 },
      ]
    case 'bench-8':
      return [
        { item: { ...item, kit: undefined, type: 'workstation', label: '4-seat bench A', capacity: 4 }, dx: 0, dy: -40, width: 216, height: 60 },
        { item: { ...item, kit: undefined, type: 'workstation', label: '4-seat bench B', capacity: 4 }, dx: 0, dy: 40, width: 216, height: 60, rotation: 180 },
        { item: { type: 'divider', label: 'Bench spine', category: item.category }, dx: 0, dy: 0, width: 232, height: 5 },
      ]
    case 'huddle-room':
      return [
        { item: { ...item, kit: undefined, type: 'conference-room', label: 'Small huddle room', capacity: 4 }, dx: 0, dy: 0, width: 160, height: 130 },
        { item: { type: 'table-round', label: 'Huddle table', category: item.category, capacity: 4 }, dx: 0, dy: 0, width: 68, height: 68, capacity: 4 },
        ...[-42, 42].map((dx) => ({ item: { type: 'chair' as const, label: 'Guest chair', category: item.category }, dx, dy: -44, width: 24, height: 24 })),
        ...[-42, 42].map((dx) => ({ item: { type: 'chair' as const, label: 'Guest chair', category: item.category }, dx, dy: 44, width: 24, height: 24, rotation: 180 })),
      ]
    case 'boardroom':
      return [
        { item: { ...item, kit: undefined, type: 'conference-room', label: 'Boardroom', capacity: 12 }, dx: 0, dy: 0, width: 260, height: 170 },
        { item: { type: 'table-conference', label: 'Boardroom table', category: item.category, capacity: 12 }, dx: 0, dy: 0, width: 190, height: 70, capacity: 12 },
      ]
    case 'focus-pod-row':
      return [-68, 0, 68].map((dx, idx) => ({
        item: { ...item, kit: undefined, type: 'phone-booth', label: `Focus pod ${idx + 1}`, capacity: 1 },
        dx,
        dy: 0,
        width: 56,
        height: 64,
      }))
    case 'lounge':
      return [
        { item: { type: 'sofa', label: 'Lounge sofa', category: item.category }, dx: 0, dy: 42, width: 132, height: 52 },
        { item: { type: 'decor', label: 'Lounge chair', category: item.category, shape: 'armchair' }, dx: -72, dy: -28, width: 48, height: 48, rotation: 35 },
        { item: { type: 'decor', label: 'Lounge chair', category: item.category, shape: 'armchair' }, dx: 72, dy: -28, width: 48, height: 48, rotation: -35 },
        { item: { type: 'table-round', label: 'Coffee table', category: item.category, capacity: 0 }, dx: 0, dy: -12, width: 52, height: 52, capacity: 0 },
        { item: { type: 'plant', label: 'Plant', category: item.category }, dx: 92, dy: 44, width: 34, height: 34 },
      ]
    case 'reception':
      return [
        { item: { type: 'decor', label: 'Reception desk', category: item.category, shape: 'reception' }, dx: 0, dy: -28, width: 150, height: 72 },
        { item: { type: 'decor', label: 'Guest chair', category: item.category, shape: 'armchair' }, dx: -52, dy: 54, width: 42, height: 42, rotation: 180 },
        { item: { type: 'decor', label: 'Guest chair', category: item.category, shape: 'armchair' }, dx: 0, dy: 54, width: 42, height: 42, rotation: 180 },
        { item: { type: 'plant', label: 'Plant', category: item.category }, dx: 72, dy: 46, width: 34, height: 34 },
      ]
    case 'copy-zone':
      return [
        { item: { type: 'printer', label: 'Printer', category: item.category }, dx: -34, dy: 10, width: 56, height: 48 },
        { item: { type: 'decor', label: 'Supply storage', category: item.category, shape: 'storage' }, dx: 38, dy: 12, width: 62, height: 36 },
        { item: { type: 'counter', label: 'Copy counter', category: item.category }, dx: 0, dy: -34, width: 104, height: 28 },
      ]
    default:
      return null
  }
}

export function buildLibraryElements(
  item: LibraryItem,
  x: number,
  y: number,
  zIndex: number,
  existingElements: Record<string, CanvasElement> = {},
): AnyLibraryElement[] {
  const parts = kitParts(item)
  if (!parts) return [buildLibraryElement(item, x, y, zIndex, existingElements)]
  const groupId = crypto.randomUUID()
  const virtualExisting: Record<string, CanvasElement> = { ...existingElements }
  return parts.map((part, idx) => {
    const element = buildLibraryElement(part.item, x + part.dx, y + part.dy, zIndex + idx, virtualExisting) as AnyLibraryElement
    const next = {
      ...element,
      groupId,
      ...(part.width ? { width: part.width } : {}),
      ...(part.height ? { height: part.height } : {}),
      ...(part.rotation !== undefined ? { rotation: part.rotation } : {}),
      catalog: catalogMeta(item),
    } as AnyLibraryElement
    if (isTableType(next.type)) {
      const table = next as TableElement
      table.seatCount = part.capacity ?? numberCapacity(part.item, table.seatCount)
      table.seats = computeSeatPositions(table.type, table.seatCount, table.seatLayout, table.width, table.height)
    }
    virtualExisting[next.id] = next as CanvasElement
    return next
  })
}
