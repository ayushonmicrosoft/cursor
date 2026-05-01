import { Rect } from 'react-konva'
import type { DecorElement } from '../../../../types/elements'

export function DecorPrinterBay({ element }: { element: DecorElement }) {
  const w = element.width, h = element.height
  return (
    <>
      <Rect x={0} y={0} width={w} height={h} cornerRadius={2}
        fill={element.style.fill}
        stroke={element.style.stroke}
        strokeWidth={element.style.strokeWidth}
      />
      <Rect x={w * 0.1} y={h * 0.2} width={w * 0.8} height={h * 0.6} cornerRadius={2}
        fill="#FFFFFF"
        stroke={element.style.stroke}
        strokeWidth={element.style.strokeWidth * 0.5}
        opacity={0.7}
      />
      <Rect x={w * 0.4} y={h * 0.45} width={w * 0.2} height={h * 0.1} cornerRadius={1}
        fill={element.style.stroke}
        opacity={0.5}
      />
    </>
  )
}
