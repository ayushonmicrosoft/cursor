import { Container, Graphics } from 'pixi.js'

/**
 * PixiJS grid layer — drawn below all elements.
 * 20px minor lines, 100px major lines.
 *
 * KEY: draw ALL lines of a given style first, then call g.stroke() ONCE.
 * Calling stroke() inside a loop in PixiJS v8 does not batch correctly.
 *
 * gridLayer is a child of world, so coordinates are in world-space.
 */

const MINOR_PX = 20
const MAJOR_PX = 100

export function syncGrid(
  layer: Container,
  worldX: number,
  worldY: number,
  scaleX: number,
  viewW: number,
  viewH: number,
): void {
  // Destroy old graphics to avoid memory leak
  layer.removeChildren().forEach(c => c.destroy())

  const scale = scaleX || 1

  // World-coord origin of the viewport top-left corner
  const originX = -worldX / scale
  const originY = -worldY / scale

  // How many world units are visible
  const wWorld = viewW / scale
  const hWorld = viewH / scale

  // Snap start to nearest grid line
  const startX = Math.floor(originX / MINOR_PX) * MINOR_PX - MINOR_PX
  const startY = Math.floor(originY / MINOR_PX) * MINOR_PX - MINOR_PX
  const endX = originX + wWorld + MINOR_PX
  const endY = originY + hWorld + MINOR_PX

  const MAX_LINES = 2000

  // ── Minor lines (one Graphics, one stroke call) ───────────────────────
  // Skip minor lines if zoomed out too far to prevent extreme loop counts
  if (scale > 0.2) {
    const gMinor = new Graphics()
    let count = 0
    for (let x = startX; x <= endX && count++ < MAX_LINES; x += MINOR_PX) {
      if (Math.round(x) % MAJOR_PX === 0) continue // skip — drawn as major
      gMinor.moveTo(x, originY - MINOR_PX)
      gMinor.lineTo(x, endY)
    }
    count = 0
    for (let y = startY; y <= endY && count++ < MAX_LINES; y += MINOR_PX) {
      if (Math.round(y) % MAJOR_PX === 0) continue
      gMinor.moveTo(originX - MINOR_PX, y)
      gMinor.lineTo(endX, y)
    }
    gMinor.stroke({ color: 0xb5c1d1, width: 1 / scale, alpha: 0.75 })
    layer.addChild(gMinor)
  }

  // ── Major lines ───────────────────────────────────────────────────────
  if (scale > 0.05) {
    const majorStartX = Math.floor(originX / MAJOR_PX) * MAJOR_PX - MAJOR_PX
    const majorStartY = Math.floor(originY / MAJOR_PX) * MAJOR_PX - MAJOR_PX
    const gMajor = new Graphics()
    let count = 0
    for (let x = majorStartX; x <= endX + MAJOR_PX && count++ < MAX_LINES; x += MAJOR_PX) {
      gMajor.moveTo(x, originY - MAJOR_PX)
      gMajor.lineTo(x, endY)
    }
    count = 0
    for (let y = majorStartY; y <= endY + MAJOR_PX && count++ < MAX_LINES; y += MAJOR_PX) {
      gMajor.moveTo(originX - MAJOR_PX, y)
      gMajor.lineTo(endX, y)
    }
    gMajor.stroke({ color: 0x7f8ea3, width: 1.6 / scale, alpha: 0.95 })
    layer.addChild(gMajor)
  }
}
