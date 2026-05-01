import { Container, Graphics } from 'pixi.js'
import { isCenterAnchoredBlock } from '../../../../blocks/rendering'
import type { CanvasElement } from '../../../../types/elements'

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
  dragRef?: { current: any }
): void {
  layer.removeChildren().forEach(c => c.destroy())

  if (selectedElements.length === 0) return

  if (selectedElements.length === 1) {
    const el = selectedElements[0]
    drawSingleHandles(layer, el, dragRef)
  } else {
    const g = new Graphics()
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
    layer.addChild(g)
  }
}

function drawSingleHandles(layer: Container, el: CanvasElement, dragRef?: { current: any }) {
  const { rotation } = el
  const box = elementBox(el)
  const pad = 4
  const left = box.left - pad
  const top = box.top - pad
  const right = box.right + pad
  const bottom = box.bottom + pad

  const g = new Graphics()
  g.rect(left, top, right - left, bottom - top)
  g.stroke({ color: BOX_COLOR, width: 1.5 })

  g.moveTo((left + right) / 2, top)
  g.lineTo((left + right) / 2, top - 16)
  g.stroke({ color: BOX_COLOR, width: 1, alpha: 0.5 })
  g.circle((left + right) / 2, top - 16, 4)
  g.fill({ color: HANDLE_FILL })
  g.stroke({ color: BOX_COLOR, width: 1 })
  layer.addChild(g)

  const handles = [
    { x: left, y: top, cursor: 'nwse-resize' },
    { x: (left + right) / 2, y: top, cursor: 'ns-resize' },
    { x: right, y: top, cursor: 'nesw-resize' },
    { x: right, y: (top + bottom) / 2, cursor: 'ew-resize' },
    { x: right, y: bottom, cursor: 'nwse-resize' },
    { x: (left + right) / 2, y: bottom, cursor: 'ns-resize' },
    { x: left, y: bottom, cursor: 'nesw-resize' },
    { x: left, y: (top + bottom) / 2, cursor: 'ew-resize' },
  ]

  handles.forEach((h, i) => {
    const hg = new Graphics()
    hg.roundRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE, HANDLE_RADIUS)
    hg.fill({ color: HANDLE_FILL })
    hg.stroke({ color: HANDLE_STROKE, width: 1.5 })
    hg.eventMode = 'static'
    hg.cursor = h.cursor
    hg.on('pointerdown', (e) => {
      e.stopPropagation()
      if (dragRef && !el.locked) {
        const wp = hg.parent?.toLocal(e.global)
        if (wp) {
          dragRef.current = {
            id: el.id,
            action: 'resize',
            handleIndex: i,
            swx: wp.x, swy: wp.y,
            sex: el.x, sey: el.y,
            sw: el.width, sh: el.height
          }
        }
      }
    })
    layer.addChild(hg)
  })

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
