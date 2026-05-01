import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import { parsePixiColor } from '../../../../lib/pixiColor'

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

interface StatefulZone extends Container {
  _state?: { name: string; x: number; y: number; w: number; h: number; color: string }
}

const zoneMap = new Map<string, StatefulZone>()

export function syncNeighborhoodLayer(
  layer: Container,
  neighborhoods: Record<string, Neighborhood>,
  activeFloorId: string | null,
): void {
  const curIds = new Set<string>()
  const zones = Object.values(neighborhoods).filter(
    (n) => !activeFloorId || n.floorId === activeFloorId,
  )

  // Remove old
  for (const [id, c] of zoneMap) {
    let found = false
    for(const z of zones) if(z.id === id) { found = true; break }
    if (!found) { layer.removeChild(c); c.destroy({ children: true }); zoneMap.delete(id) }
  }

  for (const zone of zones) {
    curIds.add(zone.id)
    const { id, name, x, y, width: w, height: h, color } = zone
    let c = zoneMap.get(id)

    if (c) {
      const s = c._state
      if (s && s.name === name && s.x === x && s.y === y && s.w === w && s.h === h && s.color === color) {
        // unchanged
      } else {
        // partial update
        const gFill = c.children[0] as Graphics
        const gStroke = c.children[1] as Graphics
        const label = c.children[2] as Text
        const fill = parsePixiColor(color, 0x6366f1)
        
        gFill.clear().roundRect(x, y, w, h, 8).fill(fill)
        gStroke.clear().roundRect(x, y, w, h, 8).stroke({ color: fill, width: 1.5, alpha: 0.4 })
        label.text = name
        label.x = x + 8
        label.y = y + 6
        c._state = { name, x, y, w, h, color }
      }
    } else {
      c = new Container() as StatefulZone
      const fill = parsePixiColor(color, 0x6366f1)
      
      const gFill = new Graphics()
      gFill.roundRect(x, y, w, h, 8).fill(fill)
      gFill.alpha = 0.12
      c.addChild(gFill)

      const gStroke = new Graphics()
      gStroke.roundRect(x, y, w, h, 8).stroke({ color: fill, width: 1.5, alpha: 0.4 })
      c.addChild(gStroke)

      const label = new Text({ text: name, style: LABEL_STYLE })
      label.alpha = 0.7
      label.x = x + 8
      label.y = y + 6
      c.addChild(label)

      c._state = { name, x, y, w, h, color }
      zoneMap.set(id, c)
      layer.addChild(c)
    }
  }
}
