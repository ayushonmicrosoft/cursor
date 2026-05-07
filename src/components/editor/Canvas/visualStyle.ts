import type { SeatStatus } from '../../../types/seatAssignment'

export type CanvasLabelDensity = 'full' | 'compact' | 'hidden'

export const CANVAS_COLORS = {
  // ... existing entries ...
  selected: '#2563EB',
  selectedSoft: '#DBEAFE',
  hover: '#0EA5E9',
  locked: '#475569',
  lockedFill: '#E2E8F0',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
  assignedBorder: '#3B82F6',
  unassignedBorder: '#64748B',
  unassignedFill: '#F8FAFC',
  assignedFill: '#EAF2FF',
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
  
  // Added semantic colors
  shadow: '#0F172A',
  shadowSoft: 'rgba(15, 23, 42, 0.08)',
  text: '#1F2937',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  textOnAccent: '#ffffff',
  accentBadge: '#4F46E5',
  dropOpen: '#10B981',
  dropBusy: '#F59E0B',
  dropHover: '#2563EB',
  glassWall: '#93C5FD',
  doorSwing: '#94A3B8',
  sofaCushion: '#FFFFFF',
  sofaArmFill: '#EFF6FF',
  plantLight: '#BBF7D0',
  plantDark: '#86EFAC',
  plantTrunk: '#A16207',
  plantStroke: '#166534',
  counterFill: '#FFFFFF',
  counterStroke: '#E2E8F0',
  annotationOpen: '#FBBF24',
  annotationOpenStroke: '#92400E',
  annotationResolved: '#E5E7EB',
  annotationResolvedStroke: '#9CA3AF',
  measureStroke: '#DC2626',
  measureFill: '#991B1B',
  measureDark: '#7F1D1D',
  seatUnassignedFill: '#F8FAFC',
  seatUnassignedStroke: '#64748B',
  seatAssignedFill: '#EAF2FF',
  seatAssignedStroke: '#3B82F6',
  seatHotFill: '#ECFEFF',
  seatHotStroke: '#0891B2',
  seatDecommissionedFill: '#F1F5F9',
  deskDivider: '#D1D5DB',
  deskSubtle: '#9CA3AF',
  deskIdBadge: '#4F46E5',
  calibrateStroke: '#2563EB',
  calibrateFill: '#1D4ED8',
  calibrateDark: '#1E3A8A',
  alignmentLabel: '#1e3a8a',
  neighborhoodHealthy: '#10B981',
  neighborhoodWarn: '#F59E0B',
  neighborhoodCritical: '#EF4444',
  neighborhoodUnknown: '#9CA3AF',
} as const

export function labelDensityForScale(
  stageScale: number,
  forceDetailed = false,
): CanvasLabelDensity {
  if (forceDetailed) return 'full'
  if (stageScale < 0.28) return 'hidden'
  if (stageScale < 0.82) return 'compact'
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