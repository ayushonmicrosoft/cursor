import { Graphics, Text, TextStyle, Container } from 'pixi.js'
import type { WorkstationElement } from '../../../types/elements'
import type { Employee } from '../../../types/employee'
import { parsePixiColor } from '../../../lib/pixiColor'

/**
 * Phase 2 — PixiJS workstation bench renderer.
 *
 * WorkstationElement has:
 *   positions: number                    — total seat slots
 *   assignedEmployeeIds: (string|null)[] — sparse, length === positions
 *
 * Renders as a long bench divided into `positions` equal columns.
 * Each slot shows a seat circle + employee first-name badge if occupied.
 */

const SLOT_LABEL_STYLE = new TextStyle({
  fontSize: 8,
  fill: '#1F2937',
  fontFamily: 'Inter, sans-serif',
  fontWeight: '600',
})

const SLOT_NUM_STYLE = new TextStyle({
  fontSize: 7,
  fill: '#9CA3AF',
  fontFamily: 'Inter, sans-serif',
})

export function renderWorkstation(
  g: Graphics,
  container: Container,
  el: WorkstationElement,
  employees: Record<string, Employee>,
  selected: boolean,
): void {
  const fill = parsePixiColor(el.style?.fill, 0xe5e7eb)
  const stroke = parsePixiColor(el.style?.stroke, 0x6b7280)
  const { width: w, height: h, positions, assignedEmployeeIds } = el

  g.clear()

  // Selection ring
  if (selected) {
    g.roundRect(-4, -4, w + 8, h + 8, 6)
    g.stroke({ color: 0x7c3aed, width: 2, alpha: 0.85 })
  }

  // Bench body
  g.roundRect(0, 0, w, h, 4)
  g.fill({ color: fill })
  g.stroke({ color: stroke, width: 1.5 })

  if (positions < 1) return

  const slotW = w / positions

  for (let i = 0; i < positions; i++) {
    const sx = i * slotW
    const occupied = assignedEmployeeIds?.[i]

    // Slot divider (not on first)
    if (i > 0) {
      g.moveTo(sx, 4)
      g.lineTo(sx, h - 4)
      g.stroke({ color: stroke, width: 0.5, alpha: 0.4 })
    }

    // Seat circle at bottom of slot
    const cx = sx + slotW / 2
    const cy = h + 8
    g.circle(cx, cy, 6)
    g.fill({ color: 0xffffff })
    g.stroke({ color: stroke, width: 1 })

    // Slot number (top-left corner of slot)
    const numText = new Text({ text: String(i + 1), style: SLOT_NUM_STYLE })
    numText.x = sx + 3
    numText.y = 3
    container.addChild(numText)

    // Employee name badge if occupied
    if (occupied && employees[occupied]) {
      const name = employees[occupied].name.split(' ')[0]
      const dept = employees[occupied].department

      // Dept colour strip at slot top
      const deptFill = deptColor(dept)
      g.rect(sx + 2, 0, slotW - 4, 4)
      g.fill({ color: deptFill })

      const nameText = new Text({ text: name, style: SLOT_LABEL_STYLE })
      nameText.x = cx - nameText.width / 2
      nameText.y = h / 2 - nameText.height / 2
      container.addChild(nameText)
    }
  }
}

// Deterministic dept color — same algo as PixiStage
const PALETTE = [0x6366f1, 0x10b981, 0xf59e0b, 0xef4444, 0x8b5cf6, 0x06b6d4, 0xf97316, 0x84cc16]
function deptColor(dept: string | null): number {
  if (!dept) return 0x6366f1
  let h = 0; for (let i = 0; i < dept.length; i++) h = (h * 31 + dept.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}
