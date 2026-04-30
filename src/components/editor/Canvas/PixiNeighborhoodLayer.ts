import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { parsePixiColor } from '../../../lib/pixiColor'

/**
 * Phase 4 — Neighborhood zone fills.
 * Semi-transparent coloured rects behind elements.
 */
const LABEL_STYLE = new TextStyle({
  fontSize: 11,
  fontWeight: '700',
  fontFamily: 'Inter, sans-serif',
  fill: '#ffffff',
})

interface Neighborhood {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  color: string
  floorId?: string
}

export function syncNeighborhoodLayer(
  layer: Container,
  neighborhoods: Record<string, Neighborhood>,
  activeFloorId: string | null,
): void {
  layer.removeChildren()

  const zones = Object.values(neighborhoods).filter(
    (n) => !activeFloorId || n.floorId === activeFloorId,
  )

  for (const zone of zones) {
    const fill = parsePixiColor(zone.color, 0x6366f1)

    // Fill rect — draw with low alpha separately from stroke
    const gFill = new Graphics()
    gFill.roundRect(zone.x, zone.y, zone.width, zone.height, 8)
    gFill.fill(fill)
    gFill.alpha = 0.12
    layer.addChild(gFill)

    // Stroke ring at higher alpha
    const gStroke = new Graphics()
    gStroke.roundRect(zone.x, zone.y, zone.width, zone.height, 8)
    gStroke.stroke({ color: fill, width: 1.5, alpha: 0.4 })
    layer.addChild(gStroke)

    // Zone name label
    const label = new Text({ text: zone.name, style: LABEL_STYLE })
    label.alpha = 0.7
    label.x = zone.x + 8
    label.y = zone.y + 6
    layer.addChild(label)
  }
}
