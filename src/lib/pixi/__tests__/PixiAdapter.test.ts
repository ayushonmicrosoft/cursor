import { describe, expect, it } from 'vitest'
import { PixiAdapter } from '../PixiAdapter'
import { createPixiNodeId } from '../pixiNodeFactory'
import type { EngineIntent } from '../../core/engineIntents'
import type { EngineLifecycleEvent } from '../../core/rendererContract'

class MockPixiStage {
  private readonly handlers = new Map<string, Set<(event: unknown) => void>>()

  on(eventName: string, handler: (event: unknown) => void) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set())
    }
    this.handlers.get(eventName)?.add(handler)
  }

  off(eventName: string, handler: (event: unknown) => void) {
    this.handlers.get(eventName)?.delete(handler)
  }

  emit(eventName: string, event: unknown) {
    const callbacks = this.handlers.get(eventName)
    if (!callbacks) return
    for (const callback of callbacks) {
      callback(event)
    }
  }

  listenerCount(eventName: string): number {
    return this.handlers.get(eventName)?.size ?? 0
  }
}

function createHarness() {
  const lifecycleEvents: EngineLifecycleEvent[] = []
  const intents: EngineIntent[] = []
  const adapter = new PixiAdapter()
  adapter.init({
    host: document.createElement('div'),
    emitIntent: (intent) => intents.push(intent),
    emitEvent: (event) => lifecycleEvents.push(event),
  })
  return { adapter, intents, lifecycleEvents }
}

describe('PixiAdapter', () => {
  it('tracks lifecycle and scene state', () => {
    const { adapter } = createHarness()
    adapter.render({
      floor: { id: 'floor-1', name: 'HQ' },
      elements: {},
      selectedIds: [],
      hoveredId: null,
      viewport: { x: 0, y: 0, scale: 1 },
      readOnly: false,
    })
    adapter.resize({ width: 1024, height: 768 })
    adapter.dispose()

    expect(adapter.getLifecycleHistory()).toEqual(['init', 'ready', 'render', 'resize', 'dispose'])
    expect(adapter.getLastScene()).toBeNull()
  })

  it('emits select/drag intents from pointer sequence', () => {
    const { adapter, intents } = createHarness()
    const stage = new MockPixiStage()
    adapter.bindStage(stage)

    stage.emit('pointerdown', {
      global: { x: 100, y: 80 },
      target: { label: createPixiNodeId('desk-1') },
    })
    stage.emit('pointermove', {
      global: { x: 130, y: 105 },
      target: { label: createPixiNodeId('desk-1') },
    })
    stage.emit('pointerup', {
      global: { x: 145, y: 116 },
      target: { label: createPixiNodeId('desk-1') },
    })

    expect(intents).toMatchObject([
      { type: 'select', ids: ['desk-1'], mode: 'replace' },
      { type: 'drag', phase: 'start', id: 'desk-1' },
      { type: 'drag', phase: 'move', id: 'desk-1' },
      { type: 'drag', phase: 'end', id: 'desk-1' },
    ])
  })

  it('emits marquee intents on shift background drag', () => {
    const { adapter, intents } = createHarness()
    const stage = new MockPixiStage()
    adapter.bindStage(stage)

    stage.emit('pointerdown', {
      shiftKey: true,
      global: { x: 10, y: 12 },
      target: { label: '' },
    })
    stage.emit('pointermove', {
      global: { x: 40, y: 36 },
      target: { label: '' },
    })
    stage.emit('pointerupoutside', {
      global: { x: 55, y: 48 },
      target: { label: '' },
    })

    expect(intents).toMatchObject([
      { type: 'marquee', phase: 'start' },
      { type: 'marquee', phase: 'update' },
      { type: 'marquee', phase: 'end' },
    ])
  })

  it('emits pan or zoom intents from wheel', () => {
    const { adapter, intents } = createHarness()
    const stage = new MockPixiStage()
    adapter.bindStage(stage)

    stage.emit('wheel', { deltaX: 24, deltaY: 4 })
    stage.emit('wheel', { deltaX: 0, deltaY: -20 })

    expect(intents).toHaveLength(2)
    expect(intents[0]).toMatchObject({ type: 'pan', delta: { x: 24, y: 4 } })
    expect(intents[1]).toMatchObject({ type: 'zoom' })
  })

  it('detaches listeners on dispose', () => {
    const { adapter } = createHarness()
    const stage = new MockPixiStage()
    adapter.bindStage(stage)

    expect(stage.listenerCount('pointerdown')).toBe(1)
    expect(stage.listenerCount('pointermove')).toBe(1)
    expect(stage.listenerCount('pointerup')).toBe(1)
    expect(stage.listenerCount('pointerupoutside')).toBe(1)
    expect(stage.listenerCount('rightdown')).toBe(1)
    expect(stage.listenerCount('wheel')).toBe(1)

    adapter.dispose()

    expect(stage.listenerCount('pointerdown')).toBe(0)
    expect(stage.listenerCount('pointermove')).toBe(0)
    expect(stage.listenerCount('pointerup')).toBe(0)
    expect(stage.listenerCount('pointerupoutside')).toBe(0)
    expect(stage.listenerCount('rightdown')).toBe(0)
    expect(stage.listenerCount('wheel')).toBe(0)
  })
})
