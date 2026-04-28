import { Graphics } from 'pixi.js'
import type { TableElement } from '../../../types/elements'

/**
 * Phase 2 — PixiJS table renderer.
 * Renders rect/conference/round/oval table body + seat circles.
 */
export function renderTable(
  g: Graphics,
  el: TableElement & { seats?: Array<{ x: number; y: number }> },
  selected: boolean,
): void {
  const fill = parseInt((el.style?.fill ?? '#F3F4F6').replace('#', ''), 16)
  const stroke = parseInt((el.style?.stroke ?? '#6B7280').replace('#', ''), 16)
  const w = el.width
  const h = el.height

  g.clear()

  // Selection ring
  if (selected) {
    g.roundRect(-4, -4, w + 8, h + 8, 6)
    g.stroke({ color: 0x7c3aed, width: 2, alpha: 0.85 })
  }

  // Table body
  switch (el.type) {
    case 'table-round':
      g.circle(w / 2, h / 2, Math.min(w, h) / 2)
      g.fill({ color: fill })
      g.stroke({ color: stroke, width: 1.5 })
      break
    case 'table-oval':
      g.ellipse(w / 2, h / 2, w / 2, h / 2)
      g.fill({ color: fill })
      g.stroke({ color: stroke, width: 1.5 })
      break
    default:
      // rect + conference
      g.roundRect(0, 0, w, h, 4)
      g.fill({ color: fill })
      g.stroke({ color: stroke, width: 1.5 })
      break
  }

  // Seat circles
  const seats = el.seats ?? []
  for (const seat of seats) {
    g.circle(seat.x, seat.y, 6)
    g.fill({ color: 0xffffff, alpha: 0.95 })
    g.stroke({ color: stroke, width: 1 })
  }
}
