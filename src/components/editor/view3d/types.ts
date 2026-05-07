import type { CanvasElement } from '../../../types/elements'
import type { Floor } from '../../../types/floor'

export interface ThreeDEntryProps {
  floor: Floor | null
  elements: Record<string, CanvasElement>
  onRequestFallback2D?: () => void
}
