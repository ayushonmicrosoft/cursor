import { assertEngineIntent } from '../core/engineIntents'
import { createLifecycleTracker, type EngineAdapter, type EngineAdapterInitContext } from '../core/rendererContract'
import type { RenderScene, RendererHostSize } from '../core/types'
import { parsePixiNodeId } from './pixiNodeFactory'
import { mapFloorToProjectedScene, type View3DMappingOptions, type View3DSceneData } from '../twopointfive/projector'
import type { Floor } from '../../types/floor'
import type { CanvasElement } from '../../types/elements'

type PixiPointerLike = {
  global?: { x?: number; y?: number }
  shiftKey?: boolean
  target?: {
    label?: string
    name?: string
    parent?: unknown
  }
}

type PixiWheelLike = {
  deltaX?: number
  deltaY?: number
  shiftKey?: boolean
}

interface PixiStageLike {
  on: (eventName: string, handler: (event: unknown) => void) => void
  off: (eventName: string, handler: (event: unknown) => void) => void
}

type DragState = {
  elementId: string
}

type MarqueeState = {
  start: { x: number; y: number }
}

export class PixiAdapter implements EngineAdapter {
  capabilities = {
    supportsMarquee: true,
    supportsContextMenu: true,
    supportsKeyboardShortcuts: true,
  } as const

  private readonly lifecycle = createLifecycleTracker()
  private context: EngineAdapterInitContext | null = null
  private lastScene: RenderScene | null = null
  private stage: PixiStageLike | null = null
  private dragState: DragState | null = null
  private marqueeState: MarqueeState | null = null

  private handlers:
    | {
        pointerdown: (event: unknown) => void
        pointermove: (event: unknown) => void
        pointerup: (event: unknown) => void
        pointerupoutside: (event: unknown) => void
        rightdown: (event: unknown) => void
        wheel: (event: unknown) => void
      }
    | null = null

  init(context: EngineAdapterInitContext): void {
    this.context = context
    this.lifecycle.record({ type: 'init', at: Date.now() })
    this.context.emitEvent({ type: 'init', at: Date.now() })
    this.lifecycle.record({ type: 'ready', at: Date.now() })
    this.context.emitEvent({ type: 'ready', at: Date.now() })
  }

  render(scene: RenderScene): void {
    this.requireContext()
    this.lastScene = scene
    this.lifecycle.record({ type: 'render', at: Date.now() })
    this.context?.emitEvent({ type: 'render', at: Date.now() })
  }

  resize(size: RendererHostSize): void {
    this.requireContext()
    if (!Number.isFinite(size.width) || !Number.isFinite(size.height)) {
      throw new Error('PixiAdapter.resize requires finite width/height.')
    }
    this.lifecycle.record({ type: 'resize', at: Date.now() })
    this.context?.emitEvent({ type: 'resize', at: Date.now() })
  }

  dispose(): void {
    if (!this.context) return
    this.detachStage()
    this.dragState = null
    this.marqueeState = null
    this.lifecycle.record({ type: 'dispose', at: Date.now() })
    this.context.emitEvent({ type: 'dispose', at: Date.now() })
    this.context = null
    this.lastScene = null
  }

