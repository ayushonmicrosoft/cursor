const HEX_COLOR_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i
const RGB_COLOR_RE = /^rgba?\(([^)]+)\)$/i

function clampChannel(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(255, Math.round(value)))
}

/**
 * Parse user-facing CSS-ish colors into a Pixi numeric color.
 * Accepts:
 * - #RGB / #RRGGBB (with or without #)
 * - rgb(r,g,b) / rgba(r,g,b,a)
 * Falls back for unsupported values (e.g. "transparent").
 */
export function parsePixiColor(
  input: string | null | undefined,
  fallback: number,
): number {
  if (!input) return fallback
  const value = input.trim()
  const hexMatch = value.match(HEX_COLOR_RE)
  if (hexMatch) {
    const hex = hexMatch[1].length === 3
      ? hexMatch[1].split('').map((c) => c + c).join('')
      : hexMatch[1]
    const parsed = Number.parseInt(hex, 16)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const rgbMatch = value.match(RGB_COLOR_RE)
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((p) => p.trim())
    if (parts.length >= 3) {
      const r = clampChannel(Number.parseFloat(parts[0]))
      const g = clampChannel(Number.parseFloat(parts[1]))
      const b = clampChannel(Number.parseFloat(parts[2]))
      return (r << 16) + (g << 8) + b
    }
  }

  return fallback
}

