import { Rect, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'

export function DecorReception({ element }: { element: DecorElement }) {
  const w = element.width, h = element.height
  return (
    <>
      <Rect x={0} y={0} width={w} height={h * 0.42} cornerRadius={2}
        fill={element.style.fill}
        stroke={element.style.stroke}
        strokeWidth={element.style.strokeWidth}
      />
      <Rect x={0} y={h * 0.42} width={w * 0.32} height={h * 0.58} cornerRadius={[0, 0, 2, 2]}
        fill={element.style.fill}
        stroke={element.style.stroke}
        strokeWidth={element.style.strokeWidth}
      />
      <Rect x={w * 0.5} y={h * 0.62} width={w * 0.38} height={h * 0.22} cornerRadius={1}
        fill="#FFFFFF"
        stroke={element.style.stroke}
        strokeWidth={1}
        opacity={0.72}
      />
      <Line points={[w * 0.12, h * 0.22, w * 0.82, h * 0.22]} stroke="#FFFFFF" strokeWidth={1.2} opacity={0.75} />
    </>
  )
}
