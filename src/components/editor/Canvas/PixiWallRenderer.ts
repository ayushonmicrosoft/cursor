import { Graphics } from 'pixi.js'
import type { WallElement } from '../../../types/elements'
import { parsePixiColor } from '../../../lib/pixiColor'

/**
 * Phase 2 — PixiJS wall renderer.
 * Straight segments + arc-bulge quadratic bezier curves.
 */
export function renderWall(g: Graphics, el: WallElement, selected: boolean): void {
  const { points, bulges, thickness = 8 } = el
  const strokeColor = parsePixiColor(el.style?.stroke, 0x374151)
  const activeColor = selected ? 0x7c3aed : strokeColor

  g.clear()
  if (points.length < 4) return

  const segCount = Math.floor(points.length / 2) - 1

  for (let i = 0; i < segCount; i++) {
    const x0 = points[i * 2], y0 = points[i * 2 + 1]
    const x1 = points[(i + 1) * 2], y1 = points[(i + 1) * 2 + 1]
    const bulge = bulges?.[i] ?? 0

    g.moveTo(x0, y0)
    if (Math.abs(bulge) < 0.5) {
      g.lineTo(x1, y1)
    } else {
      const midX = (x0 + x1) / 2, midY = (y0 + y1) / 2
      const dx = x1 - x0, dy = y1 - y0
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len < 0.001) { g.lineTo(x1, y1) }
      else {
        const cpX = midX + (-dy / len) * bulge
        const cpY = midY + (dx / len) * bulge
        g.quadraticCurveTo(cpX, cpY, x1, y1)
      }
    }
    g.stroke({ color: activeColor, width: selected ? thickness + 2 : thickness, cap: 'round', join: 'round' })
  }
}
