import { Layer, Line, Label, Tag, Text } from 'react-konva'
import React from 'react'
import { useElementsStore } from '../../../stores/elementsStore'
import { useUIStore } from '../../../stores/uiStore'
import { useCanvasStore } from '../../../stores/canvasStore'
import { isWallElement } from '../../../types/elements'
import { useMemo } from 'react'

export function SelectionDistanceOverlay() {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const elements = useElementsStore((s) => s.elements)
  const scale = useCanvasStore((s) => s.settings.scale)
  const scaleUnit = useCanvasStore((s) => s.settings.scaleUnit)

  const distances = useMemo(() => {
    if (selectedIds.length !== 1) return []
    const el = elements[selectedIds[0]]
    if (!el || isWallElement(el) || el.type === 'door' || el.type === 'window') return []

    // Calculate center
    const cx = el.x + el.width / 2
    const cy = el.y + el.height / 2

    // Get all wall segments
    const segments: {x0: number, y0: number, x1: number, y1: number}[] = []
    Object.values(elements).forEach(w => {
      if (isWallElement(w)) {
        for (let i = 0; i + 3 < w.points.length; i += 2) {
          segments.push({
            x0: w.points[i], y0: w.points[i + 1],
            x1: w.points[i + 2], y1: w.points[i + 3]
          })
        }
      }
    })

    if (segments.length === 0) return []

    // Helper to find closest intersection for a ray from (cx,cy)
    const intersect = (dx: number, dy: number) => {
      let minDist = Infinity
      let intP: {x: number, y: number} | null = null

      segments.forEach(seg => {
        // ray: p = (cx,cy) + t*(dx,dy)
        // segment: q = (x0,y0) + u*(x1-x0, y1-y0)
        const x0 = seg.x0, y0 = seg.y0, x1 = seg.x1, y1 = seg.y1
        
        const denom = dx * (y1 - y0) - dy * (x1 - x0)
        if (Math.abs(denom) < 0.0001) return // parallel
        
        const t = ((x0 - cx) * (y1 - y0) - (y0 - cy) * (x1 - x0)) / denom
        const u = ((x0 - cx) * dy - (y0 - cy) * dx) / denom
        
        if (t > 0 && u >= 0 && u <= 1) {
          if (t < minDist) {
            minDist = t
            intP = { x: cx + t * dx, y: cy + t * dy }
          }
        }
      })
      
      return intP ? { dist: minDist, p: intP } : null
    }

    const rays = [
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }   // right
    ]

    return rays.map(ray => intersect(ray.dx, ray.dy)).filter(Boolean) as {dist: number, p: {x: number, y: number}}[]
  }, [selectedIds, elements])

  if (distances.length === 0) return null

  const el = elements[selectedIds[0]]
  const cx = el.x + el.width / 2
  const cy = el.y + el.height / 2

  return (
    <Layer listening={false}>
      {distances.map((d, i) => {
        const lenUnits = d.dist * scale
        const text = `${lenUnits.toFixed(2)} ${scaleUnit}`
        const midX = cx + (d.p.x - cx) * 0.7 // Position label a bit closer to the wall
        const midY = cy + (d.p.y - cy) * 0.7 
        return (
          <React.Fragment key={i}>
            <Line
              points={[cx, cy, d.p.x, d.p.y]}
              stroke="#22C55E"
              strokeWidth={1}
              dash={[4, 4]}
            />
            <Label x={midX} y={midY} offsetX={text.length * 3}>
              <Tag fill="#22C55E" cornerRadius={4} />
              <Text text={text} fill="white" fontSize={10} padding={3} />
            </Label>
          </React.Fragment>
        )
      })}
    </Layer>
  )
}
