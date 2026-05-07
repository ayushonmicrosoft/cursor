import { Image } from 'react-konva'
import type { KonvaNodeEvents } from 'react-konva/lib/ReactKonvaCore'
import { getSilhouetteImage } from '../../../lib/silhouettes/loadSilhouettes'

interface Props extends KonvaNodeEvents {
  type: string
  width: number
  height: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}

export function SilhouetteRenderer({ 
  type, 
  width, 
  height, 
  fill, 
  stroke, 
  strokeWidth, 
  opacity,
  ...props
}: Props) {
  const img = getSilhouetteImage(type)
  if (!img) return null // caller falls back to rounded rect
  
  return (
    <Image 
      image={img} 
      width={width} 
      height={height} 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth} 
      opacity={opacity}
      {...props}
    />
  )
}