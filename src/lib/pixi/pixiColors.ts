/**
 * Convert a hex color string to a Pixi numeric color.
 * @param hex - Hex color string (e.g. '#FF0000' or 'FF0000')
 * @returns Pixi numeric color (e.g. 0xFF0000)
 */
function hexToPixi(hex: string): number {
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  // Parse as hex number
  return parseInt(cleanHex, 16)
}

export const PIXI_COLORS = {
  furnitureFill: hexToPixi('#E5E7EB'),  // 0xe5e7eb
  furnitureStroke: hexToPixi('#6B7280'), // 0x6b7280
  selected: 0x7c3aed,
  selectionAlpha: 0.85,
  deskFill: hexToPixi('#E5E7EB'),
  deskStroke: hexToPixi('#6B7280'),
  seatFill: 0xffffff,
  roomFill: hexToPixi('#EFF6FF'),
  roomStroke: hexToPixi('#3B82F6'),
  wallStroke: hexToPixi('#374151'),
  gridMinor: 0xb5c1d1,
  gridMajor: 0x7f8ea3,
  neighborhoodFill: 0x6366f1,
  handleFill: 0xffffff,
  handleStroke: 0x6366f1,
  guideColor: 0x6366f1,
  // dept palette
  deptPalette: [0x6366f1, 0x10b981, 0xf59e0b, 0xef4444, 0x8b5cf6, 0x06b6d4, 0xf97316, 0x84cc16],
  
  // Additional colors from CANVAS_COLORS
  shadow: hexToPixi('#0F172A'),
  text: hexToPixi('#1F2937'),
  textMuted: hexToPixi('#6B7280'),
  textSubtle: hexToPixi('#9CA3AF'),
  textOnAccent: hexToPixi('#ffffff'),
  accentBadge: hexToPixi('#4F46E5'),
  dropOpen: hexToPixi('#10B981'),
  dropBusy: hexToPixi('#F59E0B'),
  dropHover: hexToPixi('#2563EB'),
  glassWall: hexToPixi('#93C5FD'),
  doorSwing: hexToPixi('#94A3B8'),
  sofaCushion: hexToPixi('#FFFFFF'),
  sofaArmFill: hexToPixi('#EFF6FF'),
  plantLight: hexToPixi('#BBF7D0'),
  plantDark: hexToPixi('#86EFAC'),
  plantTrunk: hexToPixi('#A16207'),
  plantStroke: hexToPixi('#166534'),
  counterFill: hexToPixi('#FFFFFF'),
  counterStroke: hexToPixi('#E2E8F0'),
  annotationOpen: hexToPixi('#FBBF24'),
  annotationOpenStroke: hexToPixi('#92400E'),
  annotationResolved: hexToPixi('#E5E7EB'),
  annotationResolvedStroke: hexToPixi('#9CA3AF'),
  measureStroke: hexToPixi('#DC2626'),
  measureFill: hexToPixi('#991B1B'),
  measureDark: hexToPixi('#7F1D1D'),
  seatUnassignedFill: hexToPixi('#F8FAFC'),
  seatUnassignedStroke: hexToPixi('#64748B'),
  seatAssignedFill: hexToPixi('#EAF2FF'),
  seatAssignedStroke: hexToPixi('#3B82F6'),
  seatHotFill: hexToPixi('#ECFEFF'),
  seatHotStroke: hexToPixi('#0891B2'),
  seatDecommissionedFill: hexToPixi('#F1F5F9'),
  deskDivider: hexToPixi('#D1D5DB'),
  deskSubtle: hexToPixi('#9CA3AF'),
  deskIdBadge: hexToPixi('#4F46E5'),
  calibrateStroke: hexToPixi('#2563EB'),
  calibrateFill: hexToPixi('#1D4ED8'),
  calibrateDark: hexToPixi('#1E3A8A'),
  alignmentLabel: hexToPixi('#1e3a8a'),
  neighborhoodHealthy: hexToPixi('#10B981'),
  neighborhoodWarn: hexToPixi('#F59E0B'),
  neighborhoodCritical: hexToPixi('#EF4444'),
  neighborhoodUnknown: hexToPixi('#9CA3AF'),
}