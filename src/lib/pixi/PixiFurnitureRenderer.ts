import { Graphics } from 'pixi.js'
import type { CanvasElement, LineShapeElement, DecorElement } from '../../types/elements'
import { parsePixiColor } from '../pixiColor'

export function renderFurniture(g: Graphics, el: CanvasElement, selected: boolean): void {
  const w = Number.isFinite(el.width) ? Math.max(0, el.width) : 0
  const h = Number.isFinite(el.height) ? Math.max(0, el.height) : 0
  const fill = parsePixiColor(el.style?.fill, 0xe5e7eb)
  const stroke = parsePixiColor(el.style?.stroke, 0x6b7280)
  const sw = selected ? 2 : 1
  const sColor = selected ? 0x7c3aed : stroke

  g.clear()

  // Selection ring
  if (selected) {
    g.roundRect(-4, -4, w + 8, h + 8, 6)
    g.stroke({ color: 0x7c3aed, width: 2, alpha: 0.85 })
  }

  const t = el.type
  if (t === 'sofa') {
    const armW = Math.max(6, Math.min(24, w * 0.1))
    const armrestInsetY = Math.max(1, h * 0.06)
    const innerPadX = armW + 2
    const innerPadY = Math.max(2, h * 0.14)
    const innerCushionW = Math.max(8, w - innerPadX * 2)
    const backrestH = Math.max(5, h * 0.3)
    const seamW = Math.max(10, w * 0.32)
    const seamH = Math.max(2, h * 0.08)

    // Main cushion
    g.roundRect(0, 0, w, h, 1).fill({ color: fill }).stroke({ color: sColor, width: sw })
    
    // Left & Right armrests
    g.roundRect(0, armrestInsetY, armW, Math.max(4, h - armrestInsetY * 2), 1)
      .fill({ color: fill, alpha: 0.5 })
      .stroke({ color: sColor, width: sw * 0.8 })
    g.roundRect(w - armW, armrestInsetY, armW, Math.max(4, h - armrestInsetY * 2), 1)
      .fill({ color: fill, alpha: 0.5 })
      .stroke({ color: sColor, width: sw * 0.8 })
    
    // Backrest cushion
    g.roundRect((w - innerCushionW) / 2, innerPadY, innerCushionW, backrestH, 1)
      .fill({ color: 0xffffff, alpha: 0.4 })
      .stroke({ color: sColor, width: sw * 0.8 })
      
    // Seam hint
    g.moveTo((w - seamW) / 2, h - Math.max(4, h * 0.15))
    g.lineTo((w + seamW) / 2, h - Math.max(4, h * 0.15))
    g.stroke({ color: sColor, width: 0.5, alpha: 0.3 })
  } else if (t === 'plant') {
    const potH = Math.max(4, h * 0.25)
    const foliageR = Math.min(w, h - potH) / 2
    // Foliage
    g.circle(w / 2, foliageR, foliageR).fill({ color: fill }).stroke({ color: selected ? 0x7c3aed : 0x166534, width: sw })
    // Pot base
    g.roundRect(w * 0.2, h - potH, w * 0.6, potH, 1).fill({ color: stroke })
  } else if (t === 'ellipse') {
    g.ellipse(w / 2, h / 2, w / 2, h / 2).fill({ color: fill }).stroke({ color: sColor, width: sw })
  } else if (t === 'line-shape') {
    const le = el as LineShapeElement
    if (le.points && le.points.length >= 4) {
      g.moveTo(le.points[0], le.points[1])
      for(let i=2; i + 1 < le.points.length; i+=2){
         g.lineTo(le.points[i], le.points[i+1])
      }
      g.stroke({ color: sColor, width: Math.max(2, el.style?.strokeWidth || 2) })
    }
  } else if (t === 'decor') {
    const de = el as DecorElement
    const shape = de.shape
    g.roundRect(0, 0, w, h, 1).fill({ color: fill }).stroke({ color: sColor, width: sw })

    if (shape === 'storage') {
       // Single horizontal drawer line
       g.moveTo(2, h * 0.15).lineTo(w - 2, h * 0.15).stroke({ color: stroke, width: 0.5, alpha: 0.6 })
    } else if (shape === 'locker') {
       // Vertical locker slots
       const slotCount = Math.floor(w / 12); const slotW = w / slotCount
       for(let i=1; i<slotCount; i++){
          g.moveTo(i * slotW, 2).lineTo(i * slotW, h - 2).stroke({ color: stroke, width: 0.5, alpha: 0.4 })
       }
    } else if (shape === 'credenza') {
       // Two door rectangles
       g.roundRect(w * 0.05, h * 0.2, w * 0.42, h * 0.7, 0.5).stroke({ color: stroke, width: 0.5, alpha: 0.5 })
       g.roundRect(w * 0.53, h * 0.2, w * 0.42, h * 0.7, 0.5).stroke({ color: stroke, width: 0.5, alpha: 0.5 })
    } else if (shape === 'printer-bay') {
       // Printer silhouette
       g.roundRect(w * 0.15, h * 0.15, w * 0.7, h * 0.6, 1).fill({ color: 0xffffff, alpha: 0.4 }).stroke({ color: stroke, width: 0.5 })
       g.circle(w * 0.8, h * 0.8, 2).fill({ color: stroke, alpha: 0.6 }) // button
    } else if (shape === 'fridge') {
       // Door handle
       g.rect(2, h * 0.2, 2, h * 0.3).fill({ color: stroke })
    } else if (shape === 'reception') {
       // Counter strip
       g.rect(0, 0, w, h * 0.25).fill({ color: stroke, alpha: 0.35 })
    }
  } else {
    // Fallback for printer, whiteboard, rect-shape
    g.roundRect(0, 0, w, h, 3).fill({ color: fill }).stroke({ color: sColor, width: sw })
  }
}
