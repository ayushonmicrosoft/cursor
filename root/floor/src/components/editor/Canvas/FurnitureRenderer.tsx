import { Circle, Group, Line, Rect, Text } from 'react-konva'
import type { BaseElement } from '../../../types/elements'
import { useUIStore } from '../../../stores/uiStore'

interface FurnitureRendererProps {
  element: BaseElement
}

export function FurnitureRenderer({ element }: FurnitureRendererProps) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const stroke = isSelected ? '#2563EB' : element.style.stroke
  const strokeWidth = isSelected ? 2.5 : element.style.strokeWidth
  const opacity = element.style.opacity

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
      case 'monitor':
        return (
          <MonitorSymbol
            width={element.width}
            height={element.height}
            fill={element.style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
      case 'task-lamp':
        return (
          <TaskLampSymbol
            width={element.width}
            height={element.height}
            fill={element.style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
      case 'credenza':
        return (
          <CredenzaSymbol
            width={element.width}
            height={element.height}
            fill={element.style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
      case 'bookshelf':
        return (
          <BookshelfSymbol
            width={element.width}
            height={element.height}
            fill={element.style.fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )
      case 'area-rug':
        return (
          <AreaRugSymbol
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
    <Group rotation={element.rotation} listening={!element.locked}>
      {symbol}
      {element.width >= 48 && element.height >= 24 && element.label && (
        <Text
          text={element.label}
          x={-element.width / 2 + 4}
          y={element.height / 2 + 3}
          width={element.width - 8}
          align="center"
          fontSize={9}
          fontStyle="bold"
          fill="#475569"
          listening={false}
        />
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
  const wheelR = Math.max(1.5, Math.min(w, h) * 0.06)
  return (
    <>
      <Rect
        x={-seatW * 0.44}
        y={-h / 2}
        width={seatW * 0.88}
        height={Math.max(3, backH * 0.35)}
        fill="#93C5FD"
        opacity={opacity * 0.5}
        cornerRadius={backH * 0.18}
        listening={false}
      />
      <Rect
        x={-seatW / 2}
        y={-seatH / 2 + backH * 0.2}
        width={seatW}
        height={seatH}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={Math.min(8, seatH / 2)}
        opacity={opacity}
      />
      <Rect
        x={-seatW / 2}
        y={-h / 2 + 2}
        width={seatW}
        height={backH}
        fill="#DBEAFE"
        stroke={stroke}
        strokeWidth={Math.max(1, strokeWidth * 0.75)}
        cornerRadius={Math.min(7, backH / 2)}
        opacity={opacity}
      />
      <Rect x={-seatW / 2 - armW} y={-seatH / 2 + backH * 0.25} width={armW} height={seatH * 0.9} fill="#EFF6FF" stroke={stroke} strokeWidth={1} cornerRadius={armW / 2} opacity={opacity} />
      <Rect x={seatW / 2} y={-seatH / 2 + backH * 0.25} width={armW} height={seatH * 0.9} fill="#EFF6FF" stroke={stroke} strokeWidth={1} cornerRadius={armW / 2} opacity={opacity} />
      <Line points={[0, h * 0.18, 0, h * 0.38, -w * 0.22, h * 0.44, w * 0.22, h * 0.44]} stroke={stroke} strokeWidth={1.2} opacity={opacity} listening={false} />
      {[-0.26, 0, 0.26].map((x) => (
        <Circle key={x} x={w * x} y={h * 0.43} radius={wheelR} fill="#1E293B" opacity={opacity * 0.85} listening={false} />
      ))}
    </>
  )
}

function CounterSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const inset = Math.max(4, Math.min(w, h) * 0.12)
  return (
    <>
      <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={Math.min(8, h / 3)} opacity={opacity} />
      <Rect x={-w / 2 + inset} y={-h / 2 + inset} width={w - inset * 2} height={h - inset * 2} fill="#FFFFFF" stroke={stroke} strokeWidth={1} cornerRadius={Math.min(5, h / 4)} opacity={opacity * 0.8} listening={false} />
      <Line points={[0, -h / 2 + inset, 0, h / 2 - inset]} stroke={stroke} strokeWidth={1} opacity={opacity * 0.65} listening={false} />
      <Circle x={-w * 0.25} y={0} radius={Math.max(3, Math.min(w, h) * 0.08)} fill="transparent" stroke={stroke} strokeWidth={1} opacity={opacity} listening={false} />
    </>
  )
}

function DividerSymbol({ width: w, height: h, stroke, strokeWidth, opacity }: SymbolProps) {
  const railH = Math.max(4, h)
  const postCount = Math.max(2, Math.floor(w / 28))
  return (
    <>
      <Rect x={-w / 2} y={-railH / 2} width={w} height={railH} fill="#E2E8F0" stroke={stroke} strokeWidth={strokeWidth} cornerRadius={railH / 2} opacity={opacity} />
      {Array.from({ length: postCount }).map((_, i) => {
        const x = -w / 2 + (w / (postCount - 1)) * i
        return <Line key={i} points={[x, -railH * 1.4, x, railH * 1.4]} stroke={stroke} strokeWidth={1} opacity={opacity * 0.55} listening={false} />
      })}
    </>
  )
}

function PlanterSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const r = Math.min(w, h) * 0.28
  return (
    <>
      <Circle x={-r * 0.45} y={-r * 0.15} radius={r} fill={fill} stroke={stroke} strokeWidth={1} opacity={opacity} />
      <Circle x={r * 0.45} y={-r * 0.15} radius={r} fill="#BBF7D0" stroke={stroke} strokeWidth={1} opacity={opacity} />
      <Circle x={0} y={r * 0.35} radius={r} fill="#86EFAC" stroke={stroke} strokeWidth={1} opacity={opacity} />
      <Rect x={-w * 0.24} y={h * 0.2} width={w * 0.48} height={Math.max(5, h * 0.16)} fill="#A16207" stroke={stroke} strokeWidth={Math.max(1, strokeWidth * 0.5)} cornerRadius={[0, 0, 4, 4]} opacity={opacity} listening={false} />
    </>
  )
}

function CustomShapeSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const r = Math.min(10, Math.min(w, h) * 0.12)
  return (
    <>
      <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} dash={[7, 5]} cornerRadius={r} opacity={opacity} />
      <Line points={[-w * 0.25, h * 0.18, -w * 0.06, -h * 0.22, w * 0.18, h * 0.08, w * 0.31, -h * 0.2]} stroke={stroke} strokeWidth={1.5} opacity={opacity * 0.7} listening={false} />
      {[
        [-w * 0.25, h * 0.18],
        [-w * 0.06, -h * 0.22],
        [w * 0.18, h * 0.08],
        [w * 0.31, -h * 0.2],
      ].map(([x, y], i) => (
        <Circle key={i} x={x} y={y} radius={3} fill="#FFFFFF" stroke={stroke} strokeWidth={1} opacity={opacity} listening={false} />
      ))}
    </>
  )
}

function GenericBlockSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const r = Math.min(8, Math.min(w, h) * 0.16)
  return (
    <>
      <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={r} opacity={opacity} />
      <Rect x={-w * 0.34} y={-h * 0.24} width={w * 0.68} height={h * 0.18} fill="#FFFFFF" opacity={opacity * 0.45} cornerRadius={h * 0.08} listening={false} />
      <Line points={[-w * 0.3, h * 0.18, w * 0.3, h * 0.18]} stroke={stroke} strokeWidth={1} opacity={opacity * 0.45} listening={false} />
    </>
  )
}

function MonitorSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const screenW = w * 0.82
  const screenH = h * 0.62
  return (
    <>
      <Rect x={-screenW / 2} y={-h / 2} width={screenW} height={screenH} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={3} opacity={opacity} />
      <Rect x={-screenW * 0.36} y={-h / 2 + screenH * 0.16} width={screenW * 0.72} height={screenH * 0.16} fill="#38BDF8" opacity={opacity * 0.45} cornerRadius={2} listening={false} />
      <Line points={[0, -h / 2 + screenH, 0, h * 0.22]} stroke={stroke} strokeWidth={Math.max(1, strokeWidth * 0.8)} opacity={opacity} listening={false} />
      <Rect x={-w * 0.24} y={h * 0.2} width={w * 0.48} height={Math.max(3, h * 0.13)} fill={stroke} opacity={opacity * 0.75} cornerRadius={2} listening={false} />
    </>
  )
}

function TaskLampSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const shadeR = Math.min(w, h) * 0.2
  return (
    <>
      <Circle x={-w * 0.24} y={h * 0.28} radius={Math.max(3, Math.min(w, h) * 0.12)} fill={stroke} opacity={opacity * 0.25} listening={false} />
      <Line points={[-w * 0.2, h * 0.18, -w * 0.04, -h * 0.08, w * 0.18, -h * 0.28]} stroke={stroke} strokeWidth={Math.max(1.4, strokeWidth)} opacity={opacity} listening={false} />
      <Circle x={-w * 0.04} y={-h * 0.08} radius={Math.max(2, shadeR * 0.25)} fill="#FFFFFF" stroke={stroke} strokeWidth={1} opacity={opacity} listening={false} />
      <Rect x={w * 0.08} y={-h * 0.38} width={w * 0.34} height={h * 0.18} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={Math.min(8, h * 0.09)} opacity={opacity} rotation={-18} />
      <Line points={[w * 0.16, -h * 0.22, w * 0.28, -h * 0.34]} stroke="#FFFFFF" strokeWidth={1} opacity={opacity * 0.65} listening={false} />
    </>
  )
}

function CredenzaSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const drawerCount = Math.max(2, Math.min(4, Math.round(w / 42)))
  const innerW = w - 10
  const drawerW = innerW / drawerCount
  return (
    <>
      <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={Math.min(6, h * 0.18)} opacity={opacity} />
      {Array.from({ length: drawerCount }).map((_, i) => {
        const x = -innerW / 2 + drawerW * i
        return (
          <Rect key={i} x={x + 2} y={-h * 0.22} width={drawerW - 4} height={h * 0.44} fill="#FDECC8" stroke={stroke} strokeWidth={0.8} cornerRadius={2} opacity={opacity * 0.72} listening={false} />
        )
      })}
      {Array.from({ length: drawerCount }).map((_, i) => (
        <Circle key={`pull-${i}`} x={-innerW / 2 + drawerW * (i + 0.5)} y={0} radius={Math.max(1.5, h * 0.04)} fill={stroke} opacity={opacity * 0.65} listening={false} />
      ))}
    </>
  )
}

function BookshelfSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  const shelfY = [-0.24, 0, 0.24]
  return (
    <>
      <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={Math.min(5, h * 0.15)} opacity={opacity} />
      {shelfY.map((y, i) => (
        <Line key={`shelf-${i}`} points={[-w * 0.42, h * y, w * 0.42, h * y]} stroke="#FDECC8" strokeWidth={1.2} opacity={opacity * 0.85} listening={false} />
      ))}
      {[-0.32, -0.16, 0.04, 0.22, 0.36].map((x, i) => (
        <Rect key={`book-${i}`} x={w * x} y={-h * 0.34} width={Math.max(3, w * 0.055)} height={h * (0.22 + (i % 2) * 0.08)} fill={i % 2 ? '#2563EB' : '#BE123C'} opacity={opacity * 0.72} cornerRadius={1} listening={false} />
      ))}
    </>
  )
}

function AreaRugSymbol({ width: w, height: h, fill, stroke, strokeWidth, opacity }: SymbolProps) {
  return (
    <>
      <Rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={Math.min(14, Math.min(w, h) * 0.12)} opacity={opacity * 0.72} />
      <Rect x={-w * 0.42} y={-h * 0.36} width={w * 0.84} height={h * 0.72} fill="transparent" stroke="#FFFFFF" strokeWidth={1.2} dash={[5, 4]} opacity={opacity * 0.65} cornerRadius={Math.min(10, h * 0.09)} listening={false} />
      {[-0.2, 0, 0.2].map((y) => (
        <Line key={y} points={[-w * 0.34, h * y, w * 0.34, h * y]} stroke={stroke} strokeWidth={1} opacity={opacity * 0.28} listening={false} />
      ))}
    </>
  )
}
