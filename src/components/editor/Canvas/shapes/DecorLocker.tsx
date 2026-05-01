import { Rect, Line } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'

export function DecorLocker({ element }: { element: DecorElement }) {
  const w = element.width, h = element.height
  const lockerCount = 4
  const lines = []
  for (let i = 1; i < lockerCount; i++) {
    const x = (w / lockerCount) * i
    lines.push(
      <Line key={i} points={[x, 0, x, h]} stroke={element.style.stroke} strokeWidth={element.style.strokeWidth * 0.5} opacity={0.6} />
    )
  }
  return (
    <>
      <Rect x={0} y={0} width={w} height={h} cornerRadius={2}
        fill={element.style.fill}
        stroke={element.style.stroke}
        strokeWidth={element.style.strokeWidth}
      />
      {lines}
    </>
  )
}
