import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LibraryPreview } from '../components/editor/LeftSidebar/LibraryPreview'
import type { LibraryItem } from '../components/editor/LeftSidebar/ElementLibrary'

function snap(item: LibraryItem) {
  const { container } = render(<LibraryPreview item={item} />)
  return container.firstElementChild?.outerHTML ?? ''
}

describe('LibraryPreview', () => {
  it('round table renders an ellipse', () => {
    const html = snap({ type: 'table-round', label: 'Round', category: 'Tables' })
    expect(html).toMatch(/<ellipse/)
  })

  it('column renders a small circle', () => {
    const html = snap({ type: 'decor', shape: 'column', label: 'Column', category: 'Structure' })
    expect(html).toMatch(/<circle/)
    expect(html).not.toMatch(/<rect[^>]*(width="22"|width="24")/)
  })

  it('stairs renders three horizontal lines inside a rect', () => {
    const html = snap({ type: 'decor', shape: 'stairs', label: 'Stairs', category: 'Structure' })
    // 1 outer rect + 3 line siblings
    expect(html.match(/<line/g)?.length).toBe(3)
    expect(html).toMatch(/<rect/)
  })

  it('text-label renders the letter T', () => {
    const html = snap({ type: 'text-label', label: 'Text', category: 'Other' })
    expect(html).toMatch(/<text[^>]*>T</)
  })

  it('rect table renders as a sharp plan-view table with seat blocks', () => {
    const html = snap({ type: 'table-rect', label: 'Rect Table', category: 'Tables' })
    expect(html).toMatch(/<rect/)
    expect(html).not.toMatch(/<ellipse/)
    expect(html.match(/rx="0\.75"/g)?.length).toBeGreaterThanOrEqual(1)
    expect(html.match(/<rect/g)?.length).toBeGreaterThanOrEqual(8)
  })

  it('elevator has two crossing lines', () => {
    const html = snap({ type: 'decor', shape: 'elevator', label: 'Elevator', category: 'Structure' })
    expect(html.match(/<line/g)?.length).toBe(2)
  })

  it('workstation preview uses rectilinear bench slots and chair blocks', () => {
    const html = snap({ type: 'workstation', label: 'Workstation', category: 'Desks' })
    expect(html.match(/<line/g)?.length).toBe(3)
    expect(html.match(/<rect/g)?.length).toBeGreaterThanOrEqual(9)
    expect(html).not.toMatch(/<circle/)
  })

  it('conference room preview uses a sharp room shell and seat blocks', () => {
    const html = snap({ type: 'conference-room', label: 'Conference Room', category: 'Rooms' })
    expect(html.match(/<rect/g)?.length).toBeGreaterThanOrEqual(12)
    expect(html).toMatch(/rx="0\.75"/)
    expect(html).not.toMatch(/<circle/)
  })
})
