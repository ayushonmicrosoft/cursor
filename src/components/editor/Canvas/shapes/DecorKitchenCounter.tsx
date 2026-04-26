import { Rect, Circle, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'

export function DecorKitchenCounter({ element }: { element: DecorElement }) {
  const w = element.width, h = element.height
  return (
    <>
      <Rect x={0} y={0} width={w} height={h} cornerRadius={2}
        fill={element.style.fill}
        stroke={element.style.stroke}
        strokeWidth={element.style.strokeWidth}
      />
      <Rect x={w * 0.08} y={h * 0.16} width={w * 0.34} height={h * 0.68} cornerRadius={1}
        fill="#FFFFFF" stroke={element.style.stroke} strokeWidth={1} opacity={0.72} />
      <Circle x={w * 0.25} y={h / 2} radius={Math.min(w, h) * 0.08} fill="transparent" stroke={element.style.stroke} strokeWidth={1} />
      <Line points={[w * 0.52, h * 0.16, w * 0.52, h * 0.84]} stroke={element.style.stroke} strokeWidth={1} opacity={0.65} />
      <Line points={[w * 0.64, h * 0.32, w * 0.88, h * 0.32]} stroke={element.style.stroke} strokeWidth={1} opacity={0.65} />
      <Line points={[w * 0.64, h * 0.5, w * 0.88, h * 0.5]} stroke={element.style.stroke} strokeWidth={1} opacity={0.65} />
      <Line points={[w * 0.64, h * 0.68, w * 0.88, h * 0.68]} stroke={element.style.stroke} strokeWidth={1} opacity={0.65} />
    </>
  )
}
