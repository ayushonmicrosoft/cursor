import { Graphics } from 'pixi.js'
import type { DeskElement, PrivateOfficeElement } from '../../types/elements'
import { parsePixiColor } from '../pixiColor'
import { PIXI_COLORS } from './pixiColors'

/**
 * Phase 2 — Desk / private-office renderer.
 * Handles: desk, hot-desk (straight/l-shape/cubicle), private-office (rectangular/u-shape).
 * Chair dot shown at bottom-centre for single-seat elements.
 */

type AssignableDesk = DeskElement | PrivateOfficeElement

export function renderDesk(g: Graphics, el: AssignableDesk, selected: boolean): void {
  const fill = parsePixiColor(el.style?.fill, PIXI_COLORS.deskFill)
  const stroke = parsePixiColor(el.style?.stroke, PIXI_COLORS.deskStroke)
  const { width: w, height: h } = el
  const shape = el.shape

  g.clear()

  // Selection ring
  if (selected) {
    g.roundRect(-4, -4, w + 8, h + 8, 6)
    g.stroke({ color: PIXI_COLORS.selected, width: 2, alpha: PIXI_COLORS.selectionAlpha })
  }

  if (shape === 'l-shape') {
    // Horizontal arm: full width, top 60%
    g.roundRect(0, 0, w, h * 0.6, 4).fill({ color: fill }).stroke({ color: stroke, width: 1 })
    // Vertical arm: right 40%, full height
    g.roundRect(w * 0.6, 0, w * 0.4, h, 4).fill({ color: fill }).stroke({ color: stroke, width: 1 })
  } else if (shape === 'cubicle' || shape === 'u-shape') {
    // Three-wall U — open at bottom
    g.rect(0, 0, w, h * 0.12).fill({ color: stroke })              // back wall
    g.rect(0, 0, w * 0.12, h).fill({ color: stroke })              // left wall
    g.rect(w - w * 0.12, 0, w * 0.12, h).fill({ color: stroke })  // right wall
    g.rect(w * 0.12, h * 0.12, w * 0.76, h * 0.88).fill({ color: fill }) // floor
  } else {
    // Straight / rectangular (default)
    g.roundRect(0, 0, w, h, 4).fill({ color: fill }).stroke({ color: stroke, width: 1.5 })
  }

  // Chair dot — bottom-centre
  g.circle(w / 2, h + 8, 7).fill({ color: PIXI_COLORS.seatFill }).stroke({ color: stroke, width: 1 })
}
