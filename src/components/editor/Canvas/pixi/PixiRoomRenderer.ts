import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { ConferenceRoomElement, CommonAreaElement, PhoneBoothElement } from '../../../../types/elements'
import { parsePixiColor } from '../../../../lib/pixiColor'

/**
 * Phase 2 — Room renderer.
 * Handles conference-room, phone-booth, common-area.
 * Uses real types from elements.ts — BaseElement has style, width, height, label, type.
 */
type RoomElement = ConferenceRoomElement | PhoneBoothElement | CommonAreaElement

const NAME_STYLE = new TextStyle({
  fontSize: 11, fill: '#374151', fontFamily: 'Inter, sans-serif',
  fontWeight: '600', wordWrap: true, align: 'center',
})
const CAP_STYLE = new TextStyle({
  fontSize: 9, fill: '#9CA3AF', fontFamily: 'Inter, sans-serif',
})

export function renderRoom(container: Container, el: RoomElement, selected: boolean): void {
  container.removeChildren()

  const fill = parsePixiColor(el.style?.fill, 0xeff6ff)
  const stroke = parsePixiColor(el.style?.stroke, 0x3b82f6)
  const { width: w, height: h } = el

  const g = new Graphics()
  if (selected) {
    g.roundRect(-4, -4, w + 8, h + 8, 6)
    g.stroke({ color: 0x7c3aed, width: 2, alpha: 0.85 })
  }
  g.roundRect(0, 0, w, h, 6)
  g.fill({ color: fill })
  g.alpha = (el.style?.opacity ?? 1) * 0.8
  g.stroke({ color: stroke, width: 1.5 })
  container.addChild(g)

  // Room name
  const name = el.type === 'conference-room'
    ? (el as ConferenceRoomElement).roomName
    : el.type === 'common-area'
    ? (el as CommonAreaElement).areaName
    : el.label
  const cap = el.type === 'conference-room' ? (el as ConferenceRoomElement).capacity : 0

  const nameText = new Text({ text: name || el.label, style: NAME_STYLE })
  nameText.x = w / 2 - nameText.width / 2
  nameText.y = h / 2 - nameText.height / 2 - (cap ? 8 : 0)
  container.addChild(nameText)

  if (cap > 0) {
    const capText = new Text({ text: `cap ${cap}`, style: CAP_STYLE })
    capText.x = w / 2 - capText.width / 2
    capText.y = nameText.y + nameText.height + 2
    container.addChild(capText)
  }
}
