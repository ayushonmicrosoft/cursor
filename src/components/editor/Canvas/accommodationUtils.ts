import type { Accommodation } from '../../../types/employee'

/**
 * Minimum shape needed to render a seat badge — we deliberately don't
 * require the full `Employee` record here so the (narrow) typings the
 * sub-renderers receive can extend this instead of pulling in
 * `accommodations: undefined` everywhere. If the employee lookup comes
 * up empty or the array is missing, we render nothing.
 */
export interface EmployeeBadgeShape {
  accommodations?: Accommodation[]
}

/**
 * Unicode-glyph badge keyed off the employee's accommodations. We pick
 * a single representative glyph per seat (wheelchair trumps everything
 * — it's the ADA-load-bearing one), so a user glancing at the layout
 * can pick out accommodated seats without reading labels.
 *
 * Using Text + a Konva Circle was the deliberate trade vs. wiring the
 * lucide SVG paths into react-konva — the glyph set renders reliably
 * across platforms and stays small (12px) without import gymnastics.
 */
export function accommodationGlyph(
  accommodations: Accommodation[] | undefined,
): string | null {
  if (!accommodations || accommodations.length === 0) return null
  if (accommodations.some((a) => a.type === 'wheelchair-access')) return '\u267F' // ♿
  const first = accommodations[0]
  switch (first.type) {
    case 'quiet-zone':
      return '\u{1F910}' // 🤐
    case 'proximity-to-exit':
      return '\u{1F6AA}' // 🚪
    case 'ergonomic-chair':
      return '\u{1FA91}' // 🪑
    case 'standing-desk':
      return '\u{1F5A5}' // 🖥
    case 'natural-light':
      return '\u2600' // ☀
    default:
      return '\u2726' // ✦
  }
}