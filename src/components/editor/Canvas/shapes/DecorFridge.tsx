import { Rect, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'

export function DecorFridge({ element }: { element: DecorElement }) {
  const w = element.width, h = element.height
  return (
    <>
      <Rect x={0} y={0} width={w} height={h} cornerRadius={2}
        fill={element.style.fill}
        stroke={element.style.stroke}
        strokeWidth={element.style.strokeWidth}
      />
      <Line points={[0, h * 0.4, w, h * 0.4]} stroke={element.style.stroke} strokeWidth={1} />
      <Line points={[w * 0.82, h * 0.1, w * 0.82, h * 0.32]} stroke={element.style.stroke} strokeWidth={1} opacity={0.75} />
      <Line points={[w * 0.82, h * 0.5, w * 0.82, h * 0.88]} stroke={element.style.stroke} strokeWidth={1} opacity={0.75} />
    </>
  )
}
