import { Rect, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'

export function DecorStorage({ element }: { element: DecorElement }) {
  const w = element.width, h = element.height
  return (
    <>
      <Rect x={0} y={0} width={w} height={h} cornerRadius={2}
        fill={element.style.fill}
        stroke={element.style.stroke}
        strokeWidth={element.style.strokeWidth}
      />
      <Line points={[0, h / 2, w, h / 2]} stroke={element.style.stroke} strokeWidth={element.style.strokeWidth * 0.5} opacity={0.5} />
    </>
  )
}
