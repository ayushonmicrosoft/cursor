import type { CanvasElement } from '../../types/elements'
import type { Floor } from '../../types/floor'

export type RenderEngine = 'konva' | 'pixi'

export interface RenderViewport {
  x: number
  y: number
  scale: number
}

export interface RenderScene {
  floor: Pick<Floor, 'id' | 'name'> | null
  elements: Readonly<Record<string, CanvasElement>>
  selectedIds: readonly string[]
  hoveredId: string | null
  viewport: RenderViewport
  readOnly: boolean
}

export interface RendererHostSize {
  width: number
  height: number
}

export interface PointerPoint {
  x: number
  y: number
}
