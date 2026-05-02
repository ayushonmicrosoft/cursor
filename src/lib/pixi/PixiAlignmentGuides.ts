import { Container, Graphics } from 'pixi.js'
import type { AlignmentGuide } from '../../lib/geometry'

/**
 * Phase 4 — Alignment guide overlay.
 * Renders snap guide lines when an element is being dragged.
 * AlignmentGuide.orientation is 'vertical' | 'horizontal'.
 * start/end are the guide line extents along the perpendicular axis.
 */
const GUIDE_COLOR = 0x6366f1

export function syncAlignmentGuides(
  layer: Container,
  guides: AlignmentGuide[],
): void {
  for (const child of layer.removeChildren()) {
    child.destroy({ children: true })
  }
  if (guides.length === 0) return

  const g = new Graphics()
  for (const guide of guides) {
    if (guide.orientation === 'vertical') {
      g.moveTo(guide.position, guide.start)
      g.lineTo(guide.position, guide.end)
    } else {
      g.moveTo(guide.start, guide.position)
      g.lineTo(guide.end, guide.position)
    }
    g.stroke({ color: GUIDE_COLOR, width: 1, alpha: 0.75 })
  }
  layer.addChild(g)
}
