import { Graphics } from 'pixi.js'
import type { TableElement } from '../../types/elements'
import { parsePixiColor } from '../pixiColor'
import { PIXI_COLORS } from './pixiColors'

/**
 * Phase 2 — PixiJS table renderer.
 * Renders rect/conference/round/oval table body + seat circles.
 */
export function renderTable(
  g: Graphics,
  el: TableElement,
  selected: boolean,
): void {
  const fill = parsePixiColor(el.style?.fill, PIXI_COLORS.furnitureFill)
  const stroke = parsePixiColor(el.style?.stroke, PIXI_COLORS.furnitureStroke)
  const w = el.width
  const h = el.height

  g.clear()

  // Selection ring
  if (selected) {
    g.roundRect(-4, -4, w + 8, h + 8, 6)
    g.stroke({ color: PIXI_COLORS.selected, width: 2, alpha: PIXI_COLORS.selectionAlpha })
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
    const seatX = w / 2 + seat.offsetX
    const seatY = h / 2 + seat.offsetY
    g.circle(seatX, seatY, 6)
    g.fill({ color: PIXI_COLORS.sofaCushion, alpha: 0.95 })
    g.stroke({ color: stroke, width: 1 })
  }
}