  bindStage(stage: PixiStageLike): void {
    this.requireContext()
    this.detachStage()

    const pointerdown = (event: unknown) => {
      const pointer = this.toPointer(event)
      const point = this.pointFromPointer(pointer)
      const elementId = this.resolveElementId(pointer)

      if (!elementId && pointer.shiftKey) {
        this.marqueeState = { start: point }
        this.emitIntent({
          type: 'marquee',
          source: 'pointer',
          phase: 'start',
          start: point,
          end: point,
          additive: true,
        })
        return
      }

      this.marqueeState = null

      if (!elementId) {
        this.dragState = null
        this.emitIntent({
          type: 'select',
          source: 'pointer',
          ids: [],
          mode: 'replace',
        })
        return
      }

      this.dragState = { elementId }
      this.emitIntent({
        type: 'select',
        source: 'pointer',
        ids: [elementId],
        mode: 'replace',
      })
      this.emitIntent({
        type: 'drag',
        source: 'pointer',
        phase: 'start',
        id: elementId,
        position: point,
      })
    }

    const pointermove = (event: unknown) => {
      const pointer = this.toPointer(event)
      const point = this.pointFromPointer(pointer)

      if (this.dragState) {
        this.emitIntent({
          type: 'drag',
          source: 'pointer',
          phase: 'move',
          id: this.dragState.elementId,
          position: point,
        })
      }

      if (this.marqueeState) {
        this.emitIntent({
          type: 'marquee',
          source: 'pointer',
          phase: 'update',
          start: this.marqueeState.start,
          end: point,
          additive: true,
        })
      }
    }

    const pointerup = (event: unknown) => {
      const pointer = this.toPointer(event)
      const point = this.pointFromPointer(pointer)

      if (this.dragState) {
        this.emitIntent({
          type: 'drag',
          source: 'pointer',
          phase: 'end',
          id: this.dragState.elementId,
          position: point,
        })
      }

      if (this.marqueeState) {
        this.emitIntent({
          type: 'marquee',
          source: 'pointer',
          phase: 'end',
          start: this.marqueeState.start,
          end: point,
          additive: true,
        })
      }

      this.dragState = null
      this.marqueeState = null
    }

    const rightdown = (event: unknown) => {
      const pointer = this.toPointer(event)
      const point = this.pointFromPointer(pointer)
      const elementId = this.resolveElementId(pointer)
      this.emitIntent({
        type: 'context-menu',
        source: 'pointer',
        position: point,
        targetId: elementId,
      })
    }

    const wheel = (event: unknown) => {
      const wheelEvent = this.toWheel(event)
      const deltaX = Number.isFinite(wheelEvent.deltaX) ? Number(wheelEvent.deltaX) : 0
      const deltaY = Number.isFinite(wheelEvent.deltaY) ? Number(wheelEvent.deltaY) : 0
      const shiftKey = Boolean(wheelEvent.shiftKey)
      if (shiftKey || deltaX !== 0) {
        if (deltaX === 0 && deltaY === 0) return
        this.emitIntent({
          type: 'pan',
          source: 'pointer',
          delta: {
            x: deltaX,
            y: deltaY,
          },
        })
        return
      }

      if (deltaY === 0) return
      const scaleDelta = deltaY < 0 ? 1.04 : 0.96
      this.emitIntent({
        type: 'zoom',
        source: 'pointer',
        scaleDelta,
        anchor: null,
      })
    }

    stage.on('pointerdown', pointerdown)
    stage.on('pointermove', pointermove)
    stage.on('pointerup', pointerup)
    stage.on('pointerupoutside', pointerup)
    stage.on('rightdown', rightdown)
    stage.on('wheel', wheel)

    this.stage = stage
    this.handlers = {
      pointerdown,
      pointermove,
      pointerup,
      pointerupoutside: pointerup,
      rightdown,
      wheel,
    }
  }

  unbindStage(): void {
    this.detachStage()
  }

  getLifecycleHistory(): string[] {
    return this.lifecycle.getHistory()
  }

  getLastScene(): RenderScene | null {
    return this.lastScene
  }

  projectSceneForReview(
    floor: Floor | null | undefined,
    elementsOverride?: Record<string, CanvasElement>,
    options: View3DMappingOptions = {},
  ): View3DSceneData {
    return mapFloorToProjectedScene(floor, elementsOverride, options)
  }

  private detachStage() {
    if (!this.stage || !this.handlers) return
    this.stage.off('pointerdown', this.handlers.pointerdown)
    this.stage.off('pointermove', this.handlers.pointermove)
    this.stage.off('pointerup', this.handlers.pointerup)
    this.stage.off('pointerupoutside', this.handlers.pointerupoutside)
    this.stage.off('rightdown', this.handlers.rightdown)
    this.stage.off('wheel', this.handlers.wheel)
    this.stage = null
    this.handlers = null
  }

  private toPointer(event: unknown): PixiPointerLike {
    if (!event || typeof event !== 'object') return {}
    return event as PixiPointerLike
  }

  private toWheel(event: unknown): PixiWheelLike {
    if (!event || typeof event !== 'object') return {}
    return event as PixiWheelLike
  }

  private pointFromPointer(pointer: PixiPointerLike): { x: number; y: number } {
    return {
      x: Number.isFinite(pointer.global?.x) ? Number(pointer.global?.x) : 0,
      y: Number.isFinite(pointer.global?.y) ? Number(pointer.global?.y) : 0,
    }
  }

  private resolveElementId(pointer: PixiPointerLike): string | null {
    let current: unknown = pointer.target
    let hops = 0
    while (current && hops < 8) {
      if (typeof current === 'object') {
        const maybeLabel = (current as { label?: unknown }).label
        const maybeName = (current as { name?: unknown }).name
        if (typeof maybeLabel === 'string') {
          const parsed = parsePixiNodeId(maybeLabel)
          if (parsed) return parsed
        }
        if (typeof maybeName === 'string') {
          const parsed = parsePixiNodeId(maybeName)
          if (parsed) return parsed
        }
        current = (current as { parent?: unknown }).parent
        hops += 1
        continue
      }
      break
    }
    return null
  }

  private emitIntent(intent: unknown) {
    assertEngineIntent(intent)
    this.context?.emitIntent(intent)
  }

  private requireContext() {
    if (!this.context) {
      throw new Error('PixiAdapter must be initialized before use.')
    }
  }
}
