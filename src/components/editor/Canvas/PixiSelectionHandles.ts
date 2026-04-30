import { Container, Graphics } from 'pixi.js'
import { isCenterAnchoredBlock } from '../../../blocks/rendering'
import type { CanvasElement } from '../../../types/elements'

/**
 * Phase 5 — Selection handles overlay.
 * Draws 8-point resize handles + bounding box for a single selected element.
 * For multi-select: draws a shared bounding box, no individual handles.
 *
 * Handles are purely visual in Phase 5 — resize interaction is Phase 6+.
 * This gives the visual fidelity parity needed before Konva removal.
 */

const HANDLE_FILL = 0xffffff
const HANDLE_STROKE = 0x6366f1
const BOX_COLOR = 0x6366f1
const HANDLE_RADIUS = 4
const HANDLE_SIZE = 8

export function syncSelectionHandles(
  layer: Container,
  selectedElements: CanvasElement[],
): void {
  layer.removeChildren()

  if (selectedElements.length === 0) return

  const g = new Graphics()

  if (selectedElements.length === 1) {
    const el = selectedElements[0]
    drawSingleHandles(g, el)
  } else {
    // Multi-select bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const el of selectedElements) {
      const box = elementBox(el)
      minX = Math.min(minX, box.left)
      minY = Math.min(minY, box.top)
      maxX = Math.max(maxX, box.right)
      maxY = Math.max(maxY, box.bottom)
    }
    g.rect(minX - 4, minY - 4, maxX - minX + 8, maxY - minY + 8)
    g.stroke({ color: BOX_COLOR, width: 1.5, alpha: 0.6 })
  }

  layer.addChild(g)
}

function drawSingleHandles(g: Graphics, el: CanvasElement) {
  const { rotation } = el
  const box = elementBox(el)

  // Apply rotation transform to the graphics container for rotated elements.
  // For Phase 5 we draw axis-aligned handles (simpler), matching Konva's approach
  // of showing the bounding box un-rotated in practice.
  const pad = 4
  const left = box.left - pad
  const top = box.top - pad
  const right = box.right + pad
  const bottom = box.bottom + pad

  // Bounding box
  g.rect(left, top, right - left, bottom - top)
  g.stroke({ color: BOX_COLOR, width: 1.5 })

  // Rotation indicator (dashed line from top-centre upward)
  g.moveTo((left + right) / 2, top)
  g.lineTo((left + right) / 2, top - 16)
  g.stroke({ color: BOX_COLOR, width: 1, alpha: 0.5 })
  g.circle((left + right) / 2, top - 16, 4)
  g.fill({ color: HANDLE_FILL })
  g.stroke({ color: BOX_COLOR, width: 1 })

  // 8 resize handles
  const handles = [
    [left, top],
    [(left + right) / 2, top],
    [right, top],
    [right, (top + bottom) / 2],
    [right, bottom],
    [(left + right) / 2, bottom],
    [left, bottom],
    [left, (top + bottom) / 2],
  ]

  for (const [hx, hy] of handles) {
    g.roundRect(hx - HANDLE_SIZE / 2, hy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE, HANDLE_RADIUS)
    g.fill({ color: HANDLE_FILL })
    g.stroke({ color: HANDLE_STROKE, width: 1.5 })
  }

  // Suppress the linter for unused rotation (Phase 6 will apply it)
  void rotation
}

function elementBox(el: CanvasElement) {
  const w = Number.isFinite(el.width) ? Math.max(0, el.width) : 0
  const h = Number.isFinite(el.height) ? Math.max(0, el.height) : 0
  if (!isCenterAnchoredBlock(el.type)) {
    return { left: el.x, top: el.y, right: el.x + w, bottom: el.y + h }
  }
  return {
    left: el.x - w / 2,
    top: el.y - h / 2,
    right: el.x + w / 2,
    bottom: el.y + h / 2,
  }
}
