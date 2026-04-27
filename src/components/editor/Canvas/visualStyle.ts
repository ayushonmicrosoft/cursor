import type { SeatStatus } from '../../../types/seatAssignment'

export type CanvasLabelDensity = 'full' | 'compact' | 'hidden'

export const CANVAS_COLORS = {
  selected: '#2563EB',
  selectedSoft: '#DBEAFE',
  hover: '#0EA5E9',
  locked: '#475569',
  lockedFill: '#E2E8F0',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
  assignedBorder: '#64748B',
  unassignedBorder: '#94A3B8',
  unassignedFill: '#F8FAFC',
  assignedFill: '#FFFFFF',
  hotDeskFill: '#ECFEFF',
  hotDeskStroke: '#0891B2',
  decommissionedFill: '#F1F5F9',
  roomStroke: '#0F766E',
  roomFill: '#F0FDFA',
  conferenceStroke: '#B45309',
  conferenceFill: '#FFF7ED',
  officeStroke: '#2563EB',
  officeFill: '#EFF6FF',
  furnitureStroke: '#64748B',
  furnitureFill: '#F1F5F9',
  structure: '#111827',
  structureDark: '#F8FAFC',
} as const

export function labelDensityForScale(
  stageScale: number,
  forceDetailed = false,
): CanvasLabelDensity {
  if (forceDetailed) return 'full'
  if (stageScale < 0.55) return 'hidden'
  if (stageScale < 0.85) return 'compact'
  return 'full'
}

export function seatFillForStatus(status: SeatStatus, hasAssignment: boolean) {
  if (status === 'decommissioned') return CANVAS_COLORS.decommissionedFill
  if (status === 'reserved') return CANVAS_COLORS.warningSoft
  if (status === 'hot-desk') return CANVAS_COLORS.hotDeskFill
  return hasAssignment ? CANVAS_COLORS.assignedFill : CANVAS_COLORS.unassignedFill
}

export function seatStrokeForStatus(
  status: SeatStatus,
  fallbackStroke: string | null,
) {
  if (status === 'reserved') return CANVAS_COLORS.warning
  if (status === 'hot-desk') return CANVAS_COLORS.hotDeskStroke
  if (status === 'decommissioned') return CANVAS_COLORS.locked
  return fallbackStroke ?? CANVAS_COLORS.unassignedBorder
}

export function seatDashForStatus(status: SeatStatus, hasAssignment: boolean) {
  if (status === 'decommissioned') return [3, 3]
  if (status === 'reserved') return [7, 3]
  return hasAssignment ? undefined : [5, 4]
}

export function interactionStrokeWidth(isSelected: boolean, isWarning = false) {
  if (isSelected) return 3
  if (isWarning) return 2.25
  return 1.4
}

