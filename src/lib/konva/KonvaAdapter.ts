import { assertEngineIntent } from '../core/engineIntents'
import { createLifecycleTracker, type EngineAdapter, type EngineAdapterInitContext } from '../core/rendererContract'
import type { RenderScene, RendererHostSize } from '../core/types'
import { parseKonvaNodeId } from './konvaNodeFactory'
import { mapFloorToProjectedScene, type View3DMappingOptions, type View3DSceneData } from '../twopointfive/projector'
import type { Floor } from '../../types/floor'
import type { CanvasElement } from '../../types/elements'

type KonvaNodeLike = {
  id?: () => string
  getParent?: () => KonvaNodeLike | null | undefined
}

type KonvaStageEvent = {
  target?: KonvaNodeLike
  evt?: {
    clientX?: number
    clientY?: number
    deltaY?: number
  }
}

interface KonvaStageLike {
  on: (eventName: string, handler: (event: KonvaStageEvent) => unknown) => unknown
  off: (eventName: string, handler: (event: KonvaStageEvent) => unknown) => unknown
}

export class KonvaAdapter implements EngineAdapter {
  capabilities = {
    supportsMarquee: true,
    supportsContextMenu: true,
    supportsKeyboardShortcuts: true,
  } as const

  private readonly lifecycle = createLifecycleTracker()
  private context: EngineAdapterInitContext | null = null
  private lastScene: RenderScene | null = null
  private stage: KonvaStageLike | null = null
  private handlers:
    | {
        pointerdown: (event: KonvaStageEvent) => void
        contextmenu: (event: KonvaStageEvent) => void
        wheel: (event: KonvaStageEvent) => void
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
      throw new Error('KonvaAdapter.resize requires finite width/height.')
    }
    this.lifecycle.record({ type: 'resize', at: Date.now() })
    this.context?.emitEvent({ type: 'resize', at: Date.now() })
  }

  dispose(): void {
    if (!this.context) return
    this.detachStage()
    this.lifecycle.record({ type: 'dispose', at: Date.now() })
    this.context.emitEvent({ type: 'dispose', at: Date.now() })
    this.context = null
    this.lastScene = null
  }

  bindStage(stage: KonvaStageLike): void {
    this.requireContext()
    this.detachStage()

    const pointerdown = (event: KonvaStageEvent) => {
      const elementId = this.resolveElementId(event)
      if (!elementId) {
        this.emitIntent({
          type: 'select',
          source: 'pointer',
          ids: [],
          mode: 'replace',
        })
        return
      }
      this.emitIntent({
        type: 'select',
        source: 'pointer',
        ids: [elementId],
        mode: 'replace',
      })
    }

    const contextmenu = (event: KonvaStageEvent) => {
      const elementId = this.resolveElementId(event)
      this.emitIntent({
        type: 'context-menu',
        source: 'pointer',
        position: {
          x: event.evt?.clientX ?? 0,
          y: event.evt?.clientY ?? 0,
        },
        targetId: elementId,
      })
    }

    const wheel = (event: KonvaStageEvent) => {
      if (!Number.isFinite(event.evt?.deltaY)) return
      const deltaY = Number(event.evt?.deltaY)
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
    stage.on('contextmenu', contextmenu)
    stage.on('wheel', wheel)
    this.stage = stage
    this.handlers = { pointerdown, contextmenu, wheel }
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
    this.stage.off('contextmenu', this.handlers.contextmenu)
    this.stage.off('wheel', this.handlers.wheel)
    this.stage = null
    this.handlers = null
  }

  private emitIntent(intent: unknown) {
    assertEngineIntent(intent)
    this.context?.emitIntent(intent)
  }

  private resolveElementId(event: KonvaStageEvent): string | null {
    let current: KonvaNodeLike | null | undefined = event.target
    let hops = 0
    while (current && hops < 6) {
      const maybeId = current.id?.()
      if (maybeId) {
        const parsed = parseKonvaNodeId(maybeId)
        if (parsed) return parsed
      }
      current = current.getParent?.()
      hops += 1
    }
    return null
  }

  private requireContext() {
    if (!this.context) {
      throw new Error('KonvaAdapter must be initialized before use.')
    }
  }
}
