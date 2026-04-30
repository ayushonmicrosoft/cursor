import { Circle, Group, Line, Rect, Text } from 'react-konva'
import type { BaseElement } from '../../../types/elements'
import { useUIStore } from '../../../stores/uiStore'
import { truncateToWidth } from '../../../lib/textTruncate'
import { useCanvasStore } from '../../../stores/canvasStore'
import { CANVAS_COLORS, interactionStrokeWidth, labelDensityForScale } from './visualStyle'

interface FurnitureRendererProps {
  element: BaseElement
}

const SHARP_CORNER = 1
const SELECTED_STROKE = CANVAS_COLORS.selected
const LABEL_FONT_SIZE = 9

const secondaryStroke = (width: number) => Math.max(1, width * 0.72)
const tertiaryStroke = (width: number) => Math.max(0.75, width * 0.56)

export function FurnitureRenderer({ element }: FurnitureRendererProps) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const stageScale = useCanvasStore((s) => s.stageScale)
  const labelDensity = labelDensityForScale(stageScale, isSelected)
  const stroke = isSelected
    ? SELECTED_STROKE
    : element.locked
      ? CANVAS_COLORS.locked
      : CANVAS_COLORS.furnitureStroke
  const strokeWidth = interactionStrokeWidth(isSelected)
  const opacity = element.style.opacity
  const labelWidth = Math.max(20, element.width - 8)
  const labelText = truncateToWidth(element.label ?? '', labelWidth, LABEL_FONT_SIZE)

  const symbol = (() => {
    switch (element.type) {
      case 'chair':
        return (
          <ChairSymbol
            width={element.width}
            height={element.height}
            fill={element.style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
      case 'counter':
        return (
          <CounterSymbol
            width={element.width}
            height={element.height}
            fill={element.style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
      case 'divider':
        return (
          <DividerSymbol
            width={element.width}
            height={element.height}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
      case 'planter':
        return (
          <PlanterSymbol
            width={element.width}
            height={element.height}
            fill={element.style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
      case 'custom-shape':
        return (
          <CustomShapeSymbol
            width={element.width}
            height={element.height}
            fill={element.style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
      default:
        return (
          <GenericBlockSymbol
            width={element.width}
            height={element.height}
            fill={element.style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
    }
  })()

  return (
    <Group rotation={element.rotation} listening={true}>
      {symbol}
      {labelDensity === 'full' && element.width >= 48 && element.height >= 24 && element.label && (
        <Text
          text={labelText}
          x={-element.width / 2 + 4}
          y={element.height / 2 + 3}
          width={labelWidth}
          align="center"
          fontSize={LABEL_FONT_SIZE}
          fontStyle="bold"
          fill="#475569"
          listening={false}
        />
      )}
      {element.locked && (
        <LockedFurnitureMark width={element.width} height={element.height} />
      )}
    </Group>
  )
}

interface SymbolProps {
  width: number
  height: number
  fill?: string
  stroke: string
  strokeWidth: number
  opacity: number
}

function ChairSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const seatW = w * 0.62
  const seatH = h * 0.46
  const backH = Math.max(5, h * 0.24)
  const armW = Math.max(3, w * 0.12)
  const r = SHARP_CORNER
  return (
    <>
      <Rect
        x={-seatW / 2}
        y={-seatH / 2 + backH * 0.2}
        width={seatW}
        height={seatH}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={r}
        opacity={opacity}
      />
      <Rect
        x={-seatW / 2}
        y={-h / 2 + 2}
        width={seatW}
        height={backH}
        fill="#DBEAFE"
        stroke={stroke}
        strokeWidth={secondaryStroke(strokeWidth)}
        cornerRadius={SHARP_CORNER}
        opacity={opacity}
      />
      <Rect x={-seatW / 2 - armW} y={-seatH / 2 + backH * 0.25} width={armW} height={seatH * 0.9} fill="#EFF6FF" stroke={stroke} strokeWidth={secondaryStroke(strokeWidth)} cornerRadius={SHARP_CORNER} opacity={opacity} />
      <Rect x={seatW / 2} y={-seatH / 2 + backH * 0.25} width={armW} height={seatH * 0.9} fill="#EFF6FF" stroke={stroke} strokeWidth={secondaryStroke(strokeWidth)} cornerRadius={SHARP_CORNER} opacity={opacity} />
      <Line points={[0, h * 0.18, 0, h * 0.38, -w * 0.22, h * 0.44, w * 0.22, h * 0.44]} stroke={stroke} strokeWidth={secondaryStroke(strokeWidth)} opacity={opacity} listening={false} />
    </>
  )
}

function CounterSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const inset = Math.max(4, Math.min(w, h) * 0.12)
  return (
    <>
      <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={SHARP_CORNER} opacity={opacity} />
      <Rect x={-w / 2 + inset} y={-h / 2 + inset} width={w - inset * 2} height={h - inset * 2} fill="#FFFFFF" stroke={stroke} strokeWidth={secondaryStroke(strokeWidth)} cornerRadius={SHARP_CORNER} opacity={opacity * 0.8} listening={false} />
      <Line points={[0, -h / 2 + inset, 0, h / 2 - inset]} stroke={stroke} strokeWidth={tertiaryStroke(strokeWidth)} opacity={opacity * 0.65} listening={false} />
      <Circle x={-w * 0.25} y={0} radius={Math.max(3, Math.min(w, h) * 0.08)} fill="transparent" stroke={stroke} strokeWidth={secondaryStroke(strokeWidth)} opacity={opacity} listening={false} />
    </>
  )
}

function DividerSymbol({ width: w, height: h, stroke, strokeWidth, opacity }: SymbolProps) {
  const railH = Math.max(4, h)
  const postCount = Math.max(2, Math.floor(w / 28))
  return (
    <>
      <Rect x={-w / 2} y={-railH / 2} width={w} height={railH} fill="#E2E8F0" stroke={stroke} strokeWidth={strokeWidth} cornerRadius={SHARP_CORNER} opacity={opacity} />
      {Array.from({ length: postCount }).map((_, i) => {
        const x = -w / 2 + (w / (postCount - 1)) * i
        return <Line key={i} points={[x, -railH * 1.4, x, railH * 1.4]} stroke={stroke} strokeWidth={tertiaryStroke(strokeWidth)} opacity={opacity * 0.55} listening={false} />
      })}
    </>
  )
}

function PlanterSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const r = Math.min(w, h) * 0.28
  return (
    <>
      <Circle x={-r * 0.45} y={-r * 0.15} radius={r} fill={fill} stroke={stroke} strokeWidth={secondaryStroke(strokeWidth)} opacity={opacity} />
      <Circle x={r * 0.45} y={-r * 0.15} radius={r} fill="#BBF7D0" stroke={stroke} strokeWidth={secondaryStroke(strokeWidth)} opacity={opacity} />
      <Circle x={0} y={r * 0.35} radius={r} fill="#86EFAC" stroke={stroke} strokeWidth={secondaryStroke(strokeWidth)} opacity={opacity} />
      <Rect x={-w * 0.24} y={h * 0.2} width={w * 0.48} height={Math.max(5, h * 0.16)} fill="#A16207" stroke={stroke} strokeWidth={tertiaryStroke(strokeWidth)} cornerRadius={SHARP_CORNER} opacity={opacity} listening={false} />
    </>
  )
}

function CustomShapeSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const r = SHARP_CORNER
  return (
    <>
      <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} dash={[7, 5]} cornerRadius={r} opacity={opacity} />
      <Line points={[-w * 0.25, h * 0.18, -w * 0.06, -h * 0.22, w * 0.18, h * 0.08, w * 0.31, -h * 0.2]} stroke={stroke} strokeWidth={secondaryStroke(strokeWidth)} opacity={opacity * 0.7} listening={false} />
      {[
        [-w * 0.25, h * 0.18],
        [-w * 0.06, -h * 0.22],
        [w * 0.18, h * 0.08],
        [w * 0.31, -h * 0.2],
      ].map(([x, y], i) => (
        <Circle key={i} x={x} y={y} radius={3} fill="#FFFFFF" stroke={stroke} strokeWidth={secondaryStroke(strokeWidth)} opacity={opacity} listening={false} />
      ))}
    </>
  )
}

function GenericBlockSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const r = SHARP_CORNER
  return (
    <>
      <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={r} opacity={opacity} />
      <Rect x={-w * 0.34} y={-h * 0.24} width={w * 0.68} height={h * 0.18} fill="#FFFFFF" opacity={opacity * 0.45} cornerRadius={SHARP_CORNER} listening={false} />
      <Line points={[-w * 0.3, h * 0.18, w * 0.3, h * 0.18]} stroke={stroke} strokeWidth={tertiaryStroke(strokeWidth)} opacity={opacity * 0.45} listening={false} />
    </>
  )
}

function LockedFurnitureMark({ width, height }: { width: number; height: number }) {
  const size = Math.min(16, Math.max(9, Math.min(width, height) * 0.24))
  return (
    <Rect
      x={width / 2 - size - 1}
      y={-height / 2 + 1}
      width={size}
      height={size}
      fill={CANVAS_COLORS.lockedFill}
      stroke={CANVAS_COLORS.locked}
      strokeWidth={0.8}
      dash={[2, 2]}
      cornerRadius={SHARP_CORNER}
      listening={false}
    />
  )
}

