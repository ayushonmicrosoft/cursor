import type { EngineIntent } from './engineIntents'
import type { RenderScene, RendererHostSize } from './types'

export type EngineLifecycleEventType =
  | 'init'
  | 'ready'
  | 'render'
  | 'resize'
  | 'error'
  | 'dispose'

export interface EngineLifecycleEvent {
  type: EngineLifecycleEventType
  at: number
  detail?: string
}

export interface EngineIntentEvent {
  type: 'intent'
  intent: EngineIntent
}

export type EngineEvent = EngineLifecycleEvent | EngineIntentEvent

export interface EngineCapabilities {
  supportsMarquee: boolean
  supportsContextMenu: boolean
  supportsKeyboardShortcuts: boolean
}

export interface EngineAdapterInitContext {
  host: HTMLElement
  emitIntent: (intent: EngineIntent) => void
  emitEvent: (event: EngineLifecycleEvent) => void
}

export interface EngineAdapter {
  capabilities: EngineCapabilities
  init: (context: EngineAdapterInitContext) => void | Promise<void>
  render: (scene: RenderScene) => void
  resize: (size: RendererHostSize) => void
  dispose: () => void
}

/**
 * Contract rule:
 * - Adapters emit intents and lifecycle events only.
 * - Mutating app stores and executing commands happens outside the adapter.
 */
export function createLifecycleTracker() {
  const history: EngineLifecycleEventType[] = []
  let initialized = false
  let ready = false
  let disposed = false

  const normalizeEvent = (
    event: EngineLifecycleEventType | EngineLifecycleEvent,
  ): EngineLifecycleEvent => {
    if (typeof event === 'string') {
      return { type: event, at: Date.now() }
    }
    return event
  }

  const validateEventPayload = (event: EngineLifecycleEvent) => {
    if (!Number.isFinite(event.at)) {
      throw new Error('Lifecycle error: event.at must be a finite number.')
    }
  }

  const record = (eventInput: EngineLifecycleEventType | EngineLifecycleEvent) => {
    const event = normalizeEvent(eventInput)
    validateEventPayload(event)
    const { type } = event
    switch (type) {
      case 'init': {
        if (initialized) throw new Error('Lifecycle error: init can only be emitted once.')
        if (disposed) throw new Error('Lifecycle error: init cannot happen after dispose.')
        initialized = true
        history.push(type)
        return
      }
      case 'ready': {
        if (!initialized) throw new Error('Lifecycle error: ready requires init first.')
        if (ready) throw new Error('Lifecycle error: ready can only be emitted once.')
        if (disposed) throw new Error('Lifecycle error: ready cannot happen after dispose.')
        ready = true
        history.push(type)
        return
      }
      case 'render':
      case 'resize': {
        if (!ready) throw new Error(`Lifecycle error: ${type} requires ready first.`)
        if (disposed) throw new Error(`Lifecycle error: ${type} cannot happen after dispose.`)
        history.push(type)
        return
      }
      case 'error': {
        if (!initialized) throw new Error('Lifecycle error: error requires init first.')
        if (disposed) throw new Error('Lifecycle error: error cannot happen after dispose.')
        history.push(type)
        return
      }
      case 'dispose': {
        if (!initialized) throw new Error('Lifecycle error: dispose requires init first.')
        if (disposed) throw new Error('Lifecycle error: dispose can only happen once.')
        disposed = true
        history.push(type)
        return
      }
      default: {
        const neverType: never = type
        throw new Error(`Unsupported lifecycle event: ${String(neverType)}`)
      }
    }
  }

  return {
    record,
    getHistory: () => [...history],
  }
}
