import { Group, Rect } from 'react-konva'
import type { SofaElement } from '../../../types/elements'
import { useUIStore } from '../../../stores/uiStore'
import { CANVAS_COLORS, interactionStrokeWidth } from './visualStyle'

interface Props {
  element: SofaElement
}

const SHARP_CORNER = 1
const SELECTED_STROKE = CANVAS_COLORS.selected

/**
 * Sofa renderer — a rounded main body with two inset armrest bars. The
 * armrests are proportional (clamped so very narrow sofas still read as
 * "sofa" instead of "block"), which keeps the silhouette recognisable
 * after the user resizes.
 */
export function SofaRenderer({ element }: Props) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)

  const w = element.width
  const h = element.height
  // Armrest width is ~10% of body width, clamped to a 6–24px range so it
  // stays visible when shrunk and doesn't eat the sofa when enlarged.
  const armW = Math.max(6, Math.min(24, w * 0.1))
  const stroke = isSelected
    ? SELECTED_STROKE
    : element.locked
      ? CANVAS_COLORS.locked
      : CANVAS_COLORS.furnitureStroke
  const strokeWidth = interactionStrokeWidth(isSelected)
  const detailStrokeWidth = Math.max(1, strokeWidth * 0.7)
  const armrestInsetY = Math.max(1, h * 0.06)
  const innerPadX = armW + 2
  const innerPadY = Math.max(2, h * 0.14)
  const innerCushionW = Math.max(8, w - innerPadX * 2)
  const backrestH = Math.max(5, h * 0.3)
  const seamW = Math.max(10, w * 0.32)
  const seamH = Math.max(2, h * 0.08)

  return (
    <Group rotation={element.rotation} listening={!element.locked}>
      {/* Main cushion body */}
      <Rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        fill={element.style.fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={SHARP_CORNER}
        opacity={element.style.opacity}
        shadowColor="#0F172A"
        shadowBlur={3}
        shadowOpacity={0.08}
        shadowOffset={{ x: 0, y: 1 }}
      />
      {/* Left armrest */}
      <Rect
        x={-w / 2}
        y={-h / 2 + armrestInsetY}
        width={armW}
        height={Math.max(4, h - armrestInsetY * 2)}
        fill={element.style.stroke}
        stroke={stroke}
        strokeWidth={detailStrokeWidth}
        opacity={element.style.opacity * 0.35}
        cornerRadius={SHARP_CORNER}
        listening={false}
      />
      {/* Right armrest */}
      <Rect
        x={w / 2 - armW}
        y={-h / 2 + armrestInsetY}
        width={armW}
        height={Math.max(4, h - armrestInsetY * 2)}
        fill={element.style.stroke}
        stroke={stroke}
        strokeWidth={detailStrokeWidth}
        opacity={element.style.opacity * 0.35}
        cornerRadius={SHARP_CORNER}
        listening={false}
      />
      <Rect
        x={-innerCushionW / 2}
        y={-h / 2 + innerPadY}
        width={innerCushionW}
        height={backrestH}
        fill="#FFFFFF"
        stroke={stroke}
        strokeWidth={detailStrokeWidth}
        opacity={element.style.opacity * 0.36}
        cornerRadius={SHARP_CORNER}
        listening={false}
      />
      <Rect
        x={-seamW / 2}
        y={h / 2 - seamH - Math.max(2, h * 0.14)}
        width={seamW}
        height={seamH}
        fill={stroke}
        opacity={element.style.opacity * 0.22}
        cornerRadius={SHARP_CORNER}
        listening={false}
      />
      {element.locked && (
        <Rect
          x={w / 2 - 15}
          y={-h / 2 + 2}
          width={13}
          height={13}
          fill={CANVAS_COLORS.lockedFill}
          stroke={CANVAS_COLORS.locked}
          strokeWidth={0.8}
          dash={[2, 2]}
          cornerRadius={SHARP_CORNER}
          listening={false}
        />
      )}
    </Group>
  )
}
